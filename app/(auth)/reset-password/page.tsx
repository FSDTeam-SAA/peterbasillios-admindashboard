"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Loader2, LockKeyhole, X } from "lucide-react"
import { Suspense, useMemo, useState } from "react"
import { toast } from "sonner"

import { AuthShell } from "../_component/AuthShell"
import { PasswordInput } from "../_component/PasswordInput"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { postAuth } from "@/lib/auth-api"

const passwordRules = [
  {
    label: "Minimum 6 characters.",
    test: (password: string) => password.length >= 6,
  },
  {
    label: "No spaces.",
    test: (password: string) => password.length > 0 && !/\s/.test(password),
  },
]

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")?.trim().toLowerCase() ?? ""
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const rules = useMemo(
    () =>
      passwordRules.map((rule) => ({
        label: rule.label,
        valid: rule.test(password),
      })),
    [password],
  )
  const isPasswordValid = rules.every((rule) => rule.valid)
  const isConfirmInvalid =
    confirmPassword.length > 0 && confirmPassword !== password
  const canSave =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    isPasswordValid &&
    password === confirmPassword

  return (
    <AuthShell
      eyebrow="Create new password"
      title="Reset your password"
      description="Choose a strong password for your admin account. You will use it for your next login."
      footer={
        <div className="flex flex-col items-center gap-2">
          <Link href="/login" className="font-semibold text-[#007066]">
            Return to login
          </Link>
          {!email && (
            <Link href="/forgot-password" className="text-[#7D7D7D]">
              Start password recovery again
            </Link>
          )}
        </div>
      }
    >
      <form
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault()
          setSubmitted(true)

          if (!email) {
            toast.error("Email is missing. Please start password recovery again.")
            return
          }

          if (!canSave) {
            toast.error("Please enter a valid matching password")
            return
          }

          setIsLoading(true)

          try {
            const result = await postAuth(
              "/auth/reset-password",
              { email, newPassword: password },
              "Failed to reset password. Please try again.",
            )

            toast.success(result.message || "Password reset successfully")
            router.push("/login")
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to reset password. Please try again.",
            )
          } finally {
            setIsLoading(false)
          }
        }}
      >
        {!email && (
          <div className="rounded-xl border border-[#FFB3BE] bg-[#FFF5F6] px-4 py-3 text-base leading-6 text-[#B42318]">
            Email is missing from this reset session. Please start password
            recovery again.
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="new-password"
            className="text-base font-medium text-[#000000]"
          >
            New Password
          </Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-[#6F807F]" />
            <PasswordInput
              id="new-password"
              label="new password"
              value={password}
              disabled={isLoading || !email}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              className={`pl-11 ${
                submitted && !isPasswordValid
                  ? "border-[#FF5C70] focus:border-[#FF5C70] focus:ring-[#FF5C70]/15"
                  : ""
              }`}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirm-password"
            className="text-base font-medium text-[#000000]"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-[#6F807F]" />
            <PasswordInput
              id="confirm-password"
              label="confirm password"
              value={confirmPassword}
              disabled={isLoading || !email}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              className={`pl-11 ${
                isConfirmInvalid
                  ? "border-[#FF5C70] focus:border-[#FF5C70] focus:ring-[#FF5C70]/15"
                  : ""
              }`}
            />
          </div>
          {isConfirmInvalid && (
            <p className="text-base text-[#FF1B2D]">
              Confirm password must match new password.
            </p>
          )}
        </div>

        <ul className="space-y-2 rounded-xl bg-white/60 p-4">
          {rules.map((rule) => {
            const Icon = rule.valid ? Check : X
            const color = rule.valid
              ? "text-[#007066]"
              : password.length > 0 || submitted
                ? "text-[#FF1B2D]"
                : "text-[#7D7D7D]"

            return (
              <li key={rule.label} className={`flex gap-2 text-base ${color}`}>
                <Icon className="mt-0.5 size-4 shrink-0" />
                <span>{rule.label}</span>
              </li>
            )
          })}
        </ul>

        <Button
          type="submit"
          disabled={!canSave || isLoading || !email}
          className="h-[52px] w-full rounded-lg bg-[#007066] text-base font-semibold text-white hover:bg-[#006059] disabled:bg-[#7FAFAA]"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save New Password"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
