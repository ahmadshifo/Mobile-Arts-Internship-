"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Layers, Monitor, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Sidebar"
      className="flex shrink-0 flex-col gap-7 bg-sidebar px-4 py-5 text-sidebar-foreground lg:w-[232px]"
    >
      <Link
        href="/services"
        className="flex items-center gap-2.5 rounded-lg px-2 py-1 focus-visible:outline-2 focus-visible:outline-sidebar-ring"
      >
        <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-white">
          <Box className="size-5" aria-hidden="true" />
        </span>

        <span className="font-heading text-xl font-bold text-white">
          MobiBox <span className="text-teal-300">Lite</span>
        </span>
      </Link>

      <nav aria-label="Main navigation" className="flex flex-col gap-1">
        <Button
          asChild
          variant="ghost"
          className="h-11 justify-start gap-3 rounded-[10px] bg-sidebar-accent px-3 text-[15px] font-semibold text-white hover:bg-slate-700 hover:text-white"
        >
          <Link
            href="/services"
            aria-current={pathname === "/services" ? "page" : undefined}
          >
            <Layers className="size-[18px] text-teal-300" aria-hidden="true" />
            Services
          </Link>
        </Button>

        <Button
          type="button"
          variant="ghost"
          disabled
          className="h-11 justify-start gap-3 px-3 text-[15px]"
        >
          <Users className="size-[18px]" aria-hidden="true" />
          Subscribers
        </Button>

        <Button
          type="button"
          variant="ghost"
          disabled
          className="h-11 justify-start gap-3 px-3 text-[15px]"
        >
          <Monitor className="size-[18px]" aria-hidden="true" />
          Checkout preview
        </Button>
      </nav>

      <div className="flex items-center gap-2.5 rounded-xl bg-sidebar-accent p-3 lg:mt-auto">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
          TA
        </span>

        <div className="text-[13px]">
          <p className="font-semibold text-white">Trainee Admin</p>
          <p>Administrator</p>
        </div>
      </div>
    </aside>
  );
}