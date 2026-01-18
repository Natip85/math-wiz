export type BreadcrumbPage = {
  href: string;
  /** Translation key for the Breadcrumbs namespace */
  labelKey: string;
  /** Optional dynamic values for interpolation */
  labelValues?: Record<string, string>;
};

// Home breadcrumb
export const homeBreadcrumb: BreadcrumbPage = {
  href: "/",
  labelKey: "home",
};

// About breadcrumbs
export const aboutBreadcrumbs: BreadcrumbPage[] = [
  homeBreadcrumb,
  { href: "/about", labelKey: "about" },
];

// History breadcrumbs
export const historyBreadcrumbs: BreadcrumbPage[] = [
  homeBreadcrumb,
  { href: "/history", labelKey: "history" },
];

// Playground breadcrumbs
export const playgroundBreadcrumbs: BreadcrumbPage[] = [
  homeBreadcrumb,
  { href: "/playground", labelKey: "playground" },
];

// Profile breadcrumbs
export const profileBreadcrumbs: BreadcrumbPage[] = [
  homeBreadcrumb,
  { href: "/profile", labelKey: "profile" },
];

// Helper function for playground detail pages (playground/:id)
export function createPlaygroundDetailBreadcrumbs(playgroundId: string): BreadcrumbPage[] {
  return [
    homeBreadcrumb,
    { href: "/playground", labelKey: "playground" },
    {
      href: `/playground/${playgroundId}`,
      labelKey: "learningSession",
      labelValues: { id: playgroundId },
    },
  ];
}

// Generic helper to create breadcrumbs with a custom page
export function createBreadcrumbs(
  parentBreadcrumbs: BreadcrumbPage[],
  page: BreadcrumbPage
): BreadcrumbPage[] {
  return [...parentBreadcrumbs, page];
}
