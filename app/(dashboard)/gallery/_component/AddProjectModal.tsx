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

interface AddProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddProjectModal({
  open,
  onOpenChange,
}: AddProjectModalProps) {
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
            <DialogTitle className="text-2xl font-medium text-[#000000]">
              Add New Project
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="project-name"
                className="text-base font-medium text-[#000000]"
              >
                Project Name
              </Label>
              <Input
                id="project-name"
                name="projectName"
                placeholder="Enter project name"
                className="h-[52px] border-[#C3C3C3] text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="project-description"
                className="text-base font-medium text-[#000000]"
              >
                Description
              </Label>
              <Textarea
                id="project-description"
                name="description"
                placeholder="Describe this project....."
                className="h-[154px] border-[#C3C3C3] text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="project-images"
                className="text-base font-medium text-[#000000]"
              >
                Project Images
              </Label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-[250px] w-full flex-col items-center justify-center rounded border border-dashed border-[#CADBD9] bg-[#F6FEFD] text-center transition hover:border-[#007066]/60 hover:bg-white"
              >
                <span className="mb-5 flex size-10 items-center justify-center rounded-full bg-[#C8E8E5] text-[#007066] ring-8 ring-[#DDF3F1]">
                  <Upload className="size-5" />
                </span>
                <span className="text-base text-[#7D7D7D]">
                  {fileCount > 0
                    ? `${fileCount} images selected`
                    : "Drag & drop images here or Browse Files."}
                </span>
                <span className="mt-1 text-base text-[#7D7D7D]">
                  You can select multiple images at once.
                </span>
              </button>
              <input
                ref={fileInputRef}
                id="project-images"
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
              className="h-[48px] min-w-[100px] border-[#007066] bg-transparent text-base font-medium text-[#007066] hover:bg-[#E6F1F0]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-[48px] min-w-[100px] bg-[#007066] text-base font-medium text-white hover:bg-[#006059]"
            >
              Save
            </Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}
