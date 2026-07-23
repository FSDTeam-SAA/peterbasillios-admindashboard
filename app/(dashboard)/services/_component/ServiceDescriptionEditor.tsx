"use client"

import dynamic from "next/dynamic"

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-[197px] rounded border border-[#C3C3C3] bg-[#F6FEFD]" />
  ),
})

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
}

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "link",
]

interface ServiceDescriptionEditorProps {
  id: string
  value: string
  placeholder?: string
  disabled?: boolean
  onChange: (value: string) => void
}

export function isRichTextEmpty(value: string) {
  return (
    value
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length === 0
  )
}

export function ServiceDescriptionEditor({
  id,
  value,
  placeholder,
  disabled,
  onChange,
}: ServiceDescriptionEditorProps) {
  return (
    <div
      id={id}
      className={`service-rich-text-editor ${
        disabled ? "service-rich-text-editor-disabled" : ""
      }`}
    >
      <ReactQuill
        theme="snow"
        value={value}
        readOnly={disabled}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  )
}
