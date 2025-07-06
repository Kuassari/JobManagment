import { format, isValid } from 'date-fns';

/**
 * Format a date string from ISO format to a human-readable format
 * @param dateString ISO date string
 * @param formatStr Format string (default: 'MMM dd, yyyy HH:mm:ss')
 * @returns Formatted date string or '-' if invalid
 */
export const formatDate = (
  dateString?: string | null,
  formatStr: string = 'MMM dd, yyyy HH:mm:ss'
): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (!isValid(date)) return '-';
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Format a relative time (e.g., "2 hours ago")
 * This is a placeholder function - you may want to use a library like date-fns for this
 */
export const formatRelativeTime = (dateString?: string | null): string => {
  if (!dateString) return '-';
  
  try {
    // Implementation would go here
    // For now, just return the formatted date
    return formatDate(dateString);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '-';
  }
};

/**
 * Format duration between two dates in a human-readable format
 * @param startDateString ISO date string for start time
 * @param endDateString ISO date string for end time
 * @returns Formatted duration string or '-' if invalid
 */
export const formatDuration = (
  startDateString?: string | null,
  endDateString?: string | null
): string => {
  if (!startDateString || !endDateString) return '-';
  
  try {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    
    if (!isValid(startDate) || !isValid(endDate)) return '-';
    
    const durationMs = endDate.getTime() - startDate.getTime();
    
    if (durationMs < 0) return '-';
    
    const seconds = Math.floor(durationMs / 1000) % 60;
    const minutes = Math.floor(durationMs / (1000 * 60)) % 60;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  } catch (error) {
    console.error('Error formatting duration:', error);
    return '-';
  }
};