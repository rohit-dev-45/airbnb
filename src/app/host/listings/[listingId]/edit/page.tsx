import { ListingForm } from "@/components/listing-form";
import { PageIntro } from "@/components/ui/page-intro";
import { updateListing } from "@/lib/actions";
import { requireUser } from "@/lib/auth-lib";
import { prisma } from "@/lib/prisma";
import { uiShell } from "@/lib/ui-classes";
import { ArrowLeft, PencilLine } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

type EditListingPageProps = {
    params: Promise<{
        listingId: string;
    }>;
};

const EditListingPage = async ({ params }: EditListingPageProps) => {
    const user = await requireUser();
    const { listingId } = await params;
    const listing = await prisma.listing.findFirst({
        where: {
            id: listingId,
            userId: user.id,
        },
    });
    if (!listing) notFound();
    async function updateListingAction(formData: FormData) {
        "use server";
        await updateListing(listing!.id, formData);
    }
    return (
        <main className={uiShell.pageContainer}>
            <PageIntro
                badge="Edit Listing"
                icon={PencilLine}
                title={`Update ${listing.title}`}
                description="Refine Listing Details, Update Guest Capacity, And Manage Gallery Images."
                action={
                    <Link
                        href="/host"
                        className="inline-flex items-center gap-2 rounded-full border border-ink-300 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back To Hosting Dashboard
                    </Link>
                }
            />
            <section className={uiShell.sectionCard}>
                <ListingForm
                    action={updateListingAction}
                    submitLabel="Save Changes"
                    submittingLabel="Saving..."
                    initialValues={{
                        title: listing.title,
                        category: listing.category,
                        description: listing.description,
                        locationValue: listing.locationValue,
                        pricePerNight: listing.pricePerNight,
                        guestCount: listing.guestCount,
                        roomCount: listing.roomCount,
                        bathroomCount: listing.bathroomCount,
                        imageSrc: listing.imageSrc,
                        imageGallery: listing.imageGallery,
                    }}
                />
            </section>
        </main>
    );
};

export default EditListingPage;
