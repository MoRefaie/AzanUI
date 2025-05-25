
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    colorScheme?: "default" | "success" | "danger" | "islamic-green" | "islamic-blue" | "islamic-gold"
  }
>(({ className, colorScheme = "default", ...props }, ref) => {
  // Define color classes based on the colorScheme prop
  const colorClasses = {
    default: "data-[state=checked]:bg-primary",
    success: "data-[state=checked]:bg-green-500",
    danger: "data-[state=checked]:bg-red-500",
    "islamic-green": "data-[state=checked]:bg-islamic-green",
    "islamic-blue": "data-[state=checked]:bg-islamic-blue",
    "islamic-gold": "data-[state=checked]:bg-islamic-gold",
  }

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-input",
        colorClasses[colorScheme],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
