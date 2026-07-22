"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { InquiriesTableSkeleton } from "./InquiriesTableSkeleton"

interface ContactApiItem {
  _id: string
  fullName?: string
  email?: string
  phoneNumber?: string
  message?: string
  createdAt?: string
  updatedAt?: string
}

interface ContactsApiResponse {
  statusCode?: number
  success?: boolean
  status?: boolean
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
  data?: ContactApiItem[]
}

interface InquiryItem {
  id: string
  name: string
  email: string
  phone: string
  inquiry: string
  addedDate: string
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

function getContactsUrl() {
  const baseUrl = getApiBaseUrl()

  if (baseUrl.endsWith("/api/v1")) {
    return `${baseUrl}/contact`
  }

  return `${baseUrl}/api/v1/contact`
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

function normalizeContacts(data?: ContactApiItem[]): InquiryItem[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.map((contact) => ({
    id: contact._id,
    name: contact.fullName?.trim() || "Unknown contact",
    email: contact.email?.trim() || "N/A",
    phone: contact.phoneNumber?.trim() || "N/A",
    inquiry: contact.message?.trim() || "No message provided.",
    addedDate: formatAddedDate(contact.createdAt),
  }))
}

async function fetchInquiries(accessToken: string) {
  const response = await fetch(getContactsUrl(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  const payload: ContactsApiResponse | null = await response
    .json()
    .catch(() => null)
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        "Inquiries could not be loaded. Please try again.",
    )
  }

  return normalizeContacts(payload?.data)
}

function InquiriesState({
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

export function InquiriesClient() {
  const { data: session, status } = useSession()
  const accessToken = session?.accessToken

  const inquiriesQuery = useQuery({
    queryKey: ["inquiries"],
    queryFn: () => fetchInquiries(accessToken as string),
    enabled: status === "authenticated" && Boolean(accessToken),
    retry: 1,
    staleTime: 60_000,
  })

  const inquiries = useMemo(
    () => inquiriesQuery.data ?? [],
    [inquiriesQuery.data],
  )
  const isTokenMissing = status === "authenticated" && !accessToken
  const isInquiriesLoading =
    status === "loading" ||
    (status === "authenticated" &&
      Boolean(accessToken) &&
      (inquiriesQuery.isLoading || inquiriesQuery.isFetching))

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="min-h-[calc(100vh-128px)] bg-[#F8FCFC] text-base text-[#7D7D7D]"
    >
      {isInquiriesLoading ? (
        <InquiriesTableSkeleton />
      ) : isTokenMissing ? (
        <InquiriesState
          title="Inquiries unavailable"
          description="Your session token was not found. Please log in again to load inquiries."
        />
      ) : inquiriesQuery.isError ? (
        <InquiriesState
          title="Inquiries unavailable"
          description={
            inquiriesQuery.error instanceof Error
              ? inquiriesQuery.error.message
              : "Inquiries could not be loaded. Please try again."
          }
          action={
            <Button
              type="button"
              onClick={() => inquiriesQuery.refetch()}
              className="h-11 rounded-lg bg-[#007066] px-6 text-base font-semibold text-white hover:bg-[#006059]"
            >
              Try again
            </Button>
          }
        />
      ) : inquiries.length === 0 ? (
        <InquiriesState
          title="No inquiries yet"
          description="Contact inquiries will appear here once visitors submit the form."
        />
      ) : (
        <div className="overflow-hidden rounded-lg bg-[#E6F1F0]">
          <Table className="min-w-[1050px]">
            <TableHeader>
              <TableRow className="h-[60px] hover:bg-transparent">
                <TableHead className="w-[190px] text-center text-base text-[#454545]">
                  Name
                </TableHead>
                <TableHead className="w-[230px] text-center text-base text-[#454545]">
                  Email
                </TableHead>
                <TableHead className="w-[210px] text-center text-base text-[#454545]">
                  Phone Number
                </TableHead>
                <TableHead className="w-[430px] text-center text-base text-[#454545]">
                  Inquiry
                </TableHead>
                <TableHead className="w-[190px] text-center text-base text-[#454545]">
                  Added date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((item) => (
                <TableRow key={item.id} className="h-[88px]">
                  <TableCell className="text-center">
                    <span className="text-base font-semibold text-[#000000]">
                      {item.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-base font-medium text-[#7D7D7D]">
                    {item.email}
                  </TableCell>
                  <TableCell className="text-center text-base font-medium text-[#7D7D7D]">
                    {item.phone}
                  </TableCell>
                  <TableCell className="max-w-[430px] text-center">
                    <p className="mx-auto max-w-[390px] text-base leading-6 text-[#7D7D7D]">
                      {item.inquiry}
                    </p>
                  </TableCell>
                  <TableCell className="text-center text-base font-medium text-[#7D7D7D]">
                    {item.addedDate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.section>
  )
}
