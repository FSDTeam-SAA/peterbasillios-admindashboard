"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Camera, Check, Eye, EyeOff, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const profileImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="140" height="140" rx="70" fill="#C8E8E5"/>
    <rect x="23" y="78" width="94" height="70" rx="30" fill="#101827"/>
    <circle cx="70" cy="59" r="31" fill="#D9A066"/>
    <path d="M36 53C41 31 57 18 81 21C101 24 111 38 111 55C96 50 82 42 72 31C63 45 49 52 36 53Z" fill="#2D1818"/>
    <path d="M39 50C46 31 62 20 84 23C99 25 108 37 110 52C93 49 79 40 72 30C63 43 52 49 39 50Z" fill="#5B1D28"/>
    <path d="M48 40C58 29 74 24 90 30" stroke="#F5D7B7" stroke-width="5" stroke-linecap="round"/>
    <circle cx="59" cy="60" r="3" fill="#1D2430"/>
    <circle cx="82" cy="60" r="3" fill="#1D2430"/>
    <path d="M60 78C66 83 75 83 82 78" stroke="#7E3A2E" stroke-width="4" stroke-linecap="round"/>
    <rect x="48" y="93" width="45" height="40" rx="12" fill="#007066"/>
    <path d="M32 122C42 105 55 97 70 97C85 97 98 105 108 122V140H32V122Z" fill="#0C1D2E"/>
  </svg>
`)}`

const passwordRuleDefinitions = [
  {
    label: "Minimum 6 characters.",
    test: (password: string) => password.length >= 6,
  },
  {
    label: "At least one uppercase letter must.",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "At least one lowercase letter must.",
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    label: "At least one number must (0-9).",
    test: (password: string) => /\d/.test(password),
  },
  {
    label: "At least special character (! @ # $ % ^ & * etc.).",
    test: (password: string) => /[!@#$%^&*]/.test(password),
  },
  {
    label: "No spaces allowed.",
    test: (password: string) => password.length > 0 && !/\s/.test(password),
  },
]

export function SecurityClient() {
  return (
    <Tabs defaultValue="personal" className="min-h-[calc(100vh-128px)]">
      <TabsList>
        <TabsTrigger value="personal">Personal Info</TabsTrigger>
        <TabsTrigger value="password">Change Password</TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <PersonalInfoPanel />
      </TabsContent>

      <TabsContent value="password">
        <PasswordChangePanel />
      </TabsContent>
    </Tabs>
  )
}

function PersonalInfoPanel() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="grid gap-6 lg:grid-cols-[400px_1fr]"
    >
      <aside className="overflow-hidden rounded bg-[#E6F1F0]">
        <div className="h-[172px] bg-[#2D9286]" />
        <div className="px-5 pb-6 text-center">
          <div className="relative mx-auto -mt-[72px] size-[118px] rounded-full border-4 border-white bg-cover bg-center shadow-md" style={{ backgroundImage: `url("${profileImage}")` }}>
            <button
              type="button"
              className="absolute bottom-1 right-1 flex size-8 items-center justify-center rounded-full bg-[#007066] text-white shadow-md"
              aria-label="Change profile image"
            >
              <Camera className="size-4" />
            </button>
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-[#000000]">
            Welly Wilson
          </h2>
          <p className="text-base text-[#000000]">example@example.com</p>

          <div className="mt-6 space-y-4 text-left text-base leading-6 text-[#000000]">
            <p>
              <span className="font-semibold">Name:</span> Jenny Wilson
            </p>
            <p>
              <span className="font-semibold">Bio:</span> Dedicated natural
              health advocate committed to empowering people with safe,
              holistic, and evidence-based wellness guidance. Focused on
              building meaningful digital experiences that make naturopathic
              knowledge accessible to everyone worldwide.
            </p>
            <p>
              <span className="font-semibold">Email:</span> example@example.com
            </p>
            <p>
              <span className="font-semibold">Phone:</span> +1 (725) 890-4421
            </p>
            <p>
              <span className="font-semibold">Location:</span> 87 Meadowbrook
              Drive, Austin, TX 78703
            </p>
          </div>
        </div>
      </aside>

      <form className="rounded bg-[#E6F1F0] p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="First Name" id="first-name">
            <Input id="first-name" defaultValue="Welly" className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]" />
          </Field>
          <Field label="Last Name" id="last-name">
            <Input id="last-name" defaultValue="Wilson" className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]" />
          </Field>
          <Field label="Email Address" id="email">
            <Input id="email" defaultValue="example@example.com" className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]" />
          </Field>
          <Field label="Phone Number" id="phone">
            <Input id="phone" defaultValue="+1 (555) 123-4567" className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]" />
          </Field>
        </div>

        <div className="mt-5 flex items-center gap-4 text-base text-[#000000]">
          <label className="flex items-center gap-2">
            Male
            <input
              type="radio"
              name="gender"
              defaultChecked
              className="size-4 accent-[#000C5C]"
            />
          </label>
          <label className="flex items-center gap-2">
            Female
            <input type="radio" name="gender" className="size-4 accent-[#000C5C]" />
          </label>
        </div>

        <Field label="Bio" id="bio" className="mt-5">
          <Textarea
            id="bio"
            defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi et ante sed sem feugiat tristique at sed mauris. Phasellus urna magna, cursus at mi eu, dapibus porta nisi."
            className="h-[92px] border-[#C3C3C3] text-base leading-6 text-[#7D7D7D]"
          />
        </Field>

        <Field label="Street Address" id="street-address" className="mt-5">
          <Input
            id="street-address"
            defaultValue="1234 Oak Avenue, San Francisco, CA 94102A"
            className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]"
          />
        </Field>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Location" id="location">
            <Input id="location" defaultValue="Florida, USA" className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]" />
          </Field>
          <Field label="Postal Code" id="postal-code">
            <Input id="postal-code" defaultValue="30301" className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]" />
          </Field>
        </div>

        <FormActions />
      </form>
    </motion.section>
  )
}

