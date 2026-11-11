import { getCurrentUser } from "@/lib/auth-lib";
import { prisma } from "@/lib/prisma";
import { House } from "lucide-react";
import Link from "next/link";
import { AuthButtons } from "./auth-buttons";

export async function Navbar() {
    const user = await getCurrentUser();
    const hasHostedListings = user
        ? (await prisma.listing.count({ where: { userId: user.id } })) > 0
        : false;
    const hostCtaLabel = hasHostedListings ? "Manage Hosting" : "Start Hosting";
    return (
        <header className="sticky top-0 z-40 border-b border-ink-200/80 bg-surface/95 backdrop-blur">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-bold tracking-tight text-brand-500"
                >
                    <House className="h-5 w-5" />
                    <span>StayScape</span>
                </Link>

                <div className="flex items-center gap-2">
                    <Link
                        href="/host"
                        className="hidden rounded-full px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100 md:inline-block"
                    >
                        {hostCtaLabel}
                    </Link>

                    <AuthButtons user={user} hostCtaLabel={hostCtaLabel} />
                </div>
            </nav>
        </header>
    );
}
