import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only genuinely-Node packages are external. Keep better-auth + drizzle-orm OUT of this
  // list so webpack bundles them into a single consistent module graph (avoids the
  // "(0 , drizzle_orm.eq) is not a function" module-identity bug with the auth adapter).
  serverExternalPackages: ["nodemailer", "imapflow", "@neondatabase/serverless"],
  transpilePackages: [
    "@smartreach/ui",
    "@smartreach/shared",
    "@smartreach/validation",
    "@smartreach/database",
    "@smartreach/email-engine",
    "better-auth",
    "@better-auth/drizzle-adapter",
  ],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
