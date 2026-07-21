"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useRef, useState } from "react"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { AuthShell } from "../_component/AuthShell"
import { Button } from "@/components/ui/button"
import { postAuth } from "@/lib/auth-api"

function OtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")?.trim().toLowerCase() ?? ""
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [otp, setOtp] = useState(Array(6).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const otpValue = otp.join("")
  const maskedEmail = email || "your email"

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email is missing. Please start again.")
      return
    }

    setIsResending(true)

    try {
      const result = await postAuth(
        "/auth/forgot-password",
        { email },
        "Failed to resend OTP. Please try again.",
      )

      toast.success(result.message || "OTP resent successfully")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to resend OTP. Please try again.",
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Verification"
      title="Enter OTP code"
      description={`We sent a 6-digit code to ${maskedEmail}. Enter it below to verify your identity.`}
      footer={
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={isResending || !email}
            onClick={handleResendCode}
            className="font-semibold text-[#007066] disabled:cursor-not-allowed disabled:text-[#7D7D7D]"
          >
            {isResending ? "Resending code..." : "Resend code"}
          </button>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 text-[#7D7D7D] hover:text-[#007066]"
          >
            <ArrowLeft className="size-4" />
            Change email
          </Link>
        </div>
      }
    >
      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault()

          if (!email) {
            toast.error("Email is missing. Please start again.")
            return
          }

          if (otpValue.length !== 6) {
            toast.error("Please enter the 6-digit OTP code")
            return
          }

          setIsLoading(true)

          try {
            const result = await postAuth(
              "/auth/verify",
              { email, otp: otpValue },
              "OTP verification failed. Please try again.",
            )

            toast.success(result.message || "OTP verified successfully")
            router.push(`/reset-password?email=${encodeURIComponent(email)}`)
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "OTP verification failed. Please try again.",
            )
          } finally {
            setIsLoading(false)
          }
        }}
      >
        <div className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-3 text-base text-[#4D5F5D]">
          <ShieldCheck className="size-5 text-[#007066]" />
          Keep this code private. It expires shortly.
        </div>

        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element
              }}
              value={digit}
              inputMode="numeric"
              maxLength={1}
              disabled={isLoading}
              aria-label={`OTP digit ${index + 1}`}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "").slice(0, 1)
                setOtp((current) => {
                  const next = [...current]
                  next[index] = value
                  return next
                })

                if (value && index < 5) {
                  inputRefs.current[index + 1]?.focus()
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !digit && index > 0) {
                  inputRefs.current[index - 1]?.focus()
                }
              }}
              onPaste={(event) => {
                event.preventDefault()
                const pastedValue = event.clipboardData
                  .getData("text")
                  .replace(/\D/g, "")
                  .slice(0, 6)

                if (!pastedValue) {
                  return
                }

                setOtp(
                  Array.from({ length: 6 }, (_, digitIndex) =>
                    pastedValue[digitIndex] ?? "",
                  ),
                )

                inputRefs.current[Math.min(pastedValue.length, 6) - 1]?.focus()
              }}
              className="h-14 rounded-lg border border-[#C3C3C3] bg-transparent text-center text-2xl font-semibold text-[#000000] outline-none transition focus:border-[#007066] focus:ring-2 focus:ring-[#007066]/15"
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={otpValue.length !== 6 || isLoading || !email}
          className="h-[52px] w-full rounded-lg bg-[#007066] text-base font-semibold text-white hover:bg-[#006059] disabled:bg-[#7FAFAA]"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}

export default function OtpPage() {
  return (
    <Suspense fallback={null}>
      <OtpForm />
    </Suspense>
  )
}
