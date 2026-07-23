"use client"

import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { AlertCircle, Camera } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  fetchUserProfile,
  getUserInitials,
  getUserProfileImage,
  updateUserProfile,
  userProfileQueryKey,
  type UpdateUserProfilePayload,
  type UserProfile,
} from "@/lib/user-profile"

const fallbackProfileImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
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

interface PersonalInfoForm {
  firstName: string
  lastName: string
  email: string
  gender: string
  phoneNumber: string
  bio: string
  streetAddress: string
  location: string
  postCode: string
}

const emptyPersonalInfoForm: PersonalInfoForm = {
  firstName: "",
  lastName: "",
  email: "",
  gender: "",
  phoneNumber: "",
  bio: "",
  streetAddress: "",
  location: "",
  postCode: "",
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeValue(value?: string | null) {
  return value?.trim() ?? ""
}

function splitFullName(fullName?: string | null) {
  const normalizedName = normalizeValue(fullName).replace(/\s+/g, " ")

  if (!normalizedName) {
    return {
      firstName: "",
      lastName: "",
    }
  }

  const [firstName, ...rest] = normalizedName.split(" ")

  return {
    firstName,
    lastName: rest.join(" "),
  }
}

function getFullName(form: PersonalInfoForm) {
  return [form.firstName.trim(), form.lastName.trim()]
    .filter(Boolean)
    .join(" ")
}

function createFormFromProfile(profile?: UserProfile | null): PersonalInfoForm {
  const nameParts = splitFullName(profile?.fullName)

  return {
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    email: normalizeValue(profile?.email),
    gender: normalizeValue(profile?.gender),
    phoneNumber: normalizeValue(profile?.phoneNumber),
    bio: normalizeValue(profile?.bio),
    streetAddress: normalizeValue(profile?.streetAddress),
    location: normalizeValue(profile?.location),
    postCode: normalizeValue(profile?.postCode),
  }
}

function createProfilePayload(
  form: PersonalInfoForm,
  profile?: UserProfile | null,
): UpdateUserProfilePayload {
  const payload: UpdateUserProfilePayload = {
    fullName: getFullName(form),
    email: form.email.trim(),
    gender: form.gender.trim(),
    phoneNumber: form.phoneNumber.trim(),
    profilePicture: getUserProfileImage(profile),
    bio: form.bio.trim(),
    streetAddress: form.streetAddress.trim(),
    location: form.location.trim(),
    postCode: form.postCode.trim(),
  }

  if (profile?.role?.trim()) {
    payload.role = profile.role.trim()
  }

  if (profile?.status?.trim()) {
    payload.status = profile.status.trim()
  }

  if (typeof profile?.verifiedForget === "boolean") {
    payload.verifiedForget = profile.verifiedForget
  }

  return payload
}

function cssUrl(value: string) {
  return `url("${value.replace(/"/g, '\\"')}")`
}

function displayValue(value?: string | null) {
  return value?.trim() || "N/A"
}

function formatLabel(value?: string | null) {
  const normalizedValue = value?.trim()

  if (!normalizedValue) {
    return "N/A"
  }

  return normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1)
}

function formatAddress(form: PersonalInfoForm) {
  return (
    [form.streetAddress, form.location, form.postCode]
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ") || "N/A"
  )
}

function PersonalInfoSkeleton() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="grid gap-6 lg:grid-cols-[400px_1fr]"
    >
      <aside className="overflow-hidden rounded bg-[#E6F1F0]">
        <div className="h-[172px] animate-pulse bg-[#2D9286]" />
        <div className="animate-pulse px-5 pb-6 text-center">
          <div className="mx-auto -mt-[72px] size-[118px] rounded-full border-4 border-white bg-[#D9EAE8] shadow-md" />
          <div className="mx-auto mt-5 h-8 w-44 rounded bg-[#C6DEDB]" />
          <div className="mx-auto mt-2 h-5 w-56 rounded bg-[#D9EAE8]" />
          <div className="mt-6 space-y-4 text-left">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-5 rounded bg-[#D9EAE8]" />
            ))}
          </div>
        </div>
      </aside>

      <div className="animate-pulse rounded bg-[#E6F1F0] p-5">
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-5 w-32 rounded bg-[#D9EAE8]" />
              <div className="h-[44px] rounded border border-[#C3C3C3] bg-[#F6FEFD]" />
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <div className="h-5 w-20 rounded bg-[#D9EAE8]" />
          <div className="h-[92px] rounded border border-[#C3C3C3] bg-[#F6FEFD]" />
        </div>
        <div className="mt-5 space-y-2">
          <div className="h-5 w-36 rounded bg-[#D9EAE8]" />
          <div className="h-[44px] rounded border border-[#C3C3C3] bg-[#F6FEFD]" />
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <div className="h-[48px] w-[120px] rounded bg-[#D9EAE8]" />
          <div className="h-[48px] w-[120px] rounded bg-[#C6DEDB]" />
        </div>
      </div>
    </motion.section>
  )
}

function PersonalInfoErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="rounded bg-[#E6F1F0] p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#D9EAE8] text-[#007066]">
          <AlertCircle className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-[#000000]">
            Profile unavailable
          </h2>
          <p className="mt-1 text-base leading-6 text-[#667877]">{message}</p>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button
          type="button"
          onClick={onRetry}
          className="h-[44px] min-w-[96px] bg-[#007066] text-base font-medium text-white hover:bg-[#006059]"
        >
          Try again
        </Button>
      </div>
    </div>
  )
}

export function PersonalInfoPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<PersonalInfoForm>(emptyPersonalInfoForm)
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(
    null,
  )
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState("")
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()
  const accessToken = session?.accessToken

  const profileQuery = useQuery({
    queryKey: userProfileQueryKey,
    queryFn: () => fetchUserProfile(accessToken as string),
    enabled: Boolean(accessToken),
    retry: 1,
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!profileQuery.data) {
      return
    }

    setForm(createFormFromProfile(profileQuery.data))
    setSelectedProfileImage(null)
    setProfileImagePreviewUrl("")
  }, [profileQuery.data])

  useEffect(() => {
    return () => {
      if (profileImagePreviewUrl) {
        URL.revokeObjectURL(profileImagePreviewUrl)
      }
    }
  }, [profileImagePreviewUrl])

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) {
        throw new Error("Your session token was not found. Please log in again.")
      }

      const payload = createProfilePayload(form, profileQuery.data)
      const result = await updateUserProfile(accessToken, payload, {
        profilePictureFile: selectedProfileImage,
      })

      return {
        ...result,
        payload,
      }
    },
    onSuccess: async (result) => {
      const nextProfile: UserProfile = {
        ...(profileQuery.data ?? {}),
        ...result.payload,
        ...(result.data ?? {}),
      }

      queryClient.setQueryData(userProfileQueryKey, nextProfile)
      setForm(createFormFromProfile(nextProfile))
      setSelectedProfileImage(null)
      setProfileImagePreviewUrl("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      toast.success(result.message)
      await queryClient.invalidateQueries({ queryKey: userProfileQueryKey })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Profile information could not be updated. Please try again.",
      )
    },
  })

  const isSessionLoading = status === "loading"
  const isInitialLoading = profileQuery.isLoading && !profileQuery.data
  const isSaving = updateProfileMutation.isPending

  if (isSessionLoading || isInitialLoading) {
    return <PersonalInfoSkeleton />
  }

  if (!accessToken || profileQuery.isError) {
    return (
      <PersonalInfoErrorState
        message={
          !accessToken
            ? "Your session token was not found. Please log in again."
            : profileQuery.error instanceof Error
              ? profileQuery.error.message
              : "Profile information could not be loaded. Please try again."
        }
        onRetry={() => profileQuery.refetch()}
      />
    )
  }

  const profile = profileQuery.data
  const displayName = getFullName(form) || profile?.fullName?.trim() || "Admin"
  const displayEmail = form.email.trim() || profile?.email?.trim() || "N/A"
  const displayImage =
    profileImagePreviewUrl || getUserProfileImage(profile) || fallbackProfileImage

  const handleChange =
    (field: keyof PersonalInfoForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((currentForm) => ({
        ...currentForm,
        [field]: event.target.value,
      }))
    }

  const handleCancel = () => {
    setForm(createFormFromProfile(profile))
    setSelectedProfileImage(null)
    setProfileImagePreviewUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.currentTarget.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files can be selected.")
      event.currentTarget.value = ""
      return
    }

    const nextPreviewUrl = URL.createObjectURL(file)

    setSelectedProfileImage(file)
    setProfileImagePreviewUrl(nextPreviewUrl)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.firstName.trim()) {
      toast.error("First name is required.")
      return
    }

    if (!form.email.trim()) {
      toast.error("Email address is required.")
      return
    }

    if (!emailPattern.test(form.email.trim())) {
      toast.error("Please enter a valid email address.")
      return
    }

    if (!isSaving) {
      updateProfileMutation.mutate()
    }
  }

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
          <div
            className="group relative mx-auto -mt-[72px] flex size-[118px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-cover bg-center text-3xl font-semibold text-[#007066] shadow-md"
            style={{ backgroundImage: cssUrl(displayImage) }}
          >
            {!displayImage ? getUserInitials(displayName || displayEmail) : null}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-60"
              aria-label="Change profile image"
            >
              <Camera className="size-6" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleProfileImageChange}
          />

          <h2 className="mt-5 break-words text-2xl font-semibold text-[#000000]">
            {displayName}
          </h2>
          <p className="break-words text-base text-[#000000]">{displayEmail}</p>

          <div className="mt-6 space-y-4 text-left text-base leading-6 text-[#000000]">
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {displayValue(displayName)}
            </p>
            <p>
              <span className="font-semibold">Bio:</span>{" "}
              {displayValue(form.bio)}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {displayValue(form.email)}
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{" "}
              {displayValue(form.phoneNumber)}
            </p>
            <p>
              <span className="font-semibold">Location:</span>{" "}
              {formatAddress(form)}
            </p>
            <p>
              <span className="font-semibold">Role:</span>{" "}
              {formatLabel(profile?.role)}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {formatLabel(profile?.status)}
            </p>
          </div>
        </div>
      </aside>

      <form onSubmit={handleSubmit} className="rounded bg-[#E6F1F0] p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="First Name" id="first-name">
            <Input
              id="first-name"
              value={form.firstName}
              disabled={isSaving}
              onChange={handleChange("firstName")}
              placeholder="Enter first name"
              className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]"
            />
          </Field>
          <Field label="Last Name" id="last-name">
            <Input
              id="last-name"
              value={form.lastName}
              disabled={isSaving}
              onChange={handleChange("lastName")}
              placeholder="Enter last name"
              className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]"
            />
          </Field>
          <Field label="Email Address" id="email">
            <Input
              id="email"
              type="email"
              value={form.email}
              disabled={isSaving}
              onChange={handleChange("email")}
              placeholder="Enter email address"
              className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]"
            />
          </Field>
          <Field label="Phone Number" id="phone">
            <Input
              id="phone"
              value={form.phoneNumber}
              disabled={isSaving}
              onChange={handleChange("phoneNumber")}
              placeholder="Enter phone number"
              className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]"
            />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-base text-[#000000]">
          {["male", "female", "other"].map((gender) => (
            <label key={gender} className="flex items-center gap-2">
              {formatLabel(gender)}
              <input
                type="radio"
                name="gender"
                value={gender}
                checked={form.gender === gender}
                disabled={isSaving}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    gender: event.target.value,
                  }))
                }
                className="size-4 accent-[#000C5C]"
              />
            </label>
          ))}
        </div>

        <Field label="Bio" id="bio" className="mt-5">
          <Textarea
            id="bio"
            value={form.bio}
            disabled={isSaving}
            onChange={handleChange("bio")}
            placeholder="Write a short profile bio"
            className="h-[92px] border-[#C3C3C3] text-base leading-6 text-[#7D7D7D]"
          />
        </Field>

        <Field label="Street Address" id="street-address" className="mt-5">
          <Input
            id="street-address"
            value={form.streetAddress}
            disabled={isSaving}
            onChange={handleChange("streetAddress")}
            placeholder="Enter street address"
            className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]"
          />
        </Field>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Location" id="location">
            <Input
              id="location"
              value={form.location}
              disabled={isSaving}
              onChange={handleChange("location")}
              placeholder="Enter location"
              className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]"
            />
          </Field>
          <Field label="Postal Code" id="postal-code">
            <Input
              id="postal-code"
              value={form.postCode}
              disabled={isSaving}
              onChange={handleChange("postCode")}
              placeholder="Enter postal code"
              className="h-[44px] border-[#C3C3C3] text-base text-[#7D7D7D]"
            />
          </Field>
        </div>

        <FormActions
          onCancel={handleCancel}
          saveDisabled={isSaving}
          cancelDisabled={isSaving}
          saveLabel={isSaving ? "Saving..." : "Save"}
        />
      </form>
    </motion.section>
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
      <Label
        htmlFor={id}
        className="mb-2 block text-base font-medium text-[#000000]"
      >
        {label}
      </Label>
      {children}
    </div>
  )
}

function FormActions({
  onCancel,
  saveDisabled,
  cancelDisabled,
  saveLabel = "Save",
}: {
  onCancel?: () => void
  saveDisabled?: boolean
  cancelDisabled?: boolean
  saveLabel?: string
}) {
  return (
    <div className="mt-8 flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={cancelDisabled}
        className="h-[48px] min-w-[120px] border-[#007066] bg-transparent text-base font-medium text-[#007066] hover:bg-[#DCEFEB]"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={saveDisabled}
        className="h-[48px] min-w-[120px] bg-[#007066] text-base font-medium text-white hover:bg-[#006059] disabled:bg-[#7FAFAA]"
      >
        {saveLabel}
      </Button>
    </div>
  )
}
