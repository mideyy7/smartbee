import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-3 py-1 transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-bee-yellow/10 text-bee-yellow border border-bee-yellow/20',
        success: 'bg-green-500/10 text-green-400 border border-green-500/20',
        warning: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
        danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
        ghost: 'bg-white/5 text-white/60 border border-white/10',
        blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
