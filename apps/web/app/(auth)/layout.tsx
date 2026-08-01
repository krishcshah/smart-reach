import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Logo href="/" />
      </div>
      {children}
    </div>
  );
}
