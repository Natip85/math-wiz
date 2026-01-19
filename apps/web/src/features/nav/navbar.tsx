"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Info, LogIn, Menu, MessageCircle, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { authClient } from "@/lib/auth-client";
import { NavUser } from "./nav-user";
import { ThemeSwitch } from "@/components/theme-switch";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function NavBar({ className }: React.ComponentProps<"div">) {
  const pathname = usePathname();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const { resolvedTheme } = useTheme();
  const t = useTranslations("Nav");

  const baseNavItems = [
    { name: t("home"), url: "/", icon: Home },
    { name: t("about"), url: "/about", icon: Info },
    { name: t("chat"), url: "/chat", icon: MessageCircle },
  ];

  const navItems = session
    ? [...baseNavItems, { name: t("playground"), url: "/playground", icon: Play }]
    : [...baseNavItems, { name: t("signIn"), url: "/sign-in", icon: LogIn }];

  return (
    <motion.div
      className={cn(
        "sticky top-0 right-0 left-0 z-40 px-8 py-3 shadow-md backdrop-blur-lg",
        className
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Mobile hamburger menu (left on mobile) */}
        <button
          className="hover:bg-foreground/10 flex shrink-0 items-center justify-center rounded-full p-2 transition-colors md:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label={t("openMenu")}
        >
          <Menu size={24} />
        </button>

        {/* Desktop logo (left on desktop) */}
        <Link href="/" className="hidden shrink-0 md:block">
          <Image
            src={resolvedTheme === "light" ? "/logo.png" : "/dark-logo.png"}
            alt={t("logoAlt")}
            width={70}
            height={70}
            style={{ height: "auto" }}
          />
        </Link>

        {/* Desktop navigation */}
        <div className="relative hidden items-center gap-3 md:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url + "/"));
            const isHovered = hoveredTab === item.name;

            return (
              <Link
                key={item.name}
                href={item.url as Route}
                onMouseEnter={() => setHoveredTab(item.name)}
                onMouseLeave={() => setHoveredTab(null)}
                className={cn(
                  "relative cursor-pointer rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300",
                  "",
                  isActive && ""
                )}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 -z-10 overflow-hidden rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                      scale: [1, 1.03, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="bg-primary/50 absolute inset-0 rounded-full blur-md" />
                    <div className="bg-primary/40 absolute inset-[-4px] rounded-full blur-xl" />
                    <div className="bg-primary/30 absolute inset-[-8px] rounded-full blur-2xl" />
                    <div className="bg-primary/20 absolute inset-[-12px] rounded-full blur-3xl" />

                    <div
                      className="from-primary/0 via-primary/40 to-primary/0 absolute inset-0 bg-linear-to-r"
                      style={{
                        animation: "shine 3s ease-in-out infinite",
                      }}
                    />
                  </motion.div>
                )}

                <motion.span
                  className="relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.span>

                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-foreground/30 absolute inset-0 -z-10 rounded-full"
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* Mobile menu sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-[280px]">
            <SheetHeader>
              <SheetTitle>{t("menu")}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 px-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/" && pathname.startsWith(item.url + "/"));

                return (
                  <SheetClose asChild key={item.name}>
                    <Link
                      href={item.url as Route}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-foreground/10"
                      )}
                    >
                      <Icon size={20} />
                      {item.name}
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <ThemeSwitch />
          {session && <NavUser />}
        </div>
      </div>
    </motion.div>
  );
}
