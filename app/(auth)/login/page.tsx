"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, LockKeyhole, Mail } from "lucide-react"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"

import { AuthShell } from "../_component/AuthShell"
import { PasswordInput } from "../_component/PasswordInput"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Login to your dashboard"
      description="Enter your admin credentials to access projects, services, inquiries, and security settings."
      footer={
        <>
          Need help?{" "}
          <Link href="/forgot-password" className="font-semibold text-[#007066]">
            Reset your password
          </Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault()
          setIsLoading(true)

          const formData = new FormData(event.currentTarget)
          const email = String(formData.get("email") ?? "").trim()
          const password = String(formData.get("password") ?? "")

          try {
            const result = await signIn("credentials", {
              email,
              password,
              redirect: false,
            })

            if (result?.ok) {
              toast.success("User logged in successfully")
              router.push("/")
              router.refresh()
              return
            }

            toast.error(
              result?.error === "CredentialsSignin"
                ? "Invalid email or password"
                : result?.error || "Invalid email or password",
            )
          } catch {
            toast.error("Login failed. Please try again.")
          } finally {
            setIsLoading(false)
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium text-[#000000]">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#6F807F]" />
            <Input
              id="email"
              name="email"
              type="email"
              required
              disabled={isLoading}
              placeholder="admin@example.com"
              className="h-[52px] border-[#C3C3C3] pl-11 text-base text-[#111827] placeholder:text-[#8A9897]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label
              htmlFor="password"
              className="text-base font-medium text-[#000000]"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-base font-medium text-[#007066] hover:text-[#005F58]"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 z-10 size-5 -translate-y-1/2 text-[#6F807F]" />
            <PasswordInput
              id="password"
              name="password"
              label="password"
              required
              disabled={isLoading}
              placeholder="Enter password"
              className="pl-11"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 text-base">
          <label className="flex items-center gap-2 text-[#4D5F5D]">
            <input type="checkbox" className="size-4 accent-[#007066]" />
            Remember me
          </label>
          <span className="text-[#7D7D7D]">Secure session</span>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-[52px] w-full rounded-lg bg-[#007066] text-base font-semibold text-white hover:bg-[#006059]"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
