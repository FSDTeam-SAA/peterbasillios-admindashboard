"use client"

import { useQuery } from "@tanstack/react-query"
import { AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProjectDetailsModalProps {
  open: boolean
  projectId: string | null
  onOpenChange: (open: boolean) => void
}

interface ProjectDetails {
  _id: string
  name?: string
  description?: string
  image?: string[] | string
  createdAt?: string
  updatedAt?: string
  __v?: number
}

interface ProjectDetailsResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
  data?: ProjectDetails | null
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!baseUrl) {
    throw new Error("API base URL is not configured.")
  }

  return baseUrl.replace(/\/+$/, "")
}

function formatDateTime(value?: string) {
  if (!value) {
    return "N/A"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "N/A"
  }

  return dateTimeFormatter.format(date)
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

function ProjectDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-5 px-6 pb-6 pt-6">
      <div className="h-8 w-52 rounded bg-[#C6DEDB]" />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="h-[150px] rounded bg-[#D9EAE8]" />
        <div className="h-[150px] rounded bg-[#D9EAE8]" />
        <div className="h-[150px] rounded bg-[#D9EAE8]" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="h-[70px] rounded bg-[#D9EAE8]" />
        <div className="h-[70px] rounded bg-[#D9EAE8]" />
        <div className="h-[70px] rounded bg-[#D9EAE8]" />
        <div className="h-[70px] rounded bg-[#D9EAE8]" />
      </div>
      <div className="h-[120px] rounded bg-[#D9EAE8]" />
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#CADBD9] bg-[#F6FEFD] p-4">
      <p className="text-sm font-medium text-[#667877]">{label}</p>
      <p className="mt-1 break-words text-base font-semibold text-[#000000]">
        {value}
      </p>
    </div>
  )
}

function ProjectDetailsErrorState({
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
          Project Details
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

export function ProjectDetailsModal({
  open,
  projectId,
  onOpenChange,
}: ProjectDetailsModalProps) {
  const { data: session } = useSession()
  const accessToken = session?.accessToken

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProjectDetails(accessToken as string, projectId as string),
    enabled: open && Boolean(projectId) && Boolean(accessToken),
    retry: 1,
    staleTime: 30_000,
  })

  const project = projectQuery.data
  const images = normalizeImages(project?.image)
  const isLoading = projectQuery.isLoading || projectQuery.isFetching

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-[900px] overflow-y-auto">
        {isLoading ? (
          <ProjectDetailsSkeleton />
        ) : projectQuery.isError ? (
          <ProjectDetailsErrorState
            message={
              projectQuery.error instanceof Error
                ? projectQuery.error.message
                : "Project details could not be loaded. Please try again."
            }
            onRetry={() => projectQuery.refetch()}
          />
        ) : project ? (
          <div className="px-6 pb-6 pt-6">
            <DialogHeader className="mb-5 pr-8">
              <DialogTitle className="text-2xl font-medium text-[#000000]">
                Project Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              {images.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      role="img"
                      aria-label={`${project.name ?? "Project"} image ${index + 1}`}
                      className="h-[150px] rounded bg-[#D9EAE8] bg-cover bg-center"
                      style={{ backgroundImage: `url("${image}")` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-[150px] items-center justify-center rounded border border-dashed border-[#CADBD9] bg-[#F6FEFD] text-base text-[#7D7D7D]">
                  No images available
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-2">
                <DetailItem
                  label="Project Name"
                  value={project.name?.trim() || "Untitled project"}
                />
                <DetailItem label="Images" value={`${images.length}`} />
                <DetailItem
                  label="Created At"
                  value={formatDateTime(project.createdAt)}
                />
                <DetailItem
                  label="Updated At"
                  value={formatDateTime(project.updatedAt)}
                />
              </div>

              <div className="rounded border border-[#CADBD9] bg-[#F6FEFD] p-4">
                <p className="text-sm font-medium text-[#667877]">
                  Description
                </p>
                <p className="mt-2 text-base leading-6 text-[#000000]">
                  {project.description?.trim() || "No description available."}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
