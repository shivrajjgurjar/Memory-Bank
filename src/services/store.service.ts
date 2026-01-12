import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User as FireUser, deleteUser } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, updateDoc, writeBatch } from '@angular/fire/firestore';
import { Memory, ViewState, User, AppLock, SubscriptionPlan, Cycle } from '../types';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // --- State Signals ---
  private readonly _user = signal<User | null>(null);
  private readonly _memories = signal<Memory[]>([]);
  private readonly _lockSettings = signal<AppLock>({ enabled: false, code: null, biometric: false });
  private readonly _isLocked = signal<boolean>(false);
  private readonly _currentView = signal<ViewState>('ONBOARDING');
  private readonly _activeMemoryId = signal<string | null>(null);
  private readonly _editingMemoryId = signal<string | null>(null);
  private readonly _darkMode = signal<boolean>(true);

  // --- Auth Listener ---
  private authUser$ = user(this.auth);

  // --- Computed ---
  readonly memories = computed(() => this._memories().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  readonly user = this._user.asReadonly();
  readonly isLocked = this._isLocked.asReadonly();
  readonly lockSettings = this._lockSettings.asReadonly();
  readonly currentView = this._currentView.asReadonly();
  readonly isDarkMode = this._darkMode.asReadonly();

  readonly activeMemory = computed(() => {
    const id = this._activeMemoryId();
    return id ? this._memories().find(m => m.id === id) || null : null;
  });

  readonly editingMemory = computed(() => {
    const id = this._editingMemoryId();
    return id ? this._memories().find(m => m.id === id) || null : null;
  });

  readonly dueForReview = computed(() => {
    const now = new Date();
    return this._memories().filter(m => new Date(m.nextReviewDate) <= now);
  });

  readonly memoryLimitReached = computed(() => {
    const u = this._user();
    if (!u) return false;
    if (u.plan === 'Free' && this._memories().length >= 30) return true;
    return false;
  });

  constructor() {
    this.initAuthListener();
    this.loadLocalSettings();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this._lockSettings().enabled && this._user()) {
        this._isLocked.set(true);
      }
    });

    effect(() => {
      const isDark = this._darkMode();
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('memory_bank_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('memory_bank_theme', 'light');
      }
    });
  }

  // --- CORE INFRASTRUCTURE ---

  private initAuthListener() {
    this.authUser$.subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        await this.fetchUserProfile(firebaseUser);
        await this.fetchMemories(firebaseUser.uid);
        if (this._currentView() === 'ONBOARDING' || this._currentView() === 'AUTH') {
          this.setView('VAULT');
        }
      } else {
        this._user.set(null);
        this._memories.set([]);
        this.setView('ONBOARDING');
      }
    });
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
    } catch (error) {
      console.error('Vault Access Denied:', error);
      alert('Could not access the vault. Please try again.');
    }
  }

  async logout() {
    await signOut(this.auth);
    this._isLocked.set(false);
  }

  async deleteAccount() {
    const user = this.auth.currentUser;
    if (!user) return;

    try {
      // 1. Delete all memories (Firestore Batch)
      const batch = writeBatch(this.firestore);
      const memoriesRef = collection(this.firestore, `users/${user.uid}/memories`);
      const snapshot = await getDocs(memoriesRef);
      snapshot.forEach(doc => batch.delete(doc.ref));
      
      // 2. Delete user profile
      const userRef = doc(this.firestore, `users/${user.uid}`);
      batch.delete(userRef);
      
      await batch.commit();

      // 3. Delete Auth Account
      await deleteUser(user);
      
      // 4. Reset Local State
      localStorage.clear();
      window.location.reload(); // Force full reset
    } catch (error) {
      console.error('Account Deletion Failed:', error);
      alert('Security Requirement: Please log out and log back in to confirm ownership before deleting.');
    }
  }

  // --- DATA SYNC ---

  private async fetchUserProfile(firebaseUser: FireUser) {
    const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);
    const snapshot = await getDoc(userDocRef);

    if (snapshot.exists()) {
      this._user.set(snapshot.data() as User);
    } else {
      const newUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Traveler',
        email: firebaseUser.email || '',
        plan: 'Free',
        joinedAt: new Date().toISOString()
      };
      await setDoc(userDocRef, newUser);
      this._user.set(newUser);
    }
  }

  private async fetchMemories(uid: string) {
    try {
      const memoriesRef = collection(this.firestore, `users/${uid}/memories`);
      const snapshot = await getDocs(memoriesRef);
      const loadedMemories = snapshot.docs.map(d => d.data() as Memory);
      this._memories.set(loadedMemories);
    } catch (e) {
      console.error('Memory Retrieval Failed:', e);
    }
  }

  // --- MEMORY OPERATIONS ---

  async addMemory(memory: Omit<Memory, 'id' | 'createdAt' | 'reflections' | 'nextReviewDate' | 'linkedMemoryIds' | 'contradictoryMemoryIds' | 'lifecycle'>) {
    const user = this._user();
    if (!user) return;
    
    if (this.memoryLimitReached()) {
      this.setView('LIMIT_REACHED');
      return;
    }

    const id = crypto.randomUUID();
    const newMemory: Memory = {
      ...memory,
      id,
      createdAt: new Date().toISOString(),
      lifecycle: 'Fresh',
      reflections: [],
      linkedMemoryIds: [],
      contradictoryMemoryIds: [],
      nextReviewDate: this.calculateNextReview(memory.revisitCycle)
    };

    this._memories.update(ms => [newMemory, ...ms]);
    this.setView('VAULT');

    const docRef = doc(this.firestore, `users/${user.id}/memories/${id}`);
    await setDoc(docRef, newMemory);
  }

  async updateMemory(id: string, updates: Partial<Memory>) {
    const user = this._user();
    if (!user) return;

    this._memories.update(ms => ms.map(m => m.id === id ? { ...m, ...updates } : m));
    
    if (this._activeMemoryId() === id) {
      this.setView('DETAIL');
    } else {
      this.setView('VAULT');
    }
    this._editingMemoryId.set(null);

    const docRef = doc(this.firestore, `users/${user.id}/memories/${id}`);
    await updateDoc(docRef, updates);
  }

  addReflection(memoryId: string, content: string) {
    const m = this._memories().find(m => m.id === memoryId);
    if (m) {
        const newReflections = [...m.reflections, { id: crypto.randomUUID(), date: new Date().toISOString(), content }];
        this.updateMemory(memoryId, { reflections: newReflections });
    }
  }

  async deleteMemory(id: string) {
    const user = this._user();
    if (!user) return;

    this._memories.update(ms => ms.filter(m => m.id !== id));
    
    if (this._activeMemoryId() === id) {
      this.setView('VAULT');
    }

    const docRef = doc(this.firestore, `users/${user.id}/memories/${id}`);
    await deleteDoc(docRef);
  }

  linkMemories(id1: string, id2: string) {
     // For full implementation, you'd add database updates here
     // Currently handles local state logic in components
  }

  unlinkMemories(id1: string, id2: string) {
     // For full implementation, you'd add database updates here
  }

  // --- SUBSCRIPTIONS ---

  async updateSubscription(plan: SubscriptionPlan) {
    const user = this._user();
    if (!user) return;

    const updatedUser = { ...user, plan };
    this._user.set(updatedUser);

    const userRef = doc(this.firestore, `users/${user.id}`);
    await updateDoc(userRef, { plan });
  }

  exportData() {
    const data = {
      user: this._user(),
      memories: this._memories(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-bank-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // --- VIEW & SETTINGS ---

  setView(view: ViewState) {
    this._currentView.set(view);
    if (view !== 'DETAIL') this._activeMemoryId.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setActiveMemory(id: string) {
    this._activeMemoryId.set(id);
    this.setView('DETAIL');
  }

  startCreating() {
    if (this.memoryLimitReached()) {
      this.setView('LIMIT_REACHED');
      return;
    }
    this._editingMemoryId.set(null);
    this.setView('EDITOR');
  }

  startEditing(id: string) {
    this._editingMemoryId.set(id);
    this.setView('EDITOR');
  }

  toggleTheme() {
    this._darkMode.update(d => !d);
  }

  setLockCode(code: string) {
    const newSettings = { ...this._lockSettings(), enabled: true, code };
    this._lockSettings.set(newSettings);
    localStorage.setItem('memory_bank_lock', JSON.stringify(newSettings));
  }

  unlock(code: string): boolean {
    if (this._lockSettings().code === code) {
      this._isLocked.set(false);
      return true;
    }
    return false;
  }

  private loadLocalSettings() {
    const lockData = localStorage.getItem('memory_bank_lock');
    if (lockData) this._lockSettings.set(JSON.parse(lockData));
    const theme = localStorage.getItem('memory_bank_theme');
    if (theme) this._darkMode.set(theme === 'dark');
  }

  private calculateNextReview(cycle: Cycle): string {
    const date = new Date();
    if (cycle === '1m') date.setMonth(date.getMonth() + 1);
    if (cycle === '3m') date.setMonth(date.getMonth() + 3);
    if (cycle === '1y') date.setFullYear(date.getFullYear() + 1);
    return date.toISOString();
  }
}

