"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const SMOOTH_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function NotFound() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.13,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const fadeUp: Variants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 32,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.72,
        ease: SMOOTH_EASE,
      },
    },
  };

  const popIn: Variants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      scale: shouldReduceMotion ? 1 : 0.86,
      y: shouldReduceMotion ? 0 : -18,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.78,
        ease: SMOOTH_EASE,
      },
    },
  };

  return (
    <motion.main
      className="min-h-screen overflow-hidden bg-[#F4FAFA] px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:pt-36"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto">
        <div className="mx-auto flex min-h-[620px] max-w-[980px] flex-col items-center justify-center text-center">
          <motion.div
            className="relative w-full"
            variants={containerVariants}
            aria-hidden="true"
          >
            <motion.div
              className="flex items-center justify-center gap-2 text-[112px] font-semibold leading-none text-[#007066] [text-shadow:0_8px_0_#005D55,0_18px_30px_rgba(0,0,0,0.13)] sm:gap-4 sm:text-[170px] lg:text-[230px]"
              variants={containerVariants}
            >
              <motion.span
                className="inline-block -rotate-[13deg]"
                variants={popIn}
                animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                4
              </motion.span>
              <motion.span
                className="inline-block"
                variants={popIn}
                animate={shouldReduceMotion ? undefined : { y: [0, 7, 0] }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                0
              </motion.span>
              <motion.span
                className="inline-block rotate-[13deg]"
                variants={popIn}
                animate={shouldReduceMotion ? undefined : { y: [0, -7, 0] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                4
              </motion.span>
            </motion.div>

            <motion.div
              className="relative mx-auto -mt-2 h-[84px] w-[82%] max-w-[600px] rounded-[50%] border-[12px] border-white bg-[#E9ECEA] shadow-[inset_0_18px_38px_rgba(0,0,0,0.08),0_18px_35px_rgba(0,0,0,0.08)] sm:-mt-5 sm:h-[120px] sm:border-[16px]"
              variants={fadeUp}
            >
              <div className="absolute inset-x-[12%] bottom-3 h-9 overflow-hidden sm:bottom-4 sm:h-12">
                <div className="absolute left-1/2 top-2 h-20 w-24 -translate-x-1/2 rounded-t-full bg-[#172033] sm:h-24 sm:w-32" />
                <div className="absolute left-1/2 top-0 h-6 w-8 -translate-x-1/2 rounded-full bg-[#E24035] sm:h-8 sm:w-10" />
                <div className="absolute left-[20%] top-4 h-8 w-7 -rotate-12 rounded-full bg-[#9E7A12] sm:left-[24%] sm:h-10 sm:w-8" />
                <div className="absolute right-[20%] top-4 h-8 w-7 rotate-12 rounded-full bg-[#9E7A12] sm:right-[24%] sm:h-10 sm:w-8" />
              </div>
            </motion.div>
          </motion.div>

          <motion.h1
            className="mt-10 text-4xl font-normal leading-tight text-[#000000] sm:text-5xl lg:text-[64px]"
            variants={fadeUp}
          >
            Page Not Found
          </motion.h1>

          <motion.p
            className="mt-5 max-w-[650px] text-base leading-7 text-[#595959] sm:text-xl sm:leading-8"
            variants={fadeUp}
          >
            The page you are looking for may have moved, been renamed, or is
            still being crafted.
          </motion.p>

          <motion.div
            className="mt-9 flex w-full max-w-[430px] flex-col gap-4 sm:flex-row sm:justify-center"
            variants={fadeUp}
          >
            <Link
              href="/"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#007066] px-8 text-base font-normal text-white transition hover:bg-[#095A54]"
            >
              <Home className="h-5 w-5" />
              Back Home
            </Link>

          
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}
