import { StaffShell } from "@/components/shells";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <StaffShell>{children}</StaffShell>;
}
