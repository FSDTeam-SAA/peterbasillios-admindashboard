"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { AuthShell } from "../_component/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { postAuth } from "@/lib/auth-api"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Forgot your password?"
      description="Enter your account email and we will send a one-time verification code to continue."
      footer={
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 font-semibold text-[#007066]"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      }
    >
      <form
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          const email = String(data.get("email") ?? "").trim().toLowerCase()

          if (!email) {
            toast.error("Please enter your email address")
            return
          }

          setIsLoading(true)

          try {
            const result = await postAuth(
              "/auth/forgot-password",
              { email },
              "Failed to send OTP. Please try again.",
            )

            toast.success(result.message || "OTP sent successfully")
            router.push(`/otp?email=${encodeURIComponent(email)}`)
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to send OTP. Please try again.",
            )
          } finally {
            setIsLoading(false)
          }
        }}
      >
        <div className="space-y-2">
          <Label
            htmlFor="recovery-email"
            className="text-base font-medium text-[#000000]"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6F807F]" />
            <Input
              id="recovery-email"
              name="email"
              type="email"
              required
              disabled={isLoading}
              placeholder="example@example.com"
              className="h-[52px] border-[#C3C3C3] pl-11 text-base text-[#111827] placeholder:text-[#8A9897]"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-[52px] w-full rounded-lg bg-[#007066] text-base font-semibold text-white hover:bg-[#006059]"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
