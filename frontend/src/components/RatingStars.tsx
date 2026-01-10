import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  label?: string
}

const RatingStars = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  label
}: RatingStarsProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm text-gray-600 min-w-[4rem]">{label}</span>
      )}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const value = index + 1
          const filled = value <= rating

          return (
            <motion.button
              key={index}
              type="button"
              whileHover={interactive ? { scale: 1.1 } : {}}
              whileTap={interactive ? { scale: 0.9 } : {}}
              onClick={() => handleClick(value)}
              disabled={!interactive}
              className={`${interactive ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  filled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                } transition-colors`}
              />
            </motion.button>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default RatingStars
