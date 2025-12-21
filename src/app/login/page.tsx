
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-5xl font-extrabold text-black mb-4 mt-8 text-center tracking-tight" style={{ letterSpacing: "0.05em" }}>
          Pronia
        </h1>
        <p className="text-center mb-8 text-lg" style={{ fontFamily: 'Courier New, Courier, monospace' }}>
          The social media app if you play an instrument
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href="/login">
            <Button className="w-full h-12 text-lg font-semibold bg-black text-white hover:bg-gray-800 transition-all duration-200">
              Login
            </Button>
          </Link>
          <Link href="/onboarding">
            <Button className="w-full h-12 text-lg font-semibold bg-white text-black border border-black hover:bg-gray-100 transition-all duration-200">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}