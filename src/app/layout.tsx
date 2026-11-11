import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "StayScape",
    description:
        "Book Curated Stays With a Modern, Professional Booking Experience.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en">
            <body className="antialiased">{children}</body>
        </html>
    );
}
