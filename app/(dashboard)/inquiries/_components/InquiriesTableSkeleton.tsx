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

export function InquiriesTableSkeleton() {
  return (
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
          {skeletonRows.map((row) => (
            <TableRow key={row} className="h-[88px] animate-pulse">
              <TableCell>
                <div className="mx-auto h-4 w-32 rounded bg-[#C6DEDB]" />
              </TableCell>
              <TableCell>
                <div className="mx-auto h-4 w-40 rounded bg-[#C6DEDB]" />
              </TableCell>
              <TableCell>
                <div className="mx-auto h-4 w-32 rounded bg-[#C6DEDB]" />
              </TableCell>
              <TableCell className="max-w-[430px]">
                <div className="mx-auto space-y-2">
                  <div className="mx-auto h-3 w-[360px] max-w-full rounded bg-[#C6DEDB]" />
                  <div className="mx-auto h-3 w-[300px] max-w-full rounded bg-[#D9EAE8]" />
                </div>
              </TableCell>
              <TableCell>
                <div className="mx-auto h-4 w-24 rounded bg-[#C6DEDB]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
