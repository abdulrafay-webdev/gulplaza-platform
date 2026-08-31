export const formatCurrency = (amount?: number | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rs. 0';
  }
  return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
};

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return dateStr;
  }
};
