"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ImageDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  Box,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Our Services", href: "/services", icon: Box },
   { name: "Project Gallery", href: "/gallery", icon: ImageDown },
  { name: "Contact Inquiries", href: "/inquiries", icon: User  },
  { name: "Security", href: "/security", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    toast.success("Logout successful");
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Mobile Menu Button - শুধু mobile এ এবং sidebar close থাকলে দেখাবে */}
      {!isMobileMenuOpen && (
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-[#212121] text-white shadow-lg hover:bg-[#313131] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Overlay - mobile এ sidebar open থাকলে */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex h-screen sticky bottom-0 top-0 flex-col bg-[#E6F1F0] z-50 transition-transform duration-300 overflow-auto",
          // Mobile এ
          "fixed lg:static",
          "w-[240px] sm:w-[250px] lg:w-[300px]",
          // Mobile এ hide/show control
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-center relative px-4 mt-10">
            <Link href="/">
          <div className="flex h-[24px] items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={1000}
              height={1000}
              className="object-contain w-[274px] h-full"
            />
          </div>
            </Link>

          {/* Close Button - absolute position এ top right corner এ */}
          {isMobileMenuOpen && (
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white hover:bg-slate-600/50 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-3 flex flex-col items-center justify-start px-3 overflow-y-auto mt-10">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex w-[90%] mx-auto items-center justify-start gap-2 space-y-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#007066] text-white"
                    : "text-black hover:bg-[#007066] hover:text-white text-[18px]",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6 transition-colors duration-200 flex-shrink-0",
                    isActive ? "text-white" : "",
                  )}
                />
                <span
                  className={cn(
                    "font-normal text-sm sm:text-base leading-[120%] transition-colors duration-200",
                    isActive ? "text-white font-medium text-[18px]" : "text-[18px]",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 pt-4">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="mx-auto flex w-[90%] items-center justify-start gap-2 rounded-lg px-3 py-2 text-[18px] font-medium text-[#B42318] transition-all duration-200 hover:bg-[#B42318] hover:text-white"
          >
            <LogOut className="h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6" />
            <span className="text-sm font-normal leading-[120%] sm:text-base">
              Logout
            </span>
          </button>
        </div>
      </div>

      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="max-w-[440px] p-6">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-2xl font-semibold text-[#000000]">
              Logout confirmation
            </DialogTitle>
            <DialogDescription className="mt-2 text-base leading-6 text-[#7D7D7D]">
              Are you sure you want to logout from the admin dashboard?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isLoggingOut}
              onClick={() => setIsLogoutModalOpen(false)}
              className="h-[44px] min-w-[110px] border-[#007066] bg-transparent text-base font-medium text-[#007066] hover:bg-[#E6F1F0]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="h-[44px] min-w-[110px] bg-[#B42318] text-base font-medium text-white hover:bg-[#9F1F16]"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
