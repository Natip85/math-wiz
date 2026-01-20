import { NavBar } from "@/features/nav/navbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <NavBar />
      {children}
    </div>
  );
}
