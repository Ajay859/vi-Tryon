import Link from "next/link";
import { MapIcon, MessageSquare, Sparkle } from "lucide-react";
export default function Navbar() {
  return (
    <nav className=" border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Sparkle className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">Feedback Fusion</span>
            </div>
          </Link>
          <Link
            href="/roadmap"
            className="text-sm hover:text-primary flex items-center gap-1"
          >
            <MapIcon className="h-4 w-4" />
            Roadmap
          </Link>
          <Link
            href="/tryon"
            className="text-sm hover:text-primary flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            TRYON
          </Link>
        </div>
        <div className="flex itmes-center gap-4">signup</div>
      </div>
    </nav>
  );
}
