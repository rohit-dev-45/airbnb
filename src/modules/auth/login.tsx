"use client";

import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { House, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const callbackUrl = useMemo(() => {
        const requested = searchParams.get("callbackUrl") ?? "/";
        if (!requested.startsWith("/") || requested.startsWith("//"))
            return "/";
        return requested;
    }, [searchParams]);
    async function onCredentialsLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsLoading(true);
        const result = await signIn("credentials", {
            email,
            password,
            redirect: true,
            callbackUrl,
        });
        if (result?.error) {
            setError("Invalid Email Or Password.");
            setIsLoading(false);
        }
    }
    return (
        <main className="mx-auto flex min-h-[88vh] max-w-5xl items-center px-4 py-8 md:px-8">
            <section className="grid w-full overflow-hidden rounded-3xl border border-ink-200 bg-surface shadow-sm md:grid-cols-2">
                <div className="bg-linear-to-br from-brand-50 via-white to-brand-100 p-8 md:p-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                        Welcome Back
                    </p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900">
                        Sign In To Continue Your Travel Plans
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">
                        Access Your Bookings, Manage Your Host Activity, And
                        Continue Exploring Stays Across Top US Destinations.
                    </p>
                    <div className="mt-8 space-y-3 text-sm text-ink-700">
                        <p className="flex items-center gap-2">
                            <House className="h-4 w-4 text-brand-500" />
                            Personalized Home Recommendations
                        </p>
                        <p className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-brand-500" />
                            Secure Account Access
                        </p>
                        <p className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-brand-500" />
                            Streamlined Booking Experience
                        </p>
                    </div>
                </div>

                <div className="p-8 md:p-10">
                    <h2 className="text-2xl font-semibold text-ink-900">
                        Sign In
                    </h2>
                    <p className="mt-1 text-sm text-ink-600">
                        Continue As a Guest Or Host.
                    </p>

                    <form
                        onSubmit={onCredentialsLogin}
                        className="mt-5 space-y-3"
                    >
                        <input
                            type="email"
                            required
                            placeholder="Work Or Personal Email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full rounded-xl border border-ink-300 px-3.5 py-2.5 text-ink-800 outline-none ring-brand-300 focus:ring-2"
                        />
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            className="w-full rounded-xl border border-ink-300 px-3.5 py-2.5 text-ink-800 outline-none ring-brand-300 focus:ring-2"
                        />
                        {error ? (
                            <p className="text-sm text-brand-700">{error}</p>
                        ) : null}
                        <button
                            disabled={isLoading}
                            className="w-full rounded-xl bg-brand-500 px-4 py-2.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
                        >
                            {isLoading ? "Signing You In..." : "Sign In"}
                        </button>
                    </form>

                    <button
                        type="button"
                        className="mt-3 w-full rounded-xl border border-ink-300 px-4 py-2.5 font-semibold text-ink-700 hover:bg-ink-100"
                        onClick={() => signIn("google", { callbackUrl })}
                    >
                        Sign In With Google
                    </button>

                    <p className="mt-5 text-sm text-ink-600">
                        New Here?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-brand-600 hover:text-brand-700"
                        >
                            Create An Account
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}
