import type { MetadataRoute } from "next";

export const dynamic = "force-static";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Estrutura preparada para PWA. Para instalar de fato, adicionar service worker e ícones PNG (192/512).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gabinete Digital",
    short_name: "Gabinete",
    description: "Atendimento parlamentar digital — ambiente de demonstração",
    start_url: `${base}/`,
    display: "standalone",
    background_color: "#F4F6F9",
    theme_color: "#14283F",
    lang: "pt-BR",
    icons: [{ src: `${base}/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
