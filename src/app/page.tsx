import { HomeSearchBar } from "@/components/home-search-bar";
import { SafeImage } from "@/components/safe-image";
import { fetchDemoProperties } from "@/lib/demo-properties";
import { format } from "date-fns";
import {
    ChevronRight,
    Flame,
    Home,
    Landmark,
    Mountain,
    Palmtree,
    Snowflake,
    Star,
    TreePalm,
    Users,
    Waves,
} from "lucide-react";
import Link from "next/link";
import React from "react";

type HomePageProps = {
    searchParams: Promise<{
        location?: string;
        category?: string;
        checkIn?: string;
        checkOut?: string;
        guests?: string;
        adults?: string;
        children?: string;
        infants?: string;
    }>;
};

const categoryItems = [
    { label: "Scenic Views", icon: Mountain },
    { label: "Beach Front", icon: Palmtree },
    { label: "Guest Favorites", icon: Flame },
    { label: "Cabins", icon: Home },
    { label: "Countryside Stays", icon: TreePalm },
    { label: "Lake Front", icon: Waves },
    { label: "Historic Homes", icon: Landmark },
    { label: "Ski-In/Out", icon: Snowflake },
];

type UnifiedCard = {
    id: string;
    title: string;
    image: string;
    city: string;
    category: string;
    hostName: string;
    rating: number;
    price: number;
    maxGuests: number;
    availableDates: string[];
    isExternal: boolean;
};

function groupByCity(cards: UnifiedCard[]) {
    const grouped = new Map<string, UnifiedCard[]>();
    for (const card of cards) {
        const list = grouped.get(card.city) ?? [];
        list.push(card);
        grouped.set(card.city, list);
    }
    return Array.from(grouped.entries()).map(([city, items]) => ({
        city,
        items,
    }));
}

function normalizeUsCity(location: string) {
    const lower = location.toLowerCase();
    if (lower.includes("new york")) return "New York, United States";
    if (lower.includes("los angeles")) return "Los Angeles, United States";
    if (lower.includes("miami")) return "Miami, United States";
    if (lower.includes("chicago")) return "Chicago, United States";
    if (lower.includes("san francisco")) return "San Francisco, United States";
    if (lower.includes("seattle")) return "Seattle, United States";
    if (lower.includes("boston")) return "Boston, United States";
    return "United States";
}

function buildDateRangeInclusive(start: Date, end: Date) {
    const dates: string[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
        dates.push(cursor.toISOString().slice(0, 10));
        cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
}

function isRangeAvailable(
    availableDates: string[],
    checkIn?: string,
    checkOut?: string,
) {
    if (!checkIn || !checkOut) return true;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end < start
    ) {
        return true;
    }
    const requested = buildDateRangeInclusive(start, end);
    if (availableDates.length === 0) return true;
    const mdSet = new Set(
        availableDates
            .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
            .map((d) => d.slice(5)),
    );
    return requested.every((d) => mdSet.has(d.slice(5)));
}

function formatDateRange(checkIn?: string, checkOut?: string) {
    if (!checkIn || !checkOut) return "Anytime";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
        return "Anytime";
    return `${format(start, "MMM d")}–${format(end, "MMM d")}`;
}

