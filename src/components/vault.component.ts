import { Component, inject, computed, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { DatePipe, NgClass, SlicePipe } from '@angular/common';
import { LifeArea, MemoryType } from '../types';

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [DatePipe, NgClass, SlicePipe],
  template: `
    <div class="max-w-5xl mx-auto px-6 pt-24 pb-32 animate-fade-in min-h-screen">
      
      @if (activeFilter() !== 'NONE') {
        <div class="fixed inset-0 z-10 bg-transparent cursor-default" (click)="closeFilters()"></div>
      }

      <div class="flex flex-col md:flex-row justify-between items-end md:items-center mb-16 gap-6 relative z-0">
        <div>
          <h1 class="text-3xl font-serif text-neutral-900 dark:text-white mb-2 tracking-tight select-none cursor-default">Memory Vault</h1>
          <p class="text-sm font-sans text-neutral-500 dark:text-neutral-400 select-none cursor-default">
            {{ store.memories().length }} memories stored. {{ store.dueForReview().length }} due for review.
          </p>
        </div>
        
        <div class="flex gap-4">
           @if (store.dueForReview().length > 0) {
             <button (click)="store.setView('REVIEW')" class="px-5 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs tracking-widest uppercase hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors select-none">
               Review Ritual ({{ store.dueForReview().length }})
             </button>
           }
           <button (click)="store.startCreating()" class="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs tracking-widest uppercase hover:opacity-90 transition-opacity shadow-sm select-none">
             New Memory
           </button>
        </div>
      </div>

      <div class="relative z-20 flex flex-wrap gap-6 mb-12 pb-6 border-b border-neutral-100 dark:border-neutral-900 items-end">
        
        <div class="space-y-2 relative">
          <button (click)="toggleFilter('CONTEXT')" class="block w-40 text-left bg-transparent text-sm font-serif border-b border-neutral-200 dark:border-neutral-800 py-2 text-neutral-800 dark:text-neutral-200 cursor-pointer flex justify-between items-center outline-none">
            <span class="truncate">{{ filterContext() === 'ALL' ? 'All Areas' : filterContext() }}</span>
            <span class="text-[10px] text-neutral-400">▼</span>
          </button>
          @if (activeFilter() === 'CONTEXT') {
            <div class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1A1A1A] border border-neutral-100 dark:border-neutral-800 shadow-2xl rounded-sm max-h-64 overflow-y-auto z-50">
               <button (click)="setContext('ALL')" class="w-full text-left px-4 py-3 text-sm font-serif text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900">All Areas</button>
               @for (area of areas; track area) {
                 <button (click)="setContext(area)" class="w-full text-left px-4 py-3 text-sm font-serif text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900">{{ area }}</button>
               }
            </div>
          }
        </div>

        <div class="space-y-2 relative">
           <button (click)="toggleFilter('TYPE')" class="block w-40 text-left bg-transparent text-sm font-serif border-b border-neutral-200 dark:border-neutral-800 py-2 text-neutral-800 dark:text-neutral-200 cursor-pointer flex justify-between items-center outline-none">
            <span class="truncate">{{ filterType() === 'ALL' ? 'All Types' : filterType() }}</span>
            <span class="text-[10px] text-neutral-400">▼</span>
          </button>
          @if (activeFilter() === 'TYPE') {
            <div class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1A1A1A] border border-neutral-100 dark:border-neutral-800 shadow-2xl rounded-sm max-h-64 overflow-y-auto z-50">
               <button (click)="setType('ALL')" class="w-full text-left px-4 py-3 text-sm font-serif text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900">All Types</button>
               @for (t of types; track t) {
                 <button (click)="setType(t)" class="w-full text-left px-4 py-3 text-sm font-serif text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900">{{ t }}</button>
               }
            </div>
          }
        </div>

        <div class="ml-auto space-y-2">
           <input (input)="searchQuery.set($any($event.target).value)" placeholder="Search wisdom..." class="bg-transparent text-sm font-serif border-b border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 outline-none text-right w-48 py-2 placeholder-neutral-400 dark:placeholder-neutral-600 text-neutral-800 dark:text-neutral-200">
        </div>
      </div>

      @if (filteredMemories().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
          @for (memory of filteredMemories(); track memory.id) {
            <div [class.opacity-50]="exitingMemoryId() === memory.id" class="group relative bg-white dark:bg-[#151515] p-6 border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-500 flex flex-col h-64 select-none">
              
              <div class="flex justify-between items-start mb-4">
                <span class="text-[10px] font-sans font-bold tracking-widest uppercase text-neutral-400">{{ memory.context }}</span>
                <span class="text-[10px] font-sans text-neutral-400 dark:text-neutral-500">{{ memory.createdAt | date:'MMM y' }}</span>
              </div>

              <h3 class="font-serif text-lg text-neutral-800 dark:text-neutral-100 mb-3 line-clamp-2 leading-snug group-hover:text-black dark:group-hover:text-white transition-colors">{{ memory.title }}</h3>
              <p class="font-serif text-sm text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed flex-grow">{{ memory.body }}</p>

              <div class="mt-4 pt-4 border-t border-neutral-50 dark:border-neutral-900 flex justify-between items-center">
                <span class="px-1.5 py-0.5 bg-neutral-50 dark:bg-neutral-900 text-[10px] font-sans text-neutral-500 rounded-sm uppercase tracking-wider">{{ memory.type }}</span>
              </div>

              <div class="absolute inset-0 bg-neutral-900/95 dark:bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-6 z-10">
                 <button class="px-8 py-3 bg-white text-black dark:bg-white dark:text-black text-xs font-sans font-bold tracking-[0.15em] uppercase hover:scale-105 transition-transform duration-300 shadow-lg" (click)="openDetail(memory.id)">Open Memory</button>
                 <button class="text-[10px] font-sans text-neutral-400 hover:text-red-500 uppercase tracking-widest border-b border-transparent hover:border-red-500 transition-colors pb-0.5" (click)="initiateDelete(memory.id, $event)">Forget</button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-24"><p class="font-serif text-neutral-400 italic select-none">No memories found.</p></div>
      }
    </div>
  `
})
export class VaultComponent {
  store = inject(StoreService);
  
