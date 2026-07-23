"use client"

import { useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Upload, X } from "lucide-react"
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

import {
  isRichTextEmpty,
  ServiceDescriptionEditor,
} from "./ServiceDescriptionEditor"

interface AddServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CreateServiceResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!baseUrl) {
    throw new Error("API base URL is not configured.")
  }

  return baseUrl.replace(/\/+$/, "")
}

async function createService(accessToken: string, formData: FormData) {
  const response = await fetch(`${getApiBaseUrl()}/service`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
    cache: "no-store",
  })

  const payload: CreateServiceResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Service could not be created. Please try again.",
    )
  }

  return {
    message: payload?.message?.trim() || "Service created successfully.",
  }
}

export function AddServiceModal({
  open,
  onOpenChange,
}: AddServiceModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const accessToken = session?.accessToken

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const clearSelectedImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setSelectedImage(null)
    setPreviewUrl(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    clearSelectedImage()
  }

  const createServiceMutation = useMutation({
    mutationFn: (formData: FormData) => {
      if (!accessToken) {
        throw new Error("Your session token was not found. Please log in again.")
      }

      return createService(accessToken, formData)
    },
    onSuccess: async (result) => {
      toast.success(result.message)
      resetForm()
      onOpenChange(false)
      await queryClient.invalidateQueries({ queryKey: ["services"] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Service could not be created. Please try again.",
      )
    },
  })

  const isSubmitting = createServiceMutation.isPending

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) {
      return
    }

    if (!nextOpen) {
      resetForm()
    }

    onOpenChange(nextOpen)
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const image = event.currentTarget.files?.[0]

    if (!image) {
      return
    }

    if (!image.type.startsWith("image/")) {
      toast.error("Please select a valid image file.")
      clearSelectedImage()
      return
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const nextPreviewUrl = URL.createObjectURL(image)
    previewUrlRef.current = nextPreviewUrl
    setSelectedImage(image)
    setPreviewUrl(nextPreviewUrl)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      toast.error("Service name is required.")
      return
    }

    if (isRichTextEmpty(description)) {
      toast.error("Service description is required.")
      return
    }

    if (!selectedImage) {
      toast.error("Please select a service image.")
      return
    }

    const formData = new FormData()
    formData.append("name", name.trim())
    formData.append("description", description.trim())
    formData.append("image", selectedImage)

    createServiceMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[840px]">
        <motion.form
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="px-6 pb-6 pt-6"
        >
          <DialogHeader className="mb-3 pr-8">
            <DialogTitle className="text-2xl font-medium text-[#000000]">
              Add New Service
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="service-name"
                className="text-base font-medium text-[#000000]"
              >
                Service Name
              </Label>
              <Input
                id="service-name"
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
                htmlFor="service-description"
                className="text-base font-medium text-[#000000]"
              >
                Description
              </Label>
              <ServiceDescriptionEditor
                id="service-description"
                value={description}
                disabled={isSubmitting}
                onChange={setDescription}
                placeholder="Describe this service...."
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="service-image"
                className="text-base font-medium text-[#000000]"
              >
                Image
              </Label>

              {previewUrl ? (
                <div className="relative h-[210px] overflow-hidden rounded border border-[#CADBD9] bg-[#F6FEFD]">
                  <div
                    role="img"
                    aria-label={selectedImage?.name || "Selected service image"}
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url("${previewUrl}")` }}
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={clearSelectedImage}
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
                id="service-image"
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
      </DialogContent>
    </Dialog>
  )
}
