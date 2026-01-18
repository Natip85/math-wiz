"use client";

import type { Route } from "next";
import { Fragment } from "react";
import Link from "next/link";

import type { BreadcrumbPage as BreadcrumbPageType } from "@/lib/breadcrumbs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

function formatTitle(title: string): string {
  return title
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type Props = React.ComponentProps<typeof Breadcrumb> & {
  pages: (BreadcrumbPageType | undefined)[] | BreadcrumbPageType;
};

export function Breadcrumbs({ pages, className, ...props }: Props) {
  const pagesArray = Array.isArray(pages)
    ? (pages.filter(Boolean) as BreadcrumbPageType[])
    : [pages];

  return (
    <Breadcrumb className={cn("w-fit capitalize", className)} {...props}>
      <BreadcrumbList>
        {pagesArray.map((page, index) => (
          <Fragment key={page.label}>
            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem>
              {index === pagesArray.length - 1 ? (
                <BreadcrumbPage>{formatTitle(page.label)}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={page.href as Route}>{formatTitle(page.label)}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
