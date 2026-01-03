// Currency utility functions for INR

export function formatINR(amount: number): string {
  // Format in Indian numbering system (lakhs, crores)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRShort(amount: number): string {
  // Format large numbers with L (lakhs) and Cr (crores)
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)} K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function parseINR(amountStr: string): number {
  // Remove currency symbols and commas, then parse
  return parseFloat(amountStr.replace(/[₹,]/g, ''));
}

export function calculateMonthlyFromAnnual(annual: number): number {
  return Math.round(annual / 12);
}

export function calculateAnnualFromMonthly(monthly: number): number {
  return monthly * 12;
}
