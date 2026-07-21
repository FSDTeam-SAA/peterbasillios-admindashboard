"use client"

import { motion } from "framer-motion"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface InquiryItem {
  id: number
  name: string
  email: string
  phone: string
  inquiry: string
  addedDate: string
}

const inquiries: InquiryItem[] = [
  {
    id: 1,
    name: "Floyd Miles",
    email: "osgoodwy@gmail.com",
    phone: "(219) 555-0114",
    inquiry:
      "I'm planning to renovate my kitchen and would like a quotation for custom cabinetry.",
    addedDate: "18 Jan 2025",
  },
  {
    id: 2,
    name: "Jerome Bell",
    email: "redaniel@gmail.com",
    phone: "(704) 555-0127",
    inquiry:
      "We need a bespoke dressing room with additional storage solutions for our new home.",
    addedDate: "20 Jan 2025",
  },
  {
    id: 3,
    name: "Annette Black",
    email: "hamil@gmail.com",
    phone: "(671) 555-0110",
    inquiry:
      "I'm interested in a custom TV console design that complements our living room interior.",
    addedDate: "02 Feb 2025",
  },
  {
    id: 4,
    name: "Eleanor Pena",
    email: "codence@gmail.com",
    phone: "(603) 555-0123",
    inquiry:
      "Could you help us design a modern bathroom vanity unit with premium finishes?",
    addedDate: "10 Feb 2025",
  },
  {
    id: 5,
    name: "Kristin Watson",
    email: "qamaho@mail.ru",
    phone: "(225) 555-0118",
    inquiry:
      "We're building a new house and would like to discuss custom cabinetry solutions for multiple rooms.",
    addedDate: "10 Feb 2025",
  },
]

export function InquiriesClient() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="min-h-[calc(100vh-128px)] bg-[#F8FCFC] text-base text-[#7D7D7D]"
    >
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
    </motion.section>
  )
}
