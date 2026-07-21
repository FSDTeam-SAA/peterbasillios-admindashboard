"use client"

import { motion } from "framer-motion"

interface AuthShellProps {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FCFC] px-4 py-10 text-[#000000] sm:px-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-[560px] rounded-2xl border border-[#D6E7E5] bg-[#E6F1F0] p-6 shadow-[0_24px_80px_rgba(0,112,102,0.12)] sm:p-8"
      >
        <p className="text-base font-semibold text-[#007066]">{eyebrow}</p>
        <h2 className="mt-5 text-4xl font-semibold leading-tight text-[#000000]">
          {title}
        </h2>
        <p className="mt-5 text-base leading-8 text-[#7D7D7D]">
          {description}
        </p>

        <div className="mt-9">{children}</div>

        {footer && (
          <div className="mt-8 border-t border-[#CFE0DE] pt-6 text-center text-base text-[#7D7D7D]">
            {footer}
          </div>
        )}
      </motion.section>
    </main>
  )
}
