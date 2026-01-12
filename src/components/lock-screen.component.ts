
import { Component, inject, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lock-screen',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="fixed inset-0 z-[100] bg-[#F7F6F3] dark:bg-[#121212] flex flex-col items-center justify-center p-8 transition-colors duration-700">
      
      <div class="w-full max-w-xs space-y-8 text-center animate-fade-in">
        <div class="space-y-2">
           <h1 class="text-2xl font-serif text-neutral-900 dark:text-white">This vault is protected.</h1>
           <p class="text-xs font-sans text-neutral-500 tracking-widest uppercase">Enter Passcode</p>
        </div>

        <input #codeInput type="password" maxlength="6" (keyup)="check($event)"
               class="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-700 text-4xl font-serif py-4 focus:outline-none focus:border-neutral-500 text-neutral-900 dark:text-neutral-100 tracking-[0.5em] text-center placeholder-neutral-200 dark:placeholder-neutral-800">
        
        @if (error()) {
          <p class="text-xs text-red-500 font-sans uppercase tracking-widest animate-pulse">Incorrect Passcode</p>
        }
      </div>

    </div>
  `
})
export class LockScreenComponent {
  store = inject(StoreService);
  error = signal(false);

  check(event: any) {
    const val = event.target.value;
    if (val.length >= 4) {
      const success = this.store.unlock(val);
      if (!success) {
        this.error.set(true);
        setTimeout(() => this.error.set(false), 1000);
        event.target.value = '';
      }
    }
  }
}
