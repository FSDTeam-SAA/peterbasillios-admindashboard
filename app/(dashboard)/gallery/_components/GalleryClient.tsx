"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { AlertCircle, Eye, PencilLine, Plus, Search, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { AddProjectModal } from "./AddProjectModal"
import { EditProjectModal } from "./EditProjectModal"
import { GalleryTableSkeleton } from "./GalleryTableSkeleton"
import { ProjectDetailsModal } from "./ProjectDetailsModal"

interface ProjectApiItem {
  _id: string
  name?: string
  description?: string
  image?: string[] | string
  status?: string
  createdAt?: string
  updatedAt?: string
}

interface ProjectsApiResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
  data?: ProjectApiItem[]
}

interface ProjectDeleteResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
}

interface GalleryProject {
  id: string
  name: string
  description: string
  images: number
  addedDate: string
  status: string
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (!baseUrl) {
    throw new Error("API base URL is not configured.")
  }

  return baseUrl.replace(/\/+$/, "")
}

function formatAddedDate(value?: string) {
  if (!value) {
    return "N/A"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "N/A"
  }

  return dateFormatter.format(date)
}

function normalizeImageCount(image?: string[] | string) {
  if (Array.isArray(image)) {
    return image.length
  }

  return image ? 1 : 0
}

function normalizeStatus(status?: string) {
  if (!status?.trim()) {
    return "Published"
  }

  return status.trim()
}

function normalizeProjects(data?: ProjectApiItem[]): GalleryProject[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.map((project) => ({
    id: project._id,
    name: project.name?.trim() || "Untitled project",
    description: project.description?.trim() || "No description available.",
    images: normalizeImageCount(project.image),
    addedDate: formatAddedDate(project.createdAt),
    status: normalizeStatus(project.status),
  }))
}

