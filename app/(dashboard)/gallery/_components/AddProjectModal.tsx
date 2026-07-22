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
import { Textarea } from "@/components/ui/textarea"

interface AddProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CreateProjectResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
}

interface SelectedProjectImage {
  id: string
  file: File
  previewUrl: string
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!baseUrl) {
    throw new Error("API base URL is not configured.")
  }

  return baseUrl.replace(/\/+$/, "")
}

function createImageId(file: File, index: number) {
  return `${file.name}-${file.size}-${file.lastModified}-${index}-${crypto.randomUUID()}`
}

async function createProject(accessToken: string, formData: FormData) {
  const response = await fetch(`${getApiBaseUrl()}/project`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
    cache: "no-store",
  })

  const payload: CreateProjectResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Project could not be created. Please try again.",
    )
  }

  return {
    message: payload?.message?.trim() || "Project created successfully.",
  }
}

export function AddProjectModal({
  open,
  onOpenChange,
}: AddProjectModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedImages, setSelectedImages] = useState<SelectedProjectImage[]>(
    [],
  )
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const accessToken = session?.accessToken

  const revokeImages = (images: SelectedProjectImage[]) => {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl))
  }

  const clearSelectedImages = () => {
    setSelectedImages((currentImages) => {
      revokeImages(currentImages)
      return []
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    clearSelectedImages()
  }

  useEffect(() => {
    return () => {
      setSelectedImages((currentImages) => {
        revokeImages(currentImages)
        return currentImages
      })
    }
  }, [])

  const createProjectMutation = useMutation({
    mutationFn: (formData: FormData) => {
      if (!accessToken) {
        throw new Error("Your session token was not found. Please log in again.")
      }

      return createProject(accessToken, formData)
    },
    onSuccess: async (result) => {
      toast.success(result.message)
      resetForm()
      onOpenChange(false)
      await queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Project could not be created. Please try again.",
      )
    },
  })

  const isSubmitting = createProjectMutation.isPending

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
    const files = Array.from(event.currentTarget.files ?? [])

    if (files.length === 0) {
      return
    }

    const validImages = files.filter((file) => file.type.startsWith("image/"))

    if (validImages.length !== files.length) {
      toast.error("Only image files can be selected.")
    }

    if (validImages.length === 0) {
      event.currentTarget.value = ""
      return
    }

    const nextImages = validImages.map((file, index) => ({
      id: createImageId(file, index),
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setSelectedImages((currentImages) => [...currentImages, ...nextImages])
    event.currentTarget.value = ""
  }

  const removeSelectedImage = (imageId: string) => {
    setSelectedImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === imageId)

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl)
      }

      return currentImages.filter((image) => image.id !== imageId)
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      toast.error("Project name is required.")
      return
    }

    if (!description.trim()) {
      toast.error("Project description is required.")
      return
    }

    if (selectedImages.length === 0) {
      toast.error("Please select at least one project image.")
      return
    }

    const formData = new FormData()
    formData.append("name", name.trim())
    formData.append("description", description.trim())
    selectedImages.forEach((image) => {
      formData.append("image", image.file)
    })

    createProjectMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-[840px] overflow-y-auto">
        <motion.form
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="px-6 pb-6 pt-6"
        >
          <DialogHeader className="mb-3 pr-8">
            <DialogTitle className="text-2xl font-medium text-[#000000]">
              Add New Project
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="project-name"
                className="text-base font-medium text-[#000000]"
              >
                Project Name
              </Label>
              <Input
                id="project-name"
                name="name"
                value={name}
                disabled={isSubmitting}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter project name"
                className="h-[52px] border-[#C3C3C3] text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="project-description"
                className="text-base font-medium text-[#000000]"
              >
                Description
              </Label>
              <Textarea
                id="project-description"
                name="description"
                value={description}
                disabled={isSubmitting}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe this project....."
                className="h-[154px] border-[#C3C3C3] text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="project-images"
                className="text-base font-medium text-[#000000]"
              >
                Project Images
              </Label>

              {selectedImages.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedImages.map((image) => (
                      <div
                        key={image.id}
                        className="relative h-[150px] overflow-hidden rounded border border-[#CADBD9] bg-[#F6FEFD]"
                      >
                        <div
                          role="img"
                          aria-label={image.file.name}
                          className="h-full w-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url("${image.previewUrl}")`,
                          }}
                        />
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => removeSelectedImage(image.id)}
                          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white text-[#111827] shadow-md transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-60"
                          aria-label={`Remove ${image.file.name}`}
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-[64px] w-full items-center justify-center gap-3 rounded border border-dashed border-[#CADBD9] bg-[#F6FEFD] text-base text-[#7D7D7D] transition hover:border-[#007066]/60 hover:bg-white disabled:pointer-events-none disabled:opacity-60"
                  >
                    <Upload className="size-5 text-[#007066]" />
                    Add more images
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-[250px] w-full flex-col items-center justify-center rounded border border-dashed border-[#CADBD9] bg-[#F6FEFD] text-center transition hover:border-[#007066]/60 hover:bg-white disabled:pointer-events-none disabled:opacity-60"
                >
                  <span className="mb-5 flex size-10 items-center justify-center rounded-full bg-[#C8E8E5] text-[#007066] ring-8 ring-[#DDF3F1]">
                    <Upload className="size-5" />
                  </span>
                  <span className="text-base text-[#7D7D7D]">
                    Drag & drop images here or Browse Files.
                  </span>
                  <span className="mt-1 text-base text-[#7D7D7D]">
                    You can select multiple images at once.
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                id="project-images"
                name="image"
                type="file"
                accept="image/*"
                multiple
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