const HomePage = async ({ searchParams }: HomePageProps) => {
    const params = await searchParams;
    const listingQueryParams = new URLSearchParams();
    if (params.location) listingQueryParams.set("location", params.location);
    if (params.checkIn) listingQueryParams.set("checkIn", params.checkIn);
    if (params.checkOut) listingQueryParams.set("checkOut", params.checkOut);
    if (params.guests) listingQueryParams.set("guests", params.guests);
    if (params.adults) listingQueryParams.set("adults", params.adults);
    if (params.children) listingQueryParams.set("children", params.children);
    if (params.infants) listingQueryParams.set("infants", params.infants);
    const listingQuery = listingQueryParams.toString();
    const buildListingHref = (listingId: string) =>
        `/listings/${listingId}${listingQuery ? `?${listingQuery}` : ""}`;
    const hasLocationSearch = Boolean(params.location?.trim());
    const hasAnyFilter = Boolean(
        params.location?.trim() ||
        params.category?.trim() ||
        params.checkIn?.trim() ||
        params.checkOut?.trim() ||
        params.guests?.trim() ||
        params.adults?.trim() ||
        params.children?.trim() ||
        params.infants?.trim(),
    );
    const demoProperties = await fetchDemoProperties();
    const allCards: UnifiedCard[] = [
        ...demoProperties.map((property, index) => ({
            id: property.id,
            title: property.title,
            image: property.image,
            city: normalizeUsCity(property.city),
            category:
                categoryItems[index % categoryItems.length]?.label ??
                "Trending",
            hostName: property.hostName,
            rating: property.rating,
            price: property.pricePerNight,
            maxGuests: property.maxGuests,
            availableDates: property.availableDates,
            isExternal: true,
        })),
    ];
    const requestedGuests =
        Number(params.adults ?? 0) +
            Number(params.children ?? 0) +
            Number(params.infants ?? 0) ||
        Number(params.guests ?? 1) ||
        1;
    const adults = Number(params.adults ?? 0) || 0;
    const children = Number(params.children ?? 0) || 0;
    const infants = Number(params.infants ?? 0) || 0;
    const locationLabel = params.location?.trim() || "Anywhere";
    const dateLabel = formatDateRange(params.checkIn, params.checkOut);
    const guestParts: string[] = [];
    if (adults > 0) guestParts.push(`${adults} adult${adults > 1 ? "s" : ""}`);
    if (children > 0)
        guestParts.push(`${children} child${children > 1 ? "ren" : ""}`);
    if (infants > 0)
        guestParts.push(`${infants} infant${infants > 1 ? "s" : ""}`);
    const guestsLabel =
        guestParts.length > 0
            ? guestParts.join(", ")
            : `${requestedGuests} guest${requestedGuests > 1 ? "s" : ""}`;
    const unifiedCards = allCards.filter((card) => {
        const byLocation = params.location
            ? card.city.toLowerCase().includes(params.location.toLowerCase())
            : true;
        const byCategory = params.category
            ? card.category.toLowerCase() === params.category.toLowerCase()
            : true;
        const byGuests = card.maxGuests >= requestedGuests;
        const byAvailability = isRangeAvailable(
            card.availableDates,
            params.checkIn,
            params.checkOut,
        );
        return byLocation && byCategory && byGuests && byAvailability;
    });
    const limitedCards = unifiedCards.slice(0, 20);
    const groupedCards = groupByCity(limitedCards).slice(0, 8);
    const defaultGridCards = limitedCards;
    return (
        <main className="mx-auto min-h-screen max-w-7xl px-4 pb-14 pt-8 md:px-8 md:pb-12 md:pt-6">
            <section className="rounded-3xl border border-ink-200 bg-linear-to-br from-brand-50 via-surface to-ink-50 p-6 md:p-10">
                <div className="mx-auto max-w-202 text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
                        Thoughtfully Selected Homes Across The United States
                    </p>
                    <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink-900 md:mt-3 md:text-5xl">
                        Find The Right Place To Stay
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink-600 md:mt-3 md:text-base">
                        Explore Professionally Presented Stays In Leading US
                        Destinations. Filter By Location, Dates, And Guest Count
                        To Shortlist The Best Fit For Your Trip.
                    </p>
                </div>
                <div className="mx-auto mt-7 max-w-230 md:mt-8">
                    <HomeSearchBar
                        initialLocation={params.location}
                        initialGuests={params.guests}
                        initialAdults={params.adults}
                        initialChildren={params.children}
                        initialInfants={params.infants}
                        initialCheckIn={params.checkIn}
                        initialCheckOut={params.checkOut}
                    />
                </div>
                <div className="mx-auto mt-6 flex max-w-230 items-start justify-between gap-3">
                    <div className="hide-scrollbar flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
                        {categoryItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = params.category === item.label;
                            return (
                                <Link
                                    key={item.label}
                                    href={`/?category=${encodeURIComponent(item.label)}${params.location ? `&location=${encodeURIComponent(params.location)}` : ""}${params.guests ? `&guests=${encodeURIComponent(params.guests)}` : ""}${params.adults ? `&adults=${encodeURIComponent(params.adults)}` : ""}${params.children ? `&children=${encodeURIComponent(params.children)}` : ""}${params.infants ? `&infants=${encodeURIComponent(params.infants)}` : ""}${params.checkIn ? `&checkIn=${encodeURIComponent(params.checkIn)}` : ""}${params.checkOut ? `&checkOut=${encodeURIComponent(params.checkOut)}` : ""}`}
                                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                                        isActive
                                            ? "border-ink-900 bg-ink-900 text-white"
                                            : "border-ink-300 text-ink-700 hover:bg-ink-100"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                    {hasAnyFilter ? (
                        <Link
                            href="/"
                            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
                        >
                            Clear Filters
                        </Link>
                    ) : null}
                </div>
                <p className="mx-auto mt-3 max-w-230 text-sm text-ink-600">
                    Showing stays for{" "}
                    <span className="font-medium text-ink-900">
                        {guestsLabel}
                    </span>
                    {" · "}
                    <span className="font-medium text-ink-900">
                        {dateLabel}
                    </span>
                    {" · "}
                    <span className="font-medium text-ink-900">
                        {locationLabel}
                    </span>
                </p>
            </section>

            {unifiedCards.length === 0 ? (
                <section className="mt-10 md:mt-8">
                    <p className="text-ink-600">
                        No Stays Match Your Current Filters. Try Adjusting
                        Destination, Dates, Or Guest Count.
                    </p>
                </section>
            ) : (
                <>
                    {hasLocationSearch ? (
                        <section className="mt-10 space-y-10 md:mt-8 md:space-y-9">
                            {groupedCards.map((group) => (
                                <div key={group.city}>
                                    <div className="mb-4 flex items-center gap-2">
                                        <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
                                            Top Stays In {group.city}
                                        </h2>
                                        <ChevronRight className="h-5 w-5 text-ink-700" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                                        {group.items
                                            .slice(0, 16)
                                            .map((item, index) => (
                                                <Link
                                                    key={item.id}
                                                    href={buildListingHref(
                                                        item.id,
                                                    )}
                                                    className="block space-y-2"
                                                >
                                                    <div className="overflow-hidden rounded-2xl">
                                                        <SafeImage
                                                            src={item.image}
                                                            alt={item.title}
                                                            width={420}
                                                            height={280}
                                                            className="h-48 w-full object-cover"
                                                            priority={index < 2}
                                                        />
                                                    </div>
                                                    <div className="space-y-0.5 px-0.5">
                                                        <p className="inline-flex rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                                                            {item.city}
                                                        </p>
                                                        <p className="line-clamp-1 text-sm font-medium text-ink-900">
                                                            {item.title}
                                                        </p>
                                                        <p className="line-clamp-1 text-xs text-ink-500">
                                                            ${item.price} For 2
                                                            Nights
                                                            <span className="ml-1 inline-flex items-center gap-0.5">
                                                                <Star className="h-3 w-3 fill-current text-ink-700" />
                                                                {item.rating}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </section>
                    ) : (
                        <section className="mt-10 md:mt-8">
                            <div className="mb-4 flex items-center gap-2">
                                <h2 className="text-2xl font-semibold tracking-tight text-ink-900">
                                    Top Picks Across The United States
                                </h2>
                                <ChevronRight className="h-5 w-5 text-ink-700" />
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                                {defaultGridCards.map((item, index) => (
                                    <Link
                                        key={item.id}
                                        href={buildListingHref(item.id)}
                                        className="block space-y-2"
                                    >
                                        <div className="overflow-hidden rounded-2xl">
                                            <SafeImage
                                                src={item.image}
                                                alt={item.title}
                                                width={420}
                                                height={280}
                                                className="h-48 w-full object-cover"
                                                priority={index < 4}
                                            />
                                        </div>
                                        <div className="space-y-0.5 px-0.5">
                                            <p className="inline-flex rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                                                {item.city}
                                            </p>
                                            <p className="line-clamp-1 text-sm font-medium text-ink-900">
                                                {item.title}
                                            </p>
                                            <p className="line-clamp-1 text-xs text-ink-500">
                                                ${item.price} For 2 Nights
                                                <span className="ml-1 inline-flex items-center gap-0.5">
                                                    <Star className="h-3 w-3 fill-current text-ink-700" />
                                                    {item.rating}
                                                </span>
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            <footer className="mt-16 rounded-3xl border border-ink-200 bg-surface p-6 shadow-sm md:mt-14 md:p-7">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-semibold text-ink-900">
                            StayScape
                        </h3>
                        <p className="mt-3 max-w-xl text-sm text-ink-600">
                            Discover Carefully Curated US Stays With A Booking
                            Flow Designed For Clarity And Confidence. Compare
                            Homes Quickly And Reserve With Ease.
                        </p>
                        <p className="mt-5 inline-flex items-center gap-1 text-xs text-ink-500">
                            <Users className="h-3.5 w-3.5" />
                            Powered By Curated Sample Listing Data Focused On US
                            Destinations
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-ink-900">
                            Explore
                        </h4>
                        <ul className="mt-3 space-y-2 text-sm text-ink-600">
                            <li>City Getaways</li>
                            <li>Coastal Retreats</li>
                            <li>Cabin Weekends</li>
                            <li>Extended Stays</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-ink-900">
                            Support
                        </h4>
                        <ul className="mt-3 space-y-2 text-sm text-ink-600">
                            <li>Guest Help center</li>
                            <li>Host Guidelines</li>
                            <li>Cancellation Policy</li>
                            <li>Trust And Safety</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-ink-200 pt-4 text-xs text-ink-500">
                    © {new Date().getFullYear()} StayScape. All Rights Reserved.
                </div>
            </footer>
        </main>
    );
};

export default HomePage;
