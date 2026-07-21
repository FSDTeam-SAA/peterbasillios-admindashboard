"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded border border-[#C9D8D6] bg-transparent px-3 py-1 text-sm text-[#111827] outline-none transition-colors placeholder:text-[#7B8B8A] focus:border-[#007066] focus:ring-2 focus:ring-[#007066]/15 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
