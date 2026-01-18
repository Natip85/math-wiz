"use client";

import { useTranslations } from "next-intl";
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

type Props = React.ComponentProps<typeof Breadcrumb> & {
  pages: (BreadcrumbPageType | undefined)[] | BreadcrumbPageType;
};

export function Breadcrumbs({ pages, className, ...props }: Props) {
  const t = useTranslations("Breadcrumbs");

  const pagesArray = Array.isArray(pages)
    ? (pages.filter(Boolean) as BreadcrumbPageType[])
    : [pages];

  return (
    <Breadcrumb className={cn("w-fit", className)} {...props}>
      <BreadcrumbList>
        {pagesArray.map((page, index) => {
          const label = t(page.labelKey, page.labelValues);

          return (
            <Fragment key={page.labelKey}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem>
                {index === pagesArray.length - 1 ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={page.href as Route}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
