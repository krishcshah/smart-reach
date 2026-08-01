import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship as TS source — Next compiles them along with the app.
  transpilePackages: [
    "@smartreach/ui",
    "@smartreach/shared",
    "@smartreach/validation",
    "@smartreach/database",
    "@smartreach/email-engine",
  ],
  serverExternalPackages: ["nodemailer", "imapflow", "better-auth", "@neondatabase/serverless"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
