import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
    title: "StayScape",
    description:
        "Book Curated Stays With a Modern, Professional Booking Experience.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en">
            <body className="antialiased">
                <Navbar />
                {children}
            </body>
        </html>
    );
}
