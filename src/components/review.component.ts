
import { Component, inject, signal, computed } from '@angular/core';
import { StoreService } from '../services/store.service';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Memory } from '../types';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [DatePipe, FormsModule, NgClass],
  template: `
    <div class="min-h-screen bg-[#FDFBF7] dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-6 transition-colors duration-700">
      
      @if (currentMemory(); as memory) {
        <div class="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start animate-fade-in">
          
          <!-- Left: The Past -->
          <div class="space-y-8 lg:sticky lg:top-24">
             <div class="space-y-2">
               <div class="text-xs font-sans tracking-[0.2em] text-neutral-400 uppercase">From Your Past Self</div>
               <div class="text-xs font-sans text-neutral-500">{{ memory.createdAt | date:'mediumDate' }}</div>
             </div>

             <div class="border-l-2 border-neutral-200 dark:border-neutral-800 pl-6 py-2">
               <h2 class="text-2xl font-serif text-neutral-800 dark:text-neutral-100 mb-4">{{ memory.title }}</h2>
               <p class="font-serif text-lg leading-loose text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
                 {{ memory.body }}
               </p>
             </div>

             <div class="flex gap-4">
               <span class="text-xs font-sans px-2 py-1 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-500">{{ memory.type }}</span>
               <span class="text-xs font-sans px-2 py-1 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-500">{{ memory.context }}</span>
             </div>
             
             @if (memory.reflections.length > 0) {
               <div class="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-900 space-y-6">
                  <div class="text-xs font-sans tracking-[0.2em] text-neutral-400 uppercase">Previous Reflections</div>
                  @for (ref of memory.reflections; track ref.id) {
                    <div class="text-sm font-serif text-neutral-500 italic pl-4 border-l border-neutral-200 dark:border-neutral-800">
                      "{{ ref.content }}" <br>
                      <span class="text-xs not-italic text-neutral-400 mt-1 block">— {{ ref.date | date:'shortDate' }}</span>
                    </div>
                  }
               </div>
             }
          </div>

          <!-- Right: The Present Reflection -->
          <div class="bg-white dark:bg-[#151515] p-8 lg:p-12 shadow-sm border border-neutral-100 dark:border-neutral-800 rounded-sm space-y-8">
            <div class="space-y-2">
              <h3 class="font-serif text-xl text-neutral-800 dark:text-neutral-100">Review Ritual</h3>
              <p class="text-sm font-sans text-neutral-500">Take a moment. Read your past thought. Is it still true?</p>
            </div>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-xs font-sans tracking-widest text-neutral-400 uppercase">Reflection</label>
                <textarea [(ngModel)]="reflectionText" rows="6" 
                  class="w-full bg-neutral-50 dark:bg-[#1A1A1A] border-none p-4 font-serif text-neutral-700 dark:text-neutral-300 focus:ring-1 focus:ring-neutral-200 dark:focus:ring-neutral-700 outline-none resize-none rounded-sm"
                  placeholder="What have you learned since writing this?"></textarea>
              </div>
            </div>

            <div class="flex justify-between items-center pt-4">
              <button (click)="skip()" class="text-xs font-sans tracking-widest text-neutral-400 hover:text-neutral-600 uppercase transition-colors">
                Skip for now
              </button>
              <button (click)="completeReview(memory.id)" [disabled]="!reflectionText()" 
                [class.opacity-50]="!reflectionText()"
                class="px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-black text-xs tracking-[0.15em] uppercase hover:shadow-lg transition-all duration-500">
                Compound Wisdom
              </button>
            </div>
          </div>

        </div>
      } @else {
        <div class="text-center space-y-6 animate-fade-in">
           <div class="w-16 h-16 border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
             <span class="font-serif italic text-2xl text-neutral-400">✓</span>
           </div>
           <h2 class="text-2xl font-serif text-neutral-800 dark:text-neutral-100">Ritual Complete</h2>
           <p class="text-neutral-500 max-w-md mx-auto font-sans leading-relaxed">
             You have reviewed all pending memories. Your wisdom has compounded.
           </p>
           <button (click)="finish()" class="mt-8 text-xs font-sans tracking-widest uppercase border-b border-transparent hover:border-neutral-400 transition-colors pb-1">
             Return to Vault
           </button>
        </div>
      }
    </div>
  `
})
export class ReviewComponent {
  private store = inject(StoreService);
  
  // Local state to track which memory we are reviewing
  currentIndex = signal(0);
  reflectionText = signal('');

  // Get the list of memories due for review
  reviewQueue = this.store.dueForReview;

  // Get the current memory based on index
  currentMemory = computed(() => {
    const queue = this.reviewQueue();
    if (this.currentIndex() < queue.length) {
      return queue[this.currentIndex()];
    }
    return null;
  });

  skip() {
    this.reflectionText.set('');
    this.currentIndex.update(i => i + 1);
  }

  completeReview(id: string) {
    if (this.reflectionText()) {
      this.store.addReflection(id, this.reflectionText());
      this.reflectionText.set('');
      this.currentIndex.update(i => i + 1);
    }
  }

  finish() {
    this.store.setView('VAULT');
  }
}
