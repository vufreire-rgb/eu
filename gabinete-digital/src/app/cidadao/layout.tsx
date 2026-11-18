import { CitizenShell } from "@/components/shells";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <CitizenShell>{children}</CitizenShell>;
}
