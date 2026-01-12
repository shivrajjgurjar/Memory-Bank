
import { Component, inject, computed, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Memory } from '../types';
import { MemoryGraphComponent } from './memory-graph.component';

@Component({
  selector: 'app-memory-detail',
  standalone: true,
  imports: [DatePipe, NgClass, FormsModule, SlicePipe, MemoryGraphComponent],
  template: `
    <div [class.animate-ethereal-exit]="isExiting()" class="max-w-4xl mx-auto px-6 pt-24 pb-32 animate-fade-in min-h-screen transition-all">
      
      <!-- Nav -->
      <div class="flex justify-between items-center mb-12">
        <button (click)="back()" class="text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white uppercase transition-colors flex items-center gap-2">
          <span>←</span> Return to Vault
        </button>
        
        <div class="flex gap-4">
          <button (click)="initiateDelete()" class="text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-red-600 uppercase transition-colors px-4 py-2 rounded-sm hover:bg-neutral-50 dark:hover:bg-neutral-900">
            Forget
          </button>
          <button (click)="edit()" class="text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white uppercase transition-colors border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-sm hover:bg-neutral-50 dark:hover:bg-neutral-900">
            Edit Memory
          </button>
        </div>
      </div>

      @if (memory(); as m) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
          
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-12">
            
            <!-- Header -->
            <div class="space-y-4 border-b border-neutral-100 dark:border-neutral-800 pb-8">
              <div class="flex gap-4 mb-4 flex-wrap">
                 <span class="text-[10px] font-sans tracking-widest uppercase px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-sm">{{ m.type }}</span>
                 <span class="text-[10px] font-sans tracking-widest uppercase px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-sm">{{ m.context }}</span>
                 @if (m.associatedPerson) {
                   <span class="text-[10px] font-sans tracking-widest uppercase px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-sm flex items-center gap-1">
                     👤 {{ m.associatedPerson }}
                   </span>
                 }
              </div>
              <h1 class="text-3xl md:text-4xl font-serif text-neutral-900 dark:text-white leading-tight">{{ m.title }}</h1>
              <p class="text-xs font-sans text-neutral-400 uppercase tracking-widest">
                {{ m.createdAt | date:'mediumDate' }}
              </p>
            </div>

            <!-- VISUALIZATION TOGGLE -->
            @if (showGraph()) {
               <app-memory-graph [rootMemory]="m" (close)="showGraph.set(false)"></app-memory-graph>
            }

            <!-- Body -->
            <div class="prose dark:prose-invert max-w-none">
              <p class="font-serif text-lg md:text-xl leading-loose text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{{ m.body }}</p>
            </div>

            <!-- Reflections -->
            @if (m.reflections.length > 0) {
              <div class="pt-12 border-t border-neutral-100 dark:border-neutral-900 space-y-8">
                <h3 class="text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">Reflections over time</h3>
                @for (ref of m.reflections; track ref.id) {
                  <div class="pl-6 border-l border-neutral-200 dark:border-neutral-800 space-y-2">
                    <p class="font-serif italic text-neutral-600 dark:text-neutral-400">{{ ref.content }}</p>
                    <p class="text-[10px] font-sans text-neutral-400 dark:text-neutral-600 uppercase tracking-wider">{{ ref.date | date:'mediumDate' }}</p>
                  </div>
                }
              </div>
            }

          </div>

          <!-- Sidebar: Linked Wisdom -->
          <div class="space-y-12">
            
            <!-- Existing Links -->
            <div>
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 uppercase flex items-center gap-2">
                   <span>Connected Wisdom</span>
                   <span class="text-[10px] opacity-50">{{ linkedMemories().length }}</span>
                </h3>
                @if (linkedMemories().length > 0 && !showGraph()) {
                   <button (click)="showGraph.set(true)" class="text-[10px] font-sans uppercase tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-white border-b border-transparent hover:border-neutral-500 transition-colors">
                     View Graph
                   </button>
                }
              </div>
              
              @if (linkedMemories().length > 0) {
                <div class="space-y-4">
                  @for (link of linkedMemories(); track link.id) {
                    <div class="group relative p-4 bg-white dark:bg-[#151515] border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-300 cursor-pointer">
                      <div (click)="navigateTo(link.id)">
                        <h4 class="font-serif text-sm text-neutral-800 dark:text-neutral-200 mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">{{ link.title }}</h4>
                        <span class="text-[10px] font-sans text-neutral-400 uppercase tracking-wide">{{ link.type }}</span>
                      </div>
                      <button (click)="unlink(m.id, link.id, $event)" class="absolute top-2 right-2 text-neutral-300 hover:text-red-500 transition-colors duration-300 p-1" title="Unlink" aria-label="Unlink memory">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-sm font-serif text-neutral-400 italic">No connections yet. Wisdom connects to wisdom.</p>
              }
            </div>

            <!-- Linker Tool Trigger -->
            <div class="pt-8 border-t border-neutral-100 dark:border-neutral-900">
                 <button (click)="startLinking()" class="w-full py-3 border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-sans text-neutral-500 uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                   + Connect Memory
                 </button>
            </div>

          </div>
        </div>
      }
    </div>

    <!-- Linking Modal -->
    @if (isLinking()) {
      <div class="fixed inset-0 z-[60] flex items-start pt-24 justify-center p-4 animate-fade-in no-print">
        <div class="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm transition-opacity" (click)="stopLinking()"></div>
        
        <div class="relative bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-lg w-full rounded-sm flex flex-col max-h-[70vh] animate-fade-in">
           <!-- Modal Header -->
           <div class="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
             <span class="text-xs font-sans uppercase tracking-widest text-neutral-500">Connect Wisdom</span>
             <button (click)="stopLinking()" class="text-neutral-400 hover:text-black dark:hover:text-white transition-colors">✕</button>
           </div>
           
           <!-- Search -->
           <div class="p-4 border-b border-neutral-100 dark:border-neutral-800">
             <input 
               [ngModel]="searchQuery()" 
               (ngModelChange)="searchQuery.set($event)"
               placeholder="Search for a memory to link..." 
               class="w-full bg-transparent font-serif text-lg outline-none text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600"
               autoFocus
             >
           </div>

           <!-- Results List -->
           <div class="overflow-y-auto p-2 custom-scrollbar">
             @if (candidates().length > 0) {
                @for (candidate of candidates(); track candidate.id) {
                    <button (click)="link(memory()!.id, candidate.id)" class="w-full text-left p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group border-b border-neutral-50 dark:border-neutral-900 last:border-0">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-serif text-sm text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white font-medium">{{ candidate.title }}</span>
                            <span class="text-[9px] font-sans uppercase tracking-widest text-neutral-400">{{ candidate.context }}</span>
                        </div>
                        <p class="text-xs text-neutral-500 dark:text-neutral-500 line-clamp-1 font-serif opacity-80">{{ candidate.body }}</p>
                    </button>
                }
             } @else {
                 <div class="p-8 text-center text-neutral-400 font-serif italic text-sm">
                     @if (searchQuery()) { No matching memories found. } @else { No recent candidates to suggest. }
                 </div>
             }
           </div>
        </div>
      </div>
    }

    <!-- Custom Deletion Modal -->
    @if (showDeleteModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm transition-opacity" (click)="cancelDelete()"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-md w-full p-8 text-center space-y-6">
          <h3 class="font-serif text-xl text-neutral-900 dark:text-white">Forget this memory?</h3>
          <p class="font-sans text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            This action creates a permanent void. The memory will be erased from the vault forever. 
            <br><br>
            Are you sure?
          </p>
          
          <div class="flex flex-col gap-3 pt-4">
            <button 
              [disabled]="!canConfirmDelete()"
              (click)="confirmDelete()"
              class="w-full py-3 bg-red-600 text-white text-xs font-bold tracking-[0.15em] uppercase hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              @if (canConfirmDelete()) { Forget Forever } @else { ... }
            </button>
            <button (click)="cancelDelete()" class="text-xs font-sans text-neutral-500 hover:text-neutral-700 uppercase tracking-widest py-2">
              Keep Memory
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class MemoryDetailComponent {
  store = inject(StoreService);
  
  memory = this.store.activeMemory;
  
  // Linking State
  isLinking = signal(false);
  searchQuery = signal('');
  showGraph = signal(false); // Controls Visualization

  // Deletion State
  showDeleteModal = signal(false);
  canConfirmDelete = signal(false);
  isExiting = signal(false);

  // Computed for links
  linkedMemories = computed(() => {
    const current = this.memory();
    if (!current || !current.linkedMemoryIds) return [];
    
    return this.store.memories()
      .filter(m => current.linkedMemoryIds.includes(m.id));
  });

  // Computed for search candidates (exclude current and already linked)
  candidates = computed(() => {
    const current = this.memory();
    const query = this.searchQuery().toLowerCase();
    if (!current) return [];

    let potential = this.store.memories().filter(m => {
      const isNotSelf = m.id !== current.id;
      const isNotLinked = !(current.linkedMemoryIds || []).includes(m.id);
      const isNotContradiction = !(current.contradictoryMemoryIds || []).includes(m.id);
      return isNotSelf && isNotLinked && isNotContradiction;
    });

    if (query) {
        return potential.filter(m => 
            m.title.toLowerCase().includes(query) || 
            m.body.toLowerCase().includes(query) ||
            m.context.toLowerCase().includes(query)
        );
    } else {
        // Suggest recent 5 if no query
        return potential.slice(0, 5); 
    }
  });

  back() {
    this.store.setView('VAULT');
  }

  edit() {
    const m = this.memory();
    if (m) {
      this.store.startEditing(m.id);
    }
  }

  initiateDelete() {
    this.showDeleteModal.set(true);
    this.canConfirmDelete.set(false);
    
    // Safety delay
    setTimeout(() => {
      this.canConfirmDelete.set(true);
    }, 1500);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
  }

  confirmDelete() {
    const m = this.memory();
    if (!m) return;

    this.showDeleteModal.set(false);
    this.isExiting.set(true);

    setTimeout(() => {
      this.store.deleteMemory(m.id);
    }, 800);
  }

  navigateTo(id: string) {
    this.store.setActiveMemory(id);
    this.stopLinking();
    this.showGraph.set(false); // Close graph on navigation
  }

  startLinking() {
    this.isLinking.set(true);
    this.searchQuery.set('');
  }

  stopLinking() {
    this.isLinking.set(false);
  }

  link(sourceId: string, targetId: string) {
    this.store.linkMemories(sourceId, targetId);
    this.stopLinking();
  }

  unlink(sourceId: string, targetId: string, event: Event) {
    event.stopPropagation();
    if (confirm('Disconnect these memories? This connection will be removed.')) {
      this.store.unlinkMemories(sourceId, targetId);
    }
  }
}
