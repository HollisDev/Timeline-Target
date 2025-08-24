import { cn } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  strength: {
    score: number
    feedback: string[]
  }
  className?: string
}

const strengthLevels = {
  0: { text: 'Very Weak', color: 'bg-red-500' },
  1: { text: 'Weak', color: 'bg-red-500' },
  2: { text: 'Fair', color: 'bg-yellow-500' },
  3: { text: 'Good', color: 'bg-blue-500' },
  4: { text: 'Strong', color: 'bg-green-500' },
}

export function PasswordStrengthIndicator({
  strength,
  className
}: PasswordStrengthIndicatorProps) {
  const { score, feedback } = strength
  const level = strengthLevels[score as keyof typeof strengthLevels] || strengthLevels[0]
  const percentage = Math.min((score / 4) * 100, 100) // Max score is 4

  return (
    <div className={cn('space-y-2', className)}>
      <div className="w-full bg-background-subtle rounded-full h-1.5">
        <div
          className={cn(
            'h-1.5 rounded-full transition-all duration-300 ease-in-out',
            level.color
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {feedback.length > 0 && score < 4 && (
        <ul className="space-y-0.5">
          {feedback.map((item, index) => (
            <li key={index} className="text-xs text-text-secondary flex items-start">
              <span className="text-text-secondary mr-2">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}