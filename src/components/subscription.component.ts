import { Component, inject, signal } from '@angular/core';
import { StoreService } from '../services/store.service';
import { NgClass } from '@angular/common';
import { SubscriptionPlan } from '../types';

declare var Razorpay: any;

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="max-w-xl mx-auto px-6 pt-24 pb-12 animate-fade-in min-h-screen">
      
      <div class="flex items-center justify-between mb-12">
        <button (click)="back()" class="text-xs font-sans tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white uppercase transition-colors flex items-center gap-2">
          <span>←</span> Profile
        </button>
      </div>

      <div class="space-y-8 text-center mb-12">
        <h1 class="text-2xl font-serif text-neutral-900 dark:text-white">Commitment to Longevity</h1>
        <p class="text-neutral-500 font-sans text-sm max-w-sm mx-auto leading-relaxed">
          Your support ensures this vault remains private, ad-free, and accessible for decades.
        </p>
      </div>

      <div class="space-y-4">
        @for (plan of plans; track plan.id) {
          <button (click)="initiatePayment(plan.id, plan.price)" 
            class="w-full text-left p-6 border transition-all duration-300 flex justify-between items-center group relative overflow-hidden"
            [class.border-neutral-900]="isActive(plan.id)"
            [class.dark:border-white]="isActive(plan.id)"
            [class.border-neutral-200]="!isActive(plan.id)"
            [class.dark:border-neutral-800]="!isActive(plan.id)"
            [disabled]="isActive(plan.id)">
            
            <div class="relative z-10">
              <div class="font-serif text-lg text-neutral-900 dark:text-white">{{ plan.name }}</div>
              <div class="text-xs font-sans text-neutral-500 mt-1">{{ plan.desc }}</div>
            </div>
            
            @if (isActive(plan.id)) {
               <span class="text-xs font-sans font-bold uppercase tracking-widest relative z-10">Active</span>
            } @else {
               <span class="text-xs font-sans uppercase tracking-widest text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors relative z-10">Select</span>
            }
          </button>
        }
      </div>
      
      <p class="text-center text-[10px] text-neutral-400 mt-12 font-sans uppercase tracking-widest">
        Secure Payment via Razorpay
      </p>

    </div>
  `
})
export class SubscriptionComponent {
  store = inject(StoreService);
  
  plans = [
    { id: 'Free', name: 'Free Vault', desc: '30 memories limit', price: 0 },
    { id: 'Monthly', name: 'Monthly', desc: '₹99 / month • Unlimited', price: 9900 },
    { id: 'Yearly', name: 'Yearly', desc: '₹1199 / year • Unlimited', price: 119900 },
    { id: 'Lifetime', name: 'Lifetime Access', desc: '₹3599 one-time • Unlimited', price: 359900 }
  ];

  constructor() {
    this.loadRazorpay();
  }

  back() {
    this.store.setView('PROFILE');
  }

  isActive(plan: string) {
    return this.store.user()?.plan === plan;
  }

  loadRazorpay() {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }

  initiatePayment(plan: string, amount: number) {
    if (plan === 'Free') {
        this.store.updateSubscription('Free');
        return;
    }

    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Key ID when ready
      amount: amount, 
      currency: "INR",
      name: "Memory Bank",
      description: `${plan} Plan Subscription`,
      handler: (response: any) => {
        this.store.updateSubscription(plan as SubscriptionPlan);
        alert(`Welcome to ${plan} access.`);
      },
      theme: { color: "#121212" }
    };

    try {
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (e) {
      console.warn('Razorpay loading... Using Demo Mode.');
      if(confirm(`(Demo Mode) Confirm payment of ₹${amount/100} for ${plan}?`)) {
          this.store.updateSubscription(plan as SubscriptionPlan);
      }
    }
  }
}
