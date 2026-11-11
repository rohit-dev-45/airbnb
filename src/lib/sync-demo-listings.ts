import { DemoProperty, fetchDemoProperties } from "./demo-properties";
import { prisma } from "./prisma";

function demoListingDescription(city: string) {
    return `A Curated Demo Stay In ${city} With a Modern Setup Ideal For Short Trips And Long Weekends.`;
}

function demoHostEmail(property: DemoProperty) {
    return `demo-host-${property.id}@stayscape.local`;
}

async function ensureDemoHostUser(property: DemoProperty) {
    return prisma.user.upsert({
        where: { email: demoHostEmail(property) },
        create: {
            email: demoHostEmail(property),
            name: property.hostName,
        },
        update: {
            name: property.hostName,
        },
        select: { id: true },
    });
}

async function upsertDemoListingRow(hostId: string, property: DemoProperty) {
    const roomCount = Math.max(1, Math.round(property.maxGuests / 2));
    const bathroomCount = Math.max(1, Math.round(property.maxGuests / 3));
    await prisma.listing.upsert({
        where: { id: property.id },
        create: {
            id: property.id,
            title: property.title,
            description: demoListingDescription(property.city),
            imageSrc: property.image,
            imageGallery: [property.image],
            category: "Demo Stay",
            roomCount,
            bathroomCount,
            guestCount: property.maxGuests,
            locationValue: property.city,
            pricePerNight: property.pricePerNight,
            userId: hostId,
        },
        update: {
            title: property.title,
            description: demoListingDescription(property.city),
            imageSrc: property.image,
            imageGallery: [property.image],
            category: "Demo Stay",
            roomCount,
            bathroomCount,
            guestCount: property.maxGuests,
            locationValue: property.city,
            pricePerNight: property.pricePerNight,
            userId: hostId,
        },
    });
}

export async function syncDemoListingById(listingId: string) {
    const demoProperties = await fetchDemoProperties();
    const property = demoProperties.find((item) => item.id === listingId);
    if (!property) return;
    const host = await ensureDemoHostUser(property);
    await upsertDemoListingRow(host.id, property);
}

export async function syncDemoListingsToDatabase() {
    const demoProperties = await fetchDemoProperties();
    for (const property of demoProperties) {
        const host = await ensureDemoHostUser(property);
        await upsertDemoListingRow(host.id, property);
    }
}
