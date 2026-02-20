import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bee-yellow disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-bee-yellow text-black hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(255,209,0,0.5)]',
        ghost: 'text-white/70 hover:text-white hover:bg-white/5',
        outline: 'border border-white/10 text-white/80 hover:bg-white/5 hover:border-white/20',
        glass: 'glass text-white hover:bg-white/8',
        danger: 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30',
      },
      size: {
        sm: 'text-sm px-4 py-2',
        default: 'text-base px-6 py-3',
        lg: 'text-lg px-8 py-4',
        xl: 'text-xl px-10 py-5',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})

Button.displayName = 'Button'

export { Button, buttonVariants }
