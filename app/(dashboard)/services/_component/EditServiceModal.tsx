"use client"

import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { AlertCircle, Upload, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface EditServiceModalProps {
  open: boolean
  serviceId: string | null
  onOpenChange: (open: boolean) => void
}

interface ServiceDetails {
  _id: string
  name?: string
  description?: string
  image?: string
}

interface ServiceDetailsResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
  data?: ServiceDetails | null
}

interface UpdateServiceResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
  data?: ServiceDetails | null
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!baseUrl) {
    throw new Error("API base URL is not configured.")
  }

  return baseUrl.replace(/\/+$/, "")
}

async function fetchServiceDetails(accessToken: string, serviceId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/service/${encodeURIComponent(serviceId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  )

  const payload: ServiceDetailsResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure || !payload?.data) {
    throw new Error(
      payload?.message?.trim() ||
        "Service details could not be loaded. Please try again.",
    )
  }

  return payload.data
}

async function updateService(
  accessToken: string,
  serviceId: string,
  formData: FormData,
) {
  const response = await fetch(
    `${getApiBaseUrl()}/service/${encodeURIComponent(serviceId)}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
      cache: "no-store",
    },
  )

  const payload: UpdateServiceResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Service could not be updated. Please try again.",
    )
  }

  return {
    message: payload?.message?.trim() || "Service updated successfully.",
  }
}

function EditServiceModalSkeleton() {
  return (
    <div className="animate-pulse space-y-3 px-6 pb-6 pt-6">
      <div className="h-8 w-48 rounded bg-[#C6DEDB]" />
      <div className="space-y-1.5">
        <div className="h-5 w-28 rounded bg-[#D9EAE8]" />
        <div className="h-[52px] rounded border border-[#C3C3C3] bg-[#F6FEFD]" />
      </div>
      <div className="space-y-1.5">
        <div className="h-5 w-28 rounded bg-[#D9EAE8]" />
        <div className="h-[154px] rounded border border-[#C3C3C3] bg-[#F6FEFD]" />
      </div>
      <div className="space-y-1.5">
        <div className="h-5 w-20 rounded bg-[#D9EAE8]" />
        <div className="h-[210px] rounded border border-[#CADBD9] bg-[#F6FEFD]" />
      </div>
      <div className="flex justify-between gap-3 pt-3">
        <div className="h-[48px] w-[100px] rounded bg-[#D9EAE8]" />
        <div className="h-[48px] w-[100px] rounded bg-[#C6DEDB]" />
      </div>
    </div>
  )
}

function EditServiceErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="px-6 pb-6 pt-6">
      <DialogHeader className="pr-8">
        <DialogTitle className="text-2xl font-medium text-[#000000]">
          Edit Service
        </DialogTitle>
      </DialogHeader>
      <div className="mt-5 rounded-lg border border-[#D8E6E4] bg-[#E6F1F0] p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#D9EAE8] text-[#007066]">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#000000]">
              Service unavailable
            </h3>
            <p className="mt-1 text-base leading-6 text-[#7D7D7D]">
              {message}
            </p>
          </div>
        </div>
      </div>
      <DialogFooter className="mt-6 justify-end">
        <Button
          type="button"
          onClick={onRetry}
          className="h-[44px] min-w-[96px] bg-[#007066] text-base font-medium text-white hover:bg-[#006059]"
        >
          Try again
        </Button>
      </DialogFooter>
    </div>
  )
}

export function EditServiceModal({
  open,
  serviceId,
  onOpenChange,
}: EditServiceModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(
    null,
  )
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const accessToken = session?.accessToken

  const serviceDetailsQuery = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () =>
      fetchServiceDetails(accessToken as string, serviceId as string),
    enabled: open && Boolean(serviceId) && Boolean(accessToken),
    retry: 1,
    staleTime: 30_000,
  })

  const updateServiceMutation = useMutation({
    mutationFn: (formData: FormData) => {
      if (!accessToken || !serviceId) {
        throw new Error("Your session token was not found. Please log in again.")
      }

      return updateService(accessToken, serviceId, formData)
    },
    onSuccess: async (result) => {
      toast.success(result.message)
      resetForm()
      onOpenChange(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["services"] }),
        queryClient.invalidateQueries({ queryKey: ["service", serviceId] }),
      ])
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Service could not be updated. Please try again.",
      )
    },
  })

  const isSubmitting = updateServiceMutation.isPending
  const isLoading = serviceDetailsQuery.isLoading || serviceDetailsQuery.isFetching
  const previewUrl = selectedPreviewUrl ?? currentImageUrl

  const clearSelectedFile = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setSelectedImage(null)
    setSelectedPreviewUrl(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setCurrentImageUrl(null)
    clearSelectedFile()
  }

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const service = serviceDetailsQuery.data

    if (!open || !service) {
      return
    }

    clearSelectedFile()
    setName(service.name?.trim() ?? "")
    setDescription(service.description?.trim() ?? "")
    setCurrentImageUrl(service.image?.trim() || null)
  }, [open, serviceDetailsQuery.data])

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) {
      return
    }

    if (!nextOpen) {
      resetForm()
    }

    onOpenChange(nextOpen)
  }

  const clearPreview = () => {
    clearSelectedFile()
    setCurrentImageUrl(null)
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const image = event.currentTarget.files?.[0]

    if (!image) {
      return
    }

    if (!image.type.startsWith("image/")) {
      toast.error("Please select a valid image file.")
      clearSelectedFile()
      return
    }

    clearSelectedFile()

    const nextPreviewUrl = URL.createObjectURL(image)
    previewUrlRef.current = nextPreviewUrl
    setSelectedImage(image)
    setSelectedPreviewUrl(nextPreviewUrl)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      toast.error("Service name is required.")
      return
    }

    if (!description.trim()) {
      toast.error("Service description is required.")
      return
    }

    if (!previewUrl) {
      toast.error("Please select a service image.")
      return
    }

    const formData = new FormData()
    formData.append("name", name.trim())
    formData.append("description", description.trim())

    if (selectedImage) {
      formData.append("image", selectedImage)
    }

    updateServiceMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[840px]">
        {isLoading ? (
          <EditServiceModalSkeleton />
        ) : serviceDetailsQuery.isError ? (
          <EditServiceErrorState
            message={
              serviceDetailsQuery.error instanceof Error
                ? serviceDetailsQuery.error.message
                : "Service details could not be loaded. Please try again."
            }
            onRetry={() => serviceDetailsQuery.refetch()}
          />
        ) : (
          <motion.form
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onSubmit={handleSubmit}
            className="px-6 pb-6 pt-6"
          >
            <DialogHeader className="mb-3 pr-8">
              <DialogTitle className="text-2xl font-medium text-[#000000]">
                Edit Service
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-service-name"
                  className="text-base font-medium text-[#000000]"
                >
                  Service Name
                </Label>
                <Input
                  id="edit-service-name"
                  name="name"
                  value={name}
                  disabled={isSubmitting}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter service name"
                  className="h-[52px] border-[#C3C3C3] text-base"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-service-description"
                  className="text-base font-medium text-[#000000]"
                >
                  Description
                </Label>
                <Textarea
                  id="edit-service-description"
                  name="description"
                  value={description}
                  disabled={isSubmitting}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe this service...."
                  className="h-[154px] border-[#C3C3C3] text-base"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-service-image"
                  className="text-base font-medium text-[#000000]"
                >
                  Image
                </Label>

                {previewUrl ? (
                  <div className="relative h-[210px] overflow-hidden rounded border border-[#CADBD9] bg-[#F6FEFD]">
                    <div
                      role="img"
                      aria-label={
                        selectedImage?.name || name || "Selected service image"
                      }
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${previewUrl}")` }}
                    />
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={clearPreview}
                      className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white text-[#111827] shadow-md transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-60"
                      aria-label="Remove selected image"
                    >
                      <X className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 h-9 rounded bg-[#007066] px-4 text-sm font-medium text-white shadow-md transition hover:bg-[#006059] disabled:pointer-events-none disabled:opacity-60"
                    >
                      Change image
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-[170px] w-full flex-col items-center justify-center rounded border border-dashed border-[#CADBD9] bg-[#F6FEFD] text-center transition hover:border-[#007066]/60 hover:bg-white disabled:pointer-events-none disabled:opacity-60"
                  >
                    <span className="mb-4 flex size-10 items-center justify-center rounded-full bg-[#C8E8E5] text-[#007066] ring-8 ring-[#DDF3F1]">
                      <Upload className="size-5" />
                    </span>
                    <span className="text-base text-[#7D7D7D]">
                      Drag & drop image here or Browse File.
                    </span>
                    <span className="mt-1 text-sm text-[#7D7D7D]">
                      You can select one service image.
                    </span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  id="edit-service-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleOpenChange(false)}
                className="h-[48px] min-w-[100px] border-[#007066] bg-transparent text-base font-medium text-[#007066] hover:bg-[#E6F1F0]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-[48px] min-w-[100px] bg-[#007066] text-base font-medium text-white hover:bg-[#006059]"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </motion.form>
        )}
      </DialogContent>
    </Dialog>
  )
}
