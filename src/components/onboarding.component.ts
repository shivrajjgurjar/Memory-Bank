
import { Component, inject, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center">
      
      @if (step() === 0) {
        <div class="animate-fade-in space-y-8">
          <h1 class="text-3xl font-serif tracking-tight text-neutral-800 dark:text-neutral-100">
            Welcome to Memory Bank.
          </h1>
          <p class="text-neutral-500 dark:text-neutral-400 font-sans text-lg max-w-md mx-auto leading-relaxed">
            This is not a notes app. This is a sanctuary for your lived wisdom.
          </p>
          <button (click)="next()" class="mt-8 px-6 py-3 border border-neutral-300 dark:border-neutral-700 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-500 text-sm tracking-widest uppercase">
            Begin
          </button>
        </div>
      }

      @if (step() === 1) {
        <div class="animate-fade-in space-y-8">
          <p class="font-serif text-xl italic text-neutral-600 dark:text-neutral-300 leading-loose">
            "Humans forget insights faster than they gain them. Wisdom compounds only when revisited."
          </p>
          <div class="space-y-4 font-sans text-sm text-neutral-500 dark:text-neutral-400">
            <p>We do not optimize for speed.</p>
            <p>We optimize for depth.</p>
          </div>
          <button (click)="next()" class="mt-8 px-6 py-3 border border-neutral-300 dark:border-neutral-700 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-500 text-sm tracking-widest uppercase">
            Understand
          </button>
        </div>
      }

      @if (step() === 2) {
        <div class="animate-fade-in space-y-8">
          <h2 class="text-2xl font-serif text-neutral-800 dark:text-neutral-100">
            Your Private Vault
          </h2>
          <ul class="text-left space-y-4 max-w-sm mx-auto font-sans text-neutral-600 dark:text-neutral-400">
            <li class="flex items-center gap-3">
              <span class="w-1.5 h-1.5 bg-neutral-400 rounded-full"></span>
              <span>Local storage only.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-1.5 h-1.5 bg-neutral-400 rounded-full"></span>
              <span>No AI generation.</span>
            </li>
            <li class="flex items-center gap-3">
              <span class="w-1.5 h-1.5 bg-neutral-400 rounded-full"></span>
              <span>No social features.</span>
            </li>
          </ul>
          <button (click)="finish()" class="mt-12 px-8 py-3 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-sm hover:opacity-90 transition-opacity duration-500 text-sm tracking-widest uppercase shadow-sm">
            Enter the Bank
          </button>
        </div>
      }

    </div>
  `
})
export class OnboardingComponent {
  private store = inject(StoreService);
  step = signal(0);

  next() {
    this.step.update(s => s + 1);
  }

  finish() {
    this.store.setView('AUTH');
  }
}
