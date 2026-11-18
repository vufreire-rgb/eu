// Exportação estática (GitHub Pages / qualquer hospedagem estática).
// NEXT_PUBLIC_BASE_PATH define a subpasta de publicação, ex.: "/eu/gabinete".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
};
export default nextConfig;
