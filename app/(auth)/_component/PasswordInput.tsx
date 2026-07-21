"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"

interface PasswordInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  label: string
}

export function PasswordInput({ label, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={`h-[52px] border-[#C3C3C3] pr-12 text-base text-[#111827] placeholder:text-[#8A9897] ${className ?? ""}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-[#4A5A59]"
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
      >
        <Icon className="size-5" />
      </button>
    </div>
  )
}
