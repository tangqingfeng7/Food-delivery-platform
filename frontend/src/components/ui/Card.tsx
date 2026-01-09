import { motion, HTMLMotionProps } from 'framer-motion'

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'gradient'
  hover?: boolean
  children: React.ReactNode
}

const Card = ({
  variant = 'default',
  hover = true,
  children,
  className = '',
  ...props
}: CardProps) => {
  const baseStyles = 'rounded-2xl overflow-hidden'

  const variants = {
    default: 'bg-white shadow-lg shadow-gray-200/50',
    glass: 'glass',
    gradient: 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/50',
  }

  const hoverStyles = hover
    ? 'transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1'
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card
