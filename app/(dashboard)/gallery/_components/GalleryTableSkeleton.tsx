"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const skeletonRows = Array.from({ length: 5 }, (_, index) => index)

export function GalleryTableSkeleton() {
  return (
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
          {skeletonRows.map((row) => (
            <TableRow key={row} className="h-[76px] animate-pulse">
              <TableCell>
                <div className="mx-auto h-4 w-44 rounded bg-[#C6DEDB]" />
              </TableCell>
              <TableCell className="max-w-[385px]">
                <div className="mx-auto space-y-2">
                  <div className="mx-auto h-3 w-[330px] max-w-full rounded bg-[#C6DEDB]" />
                  <div className="mx-auto h-3 w-[260px] max-w-full rounded bg-[#D9EAE8]" />
                </div>
              </TableCell>
              <TableCell>
                <div className="mx-auto h-4 w-10 rounded bg-[#C6DEDB]" />
              </TableCell>
              <TableCell>
                <div className="mx-auto h-4 w-24 rounded bg-[#C6DEDB]" />
              </TableCell>
              <TableCell>
                <div className="mx-auto h-[24px] w-[86px] rounded-full bg-[#C6DEDB]" />
              </TableCell>
              <TableCell>
                <div className="mx-auto flex items-center justify-center gap-3">
                  <div className="size-4 rounded bg-[#C6DEDB]" />
                  <div className="size-4 rounded bg-[#C6DEDB]" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
