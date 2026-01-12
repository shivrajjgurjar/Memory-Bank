
import { Component, inject, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { NgClass, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgClass, TitleCasePipe],
  template: `
    <div class="max-w-xl mx-auto px-6 pt-24 pb-12 animate-fade-in min-h-screen">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-16">
        <button (click)="back()" class="text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white uppercase transition-colors flex items-center gap-2">
          <span>←</span> Vault
        </button>
        <span class="text-xs font-sans tracking-widest text-neutral-400 uppercase">Identity</span>
      </div>

      @if (store.user(); as user) {
        <div class="space-y-12">
          
          <!-- Identity Card -->
          <div class="text-center space-y-2 pb-12 border-b border-neutral-100 dark:border-neutral-900">
            <h1 class="text-3xl font-serif text-neutral-900 dark:text-white">{{ user.name }}</h1>
            <p class="text-sm font-sans text-neutral-500">{{ user.email }}</p>
            <div class="pt-4">
              <span class="inline-block px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-xs font-sans tracking-widest uppercase text-neutral-600 dark:text-neutral-300 rounded-sm">
                {{ user.plan }} Member
              </span>
            </div>
          </div>

          <!-- Menu -->
          <div class="space-y-1">
            <button (click)="store.setView('VAULT')" class="w-full flex items-center justify-between py-4 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group">
              <span class="font-serif text-lg text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">Memories</span>
              <span class="text-neutral-300 dark:text-neutral-600">→</span>
            </button>
            
            <button (click)="store.setView('SUBSCRIPTION')" class="w-full flex items-center justify-between py-4 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group">
              <span class="font-serif text-lg text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">Subscription</span>
              <span class="text-neutral-300 dark:text-neutral-600">→</span>
            </button>

            <button (click)="store.setView('SECURITY')" class="w-full flex items-center justify-between py-4 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group">
              <div class="flex flex-col text-left">
                <span class="font-serif text-lg text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">Security</span>
                @if (store.lockSettings().enabled) {
                  <span class="text-[10px] font-sans text-neutral-400 uppercase tracking-widest mt-1">Locked</span>
                }
              </div>
              <span class="text-neutral-300 dark:text-neutral-600">→</span>
            </button>
            
            <button (click)="store.exportData()" class="w-full flex items-center justify-between py-4 px-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group">
              <span class="font-serif text-lg text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">Export Data</span>
              <span class="text-xs font-sans text-neutral-400 uppercase tracking-widest">JSON</span>
            </button>
          </div>

          <!-- Danger Zone -->
          <div class="pt-12 mt-12 border-t border-neutral-100 dark:border-neutral-900 space-y-4">
             <button (click)="store.logout()" class="w-full py-3 border border-neutral-200 dark:border-neutral-800 text-xs font-sans tracking-widest uppercase text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
               Sign Out
             </button>
             
             <button (click)="confirmDelete()" class="w-full py-3 text-xs font-sans tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors">
               Delete Account
             </button>
          </div>

        </div>
      }
    </div>
  `
})
export class ProfileComponent {
  store = inject(StoreService);

  back() {
    this.store.setView('VAULT');
  }

  confirmDelete() {
    if (confirm('Are you sure? This will erase your local vault permanently.')) {
      this.store.deleteAccount();
    }
  }
}
