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

interface EditProjectModalProps {
  open: boolean
  projectId: string | null
  onOpenChange: (open: boolean) => void
}

interface ProjectDetails {
  _id: string
  name?: string
  description?: string
  image?: string[] | string
}

interface ProjectDetailsResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
  data?: ProjectDetails | null
}

interface UpdateProjectResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
  data?: ProjectDetails | null
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
  const uniqueId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`

  return `${file.name}-${file.size}-${file.lastModified}-${index}-${uniqueId}`
}

function normalizeImages(image?: string[] | string) {
  if (Array.isArray(image)) {
    return image.filter((item) => item.trim())
  }

  return image?.trim() ? [image] : []
}

async function fetchProjectDetails(accessToken: string, projectId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/project/${encodeURIComponent(projectId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  )

  const payload: ProjectDetailsResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure || !payload?.data) {
    throw new Error(
      payload?.message?.trim() ||
        "Project details could not be loaded. Please try again.",
    )
  }

  return payload.data
}

async function updateProject(
  accessToken: string,
  projectId: string,
  formData: FormData,
) {
  const response = await fetch(
    `${getApiBaseUrl()}/project/${encodeURIComponent(projectId)}`,
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

  const payload: UpdateProjectResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Project could not be updated. Please try again.",
    )
  }

  return {
    message: payload?.message?.trim() || "Project updated successfully.",
  }
}

async function addProjectImages(
  accessToken: string,
  projectId: string,
  images: SelectedProjectImage[],
) {
  const formData = new FormData()

  images.forEach((image) => {
    formData.append("image", image.file)
  })

  const response = await fetch(
    `${getApiBaseUrl()}/project/${encodeURIComponent(projectId)}/add-image`,
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

  const payload: UpdateProjectResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Project images could not be added. Please try again.",
    )
  }

  return {
    message: payload?.message?.trim() || "Project images added successfully.",
  }
}

async function removeProjectImage(
  accessToken: string,
  projectId: string,
  image: string,
) {
  const response = await fetch(
    `${getApiBaseUrl()}/project/${encodeURIComponent(projectId)}/remove-image`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
      cache: "no-store",
    },
  )

  const payload: UpdateProjectResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Project image could not be removed. Please try again.",
    )
  }

  return {
    message: payload?.message?.trim() || "Project image removed successfully.",
  }
}

function EditProjectModalSkeleton() {
  return (
    <div className="animate-pulse space-y-3 px-6 pb-6 pt-6">
      <div className="h-8 w-52 rounded bg-[#C6DEDB]" />
      <div className="space-y-1.5">
        <div className="h-5 w-32 rounded bg-[#D9EAE8]" />
        <div className="h-[52px] rounded border border-[#C3C3C3] bg-[#F6FEFD]" />
      </div>
      <div className="space-y-1.5">
        <div className="h-5 w-28 rounded bg-[#D9EAE8]" />
        <div className="h-[154px] rounded border border-[#C3C3C3] bg-[#F6FEFD]" />
      </div>
      <div className="space-y-1.5">
        <div className="h-5 w-36 rounded bg-[#D9EAE8]" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-[150px] rounded bg-[#D9EAE8]" />
          <div className="h-[150px] rounded bg-[#D9EAE8]" />
          <div className="h-[150px] rounded bg-[#D9EAE8]" />
        </div>
      </div>
      <div className="flex justify-between gap-3 pt-3">
        <div className="h-[48px] w-[100px] rounded bg-[#D9EAE8]" />
        <div className="h-[48px] w-[100px] rounded bg-[#C6DEDB]" />
      </div>
    </div>
  )
}

function EditProjectErrorState({
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
          Edit Project
        </DialogTitle>
      </DialogHeader>
      <div className="mt-5 rounded-lg border border-[#D8E6E4] bg-[#E6F1F0] p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#D9EAE8] text-[#007066]">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#000000]">
              Project unavailable
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

export function EditProjectModal({
  open,
  projectId,
  onOpenChange,
}: EditProjectModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [currentImages, setCurrentImages] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<SelectedProjectImage[]>(
    [],
  )
  const [removingImages, setRemovingImages] = useState<string[]>([])
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const accessToken = session?.accessToken

  const projectDetailsQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () =>
      fetchProjectDetails(accessToken as string, projectId as string),
    enabled: open && Boolean(projectId) && Boolean(accessToken),
    retry: 1,
    staleTime: 30_000,
  })

  const revokeSelectedImages = (images: SelectedProjectImage[]) => {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl))
  }

  const clearSelectedImages = () => {
    setSelectedImages((currentSelectedImages) => {
      revokeSelectedImages(currentSelectedImages)
      return []
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setCurrentImages([])
    setRemovingImages([])
    clearSelectedImages()
  }

  useEffect(() => {
    return () => {
      setSelectedImages((currentSelectedImages) => {
        revokeSelectedImages(currentSelectedImages)
        return currentSelectedImages
      })
    }
  }, [])

  useEffect(() => {
    const project = projectDetailsQuery.data

    if (!open || !project) {
      return
    }

    setSelectedImages((currentSelectedImages) => {
      currentSelectedImages.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      )
      return []
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    setName(project.name?.trim() ?? "")
    setDescription(project.description?.trim() ?? "")
    setCurrentImages(normalizeImages(project.image))
  }, [open, projectDetailsQuery.data])

  const updateProjectMutation = useMutation({
    mutationFn: async ({
      formData,
      images,
    }: {
      formData: FormData
      images: SelectedProjectImage[]
    }) => {
      if (!accessToken || !projectId) {
        throw new Error("Your session token was not found. Please log in again.")
      }

      const result = await updateProject(accessToken, projectId, formData)

      if (images.length > 0) {
        await addProjectImages(accessToken, projectId, images)
      }

      return result
    },
    onSuccess: async (result) => {
      toast.success(result.message)
      resetForm()
      onOpenChange(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      ])
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Project could not be updated. Please try again.",
      )
    },
  })

  const removeProjectImageMutation = useMutation({
    mutationFn: (image: string) => {
      if (!accessToken || !projectId) {
        throw new Error("Your session token was not found. Please log in again.")
      }

      return removeProjectImage(accessToken, projectId, image)
    },
    onSuccess: async (result, image) => {
      toast.success(result.message)
      queryClient.setQueryData<ProjectDetails | undefined>(
        ["project", projectId],
        (project) =>
          project
            ? {
                ...project,
                image: normalizeImages(project.image).filter(
                  (currentImage) => currentImage !== image,
                ),
              }
            : project,
      )
      await queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })

  const isSubmitting =
    updateProjectMutation.isPending || removeProjectImageMutation.isPending
  const isLoading =
    projectDetailsQuery.isLoading || projectDetailsQuery.isFetching

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

    setSelectedImages((currentSelectedImages) => [
      ...currentSelectedImages,
      ...nextImages,
    ])
    event.currentTarget.value = ""
  }

  const removeSelectedImage = (imageId: string) => {
    setSelectedImages((currentSelectedImages) => {
      const imageToRemove = currentSelectedImages.find(
        (image) => image.id === imageId,
      )

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl)
      }

      return currentSelectedImages.filter((image) => image.id !== imageId)
    })
  }

  const removeCurrentImage = async (image: string) => {
    if (removingImages.includes(image)) {
      return
    }

    const previousImages = currentImages

    setRemovingImages((currentRemovingImages) => [
      ...currentRemovingImages,
      image,
    ])
    setCurrentImages((currentProjectImages) =>
      currentProjectImages.filter((currentImage) => currentImage !== image),
    )

    try {
      await removeProjectImageMutation.mutateAsync(image)
    } catch (error) {
      setCurrentImages(previousImages)
      toast.error(
        error instanceof Error
          ? error.message
          : "Project image could not be removed. Please try again.",
      )
    } finally {
      setRemovingImages((currentRemovingImages) =>
        currentRemovingImages.filter((currentImage) => currentImage !== image),
      )
    }
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

    const formData = new FormData()
    formData.append("name", name.trim())
    formData.append("description", description.trim())

    updateProjectMutation.mutate({
      formData,
      images: selectedImages,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-[840px] overflow-y-auto">
        {isLoading ? (
          <EditProjectModalSkeleton />
        ) : projectDetailsQuery.isError ? (
          <EditProjectErrorState
            message={
              projectDetailsQuery.error instanceof Error
                ? projectDetailsQuery.error.message
                : "Project details could not be loaded. Please try again."
            }
            onRetry={() => projectDetailsQuery.refetch()}
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
                Edit Project
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-project-name"
                  className="text-base font-medium text-[#000000]"
                >
                  Project Name
                </Label>
                <Input
                  id="edit-project-name"
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
                  htmlFor="edit-project-description"
                  className="text-base font-medium text-[#000000]"
                >
                  Description
                </Label>
                <Textarea
                  id="edit-project-description"
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
                  htmlFor="edit-project-images"
                  className="text-base font-medium text-[#000000]"
                >
                  Project Images
                </Label>

                <div className="space-y-3">
                  {currentImages.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#667877]">
                        Current images
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {currentImages.map((image, index) => (
                          <div
                            key={`${image}-${index}`}
                            className="relative h-[150px] overflow-hidden rounded border border-[#CADBD9] bg-[#F6FEFD]"
                          >
                            <div
                              role="img"
                              aria-label={`Current project image ${index + 1}`}
                              className="h-full w-full bg-cover bg-center"
                              style={{ backgroundImage: `url("${image}")` }}
                            />
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => void removeCurrentImage(image)}
                              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white text-[#111827] shadow-md transition hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-60"
                              aria-label={`Remove current project image ${index + 1}`}
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selectedImages.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#667877]">
                        New selected images
                      </p>
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
                    </div>
                  ) : null}

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-[96px] w-full flex-col items-center justify-center rounded border border-dashed border-[#CADBD9] bg-[#F6FEFD] text-center transition hover:border-[#007066]/60 hover:bg-white disabled:pointer-events-none disabled:opacity-60"
                  >
                    <span className="mb-2 flex size-9 items-center justify-center rounded-full bg-[#C8E8E5] text-[#007066] ring-4 ring-[#DDF3F1]">
                      <Upload className="size-5" />
                    </span>
                    <span className="text-base text-[#7D7D7D]">
                      Select new project images
                    </span>
                    <span className="text-sm text-[#7D7D7D]">
                      You can select multiple images at once.
                    </span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  id="edit-project-images"
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
        )}
      </DialogContent>
    </Dialog>
  )
}
