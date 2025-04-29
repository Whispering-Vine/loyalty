// Phone number utility functions
export const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    // Add spaces for readability (XXX XXX XXXX)
    const parts = [];
    if (limited.length > 0) parts.push(limited.slice(0, 3));
    if (limited.length > 3) parts.push(limited.slice(3, 6));
    if (limited.length > 6) parts.push(limited.slice(6, 10));
    
    return parts.join(' ');
  };
  
  export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const digits = phoneNumber.replace(/\D/g, '');
    return digits.length === 10;
  };
  
  export const unformatPhoneNumber = (formatted: string): string => {
    return formatted.replace(/\D/g, '');
  };