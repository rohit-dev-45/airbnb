"use client";

import { useUploadThing } from "@/lib/uploadthing";
import { ImageUp } from "lucide-react";
import { useState } from "react";
import { SafeImage } from "./safe-image";
import { useFormStatus } from "react-dom";

type ListingFormProps = {
    action: (formData: FormData) => Promise<void>;
    submitLabel?: string;
    submittingLabel?: string;
    initialValues?: {
        title: string;
        category: string;
        description: string;
        locationValue: string;
        pricePerNight: number;
        guestCount: number;
        roomCount: number;
        bathroomCount: number;
        imageSrc: string;
        imageGallery: string[];
    };
};

export function ListingForm({
    action,
    submitLabel = "Publish Listing",
    submittingLabel = "Publishing...",
    initialValues,
}: ListingFormProps) {
    const [galleryImages, setGalleryImages] = useState<string[]>(
        initialValues
            ? Array.from(
                  new Set(
                      [
                          ...(initialValues.imageGallery ?? []),
                          ...(initialValues.imageSrc
                              ? [initialValues.imageSrc]
                              : []),
                      ].filter(Boolean),
                  ),
              ).slice(0, 10)
            : [],
    );
    const [uploadError, setUploadError] = useState("");
    const [isDragActive, setIsDragActive] = useState(false);
    const { startUpload, isUploading } = useUploadThing("imageUploader", {
        onClientUploadComplete: (res) => {
            const urls = (res ?? [])
                .map((item) => item?.ufsUrl || item?.ufsUrl || "")
                .filter(Boolean);
            setGalleryImages((prev) =>
                Array.from(new Set([...prev, ...urls])).slice(0, 10),
            );
            setUploadError("");
        },
        onUploadError: (error) => {
            setUploadError(error.message);
        },
    });
    async function handleFileUpload(files: FileList | File[] | null) {
        const list = files ? Array.from(files) : [];
        if (list.length === 0) return;
        if (galleryImages.length + list.length > 10) {
            setUploadError("You Can Upload Up To 10 Images Per Listing.");
            return;
        }
        if (list.some((file) => !file.type.startsWith("image/"))) {
            setUploadError("Please Upload An Image File.");
            return;
        }
        if (list.some((file) => file.size > 4 * 1024 * 1024)) {
            setUploadError("Image Must Be 4MB Or Smaller.");
            return;
        }
        setUploadError("");
        await startUpload(list.slice(0, 10 - galleryImages.length));
    }
    function removeImage(imageUrl: string) {
        setGalleryImages((prev) => prev.filter((image) => image !== imageUrl));
    }
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        if (galleryImages.length === 0) {
            event.preventDefault();
            setUploadError(
                "Upload At Least One Image. The First Image Is Used As The Cover Photo.",
            );
        }
    }
    return (
        <form
            action={action}
            onSubmit={handleSubmit}
            className="mt-4 grid gap-3 md:grid-cols-2"
        >
            <FieldInput
                name="title"
                label="Title"
                placeholder="Stylish Loft Near Downtown"
                defaultValue={initialValues?.title}
            />
            <FieldInput
                name="category"
                label="Category"
                placeholder="Apartment, Villa, Cabin..."
                defaultValue={initialValues?.category}
            />

            <div className="rounded-2xl border border-ink-200 bg-surface-muted/40 p-3 md:col-span-2 md:p-4">
                <p className="mb-2 text-sm font-medium text-ink-800">
                    Listing Gallery
                </p>

                <label
                    className={`flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 text-center transition ${
                        isDragActive
                            ? "border-brand-400 bg-brand-50/40"
                            : "border-ink-300 bg-surface hover:border-brand-300"
                    }`}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragActive(true);
                    }}
                    onDragLeave={() => setIsDragActive(false)}
                    onDrop={(event) => {
                        event.preventDefault();
                        setIsDragActive(false);
                        void handleFileUpload(event.dataTransfer.files);
                    }}
                >
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(event) => {
                            void handleFileUpload(event.target.files);
                            event.currentTarget.value = "";
                        }}
                    />
                    <ImageUp className="h-6 w-6 text-brand-500" />
                    <p className="text-sm font-semibold text-ink-800">
                        Drag And Drop Images, Or Click To Upload.
                    </p>
                    <p className="text-xs text-ink-500">
                        Up To 10 Images, Each Max 4MB{" "}
                        {isUploading ? "• Uploading..." : ""}
                    </p>
                </label>

                <input
                    type="hidden"
                    name="imageSrc"
                    key={`imageSrc-${galleryImages[0] ?? "none"}`}
                    defaultValue={galleryImages[0] ?? ""}
                />
                <input
                    type="hidden"
                    name="imageGallery"
                    key={`imageGallery-${JSON.stringify(galleryImages)}`}
                    defaultValue={JSON.stringify(galleryImages)}
                />

                {galleryImages.length > 0 ? (
                    <div className="mt-3 space-y-2">
                        <p className="text-sm text-emerald-700">
                            {galleryImages.length} Image
                            {galleryImages.length > 1 ? "s" : ""} Ready.
                        </p>
                        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                            {galleryImages.map((image, index) => (
                                <div
                                    key={`${image}-${index}`}
                                    className="relative"
                                >
                                    <SafeImage
                                        src={image}
                                        alt={`Uploaded listing image ${index + 1}`}
                                        width={240}
                                        height={160}
                                        className="h-16 w-24 rounded-lg border border-ink-200 object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => removeImage(image)}
                                        className="absolute -right-1.5 -top-1.5 rounded-full border border-ink-200 bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-700 hover:bg-ink-100"
                                        aria-label={`Remove image ${index + 1}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="mt-2 text-sm text-ink-600">
                        Upload At Least One Image. The First Image Is Used As
                        The Cover Photo.
                    </p>
                )}
                {uploadError ? (
                    <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                ) : null}
            </div>

            <FieldTextarea
                name="description"
                label="Description"
                placeholder="Describe What Guests Can Expect From This Stay."
                className="md:col-span-2"
                defaultValue={initialValues?.description}
            />
            <FieldInput
                name="locationValue"
                label="Location"
                placeholder="e.g. Miami, United States"
                defaultValue={initialValues?.locationValue}
            />
            <FieldInput
                name="pricePerNight"
                label="Price per night"
                type="number"
                min={10}
                placeholder="250"
                defaultValue={initialValues?.pricePerNight}
            />
            <FieldInput
                name="guestCount"
                label="Guests"
                type="number"
                min={1}
                placeholder="4"
                defaultValue={initialValues?.guestCount}
            />
            <FieldInput
                name="roomCount"
                label="Rooms"
                type="number"
                min={1}
                placeholder="2"
                defaultValue={initialValues?.roomCount}
            />
            <FieldInput
                name="bathroomCount"
                label="Bathrooms"
                type="number"
                min={1}
                placeholder="1"
                defaultValue={initialValues?.bathroomCount}
            />
            <SubmitButton
                submitLabel={submitLabel}
                submittingLabel={submittingLabel}
            />
        </form>
    );
}

type FieldInputProps = {
    name: string;
    label: string;
    placeholder: string;
    type?: string;
    min?: number;
    defaultValue?: string | number;
};

function FieldInput({
    name,
    label,
    placeholder,
    type = "text",
    min,
    defaultValue,
}: FieldInputProps) {
    return (
        <label className="grid gap-1.5">
            <span className="text-xs font-medium text-ink-600">{label}</span>
            <input
                name={name}
                required
                type={type}
                min={min}
                placeholder={placeholder}
                defaultValue={defaultValue}
                className="rounded-xl border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
        </label>
    );
}

type FieldTextareaProps = {
    name: string;
    label: string;
    placeholder: string;
    className?: string;
    defaultValue?: string;
};

function FieldTextarea({
    name,
    label,
    placeholder,
    className,
    defaultValue,
}: FieldTextareaProps) {
    return (
        <label className={`grid gap-1.5 ${className ?? ""}`}>
            <span className="text-xs font-medium text-ink-600">{label}</span>
            <textarea
                name={name}
                required
                placeholder={placeholder}
                defaultValue={defaultValue}
                rows={4}
                className="rounded-xl border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
        </label>
    );
}

function SubmitButton({
    submitLabel,
    submittingLabel,
}: {
    submitLabel: string;
    submittingLabel: string;
}) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
        >
            {pending ? submittingLabel : submitLabel}
        </button>
    );
}
