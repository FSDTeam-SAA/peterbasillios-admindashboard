"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { AlertCircle, PencilLine, Plus, Search, Trash2 } from "lucide-react"
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

import { AddServiceModal } from "./AddServiceModal"
import { EditServiceModal } from "./EditServiceModal"
import { ServicesTableSkeleton } from "./ServicesTableSkeleton"

interface ServiceApiItem {
  _id: string
  name?: string
  description?: string
  image?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

interface ServicesApiResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
  data?: ServiceApiItem[]
}

interface ServiceDeleteResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
}

interface ServiceItem {
  id: string
  name: string
  description: string
  addedDate: string
  status: string
  image?: string
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

function normalizeStatus(status?: string) {
  if (!status?.trim()) {
    return "Active"
  }

  return status.trim()
}

function stripRichText(value?: string) {
  const plainText =
    value
      ?.replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? ""

  return plainText || "No description available."
}

function normalizeServices(data?: ServiceApiItem[]): ServiceItem[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.map((service) => ({
    id: service._id,
    name: service.name?.trim() || "Untitled service",
    description: stripRichText(service.description),
    image: service.image,
    addedDate: formatAddedDate(service.createdAt),
    status: normalizeStatus(service.status),
  }))
}

async function fetchServices(accessToken: string, searchTerm: string) {
  const params = new URLSearchParams()
  const trimmedSearch = searchTerm.trim()

  if (trimmedSearch) {
    params.set("searchTerm", trimmedSearch)
  }

  const queryString = params.toString()
  const response = await fetch(
    `${getApiBaseUrl()}/service${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  )

  const payload: ServicesApiResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Services could not be loaded. Please try again.",
    )
  }

  return normalizeServices(payload?.data)
}

async function deleteService(accessToken: string, serviceId: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/service/${encodeURIComponent(serviceId)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  )

  const payload: ServiceDeleteResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Service could not be deleted. Please try again.",
    )
  }

  return {
    message: payload?.message?.trim() || "Service deleted successfully.",
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

function ServicesState({
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

export function ServicesClient() {
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [serviceToEdit, setServiceToEdit] = useState<ServiceItem | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(
    null,
  )
  const debouncedSearch = useDebouncedValue(search)
  const queryClient = useQueryClient()
  const { data: session, status } = useSession()
  const accessToken = session?.accessToken

  const servicesQuery = useQuery({
    queryKey: ["services", debouncedSearch],
    queryFn: () => fetchServices(accessToken as string, debouncedSearch),
    enabled: status === "authenticated" && Boolean(accessToken),
    retry: 1,
    staleTime: 60_000,
  })

  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => {
      if (!accessToken) {
        throw new Error("Your session token was not found. Please log in again.")
      }

      return deleteService(accessToken, serviceId)
    },
    onSuccess: async (result) => {
      toast.success(result.message)
      setServiceToDelete(null)
      await queryClient.invalidateQueries({ queryKey: ["services"] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Service could not be deleted. Please try again.",
      )
    },
  })

  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data])
  const isTokenMissing = status === "authenticated" && !accessToken
  const isServicesLoading =
    status === "loading" ||
    (status === "authenticated" &&
      Boolean(accessToken) &&
      (servicesQuery.isLoading || servicesQuery.isFetching))
  const trimmedSearch = debouncedSearch.trim()
  const isDeletePending = deleteServiceMutation.isPending

  const closeDeleteModal = (open: boolean) => {
    if (isDeletePending) {
      return
    }

    if (!open) {
      setServiceToDelete(null)
    }
  }

  const confirmDeleteService = () => {
    if (!serviceToDelete) {
      return
    }

    deleteServiceMutation.mutate(serviceToDelete.id)
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
          <div className="relative w-full max-w-[325px]">
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
            className="h-[48px] min-w-[113px] rounded bg-[#007066] px-4 text-base font-medium text-[white] hover:bg-[#006059]"
          >
            <Plus className="size-4" />
            Add Service
          </Button>
        </div>

        {isServicesLoading ? (
          <ServicesTableSkeleton />
        ) : isTokenMissing ? (
          <ServicesState
            title="Services unavailable"
            description="Your session token was not found. Please log in again to load services."
          />
        ) : servicesQuery.isError ? (
          <ServicesState
            title="Services unavailable"
            description={
              servicesQuery.error instanceof Error
                ? servicesQuery.error.message
                : "Services could not be loaded. Please try again."
            }
            action={
              <Button
                type="button"
                onClick={() => servicesQuery.refetch()}
                className="h-11 rounded-lg bg-[#007066] px-6 text-base font-semibold text-white hover:bg-[#006059]"
              >
                Try again
              </Button>
            }
          />
        ) : services.length === 0 ? (
          <ServicesState
            title={trimmedSearch ? "No services found" : "No services yet"}
            description={
              trimmedSearch
                ? `No services matched "${trimmedSearch}".`
                : "Services will appear here once they are added."
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg bg-[#E6F1F0]">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="h-[42px] hover:bg-transparent">
                  <TableHead className="w-[235px] pl-[102px] text-base text-[#7D7D7D]">
                    Name
                  </TableHead>
                  <TableHead className="w-[400px] text-center text-base text-[#7D7D7D]">
                    Description
                  </TableHead>
                  <TableHead className="w-[145px] text-center text-base text-[#7D7D7D]">
                    Added date
                  </TableHead>
                  <TableHead className="w-[110px] text-center text-base text-[#7D7D7D]">
                    Status
                  </TableHead>
                  <TableHead className="w-[105px] text-center text-base text-[#7D7D7D]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id} className="h-[60px]">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          role="img"
                          aria-label={`${service.name} preview`}
                          className="flex h-[30px] w-[38px] shrink-0 items-center justify-center rounded bg-[#D9EAE8] bg-cover bg-center text-xs font-semibold text-[#007066]"
                          style={
                            service.image
                              ? { backgroundImage: `url("${service.image}")` }
                              : undefined
                          }
                        >
                          {!service.image ? service.name.charAt(0) : null}
                        </span>
                        <span className="whitespace-nowrap text-base font-semibold text-[#000000]">
                          {service.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[400px] text-center">
                      <p className="mx-auto line-clamp-2 max-w-[360px] text-base leading-6 text-[#7D7D7D]">
                        {service.description}
                      </p>
                    </TableCell>
                    <TableCell className="text-center text-base font-medium text-[#7D7D7D]">
                      {service.addedDate}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex h-[24px] min-w-[58px] items-center justify-center rounded-full bg-[#CDF4D5] px-3 text-base font-medium text-[#7D7D7D]">
                        {service.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3 text-[#264B5B]">
                        <button
                          type="button"
                          onClick={() => setServiceToEdit(service)}
                          className="rounded p-1 transition hover:bg-white/50 hover:text-[#007066]"
                          aria-label={`Edit ${service.name}`}
                        >
                          <PencilLine className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceToDelete(service)}
                          className="rounded p-1 transition hover:bg-white/50 hover:text-red-600"
                          aria-label={`Delete ${service.name}`}
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

      <AddServiceModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      <EditServiceModal
        open={Boolean(serviceToEdit)}
        serviceId={serviceToEdit?.id ?? null}
        onOpenChange={(open) => {
          if (!open) {
            setServiceToEdit(null)
          }
        }}
      />

      <Dialog open={Boolean(serviceToDelete)} onOpenChange={closeDeleteModal}>
        <DialogContent className="max-w-[430px]">
          <div className="px-6 pb-6 pt-6">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-2xl font-medium text-[#000000]">
                Delete Service
              </DialogTitle>
              <DialogDescription className="mt-2 text-base leading-6 text-[#667877]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#000000]">
                  {serviceToDelete?.name}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6 justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isDeletePending}
                onClick={() => setServiceToDelete(null)}
                className="h-[44px] min-w-[96px] border-[#007066] bg-transparent text-base font-medium text-[#007066] hover:bg-[#E6F1F0]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeletePending}
                onClick={confirmDeleteService}
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
