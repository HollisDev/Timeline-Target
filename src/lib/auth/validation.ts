'use client'

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const getPasswordStrength = (password: string) => {
  const feedback: string[] = []
  let score = 0

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long.')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter.')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter.')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number.')
  } else {
    score += 1
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Password must contain at least one special character.')
  } else {
    score += 1
  }

  return { score, feedback }
}

export const isValidPassword = (password: string): boolean => {
  const { score } = getPasswordStrength(password)
  return score === 5
}
