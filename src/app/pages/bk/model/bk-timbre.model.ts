export interface BkPayment {
  id?: number;
  transactionId?: string;
  checkNumber?: string;
  cardNumber?: string;
  exp?: string;
  qty?: number;
  amount?: number;
  tip?: number;
  tdt?: number;
  tva?: number;
  total?: number;
  emp?: string;
  paymentType?: string;
}

export interface BkTimbreRequest {
  period: string;
  payments?: BkPayment[];
}

export interface BkTimbreDetail {
  transactionId?: string;
  checkNumber?: string;
  paymentType?: string;
  amount?: number;
  stampDuty?: number;
  eligible?: boolean;
  eligibilityReason?: string;
  period?: string;
}

export interface BkTimbreReport {
  period?: string;
  totalStampDuty?: number;
  threshold?: number;
  fixedStampDuty?: number;
  totalTransactions?: number;
  eligibleTransactions?: number;
  details?: BkTimbreDetail[];
}

export interface BkRule {
  eligiblePaymentTypes?: string[];
  threshold?: number;
  stampDuty?: number;
  description?: string;
}
