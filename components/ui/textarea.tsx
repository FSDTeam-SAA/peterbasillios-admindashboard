"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[92px] w-full resize-none rounded border border-[#C9D8D6] bg-transparent px-3 py-2 text-sm text-[#111827] outline-none transition-colors placeholder:text-[#7B8B8A] focus:border-[#007066] focus:ring-2 focus:ring-[#007066]/15 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
