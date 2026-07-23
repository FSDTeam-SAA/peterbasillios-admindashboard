export interface UserProfile {
  _id?: string
  fullName?: string
  email?: string
  role?: string
  status?: string
  gender?: string
  phoneNumber?: string
  profilePicture?: string
  profileImage?: string
  image?: string
  bio?: string
  streetAddress?: string
  location?: string
  postCode?: string
  verifiedForget?: boolean
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export interface UpdateUserProfilePayload {
  fullName: string
  email: string
  gender?: string
  phoneNumber?: string
  profilePicture?: string
  bio?: string
  streetAddress?: string
  location?: string
  postCode?: string
  role?: string
  status?: string
  verifiedForget?: boolean
}

interface UpdateUserProfileOptions {
  profilePictureFile?: File | null
}

interface UserProfileResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
  data?: UserProfile | null
}

export const userProfileQueryKey = ["user-profile"] as const

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!baseUrl) {
    throw new Error("API base URL is not configured.")
  }

  return baseUrl.replace(/\/+$/, "")
}

export function getUserProfileImage(profile?: UserProfile | null) {
  return (
    profile?.profilePicture?.trim() ||
    profile?.profileImage?.trim() ||
    profile?.image?.trim() ||
    ""
  )
}

export function getUserInitials(nameOrEmail?: string | null) {
  const normalizedValue = nameOrEmail?.trim()

  if (!normalizedValue) {
    return "AD"
  }

  const [namePart] = normalizedValue.split("@")
  const words = namePart.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return "AD"
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
}

export async function fetchUserProfile(accessToken: string) {
  const response = await fetch(`${getApiBaseUrl()}/user/profile`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  const payload: UserProfileResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure || !payload?.data) {
    throw new Error(
      payload?.message?.trim() ||
        "Profile information could not be loaded. Please try again.",
    )
  }

  return payload.data
}

export async function updateUserProfile(
  accessToken: string,
  profile: UpdateUserProfilePayload,
  options: UpdateUserProfileOptions = {},
) {
  const profilePictureFile = options.profilePictureFile
  const hasProfilePictureFile =
    typeof File !== "undefined" && profilePictureFile instanceof File
  const body =
    hasProfilePictureFile
      ? createUserProfileFormData(profile, profilePictureFile)
      : JSON.stringify(profile)
  const headers: HeadersInit = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  }

  if (!hasProfilePictureFile) {
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(`${getApiBaseUrl()}/user/profile`, {
    method: "PUT",
    headers,
    body,
    cache: "no-store",
  })

  const payload: UserProfileResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Profile information could not be updated. Please try again.",
    )
  }

  return {
    data: payload?.data ?? null,
    message: payload?.message?.trim() || "Profile information updated.",
  }
}

function createUserProfileFormData(
  profile: UpdateUserProfilePayload,
  profilePictureFile: File,
) {
  const formData = new FormData()

  formData.append("fullName", profile.fullName)
  formData.append("email", profile.email)
  formData.append("gender", profile.gender ?? "")
  formData.append("phoneNumber", profile.phoneNumber ?? "")
  formData.append("profilePicture", profilePictureFile)
  formData.append("bio", profile.bio ?? "")
  formData.append("streetAddress", profile.streetAddress ?? "")
  formData.append("location", profile.location ?? "")
  formData.append("postCode", profile.postCode ?? "")

  if (profile.role !== undefined) {
    formData.append("role", profile.role)
  }

  if (profile.status !== undefined) {
    formData.append("status", profile.status)
  }

  if (profile.verifiedForget !== undefined) {
    formData.append("verifiedForget", String(profile.verifiedForget))
  }

  return formData
}