async function fetchProjects(accessToken: string, searchTerm: string) {
  const params = new URLSearchParams()
  const trimmedSearch = searchTerm.trim()

  if (trimmedSearch) {
    params.set("searchTerm", trimmedSearch)
  }

  const queryString = params.toString()
  const response = await fetch(
    `${getApiBaseUrl()}/project${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  )

  const payload: ProjectsApiResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Projects could not be loaded. Please try again.",
    )
  }

  return normalizeProjects(payload?.data)
}

async function deleteProject(accessToken: string, projectId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/project/${encodeURIComponent(projectId)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  )

  const payload: ProjectDeleteResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Project could not be deleted. Please try again.",
    )
  }

  return {
    message: payload?.message?.trim() || "Project deleted successfully.",
  }
}

function useDebouncedValue(value: string, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => window.clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}

function GalleryState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-[#D8E6E4] bg-[#E6F1F0] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#D9EAE8] text-[#007066]">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#000000]">{title}</h2>
            <p className="mt-1 text-base leading-6 text-[#7D7D7D]">
              {description}
            </p>
          </div>
        </div>
        {action}
      </div>
    </div>
  )
}

export function GalleryClient() {
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [projectToView, setProjectToView] = useState<GalleryProject | null>(
    null,
  )
  const [projectToEdit, setProjectToEdit] = useState<GalleryProject | null>(
    null,
  )
  const [projectToDelete, setProjectToDelete] = useState<GalleryProject | null>(
    null,
  )
  const debouncedSearch = useDebouncedValue(search)
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()
  const accessToken = session?.accessToken

  const projectsQuery = useQuery({
    queryKey: ["projects", debouncedSearch],
    queryFn: () => fetchProjects(accessToken as string, debouncedSearch),
    enabled: status === "authenticated" && Boolean(accessToken),
    retry: 1,
    staleTime: 60_000,
  })

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => {
      if (!accessToken) {
        throw new Error("Your session token was not found. Please log in again.")
      }

      return deleteProject(accessToken, projectId)
    },
    onSuccess: async (result) => {
      toast.success(result.message)
      setProjectToDelete(null)
      await queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Project could not be deleted. Please try again.",
      )
    },
  })

  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data])
  const isTokenMissing = status === "authenticated" && !accessToken
  const isProjectsLoading =
    status === "loading" ||
    (status === "authenticated" &&
      Boolean(accessToken) &&
      (projectsQuery.isLoading || projectsQuery.isFetching))
  const trimmedSearch = debouncedSearch.trim()
  const isDeletePending = deleteProjectMutation.isPending

  const closeDeleteModal = (open: boolean) => {
    if (isDeletePending) {
      return
    }

    if (!open) {
      setProjectToDelete(null)
    }
  }

  const confirmDeleteProject = () => {
    if (!projectToDelete) {
      return
    }

    deleteProjectMutation.mutate(projectToDelete.id)
  }

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="min-h-[calc(100vh-128px)] bg-[#F8FCFC] text-base text-[#7D7D7D]"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-[490px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6F807F]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="h-[48px] rounded-lg border-0 bg-[#E9EFEF] pl-9 text-base text-[#7D7D7D] shadow-none placeholder:text-[#7D7D7D] focus:ring-2 focus:ring-[#007066]/15"
            />
          </div>

          <Button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="h-[48px] min-w-[160px] rounded bg-[#007066] px-4 text-base font-medium text-white hover:bg-[#006059]"
          >
            <Plus className="size-4" />
            Add New Project
          </Button>
        </div>

        {isProjectsLoading ? (
          <GalleryTableSkeleton />
        ) : isTokenMissing ? (
          <GalleryState
            title="Projects unavailable"
            description="Your session token was not found. Please log in again to load projects."
          />
        ) : projectsQuery.isError ? (
          <GalleryState
            title="Projects unavailable"
            description={
              projectsQuery.error instanceof Error
                ? projectsQuery.error.message
                : "Projects could not be loaded. Please try again."
            }
            action={
              <Button
                type="button"
                onClick={() => projectsQuery.refetch()}
                className="h-11 rounded-lg bg-[#007066] px-6 text-base font-semibold text-white hover:bg-[#006059]"
              >
                Try again
              </Button>
            }
          />
        ) : projects.length === 0 ? (
          <GalleryState
            title={trimmedSearch ? "No projects found" : "No projects yet"}
            description={
              trimmedSearch
                ? `No projects matched "${trimmedSearch}".`
                : "Projects will appear here once they are added."
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg bg-[#E6F1F0]">
            <Table className="min-w-[1050px]">
              <TableHeader>
                <TableRow className="h-[60px] hover:bg-transparent">
                  <TableHead className="w-[250px] text-center text-base text-[#7D7D7D]">
                    Project Name
                  </TableHead>
                  <TableHead className="w-[385px] text-center text-base text-[#7D7D7D]">
                    Description
                  </TableHead>
                  <TableHead className="w-[120px] text-center text-base text-[#7D7D7D]">
                    Images
                  </TableHead>
                  <TableHead className="w-[165px] text-center text-base text-[#7D7D7D]">
                    Added date
                  </TableHead>
                  <TableHead className="w-[130px] text-center text-base text-[#7D7D7D]">
                    Status
                  </TableHead>
                  <TableHead className="w-[115px] text-center text-base text-[#7D7D7D]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} className="h-[76px]">
                    <TableCell className="text-center">
                      <span className="text-base font-semibold text-[#000000]">
                        {project.name}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[385px] text-center">
                      <p className="mx-auto line-clamp-2 max-w-[345px] text-base leading-6 text-[#7D7D7D]">
                        {project.description}
                      </p>
                    </TableCell>
                    <TableCell className="text-center text-base font-medium text-[#7D7D7D]">
                      {project.images}
                    </TableCell>
                    <TableCell className="text-center text-base font-medium text-[#7D7D7D]">
                      {project.addedDate}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex h-[24px] min-w-[86px] items-center justify-center rounded-full bg-[#CDF4D5] px-4 text-base font-medium text-[#12B633]">
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3 text-[#264B5B]">
                        <button
                          type="button"
                          onClick={() => setProjectToView(project)}
                          className="flex size-7 items-center justify-center rounded bg-[#D9EAE8] text-[#007066] transition hover:bg-[#007066] hover:text-white"
                          aria-label={`View ${project.name}`}
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setProjectToEdit(project)}
                          className="rounded p-1 transition hover:bg-white/50 hover:text-[#007066]"
                          aria-label={`Edit ${project.name}`}
                        >
                          <PencilLine className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setProjectToDelete(project)}
                          className="rounded p-1 transition hover:bg-white/50 hover:text-red-600"
                          aria-label={`Delete ${project.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.section>

      <AddProjectModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      <EditProjectModal
        open={Boolean(projectToEdit)}
        projectId={projectToEdit?.id ?? null}
        onOpenChange={(open) => {
          if (!open) {
            setProjectToEdit(null)
          }
        }}
      />

      <ProjectDetailsModal
        open={Boolean(projectToView)}
        projectId={projectToView?.id ?? null}
        onOpenChange={(open) => {
          if (!open) {
            setProjectToView(null)
          }
        }}
      />

      <Dialog open={Boolean(projectToDelete)} onOpenChange={closeDeleteModal}>
        <DialogContent className="max-w-[430px]">
          <div className="px-6 pb-6 pt-6">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-2xl font-medium text-[#000000]">
                Delete Project
              </DialogTitle>
              <DialogDescription className="mt-2 text-base leading-6 text-[#667877]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#000000]">
                  {projectToDelete?.name}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6 justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isDeletePending}
                onClick={() => setProjectToDelete(null)}
                className="h-[44px] min-w-[96px] border-[#007066] bg-transparent text-base font-medium text-[#007066] hover:bg-[#E6F1F0]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeletePending}
                onClick={confirmDeleteProject}
                className="h-[44px] min-w-[112px] bg-red-600 text-base font-medium text-white hover:bg-red-700"
              >
                {isDeletePending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
