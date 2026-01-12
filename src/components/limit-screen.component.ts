
import { Component, inject } from '@angular/core';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-limit-screen',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center animate-fade-in">
      
      <div class="space-y-8">
        <h1 class="text-3xl font-serif text-neutral-800 dark:text-neutral-100">The vault is full.</h1>
        <p class="text-neutral-500 dark:text-neutral-400 font-sans text-sm leading-relaxed">
          You have reached the capacity of the Free tier (30 memories). <br>
          To continue entrusting wisdom here, choose how you'd like to support the system.
        </p>

        <div class="space-y-4 pt-4">
          <button (click)="plans()" class="w-full px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-sm hover:opacity-90 transition-opacity text-sm tracking-widest uppercase">
            View Plans
          </button>
          
          <button (click)="review()" class="w-full px-6 py-3 border border-neutral-200 dark:border-neutral-800 rounded-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors text-sm tracking-widest uppercase text-neutral-500">
            Review Existing
          </button>
        </div>
      </div>

    </div>
  `
})
export class LimitScreenComponent {
  store = inject(StoreService);

  plans() {
    this.store.setView('SUBSCRIPTION');
  }

  review() {
    this.store.setView('VAULT');
  }
}
