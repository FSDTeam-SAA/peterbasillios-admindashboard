"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const headerContent: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Overview",
    description:
      "View your profile summary, application status, and recent activity at a glance.",
  },
  "/services": {
    title: "Our Services",
    description:
      "Manage your service categories and update their content and images.",
  },
  "/gallery": {
    title: "Project Gallery",
    description:
      "Organize projects and upload gallery images for your completed work.",
  },
  "/inquiries": {
    title: "Contact Inquiries",
    description:
      "View and manage customer inquiries submitted through the website contact form.",
  },
  "/security": {
    title: "Security",
    description: "Manage your account security and login preferences.",
  },
  "/personal-information": {
    title: "Personal Information",
    description: "Manage your personal information and profile details.",
  },
};

function getHeaderContent(pathname: string) {
  const matchedPath = Object.keys(headerContent)
    .sort((a, b) => b.length - a.length)
    .find((path) => pathname === path || pathname.startsWith(`${path}/`));

  return matchedPath ? headerContent[matchedPath] : headerContent["/"];
}

export default function Header() {
  const pathname = usePathname();
  const { title, description } = getHeaderContent(pathname);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-[80px] items-center justify-between gap-4 border-b border-[#D7E7E5] bg-[#E6F1F0] px-6 lg:left-[300px]">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold leading-tight text-[#000000]">
          {title}
        </h1>
        <p className="mt-1 line-clamp-1 text-base leading-5 text-[#333333]">
          {description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full bg-white text-[#000000] shadow-sm transition hover:bg-[#F4FAFA]"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </button>

        <Avatar className="size-11 border-2 border-white shadow-sm">
          <AvatarImage src="/profile.png" alt="Profile image" />
          <AvatarFallback>WT</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
