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

export function ServicesTableSkeleton() {
  return (
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
          {skeletonRows.map((row) => (
            <TableRow key={row} className="h-[60px] animate-pulse">
              <TableCell className="pl-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-[30px] w-[38px] rounded bg-[#C6DEDB]" />
                  <div className="h-4 w-36 rounded bg-[#C6DEDB]" />
                </div>
              </TableCell>
              <TableCell className="max-w-[400px]">
                <div className="mx-auto space-y-2">
                  <div className="mx-auto h-3 w-[320px] max-w-full rounded bg-[#C6DEDB]" />
                  <div className="mx-auto h-3 w-[250px] max-w-full rounded bg-[#D9EAE8]" />
                </div>
              </TableCell>
              <TableCell>
                <div className="mx-auto h-4 w-24 rounded bg-[#C6DEDB]" />
              </TableCell>
              <TableCell>
                <div className="mx-auto h-[24px] w-[58px] rounded-full bg-[#C6DEDB]" />
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
