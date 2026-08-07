// ─── Date & Time Helpers ───────────────────────────────────────────────────────

/**
 * Format ISO string to "DD MMM YYYY" e.g. "05 Aug 2026"
 */
export const formatDate = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Format ISO string to "DD MMM YYYY, HH:MM" e.g. "05 Aug 2026, 14:30"
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
};

/**
 * Format hours as "2h 30m" or "45m"
 */
export const formatHours = (hours) => {
  if (!hours || hours === 0) return '0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Returns relative time string e.g. "2 hours ago"
 */
export const timeAgo = (isoString) => {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ─── Number Helpers ────────────────────────────────────────────────────────────

export const formatCurrency = (value) => {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value) => {
  if (value == null) return '—';
  return `${Number(value).toFixed(1)}%`;
};

// ─── String Helpers ────────────────────────────────────────────────────────────

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const titleCase = (str) => {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\w\S*/g, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
};

// ─── Status Color Helpers ──────────────────────────────────────────────────────

export const getStatusColor = (status) => {
  const map = {
    NEW: 'info',
    ASSIGNED: 'primary',
    STARTED: 'warning',
    IN_PROGRESS: 'warning',
    RESUMED: 'warning',
    ON_HOLD: 'default',
    COMPLETED: 'success',
    CANCELLED: 'error',
  };
  return map[status] || 'default';
};

export const getPriorityColor = (priority) => {
  const map = {
    LOW:    '#4CAF50',
    MEDIUM: '#FF9800',
    HIGH:   '#F44336',
    URGENT: '#9C27B0',
  };
  return map[priority] || '#9E9E9E';
};

export const getPriorityBgColor = (priority) => {
  const map = {
    LOW:    '#E8F5E9',
    MEDIUM: '#FFF3E0',
    HIGH:   '#FFEBEE',
    URGENT: '#F3E5F5',
  };
  return map[priority] || '#F5F5F5';
};