function PasswordChangePanel() {
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswordRules, setShowPasswordRules] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const toggleVisibility = (field: string) => {
    setVisible((current) => ({ ...current, [field]: !current[field] }))
  }

  const passwordRules = passwordRuleDefinitions.map((rule) => ({
    label: rule.label,
    valid: rule.test(newPassword),
  }))
  const isPasswordValid = passwordRules.every((rule) => rule.valid)
  const shouldValidateCurrent = touched.current || submitted
  const shouldValidateNew = touched.new || submitted
  const shouldValidateConfirm = touched.confirm || submitted
  const isCurrentInvalid = shouldValidateCurrent && currentPassword.length === 0
  const isNewInvalid = shouldValidateNew && !isPasswordValid
  const isConfirmRequired =
    shouldValidateConfirm && confirmPassword.length === 0
  const isConfirmMismatch =
    shouldValidateConfirm &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    confirmPassword !== newPassword
  const isConfirmInvalid = isConfirmRequired || isConfirmMismatch
  const shouldShowPasswordRules =
    showPasswordRules || touched.new || touched.confirm || submitted
  const shouldColorRules = newPassword.length > 0 || submitted
  const canSave =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    isPasswordValid &&
    confirmPassword === newPassword

  const resetPasswordForm = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setShowPasswordRules(false)
    setSubmitted(false)
    setTouched({ current: false, new: false, confirm: false })
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(true)
        setTouched({ current: true, new: true, confirm: true })
        setShowPasswordRules(true)

        if (canSave) {
          resetPasswordForm()
        }
      }}
      className="rounded bg-[#E6F1F0] p-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <PasswordField
          id="current-password"
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          onBlur={() =>
            setTouched((current) => ({ ...current, current: true }))
          }
          invalid={isCurrentInvalid}
          visible={Boolean(visible.current)}
          onToggle={() => toggleVisibility("current")}
        />
        {isCurrentInvalid && (
          <p className="mt-2 text-base text-[#FF1B2D] md:hidden">
            Current password is required.
          </p>
        )}
        <PasswordField
          id="new-password"
          label="New Password"
          value={newPassword}
          onChange={(value) => {
            setNewPassword(value)
            setShowPasswordRules(true)
          }}
          onFocus={() => setShowPasswordRules(true)}
          onBlur={() => setTouched((current) => ({ ...current, new: true }))}
          invalid={isNewInvalid}
          visible={Boolean(visible.new)}
          onToggle={() => toggleVisibility("new")}
        />
      </div>
      {(isCurrentInvalid || isNewInvalid) && (
        <div className="mt-2 hidden grid-cols-2 gap-5 md:grid">
          <p className="text-base text-[#FF1B2D]">
            {isCurrentInvalid ? "Current password is required." : ""}
          </p>
          <p className="text-base text-[#FF1B2D]">
            {isNewInvalid && newPassword.length === 0
              ? "New password is required."
              : isNewInvalid
                ? "New password does not meet all requirements."
                : ""}
          </p>
        </div>
      )}

      <PasswordField
        id="confirm-password"
        label="Confirm New Password"
        value={confirmPassword}
        onChange={(value) => {
          setConfirmPassword(value)
          setShowPasswordRules(true)
        }}
        onFocus={() => setShowPasswordRules(true)}
        onBlur={() =>
          setTouched((current) => ({ ...current, confirm: true }))
        }
        invalid={isConfirmInvalid}
        visible={Boolean(visible.confirm)}
        onToggle={() => toggleVisibility("confirm")}
        className="mt-5"
      />
      {isConfirmInvalid && (
        <p className="mt-2 text-base text-[#FF1B2D]">
          {isConfirmRequired
            ? "Confirm password is required."
            : "Confirm password must match new password."}
        </p>
      )}

      {shouldShowPasswordRules && (
        <motion.ul
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="mt-5 space-y-3"
        >
          {passwordRules.map((rule) => {
            const Icon = rule.valid ? Check : X
            const ruleColor = rule.valid
              ? "text-[#007066]"
              : shouldColorRules
                ? "text-[#FF1B2D]"
                : "text-[#7D7D7D]"

            return (
              <li
                key={rule.label}
                className={`flex items-start gap-2 text-base transition-colors ${ruleColor}`}
              >
                <Icon className="mt-0.5 size-4 shrink-0" />
                <span>{rule.label}</span>
              </li>
            )
          })}
        </motion.ul>
      )}

      <FormActions onCancel={resetPasswordForm} saveDisabled={!canSave} />
    </motion.form>
  )
}

