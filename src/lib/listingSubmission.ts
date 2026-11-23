/**
 * Genuine listing intake rules — one place for what an owner/agent must
 * provide before a listing goes to admin review, and how the form maps onto
 * the existing `properties` columns. The database moderation trigger
 * (private.enforce_property_moderation) is the real gate: it forces every
 * non-admin submission to approval_status = 'pending' / status = 'pending'.
 */

export const LISTING_LIMITS = {
  titleMin: 10,
  titleMax: 120,
  descriptionMin: 80,
  descriptionMax: 5000,
  minImages: 3,
  maxPriceIdr: 1_000_000_000_000, // Rp 1 triliun — anything above is a typo
} as const;

/** Listing types the database accepts (properties_listing_type_check). */
export const SUBMITTABLE_LISTING_TYPES = ["sale", "rent"] as const;

export const SUBMITTER_RELATIONSHIPS = ["owner", "authorized_agent", "developer"] as const;
export type SubmitterRelationship = (typeof SUBMITTER_RELATIONSHIPS)[number];

export type ListingStep = "basic" | "details" | "location" | "images" | "review";

export interface ListingSubmissionInput {
  title?: string;
  description?: string;
  property_type?: string;
  listing_type?: string;
  price?: string | number;
  bedrooms?: string | number;
  bathrooms?: string | number;
  area_sqm?: string | number;
  location?: string;
  city?: string;
  state?: string;
  images?: string[];
  contact_phone?: string;
  relationship?: string;
  declaration?: boolean;
}

export interface ListingIssue {
  field: keyof ListingSubmissionInput;
  step: ListingStep;
  message: { en: string; id: string };
}

const num = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return NaN;
  const cleaned = v.replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : NaN;
};

/** Indonesian mobile/landline: +62 / 62 / 0 prefix, 9–13 digits after it. */
export function normalizeIndonesianPhone(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  const m = digits.match(/^(?:\+?62|0)(\d{8,12})$/);
  return m ? `+62${m[1]}` : null;
}

export function validateListingSubmission(input: ListingSubmissionInput): ListingIssue[] {
  const issues: ListingIssue[] = [];
  const add = (field: ListingIssue["field"], step: ListingStep, en: string, id: string) =>
    issues.push({ field, step, message: { en, id } });

  const title = (input.title ?? "").trim();
  if (title.length < LISTING_LIMITS.titleMin || title.length > LISTING_LIMITS.titleMax) {
    add("title", "basic", `Title must be ${LISTING_LIMITS.titleMin}–${LISTING_LIMITS.titleMax} characters.`, `Judul harus ${LISTING_LIMITS.titleMin}–${LISTING_LIMITS.titleMax} karakter.`);
  }
  if (!input.property_type) add("property_type", "basic", "Choose a property type.", "Pilih tipe properti.");
  if (!SUBMITTABLE_LISTING_TYPES.includes(input.listing_type as never)) {
    add("listing_type", "basic", "Choose For sale or For rent.", "Pilih Dijual atau Disewa.");
  }
  const price = num(input.price);
  if (!Number.isFinite(price) || price <= 0 || price > LISTING_LIMITS.maxPriceIdr) {
    add("price", "basic", "Enter a price in Rupiah greater than 0.", "Masukkan harga dalam Rupiah lebih dari 0.");
  }
  const description = (input.description ?? "").trim();
  if (description.length < LISTING_LIMITS.descriptionMin || description.length > LISTING_LIMITS.descriptionMax) {
    add("description", "basic", `Description must be at least ${LISTING_LIMITS.descriptionMin} characters.`, `Deskripsi minimal ${LISTING_LIMITS.descriptionMin} karakter.`);
  }

  const area = num(input.area_sqm);
  if (!Number.isFinite(area) || area <= 0) add("area_sqm", "details", "Enter the size in m².", "Masukkan luas dalam m².");
  for (const f of ["bedrooms", "bathrooms"] as const) {
    const raw = input[f];
    if (raw === undefined || raw === null || raw === "") continue;
    const n = num(raw);
    if (!Number.isInteger(n) || n < 0 || n > 50) add(f, "details", "Enter a whole number between 0 and 50.", "Masukkan angka bulat 0–50.");
  }

  if (!input.state || !input.city || !input.location) {
    add("location", "location", "Choose the province and city.", "Pilih provinsi dan kota.");
  }

  const images = (input.images ?? []).filter((u) => typeof u === "string" && /^https:\/\//.test(u));
  if (images.length < LISTING_LIMITS.minImages) {
    add("images", "images", `Upload at least ${LISTING_LIMITS.minImages} real photos of the property.`, `Unggah minimal ${LISTING_LIMITS.minImages} foto asli properti.`);
  }

  if (!normalizeIndonesianPhone(input.contact_phone)) {
    add("contact_phone", "review", "Enter a valid Indonesian phone number (e.g. 0812…).", "Masukkan nomor telepon Indonesia yang valid (mis. 0812…).");
  }
  if (!SUBMITTER_RELATIONSHIPS.includes(input.relationship as never)) {
    add("relationship", "review", "Tell us your relationship to the property.", "Pilih hubungan Anda dengan properti ini.");
  }
  if (input.declaration !== true) {
    add("declaration", "review", "Confirm you own or are authorized to market this property.", "Konfirmasi bahwa Anda pemilik atau berwenang memasarkan properti ini.");
  }
  return issues;
}

const toInt = (v: unknown): number => {
  const n = num(v);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
};

/**
 * Maps the form onto existing `properties` columns. Never sets approval,
 * publish, featured or demo flags — the server decides those.
 * Private contact details are NOT stored on the listing (listing rows are
 * public once approved); the phone goes to the submitter's own profile.
 */
export function buildListingInsert(
  form: Record<string, any>,
  opts: { userId: string; isAgent: boolean; relationship: SubmitterRelationship; features: Record<string, boolean>; submittedAt?: string },
) {
  const images: string[] = (form.images ?? []).filter((u: unknown) => typeof u === "string" && u);
  const price = Math.round(num(form.price));
  const area = toInt(form.area_sqm);
  return {
    title: String(form.title ?? "").trim(),
    description: String(form.description ?? "").trim(),
    property_type: form.property_type,
    listing_type: form.listing_type,
    price,
    price_idr: price,
    bedrooms: toInt(form.bedrooms),
    bathrooms: toInt(form.bathrooms),
    area_sqm: area,
    building_sqm: area,
    floors: form.floors ? toInt(form.floors) : null,
    garage_count: form.garages ? toInt(form.garages) : null,
    furnishing: form.furnished || null,
    location: form.location,
    city: form.city ?? "",
    state: form.state ?? null,
    area: form.district || form.area || null,
    address: String(form.street_address ?? "").trim(),
    development_status: form.development_status,
    owner_type: form.owner_type,
    owner_id: opts.userId,
    agent_id: opts.isAgent ? opts.userId : null,
    images,
    image_urls: images,
    cover_image: images[0] ?? null,
    thumbnail_url: images[0] ?? null,
    property_features: { ...opts.features },
    virtual_tour_url: form.virtual_tour_url || null,
    three_d_model_url: form.three_d_model_url || null,
    status: "pending",
    meta: {
      submission: {
        relationship: opts.relationship,
        declared_at: opts.submittedAt ?? new Date().toISOString(),
        certificate_type_declared: form.certificate_type || null,
      },
    },
    ...(form.listing_type === "rent" && {
      rental_periods: form.rental_periods,
      minimum_rental_days: toInt(form.minimum_rental_days) || 30,
    }),
  };
}
