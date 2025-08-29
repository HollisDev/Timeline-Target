'use client';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getPasswordStrength = (password: string) => {
  const feedback: string[] = [];

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasMinLength)
    feedback.push('Password must be at least 8 characters long.');
  if (!hasUpper)
    feedback.push('Password must contain at least one uppercase letter.');
  if (!hasLower)
    feedback.push('Password must contain at least one lowercase letter.');
  if (!hasNumber) feedback.push('Password must contain at least one number.');
  if (!hasSpecial)
    feedback.push('Password must contain at least one special character.');

  // Normalize to 0..4 for UI indicator
  let raw = 0;
  if (hasMinLength) raw++;
  if (hasUpper) raw++;
  if (hasLower) raw++;
  if (hasNumber) raw++;
  if (hasSpecial) raw++;

  let score = 0;
  if (raw <= 1) score = 0;
  else if (raw === 2) score = 1;
  else if (raw === 3) score = 2;
  else if (raw === 4) score = 3;
  else score = 4;

  return { score, feedback };
};

export const isValidPassword = (password: string): boolean => {
  // Strong policy: require all categories, any special char allowed
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
};
