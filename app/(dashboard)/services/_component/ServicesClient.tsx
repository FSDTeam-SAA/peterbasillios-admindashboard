"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { PencilLine, Plus, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
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

interface ServiceItem {
  id: number
  name: string
  description: string
  addedDate: string
  status: "Active" | "Inactive"
  image: string
}

const makeServiceImage = (walls: string, cabinet: string, accent: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg width="76" height="56" viewBox="0 0 76 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="76" height="56" rx="3" fill="${walls}"/>
      <path d="M5 44H71V52H5V44Z" fill="#C7C2B7"/>
      <path d="M8 9H31V44H8V9Z" fill="${cabinet}"/>
      <path d="M35 12H67V44H35V12Z" fill="${accent}"/>
      <path d="M13 14H27V25H13V14Z" fill="#F3EEE4" opacity=".65"/>
      <path d="M41 18H62V29H41V18Z" fill="#EFE8DD" opacity=".55"/>
      <path d="M41 34H62V41H41V34Z" fill="#766D60" opacity=".25"/>
      <circle cx="28" cy="34" r="2" fill="#3E4A46" opacity=".45"/>
      <circle cx="64" cy="34" r="2" fill="#3E4A46" opacity=".45"/>
    </svg>
  `)}`

const services: ServiceItem[] = [
  {
    id: 1,
    name: "Custom Kitchens",
    description:
      "Custom kitchens designed around your lifestyle, combining intelligent layouts, premium materials, and precision engineering. Every cabinet is crafted to...",
    addedDate: "18 Jan 2025",
    status: "Active",
    image: makeServiceImage("#D8D1C6", "#74695C", "#B7AA9B"),
  },
  {
    id: 2,
    name: "Dressing Rooms",
    description:
      "Bespoke dressing rooms thoughtfully designed to maximize storage while creating a seamless and luxurious experience. Every detail is caref...",
    addedDate: "20 Jan 2025",
    status: "Active",
    image: makeServiceImage("#9E4234", "#6E2D27", "#B85A45"),
  },
  {
    id: 3,
    name: "Bedrooms",
    description:
      "Premium bedroom cabinetry tailored to create calm, organized, and sophisticated living spaces. Our custom solutions integrate intelligent...",
    addedDate: "02 Feb 2025",
    status: "Active",
    image: makeServiceImage("#D4D0C5", "#8A7A66", "#C3B59D"),
  },
  {
    id: 4,
    name: "TV Consoles",
    description:
      "Modern TV consoles and entertainment units crafted to complement contemporary interiors. Designed with clean architectural lines, conceal...",
    addedDate: "10 Feb 2025",
    status: "Active",
    image: makeServiceImage("#E2D6C6", "#A58566", "#D0B392"),
  },
  {
    id: 5,
    name: "Bathroom Vanity Units",
    description:
      "Custom bathroom vanity units engineered with moisture-resistant materials and premium hardware. Designed to...",
    addedDate: "10 Feb 2025",
    status: "Active",
    image: makeServiceImage("#CFC9BA", "#908A7A", "#BEB5A4"),
  },
]

export function ServicesClient() {
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return services
    }

    return services.filter((service) =>
      [service.name, service.description, service.status]
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
  }, [search])

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

        <div className="overflow-hidden rounded-lg bg-[#E6F1F0]">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="h-[42px] hover:bg-transparent">
                <TableHead className="w-[235px] pl-[102px] text-base text-[#7D7D7D]">Name</TableHead>
                <TableHead className="w-[400px] text-center text-base text-[#7D7D7D]">
                  Description
                </TableHead>
                <TableHead className="w-[145px] text-center text-base text-[#7D7D7D]">
                  Added date
                </TableHead>
                <TableHead className="w-[110px] text-center text-base text-[#7D7D7D]">Status</TableHead>
                <TableHead className="w-[105px] text-center text-base text-[#7D7D7D]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id} className="h-[60px]">
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        role="img"
                        aria-label={`${service.name} preview`}
                        className="h-[30px] w-[38px] rounded bg-cover bg-center"
                        style={{ backgroundImage: `url("${service.image}")` }}
                      />
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
                        className="rounded p-1 transition hover:bg-white/50 hover:text-[#007066]"
                        aria-label={`Edit ${service.name}`}
                      >
                        <PencilLine className="size-4" />
                      </button>
                      <button
                        type="button"
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
      </motion.section>

      <AddServiceModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </>
  )
}
