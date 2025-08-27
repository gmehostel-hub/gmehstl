/**
 * Format date to dd-mm-yyyy format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string in dd-mm-yyyy format
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Format date to dd-mm-yyyy hh:mm format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string in dd-mm-yyyy hh:mm format
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

/**
 * Get current date in dd-mm-yyyy format
 * @returns {string} Current date in dd-mm-yyyy format
 */
export const getCurrentDate = () => {
  return formatDate(new Date());
};

/**
 * Get current date and time in dd-mm-yyyy hh:mm format
 * @returns {string} Current date and time in dd-mm-yyyy hh:mm format
 */
export const getCurrentDateTime = () => {
  return formatDateTime(new Date());
};
