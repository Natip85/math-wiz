export type BreadcrumbPage = {
  href: string;
  label: string;
};

// Home breadcrumb
export const homeBreadcrumb: BreadcrumbPage = {
  href: "/",
  label: "Home",
};

// About breadcrumbs
export const aboutBreadcrumbs: BreadcrumbPage[] = [
  homeBreadcrumb,
  { href: "/about", label: "About" },
];

// History breadcrumbs
export const historyBreadcrumbs: BreadcrumbPage[] = [
  homeBreadcrumb,
  { href: "/history", label: "History" },
];

// Playground breadcrumbs
export const playgroundBreadcrumbs: BreadcrumbPage[] = [
  homeBreadcrumb,
  { href: "/playground", label: "Playground" },
];

// Profile breadcrumbs
export const profileBreadcrumbs: BreadcrumbPage[] = [
  homeBreadcrumb,
  { href: "/profile", label: "Profile" },
];

// Helper function for playground detail pages (playground/:id)
export function createPlaygroundDetailBreadcrumbs(
  playgroundId: string,
  playgroundName?: string
): BreadcrumbPage[] {
  return [
    homeBreadcrumb,
    { href: "/playground", label: "Playground" },
    {
      href: `/playground/${playgroundId}`,
      label: playgroundName || `Learning session: ${playgroundId}`,
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
