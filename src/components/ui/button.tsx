import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DBF73]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-[#1DBF73] text-white hover:bg-[#15945A]",
                destructive:
                    "bg-[#DC3F4D] text-white hover:bg-[#B8323E]",
                outline:
                    "border border-[#DFE7E2] bg-white text-[#24313D] hover:border-[#1DBF73]/50 hover:bg-[#E7F8EF] hover:text-[#15945A]",
                secondary:
                    "bg-[#EAF6F7] text-[#0F7C86] hover:bg-[#D5EEF1]",
                ghost:
                    "text-[#64717D] hover:bg-[#EEF5F1] hover:text-[#101820]",
                link:
                    "text-[#15945A] underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-5 py-2.5",
                sm: "h-9 rounded-md px-4",
                lg: "h-11 rounded-lg px-8",
                icon: "h-10 w-10 p-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