function Field({
  label,
  id,
  className,
  children,
}: {
  label: string
  id: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-2 block text-base font-medium text-[#000000]">
        {label}
      </Label>
      {children}
    </div>
  )
}

function PasswordField({
  id,
  label,
  invalid,
  value,
  onChange,
  onFocus,
  onBlur,
  visible,
  onToggle,
  className,
}: {
  id: string
  label: string
  invalid?: boolean
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  visible: boolean
  onToggle: () => void
  className?: string
}) {
  const VisibilityIcon = visible ? EyeOff : Eye

  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-2 block text-base font-medium text-[#000000]">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="********"
          className={`h-[52px] border-[#C3C3C3] pr-12 text-base text-[#7D7D7D] ${
            invalid ? "border-[#FF5C70] focus:border-[#FF5C70] focus:ring-[#FF5C70]/15" : ""
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-[#4A5A59]"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          <VisibilityIcon className="size-5" />
        </button>
      </div>
    </div>
  )
}

function FormActions({
  onCancel,
  saveDisabled,
}: {
  onCancel?: () => void
  saveDisabled?: boolean
}) {
  return (
    <div className="mt-8 flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="h-[48px] min-w-[120px] border-[#007066] bg-transparent text-base font-medium text-[#007066] hover:bg-[#DCEFEB]"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={saveDisabled}
        className="h-[48px] min-w-[120px] bg-[#007066] text-base font-medium text-white hover:bg-[#006059] disabled:bg-[#7FAFAA]"
      >
        Save
      </Button>
    </div>
  )
}
