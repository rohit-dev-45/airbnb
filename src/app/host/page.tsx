import { HostListingItem } from "@/components/host/host-listing-item";
import { HostSection } from "@/components/host/host-section";
import { ListingForm } from "@/components/listing-form";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/ui/page-intro";
import { StatCard } from "@/components/ui/stat-card";
import { createListing } from "@/lib/actions";
import { requireUser } from "@/lib/auth-lib";
import { prisma } from "@/lib/prisma";
import { uiShell } from "@/lib/ui-classes";
import { BadgeCheck, Building2, DollarSign, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

const HostDashboardPage = async () => {
    const user = await requireUser();
    const listings = await prisma.listing.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
    const listingCount = listings.length;
    const avgNightlyRate = listingCount
        ? Math.round(
              listings.reduce(
                  (total, listing) => total + listing.pricePerNight,
                  0,
              ) / listingCount,
          )
        : 0;
    const totalCapacity = listings.reduce(
        (total, listing) => total + listing.guestCount,
        0,
    );
    return (
        <main className={uiShell.pageContainer}>
            <PageIntro
                badge="Host Workspace"
                icon={Sparkles}
                title={`Welcome Back, ${user.name ?? "Host"}`}
                description="Manage Your Homes, Publish New Listings, And Keep Every Stay Ready For Guests."
            />

            <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    label="Active Listings"
                    value={listingCount}
                    icon={Building2}
                />
                <StatCard
                    label="Average Nightly Rate"
                    value={`$${avgNightlyRate}`}
                    icon={DollarSign}
                />
                <StatCard
                    label="Total Guest Capacity"
                    value={totalCapacity}
                    icon={BadgeCheck}
                />
            </section>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
                <HostSection
                    title="Create a Listing"
                    description="Add a Professionally Presented Listing With Photos, Pricing, And Guest Details."
                >
                    <ListingForm action={createListing} />
                </HostSection>

                <HostSection
                    title="Your Listings"
                    description="Update, Review, Or Remove Homes From Your Hosting Portfolio."
                    action={
                        <Link
                            href="/"
                            className="rounded-full border border-ink-300 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
                        >
                            View Guest Experience
                        </Link>
                    }
                >
                    <div className="space-y-3">
                        {listings.length === 0 ? (
                            <EmptyState
                                title="No Listings Yet"
                                description="Fill In The Form To Publish Your First Property."
                            />
                        ) : (
                            listings.map((listing, index) => (
                                <HostListingItem
                                    key={listing.id}
                                    listing={listing}
                                    index={index}
                                />
                            ))
                        )}
                    </div>
                </HostSection>
            </div>
        </main>
    );
};

export default HostDashboardPage;
