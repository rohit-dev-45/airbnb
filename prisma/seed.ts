import { syncDemoListingsToDatabase } from "@/lib/sync-demo-listings";

async function main() {
    await syncDemoListingsToDatabase();
}
main()
    .then(() => {
        process.stdout.write("Demo Listings Seeded Successfully.\n");
    })
    .catch((error) => {
        process.stderr.write(
            `Seed Failed: ${error instanceof Error ? error.message : String(error)}\n`,
        );
        process.exitCode = 1;
    });
