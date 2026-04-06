import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-4">
      <Link href="/" className={buttonVariants({
        variant: "outline",
        className: "absolute top-4 left-4"
      })}>
        <ArrowLeft className="size-4"/>
        Back
      </Link>
      <Link href ="/" className="text-xl font-bold flex items-center">AI-TechFlow</Link>
      <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
      <div>By clicking sign in, you agree to our <span className="hover:text-primary/80 hover:underline">Terms of service</span></div>
    </div>
  );
}
