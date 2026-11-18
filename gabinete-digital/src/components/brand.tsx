"use client";

import { Landmark } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export function Logo({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  const { tenant } = useStore();
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="Gabinete Digital — início">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: tenant.corSecundaria }}>
        {tenant.logo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={tenant.logo} alt="" className="h-6 w-6 object-contain" /> : <Landmark size={18} />}
      </span>
      <span className="leading-tight">
        <span className={`block text-[15px] font-bold tracking-tight ${dark ? "text-white" : "text-navy"}`}>Gabinete Digital</span>
        <span className={`block text-[11px] ${dark ? "text-white/60" : "text-slate-500"}`}>{tenant.cargo} {tenant.parlamentar} · {tenant.municipio}</span>
      </span>
    </Link>
  );
}
