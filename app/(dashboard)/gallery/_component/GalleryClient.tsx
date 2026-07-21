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

import { AddProjectModal } from "./AddProjectModal"

interface GalleryProject {
  id: number
  name: string
  description: string
  images: number
  addedDate: string
  status: "Published" | "Draft"
}

const projects: GalleryProject[] = [
  {
    id: 1,
    name: "Luxury Coastal Villa Interiors",
    description:
      "Luxury beachfront residential interior featuring custom cabinetry, natural wood textures, and seamless coastal...",
    images: 18,
    addedDate: "18 Jan 2025",
    status: "Published",
  },
  {
    id: 2,
    name: "Minimal White Kitchen Concept",
    description:
      "Minimal white kitchen concept with high-gloss cabinetry, integrated appliances, and clean European-...",
    images: 4,
    addedDate: "20 Jan 2025",
    status: "Published",
  },
  {
    id: 3,
    name: "Premium Door Collection Showcase",
    description:
      "A curated collection of premium custom door designs showcasing material variation, CNC precision detailin...",
    images: 16,
    addedDate: "02 Feb 2025",
    status: "Published",
  },
  {
    id: 4,
    name: "Modern Green-Themed Interior Concept",
    description:
      "Biophilic-inspired interior concept integrating natural elements with wooden structures, creating a calm and...",
    images: 10,
    addedDate: "10 Feb 2025",
    status: "Published",
  },
  {
    id: 5,
    name: "High-End Residential Villa Project",
    description:
      "High-end residential interior project featuring bespoke wardrobes, kitchen systems, and luxury detailing align...",
    images: 8,
    addedDate: "10 Feb 2025",
    status: "Published",
  },
]

export function GalleryClient() {
  const [search, setSearch] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return projects
    }

    return projects.filter((project) =>
      [project.name, project.description, project.status]
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
              {filteredProjects.map((project) => (
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
                        className="rounded p-1 transition hover:bg-white/50 hover:text-[#007066]"
                        aria-label={`Edit ${project.name}`}
                      >
                        <PencilLine className="size-4" />
                      </button>
                      <button
                        type="button"
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
      </motion.section>

      <AddProjectModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </>
  )
}
