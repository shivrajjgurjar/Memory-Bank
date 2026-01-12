import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important for NgClass
import { StoreService } from './services/store.service';
import { OnboardingComponent } from './components/onboarding.component';
import { AuthComponent } from './components/auth.component';
import { VaultComponent } from './components/vault.component';
import { EditorComponent } from './components/editor.component';
import { ReviewComponent } from './components/review.component';
import { MemoryDetailComponent } from './components/memory-detail.component';
import { ProfileComponent } from './components/profile.component';
import { SubscriptionComponent } from './components/subscription.component';
import { SecurityComponent } from './components/security.component';
import { LockScreenComponent } from './components/lock-screen.component';
import { LimitScreenComponent } from './components/limit-screen.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    OnboardingComponent, 
    AuthComponent,
    VaultComponent, 
    EditorComponent, 
    ReviewComponent, 
    MemoryDetailComponent, 
    ProfileComponent,
    SubscriptionComponent,
    SecurityComponent,
    LockScreenComponent,
    LimitScreenComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  store = inject(StoreService);
}

