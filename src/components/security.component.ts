
import { Component, inject, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-xl mx-auto px-6 pt-24 pb-12 animate-fade-in min-h-screen">
      
      <!-- Nav -->
      <div class="flex items-center justify-between mb-12">
        <button (click)="back()" class="text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white uppercase transition-colors flex items-center gap-2">
          <span>←</span> Profile
        </button>
      </div>

      <div class="space-y-8 mb-12">
        <h1 class="text-2xl font-serif text-neutral-900 dark:text-white">Vault Security</h1>
        <p class="text-neutral-500 font-sans text-sm max-w-sm leading-relaxed">
          Secure your vault with a numeric passcode. The app will lock automatically when backgrounded.
        </p>
      </div>

      @if (!store.lockSettings().enabled) {
        <div class="space-y-6">
          <div class="space-y-2">
             <label class="text-xs font-sans tracking-widest uppercase text-neutral-500 dark:text-neutral-400">Set Passcode</label>
             <input [(ngModel)]="newCode" type="password" maxlength="6" placeholder="******" 
               class="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-700 text-3xl font-serif py-2 focus:outline-none focus:border-neutral-500 text-neutral-900 dark:text-neutral-100 tracking-widest text-center">
          </div>
          
          <button (click)="enable()" [disabled]="newCode().length < 4" [class.opacity-50]="newCode().length < 4" class="w-full py-3 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-sm text-sm tracking-widest uppercase">
            Enable Lock
          </button>
        </div>
      } @else {
        <div class="bg-neutral-50 dark:bg-[#1A1A1A] p-6 text-center space-y-4 rounded-sm">
           <div class="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto text-xl">🔒</div>
           <h3 class="font-serif text-lg text-neutral-900 dark:text-white">Vault Locked</h3>
           <p class="text-xs text-neutral-500 font-sans">Passcode protection is active.</p>
           
           <button (click)="disable()" class="text-xs text-red-500 uppercase tracking-widest border-b border-transparent hover:border-red-500 pb-1 transition-colors">
             Disable Lock
           </button>
        </div>
      }

    </div>
  `
})
export class SecurityComponent {
  store = inject(StoreService);
  newCode = signal('');

  back() {
    this.store.setView('PROFILE');
  }

  enable() {
    if (this.newCode().length >= 4) {
      this.store.setLockCode(this.newCode());
      this.newCode.set('');
    }
  }

  disable() {
    if (confirm('Disable security lock?')) {
      this.store.logout(); // Simple security measure: logout to disable lock
    }
  }
}
