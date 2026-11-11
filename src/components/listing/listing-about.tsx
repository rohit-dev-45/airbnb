import { Bath, BedDouble, Users } from "lucide-react";

type ListingAboutProps = {
    description: string;
    guestCount: number;
    roomCount: number;
    bathroomCount: number;
    hostName: string;
    hostRating: number;
};

export function ListingAbout({
    description,
    guestCount,
    roomCount,
    bathroomCount,
    hostName,
    hostRating,
}: ListingAboutProps) {
    return (
        <section className="rounded-3xl border border-ink-200 bg-surface p-5 shadow-sm md:p-6">
            <h2 className="text-lg font-semibold text-ink-900 md:text-xl">
                About This Stay
            </h2>
            <p className="mt-3 leading-relaxed text-ink-700">{description}</p>

            <div className="mt-5 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1.5 text-xs text-ink-700 md:text-sm">
                    <Users className="h-4 w-4" />
                    {guestCount} Guest{guestCount === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1.5 text-xs text-ink-700 md:text-sm">
                    <BedDouble className="h-4 w-4" />
                    {roomCount} Room{roomCount === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1.5 text-xs text-ink-700 md:text-sm">
                    <Bath className="h-4 w-4" />
                    {bathroomCount} Bath{bathroomCount === 1 ? "" : "s"}
                </span>
            </div>

            <div className="mt-6 grid gap-4 border-t border-ink-200 pt-4 text-sm text-ink-700 md:grid-cols-2">
                <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                        Host
                    </p>
                    <p className="text-sm font-medium text-ink-900">
                        {hostName}
                    </p>
                    <p className="text-xs text-ink-500">
                        Hosted By {hostName}, Currently Rated{" "}
                        {hostRating.toFixed(1)} By Guests.
                    </p>
                </div>
                <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                        Booking Details
                    </p>
                    <p className="text-xs text-ink-500">
                        Free Cancellation Up To 7 Days Before Check-In. Policies
                        Shown Here Are Sample Copy.
                    </p>
                </div>
            </div>
        </section>
    );
}
