"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { fingerprint } from "@/lib/seenLeads";
import type { Lead } from "@/lib/leadTypes";
import type { ActionResult } from "./lists";
import { addLeadToListAction } from "./lists";

export interface LeadUpsertInput {
  name: string;
  category?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  source: string;
  score?: number;
  priorityLabel?: string | null;
  opportunityType?: string | null;
  opportunityReason?: string | null;
  recommendedAction?: string | null;
  dataQuality?: string | null;
  contactReadiness?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  mapsUrl?: string | null;
  signals?: string[];
  externalId?: string | null;
  rawData?: Record<string, unknown>;
}

export interface UpsertedLead {
  id: string;
  fingerprint: string;
}

/**
 * Upserts a lead for the current user keyed on (user_id, fingerprint).
 * Returns the DB-generated id so callers can link it into lead_list_items.
 */
export async function upsertLead(
  input: LeadUpsertInput
): Promise<ActionResult<UpsertedLead>> {
  const trimmedName = input.name?.trim() ?? "";
  if (!trimmedName) return { ok: false, error: "Lead name is required." };
  if (!input.source?.trim()) {
    return { ok: false, error: "Lead source is required." };
  }

  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const fp = fingerprint({
      name: trimmedName,
      phone: input.phone ?? undefined,
      website: input.website ?? undefined,
      address: input.address ?? undefined,
      source: input.source,
    });

    const row = {
      user_id: user.id,
      external_id: input.externalId ?? null,
      fingerprint: fp,
      name: trimmedName,
      category: input.category ?? null,
      phone: input.phone ?? null,
      website: input.website ?? null,
      address: input.address ?? null,
      source: input.source,
      score: Math.max(0, Math.min(100, Math.round(input.score ?? 0))),
      priority_label: input.priorityLabel ?? null,
      opportunity_type: input.opportunityType ?? null,
      opportunity_reason: input.opportunityReason ?? null,
      recommended_action: input.recommendedAction ?? null,
      data_quality: input.dataQuality ?? null,
      contact_readiness: input.contactReadiness ?? null,
      rating: input.rating ?? null,
      rating_count: input.ratingCount ?? null,
      maps_url: input.mapsUrl ?? null,
      signals: input.signals ?? [],
      raw_data: input.rawData ?? {},
    };

    const { data, error } = await supabase
      .from("leads")
      .upsert(row, { onConflict: "user_id,fingerprint" })
      .select("id, fingerprint")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message || "Could not save lead." };
    }
    return { ok: true, value: { id: data.id as string, fingerprint: fp } };
  } catch {
    return { ok: false, error: "Unauthorized." };
  }
}

function leadToUpsertInput(lead: Lead): LeadUpsertInput {
  return {
    name: lead.name,
    category: lead.category ?? null,
    phone: lead.phone ?? null,
    website: lead.website ?? null,
    address: lead.address ?? null,
    source: lead.source,
    score: lead.score,
    priorityLabel: lead.priorityLabel ?? null,
    opportunityType: lead.opportunityType ?? null,
    opportunityReason: lead.opportunityReason ?? null,
    recommendedAction: lead.recommendedAction ?? null,
    dataQuality: lead.dataQualityLabel ?? null,
    contactReadiness: lead.contactReadinessLabel ?? null,
    rating: lead.rating ?? null,
    ratingCount: lead.ratingCount ?? null,
    mapsUrl: lead.mapsUrl ?? null,
    signals: lead.signals ?? [],
    externalId: lead.id,
  };
}

/**
 * Upsert the lead AND add it to the given list. Returns the DB lead id on
 * success so the caller can update its own UI state.
 */
export async function saveLeadToList(
  lead: Lead,
  listId: string,
  extras: { status?: string; notes?: string } = {}
): Promise<ActionResult<UpsertedLead>> {
  const upsert = await upsertLead(leadToUpsertInput(lead));
  if (!upsert.ok) return upsert;

  const linked = await addLeadToListAction(listId, upsert.value.id, extras);
  if (!linked.ok) return { ok: false, error: linked.error };

  revalidatePath("/app/lists");
  return upsert;
}
