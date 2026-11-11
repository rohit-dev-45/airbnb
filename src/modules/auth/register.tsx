"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { signIn } from "next-auth/react";

type RegisterFormProps = {
    action: (formData: FormData) => Promise<void>;
};

function RegisterSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            disabled={pending}
            className="w-full rounded-xl bg-brand-500 px-4 py-2.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-70"
        >
            {pending ? "Creating Your Account..." : "Create Account"}
        </button>
    );
}

export function RegisterForm({ action }: RegisterFormProps) {
    const [googleLoading, setGoogleLoading] = useState(false);
    return (
        <>
            <form action={action} className="mt-5 space-y-3">
                <input
                    name="name"
                    required
                    placeholder="Full Name"
                    className="w-full rounded-xl border border-ink-300 px-3.5 py-2.5 text-ink-800 outline-none ring-brand-300 focus:ring-2"
                />
                <input
                    name="email"
                    type="email"
                    required
                    placeholder="Work Or Personal Email"
                    className="w-full rounded-xl border border-ink-300 px-3.5 py-2.5 text-ink-800 outline-none ring-brand-300 focus:ring-2"
                />
                <input
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    placeholder="Password (Minimum 8 Characters)"
                    className="w-full rounded-xl border border-ink-300 px-3.5 py-2.5 text-ink-800 outline-none ring-brand-300 focus:ring-2"
                />
                <RegisterSubmitButton />
            </form>

            <button
                type="button"
                disabled={googleLoading}
                className="mt-3 w-full rounded-xl border border-ink-300 px-4 py-2.5 font-semibold text-ink-700 hover:bg-ink-100 disabled:opacity-70"
                onClick={async () => {
                    setGoogleLoading(true);
                    await signIn("google", { callbackUrl: "/" });
                }}
            >
                {googleLoading
                    ? "Redirecting To Google..."
                    : "Continue With Google"}
            </button>
        </>
    );
}
