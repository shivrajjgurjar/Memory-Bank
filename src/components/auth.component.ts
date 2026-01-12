import { Component, inject, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center animate-fade-in">
      
      @if (step() === 'GOOGLE') {
        <div class="space-y-8 w-full">
          <h1 class="text-2xl font-serif text-neutral-800 dark:text-neutral-100">Sign in to Memory Bank</h1>
          <p class="text-neutral-500 dark:text-neutral-400 font-sans text-sm">
            Your vault is encrypted in the cloud. Only you hold the key.
          </p>

          <button (click)="login()" class="w-full bg-white dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 py-3 rounded-sm flex items-center justify-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span class="text-sm font-sans font-medium">Sign in with Google</span>
          </button>
        </div>
      }
      
      @if (step() === 'LOADING') {
         <div class="flex flex-col items-center justify-center space-y-4 animate-fade-in">
           <div class="w-8 h-8 border-2 border-neutral-200 border-t-neutral-800 dark:border-neutral-800 dark:border-t-white rounded-full animate-spin"></div>
           <p class="text-xs font-sans tracking-widest uppercase text-neutral-400">Authenticating...</p>
         </div>
      }

    </div>
  `
})
export class AuthComponent {
  store = inject(StoreService);
  step = signal<'GOOGLE' | 'LOADING'>('GOOGLE');

  async login() {
    this.step.set('LOADING');
    await this.store.loginWithGoogle();
    // StoreService automatically handles the redirect to VAULT upon success
  }
}

