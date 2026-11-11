"use server";

import z from "zod";
import { MAX_INFANTS, MIN_ADULTS, PROCESSING_FEE_RATE } from "../booking-rules";
import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import { requireUser } from "../auth-lib";
import { revalidatePath } from "next/cache";

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
});

const listingSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    imageSrc: z.string().url(),
    imageGallery: z.array(z.string().url()).min(1).max(10),
    category: z.string().min(2),
    roomCount: z.coerce.number().int().min(1),
    bathroomCount: z.coerce.number().int().min(1),
    guestCount: z.coerce.number().int().min(1),
    locationValue: z.string().min(2),
    pricePerNight: z.coerce.number().int().min(10),
});

const reservationSchema = z.object({
    listingId: z
        .string()
        .min(1)
        .max(64)
        .regex(/^[a-zA-Z0-9_-]+$/),
    startDate: z.string(),
    endDate: z.string(),
    adults: z.coerce.number().int().min(MIN_ADULTS),
    children: z.coerce.number().int().min(0),
    infants: z.coerce.number().int().min(0).max(MAX_INFANTS),
});

function redirectWithBookingError(listingId: string, message: string): never {
    redirect(
        `/listings/${listingId}?booking=error&message=${encodeURIComponent(message)}`,
    );
}

export async function registerUser(formData: FormData) {
    const parsed = registerSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
    });
    if (!parsed.success) throw new Error("Invalid Registration Input.");
    const existing = await prisma.user.findUnique({
        where: { email: parsed.data.email },
    });
    if (existing) throw new Error("Email Already Exists.");
    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.create({
        data: {
            name: parsed.data.name,
            email: parsed.data.email,
            hashedPassword,
        },
    });
    redirect("/login");
}

export async function createListing(formData: FormData) {
    const user = await requireUser();
    const parsedGallery = parseListingGallery(formData.get("imageGallery"));
    const parsed = listingSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        imageSrc: formData.get("imageSrc"),
        imageGallery: parsedGallery,
        category: formData.get("category"),
        roomCount: formData.get("roomCount"),
        bathroomCount: formData.get("bathroomCount"),
        guestCount: formData.get("guestCount"),
        locationValue: formData.get("locationValue"),
        pricePerNight: formData.get("pricePerNight"),
    });
    if (!parsed.success) throw new Error("Invalid Listing Payload.");
    await prisma.listing.create({
        data: {
            ...parsed.data,
            userId: user.id,
        },
    });
    revalidatePath("/");
    revalidatePath("/host");
}

function parseListingGallery(rawGallery: FormDataEntryValue | null) {
    try {
        const value = JSON.parse(String(rawGallery ?? "[]"));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

export async function updateListing(listingId: string, formData: FormData) {
    const user = await requireUser();
    if (!listingId) throw new Error("Listing Id Is Missing.");
    const parsedGallery = parseListingGallery(formData.get("imageGallery"));
    const parsed = listingSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        imageSrc: formData.get("imageSrc"),
        imageGallery: parsedGallery,
        category: formData.get("category"),
        roomCount: formData.get("roomCount"),
        bathroomCount: formData.get("bathroomCount"),
        guestCount: formData.get("guestCount"),
        locationValue: formData.get("locationValue"),
        pricePerNight: formData.get("pricePerNight"),
    });
    if (!parsed.success) throw new Error("Invalid Listing Payload.");
    const updated = await prisma.listing.updateMany({
        where: {
            id: listingId,
            userId: user.id,
        },
        data: parsed.data,
    });
    if (updated.count === 0) {
        throw new Error("Listing Not Found Or Access Denied.");
    }
    revalidatePath("/");
    revalidatePath("/host");
    revalidatePath(`/listings/${listingId}`);
    redirect("/host");
}

export async function deleteListing(formData: FormData) {
    const user = await requireUser();
    const listingId = String(formData.get("listingId") ?? "");
    if (!listingId) throw new Error("Listing Id Is Missing.");
    await prisma.listing.deleteMany({
        where: {
            id: listingId,
            userId: user.id,
        },
    });
    revalidatePath("/");
    revalidatePath("/host");
}

export async function createReservation(formData: FormData) {
    const user = await requireUser();
    const fallbackListingId = String(formData.get("listingId") ?? "");
    const parsed = reservationSchema.safeParse({
        listingId: formData.get("listingId"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        adults: formData.get("adults"),
        children: formData.get("children"),
        infants: formData.get("infants"),
    });
    if (!parsed.success) {
        if (fallbackListingId) {
            redirectWithBookingError(
                fallbackListingId,
                "Please Review Your Reservation Details And Try Again.",
            );
        }
        redirect(
            "/bookings?message=Please Review Your Reservation Details And Try Again.",
        );
    }
    const startDate = new Date(parsed.data.startDate);
    const endDate = new Date(parsed.data.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        redirectWithBookingError(
            parsed.data.listingId,
            "Please Select Valid Check-In And Checkout Dates.",
        );
    }
    if (endDate <= startDate) {
        redirectWithBookingError(
            parsed.data.listingId,
            "Checkout Must Be After Check-In.",
        );
    }
    const listing = await prisma.listing.findUnique({
        where: { id: parsed.data.listingId },
    });
    if (!listing) {
        redirectWithBookingError(parsed.data.listingId, "Listing Not Found.");
    }
    const totalGuests =
        parsed.data.adults + parsed.data.children + parsed.data.infants;
    if (totalGuests > listing.guestCount) {
        redirectWithBookingError(
            listing.id,
            `This Listing Allows Up To ${listing.guestCount} Guests. Please Adjust Your Guest Count.`,
        );
    }
    const overlappingReservation = await prisma.reservation.findFirst({
        where: {
            listingId: listing.id,
            startDate: { lt: endDate },
            endDate: { gt: startDate },
        },
    });
    if (overlappingReservation) {
        redirectWithBookingError(
            listing.id,
            "Selected Dates Are Already Booked. Please Choose Different Dates.",
        );
    }
    const nights = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const subtotal = nights * listing.pricePerNight;
    const processingFee = Math.round(subtotal * PROCESSING_FEE_RATE);
    const totalPrice = subtotal + processingFee;
    await prisma.reservation.create({
        data: {
            userId: user.id,
            listingId: listing.id,
            startDate,
            endDate,
            totalPrice,
        },
    });
    revalidatePath("/bookings");
    revalidatePath(`/listings/${listing.id}`);
    revalidatePath("/host");
    redirect(`/listings/${listing.id}?booking=success`);
}

export async function cancelReservation(formData: FormData) {
    const user = await requireUser();
    const reservationId = String(formData.get("reservationId") ?? "");
    if (!reservationId) throw new Error("Reservation Id Is Missing.");
    const reservation = await prisma.reservation.findFirst({
        where: {
            id: reservationId,
            userId: user.id,
        },
    });
    if (!reservation) {
        redirect("/bookings?message=Reservation Not Found.");
    }
    await prisma.reservation.delete({
        where: { id: reservation.id },
    });
    revalidatePath("/bookings");
    revalidatePath(`/listings/${reservation.listingId}`);
    revalidatePath("/host");
    redirect("/bookings?message=Reservation Cancelled Successfully.");
}
