export type MemoryType = 'Insight' | 'Lesson' | 'Mistake' | 'Observation' | 'Experience' | 'Principle';
export type LifeArea = 'Career' | 'Health' | 'Relationships' | 'Money' | 'Philosophy' | 'Study';
export type Weight = 'Light' | 'Medium' | 'Heavy';
export type Importance = 'Low' | 'Medium' | 'High';
export type Cycle = '1m' | '3m' | '1y';
export type LifecycleState = 'Fresh' | 'Settling' | 'Aged' | 'Timeless';

export type SubscriptionPlan = 'Free' | 'Monthly' | 'Yearly' | 'Lifetime';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: SubscriptionPlan;
  joinedAt: string;
}

export interface AppLock {
  enabled: boolean;
  code: string | null;
  biometric: boolean;
}

export interface Reflection {
  id: string;
  date: string;
  content: string;
}

export interface Memory {
  id: string;
  title: string;
  type: MemoryType;
  context: LifeArea;
  body: string;
  associatedPerson?: string;
  weight: Weight;
  importance: Importance;
  revisitCycle: Cycle;
  lifecycle: LifecycleState;
  createdAt: string; 
  nextReviewDate: string; 
  reflections: Reflection[];
  linkedMemoryIds: string[];
  contradictoryMemoryIds: string[];
}

export type ViewState = 
  | 'ONBOARDING' | 'AUTH' | 'VAULT' | 'EDITOR' | 'REVIEW' 
  | 'DETAIL' | 'PROFILE' | 'SUBSCRIPTION' | 'SECURITY' | 'LIMIT_REACHED';

