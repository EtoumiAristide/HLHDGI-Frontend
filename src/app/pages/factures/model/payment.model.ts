export interface Payment {
  id?: number;
  checkNumber: string;
  cardNumber?: string;
  exp?: string;
  qty?: number;
  amount: number;
  tip: number;
  tdt: number;
  tva: number;
  total: number;
  emp: string;
  paymentType: 'CASH' | 'BACKUP_CC' | 'HD_GLOVO' | 'CASH_WAVE';
}

export interface PaymentSummary {
  id?: number;
  pmtType: string;
  qty: number;
  amount: number;
  tip: number;
  total: number;
  percentTot: number;
}