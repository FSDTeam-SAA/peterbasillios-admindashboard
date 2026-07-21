"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddServiceModal({
  open,
  onOpenChange,
}: AddServiceModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileCount, setFileCount] = useState(0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[840px]">
        <motion.form
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onSubmit={(event) => {
            event.preventDefault()
            onOpenChange(false)
          }}
          className="px-6 pb-6 pt-6"
        >
          <DialogHeader className="mb-3 pr-8">
            <DialogTitle className="text-2xl text-[#000000] font-medium">Add New Service</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="service-name" className="text-base text-[#000000] font-medium">Service Name</Label>
              <Input
                id="service-name"
                name="serviceName"
                placeholder="Enter service name"
                className="h-[52px] text-base border-[#C3C3C3]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-description" className="text-base text-[#000000] font-medium">Description</Label>
              <Textarea
                id="service-description"
                name="description"
                placeholder="Describe this service...."
                className="h-[154px] text-base border-[#C3C3C3]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-images" className="text-base text-[#000000] font-medium">Images</Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-[130px] w-full flex-col items-center justify-center rounded border border-dashed border-[#CADBD9] bg-[#F6FEFD] text-center transition hover:border-[#007066]/60 hover:bg-white"
              >
                <span className="mb-4 flex size-8 items-center justify-center rounded-full bg-[#C8E8E5] text-[#007066] ring-4 ring-[#DDF3F1]">
                  <Upload className="size-4" />
                </span>
                <span className="text-xs text-[#667877]">
                  {fileCount > 0
                    ? `${fileCount} image selected`
                    : "Drag & drop images here or Browse Files."}
                </span>
              </button>
              <input
                ref={fileInputRef}
                id="service-images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) =>
                  setFileCount(event.currentTarget.files?.length ?? 0)
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-[48px] min-w-[100px] border-[#007066] bg-transparent text-[16px] font-medium text-[#007066] hover:bg-[#E6F1F0]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-[48px] min-w-[100px] bg-[#007066] text-[16px] font-medium text-white hover:bg-[#006059]"
            >
              Save
            </Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}
