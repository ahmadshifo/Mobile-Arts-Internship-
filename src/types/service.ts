import {
  BILLING_CYCLES,
  SERVICE_CATEGORIES,
  SERVICE_OPERATORS,
  SERVICE_STATUSES,
  TRIAL_DAYS,
} from "@/lib/constants/service";

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export type ServiceOperator = (typeof SERVICE_OPERATORS)[number];

export type BillingCycle = (typeof BILLING_CYCLES)[number];

export type TrialDays = (typeof TRIAL_DAYS)[number];

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export type Service = {
  id: number;
  name: string;
  provider: string;
  category: ServiceCategory;
  description?: string;
  operator: ServiceOperator;
  price: number;
  cycle: BillingCycle;
  trialDays: TrialDays;
  keyword: string;
  shortcode: string;
  notificationUrl: string;
  sendWelcomeSms: boolean;
  status: ServiceStatus;
  subscribers: number;
  createdAt: string;
};