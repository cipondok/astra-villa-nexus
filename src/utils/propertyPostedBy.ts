import type { BaseProperty } from "@/types/property";

type OwnerJoin = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  verification_status?: string | null;
  created_at?: string | null;
};

export function attachPostedByFromOwnerJoin<T extends Record<string, any>>(
  properties: T[]
): (T & {
  posted_by?: {
    id: string;
    name: string;
    avatar_url?: string;
    verification_status?: string;
    joining_date?: string;
  };
})[] {
  return (properties || []).map((p) => {
    const owner = (p as any).owner as OwnerJoin | OwnerJoin[] | null | undefined;
    const ownerData = Array.isArray(owner) ? owner[0] : owner;

    if (!ownerData?.id) return p as any;

    return {
      ...(p as any),
      posted_by: {
        id: ownerData.id,
        name: ownerData.full_name || "Anonymous",
        avatar_url: ownerData.avatar_url || undefined,
        verification_status: ownerData.verification_status || "unverified",
        joining_date: ownerData.created_at || undefined,
      },
    };
  });
}

export function toBaseProperty<T extends Record<string, any>>(p: T): BaseProperty {
  return {
    ...(p as any),
    listing_type: (p as any).listing_type as "sale" | "rent" | "lease",
    image_urls: ((p as any).images || []) as string[],
  } as BaseProperty;
}
