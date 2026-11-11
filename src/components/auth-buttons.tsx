"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Menu, UserCircle2 } from "lucide-react";

type AuthButtonsProps = {
    user: {
        id: string;
        name?: string | null;
    } | null;
    hostCtaLabel?: string;
};

export function AuthButtons({
    user,
    hostCtaLabel = "Start hosting",
}: AuthButtonsProps) {
    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Link
                    href="/login"
                    className="rounded-full border border-ink-300 px-3 py-1.5 text-xs font-semibold text-ink-700"
                >
                    Sign In
                </Link>

                <Link
                    href="/register"
                    className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                >
                    Create Account
                </Link>
            </div>
        );
    }
    return <UserMenu name={user.name ?? "Host"} hostCtaLabel={hostCtaLabel} />;
}

function UserMenu({
    name,
    hostCtaLabel,
}: {
    name: string;
    hostCtaLabel: string;
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handlePointerDown(event: MouseEvent | TouchEvent) {
            if (!menuRef.current) return;
            const target = event.target as Node | null;
            if (target && !menuRef.current.contains(target)) {
                setOpen(false);
            }
        }
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);
    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-ink-300 bg-surface px-3 py-2 shadow-sm"
                onClick={() => setOpen((prev) => !prev)}
            >
                <Menu className="h-4 w-4 text-ink-700" />
                <UserCircle2 className="h-6 w-6 text-ink-500" />
            </button>

            {open ? (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-ink-200 bg-surface p-2 shadow-xl">
                    <p className="px-3 py-2 text-xs font-medium text-ink-500">
                        {name}
                    </p>

                    <Link
                        href="/bookings"
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-100"
                        onClick={() => setOpen(false)}
                    >
                        Bookings
                    </Link>

                    <Link
                        href="/host"
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-100 md:hidden"
                        onClick={() => setOpen(false)}
                    >
                        {hostCtaLabel}
                    </Link>

                    <button
                        type="button"
                        className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-100"
                        onClick={() => signOut({ callbackUrl: "/" })}
                    >
                        Sign Out
                    </button>
                </div>
            ) : null}
        </div>
    );
}
