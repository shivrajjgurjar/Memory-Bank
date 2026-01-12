
import { Component, inject, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { StoreService } from '../services/store.service';
import { MemoryType, LifeArea, Importance, Weight, Cycle } from '../types';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [FormsModule, NgClass],
  template: `
    <div class="max-w-3xl mx-auto pt-24 pb-24 px-6 animate-fade-in">
      <!-- Header / Nav -->
      <div class="flex justify-between items-center mb-12">
        <button (click)="cancel()" class="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors font-sans text-sm tracking-wide uppercase">
          Cancel
        </button>
        <div class="text-xs font-sans tracking-widest text-neutral-400 uppercase">
          @if (isEditing()) { Refine Memory } @else { New Deposit }
        </div>
        <button (click)="save()" [disabled]="!isValid()" 
                [class.opacity-50]="!isValid()"
                class="px-6 py-2 bg-neutral-900 text-white dark:bg-white dark:text-black rounded-sm text-sm tracking-widest uppercase transition-all duration-300">
          @if (isEditing()) { Update } @else { Secure }
        </button>
      </div>

      <!-- Main Input -->
      <div class="space-y-12">
        
        <!-- Title -->
        <div class="group">
          <label class="block text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 uppercase group-focus-within:text-neutral-700 dark:group-focus-within:text-neutral-200 transition-colors">Title</label>
          <input [(ngModel)]="title" type="text" placeholder="Name this memory..." 
                 class="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 text-3xl font-serif placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors py-2 text-neutral-900 dark:text-neutral-100">
        </div>

        <!-- Metadata Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <!-- Type -->
          <div>
            <label class="block text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 mb-3 uppercase">Type</label>
            <div class="flex flex-wrap gap-2">
              @for (t of types; track t) {
                <button (click)="type.set(t)" 
                        [class.bg-neutral-900]="type() === t" 
                        [class.text-white]="type() === t"
                        [class.dark:bg-white]="type() === t"
                        [class.dark:text-black]="type() === t"
                        class="px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-sm text-xs font-sans transition-all duration-300 hover:border-neutral-400 text-neutral-600 dark:text-neutral-300">
                  {{ t }}
                </button>
              }
            </div>
          </div>

          <!-- Context -->
          <div>
            <label class="block text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 mb-3 uppercase">Life Area</label>
            <div class="flex flex-wrap gap-2">
              @for (c of contexts; track c) {
                <button (click)="context.set(c)"
                        [class.bg-neutral-900]="context() === c" 
                        [class.text-white]="context() === c"
                        [class.dark:bg-white]="context() === c"
                        [class.dark:text-black]="context() === c"
                        class="px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-sm text-xs font-sans transition-all duration-300 hover:border-neutral-400 text-neutral-600 dark:text-neutral-300">
                  {{ c }}
                </button>
              }
            </div>
          </div>

        </div>

        <!-- Person (New) -->
        <div class="group">
          <label class="block text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 uppercase group-focus-within:text-neutral-700 dark:group-focus-within:text-neutral-200 transition-colors">Associated Person (Optional)</label>
          <input [(ngModel)]="associatedPerson" type="text" placeholder="Who was this with?" 
                 class="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 text-lg font-serif placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors py-2 text-neutral-900 dark:text-neutral-100">
        </div>

        <!-- Deep Work Area (Content) -->
        <div class="group relative">
          <div class="mb-4">
            <label class="block text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">Content</label>
          </div>

          <textarea 
            #textArea
            [(ngModel)]="body" 
            rows="12" 
            placeholder="Capture the essence. What did you learn? What is the truth here?"
            class="w-full bg-transparent border-l-2 border-transparent focus:border-neutral-200 dark:focus:border-neutral-800 pl-4 resize-none font-serif text-lg leading-loose text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none transition-colors"
          ></textarea>
        </div>

        <!-- Footer Metadata -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-neutral-100 dark:border-neutral-900">
          
          <!-- Importance -->
          <div>
            <label class="block text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 mb-3 uppercase">Importance</label>
            <div class="flex gap-2">
               @for (i of importances; track i) {
                <button (click)="importance.set(i)"
                  [class.underline]="importance() === i"
                  class="text-xs font-sans text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {{ i }}
                </button>
               }
            </div>
          </div>

          <!-- Weight -->
          <div>
            <label class="block text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 mb-3 uppercase">Emotional Weight</label>
            <div class="flex gap-2">
               @for (w of weights; track w) {
                <button (click)="weight.set(w)"
                  [class.underline]="weight() === w"
                  class="text-xs font-sans text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {{ w }}
                </button>
               }
            </div>
          </div>

          <!-- Revisit -->
          <div>
            <label class="block text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 mb-3 uppercase">Revisit Cycle</label>
             <div class="flex gap-4">
               @for (c of cycles; track c) {
                <button (click)="cycle.set(c)"
                  [class.font-bold]="cycle() === c"
                  class="text-xs font-sans text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {{ c }}
                </button>
               }
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class EditorComponent {
  private store = inject(StoreService);

  // Form State
  title = signal('');
  body = signal('');
  type = signal<MemoryType>('Insight');
  context = signal<LifeArea>('Philosophy');
  associatedPerson = signal(''); 
  importance = signal<Importance>('Medium');
  weight = signal<Weight>('Medium');
  cycle = signal<Cycle>('3m');

  isEditing = signal(false);

  // Options
  types: MemoryType[] = ['Insight', 'Lesson', 'Mistake', 'Observation', 'Experience', 'Principle'];
  contexts: LifeArea[] = ['Career', 'Health', 'Relationships', 'Money', 'Philosophy', 'Study'];
  importances: Importance[] = ['Low', 'Medium', 'High'];
  weights: Weight[] = ['Light', 'Medium', 'Heavy'];
  cycles: Cycle[] = ['1m', '3m', '1y'];

  constructor() {
    const existing = this.store.editingMemory();
    if (existing) {
      this.isEditing.set(true);
      this.title.set(existing.title);
      this.body.set(existing.body);
      this.type.set(existing.type);
      this.context.set(existing.context);
      this.associatedPerson.set(existing.associatedPerson || '');
      this.importance.set(existing.importance);
      this.weight.set(existing.weight);
      this.cycle.set(existing.revisitCycle);
    }
  }

  isValid() {
    return this.title().length > 0 && this.body().length > 0;
  }

  save() {
    if (!this.isValid()) return;
    
    const payload = {
      title: this.title(),
      body: this.body(),
      type: this.type(),
      context: this.context(),
      associatedPerson: this.associatedPerson(),
      importance: this.importance(),
      weight: this.weight(),
      revisitCycle: this.cycle()
    };

    if (this.isEditing()) {
      const id = this.store.editingMemory()?.id;
      if (id) {
        this.store.updateMemory(id, payload);
      }
    } else {
      this.store.addMemory(payload);
    }
  }

  cancel() {
    if (this.isEditing() && this.store.activeMemory()) {
      this.store.setView('DETAIL');
    } else {
      this.store.setView('VAULT');
    }
  }
}
