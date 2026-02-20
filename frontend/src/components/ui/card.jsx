import { cn } from '../../lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'glass rounded-2xl p-6 transition-all duration-300',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return <div className={cn('mb-4', className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return (
    <h3 className={cn('text-xl font-bold text-white', className)} {...props} />
  )
}

function CardContent({ className, ...props }) {
  return <div className={cn('text-white/70', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardContent }
