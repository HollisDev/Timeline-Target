import { AuthForm } from '@/components/auth/AuthForm'
import { useAuthForm } from '@/lib/auth/hooks'
import { useToast } from '@/lib/toast/context'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

// Mock the hooks
jest.mock('@/lib/auth/hooks', () => ({
  useAuthForm: jest.fn(),
  useEmailValidation: jest.fn(() => ({
    email: '',
    setEmail: jest.fn(),
    isValid: true,
    error: null,
  })),
  usePasswordValidation: jest.fn(() => ({
    password: 'password',
    setPassword: jest.fn(),
    confirmPassword: 'password',
    setConfirmPassword: jest.fn(),
    strength: { score: 4, feedback: [] },
    passwordsMatch: true,
    canSubmit: true,
  })),
}))

jest.mock('@/lib/toast/context', () => ({
  useToast: jest.fn(() => ({
    addToast: jest.fn(),
  })),
}))

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}))

describe('AuthForm', () => {
  const mockOnSuccess = jest.fn()
  const mockOnModeChange = jest.fn()
  const mockAddToast = jest.fn()

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ addToast: mockAddToast });
    (useAuthForm as jest.Mock).mockReturnValue({
      loading: false,
      handleSignIn: jest.fn().mockResolvedValue(true),
      handleSignUp: jest.fn().mockResolvedValue(true),
    })
    jest.clearAllMocks()
  })

  it('renders sign-in form by default', () => {
    render(<AuthForm mode="signin" onModeChange={mockOnModeChange} onSuccess={mockOnSuccess} />)
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument()
  })

  it('renders sign-up form when mode is signup', () => {
    render(<AuthForm mode="signup" onModeChange={mockOnModeChange} onSuccess={mockOnSuccess} />)
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('calls handleSignIn on form submission in sign-in mode', async () => {
    const handleSignIn = jest.fn().mockResolvedValue(true)
    ;(useAuthForm as jest.Mock).mockReturnValue({ loading: false, handleSignIn })

    render(<AuthForm mode="signin" onModeChange={mockOnModeChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(handleSignIn).toHaveBeenCalledWith('test@example.com', 'password')
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('calls handleSignUp on form submission in sign-up mode', async () => {
    const handleSignUp = jest.fn().mockResolvedValue(true)
    ;(useAuthForm as jest.Mock).mockReturnValue({ loading: false, handleSignUp })

    render(<AuthForm mode="signup" onModeChange={mockOnModeChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(handleSignUp).toHaveBeenCalledWith('test@example.com', 'password')
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('switches between sign-in and sign-up modes', () => {
    const { rerender } = render(<AuthForm mode="signin" onModeChange={mockOnModeChange} onSuccess={mockOnSuccess} />)
    
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))
    expect(mockOnModeChange).toHaveBeenCalledWith('signup')

    rerender(<AuthForm mode="signup" onModeChange={mockOnModeChange} onSuccess={mockOnSuccess} />)

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(mockOnModeChange).toHaveBeenCalledWith('signin')
  })

  it('shows a toast message if sign-in fails', async () => {
    const handleSignIn = jest.fn().mockRejectedValue(new Error('Invalid credentials'))
    ;(useAuthForm as jest.Mock).mockReturnValue({ loading: false, handleSignIn })

    render(<AuthForm mode="signin" onModeChange={mockOnModeChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Invalid credentials',
      })
    })
  })
})