  filterContext = signal<string>('ALL');
  filterType = signal<string>('ALL');
  searchQuery = signal<string>('');
  activeFilter = signal<'NONE' | 'CONTEXT' | 'TYPE'>('NONE');
  exitingMemoryId = signal<string | null>(null);

  areas: LifeArea[] = ['Career', 'Health', 'Relationships', 'Money', 'Philosophy', 'Study'];
  types: MemoryType[] = ['Insight', 'Lesson', 'Mistake', 'Observation', 'Experience', 'Principle'];

  filteredMemories = computed(() => {
    let mems = this.store.memories();
    const ctx = this.filterContext();
    const type = this.filterType();
    const q = this.searchQuery().toLowerCase();

    if (ctx !== 'ALL') mems = mems.filter(m => m.context === ctx);
    if (type !== 'ALL') mems = mems.filter(m => m.type === type);
    if (q) mems = mems.filter(m => m.title.toLowerCase().includes(q) || m.body.toLowerCase().includes(q));
    
    return mems;
  });

  openDetail(id: string) { this.store.setActiveMemory(id); }
  toggleFilter(type: 'CONTEXT' | 'TYPE') { this.activeFilter.set(this.activeFilter() === type ? 'NONE' : type); }
  closeFilters() { this.activeFilter.set('NONE'); }
  setContext(val: string) { this.filterContext.set(val); this.closeFilters(); }
  setType(val: string) { this.filterType.set(val); this.closeFilters(); }

  initiateDelete(id: string, event: Event) {
    event.stopPropagation();
    if(confirm('Forget this memory forever?')) {
        this.exitingMemoryId.set(id);
        setTimeout(() => {
            this.store.deleteMemory(id);
            this.exitingMemoryId.set(null);
        }, 300);
    }
  }
}
