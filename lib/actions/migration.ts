"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { fingerprint } from "@/lib/seenLeads";

/**
 * Shape of a localStorage-cached lead passed from the browser. More
 * permissive than the runtime Lead type so legacy demo data still imports.
 */
export interface ImportLeadPayload {
  id?: string;
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
  dataQualityLabel?: string | null;
  contactReadinessLabel?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  mapsUrl?: string | null;
  signals?: string[];
}

export interface ImportListPayload {
  name: string;
  description?: string | null;
  leads: ImportLeadPayload[];
}

export interface ImportInput {
  lists: ImportListPayload[];
}

export interface ImportSummary {
  createdLists: number;
  upsertedLeads: number;
  linkedMemberships: number;
  failedLeads: number;
}

export type ImportResult =
  | { ok: true; value: ImportSummary }
  | { ok: false; error: string };

/**
 * One-shot batch importer. Accepts localStorage-shaped lists and their
 * leads, and materializes them into Supabase under the current user's RLS.
 *
 * Deliberately tolerant: skips malformed leads, ignores list-name
 * collisions by creating a new list each time (users can rename or merge
 * afterwards).
 */
const MAX_LISTS = 50;
const MAX_LEADS_PER_LIST = 500;

export async function importLocalData(
  input: ImportInput
): Promise<ImportResult> {
  if (!input?.lists || !Array.isArray(input.lists)) {
    return { ok: false, error: "No lists to import." };
  }
  if (input.lists.length > MAX_LISTS) {
    return {
      ok: false,
      error: `Too many lists to import at once (max ${MAX_LISTS}).`,
    };
  }

  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: "You must sign in to import data." };
  }

  const supabase = await createSupabaseServerClient();

  let createdLists = 0;
  let upsertedLeads = 0;
  let linkedMemberships = 0;
  let failedLeads = 0;

  for (const list of input.lists) {
    const listName = list?.name?.trim();
    if (!listName) continue;

    const { data: createdList, error: listErr } = await supabase
      .from("lead_lists")
      .insert({
        user_id: user.id,
        name: listName.slice(0, 80),
        description: list.description?.trim() || null,
      })
      .select("id")
      .single();

    if (listErr || !createdList) continue;
    createdLists += 1;
    const listId = createdList.id as string;

    for (const lead of (list.leads ?? []).slice(0, MAX_LEADS_PER_LIST)) {
      const name = lead?.name?.trim();
      if (!name || !lead.source) {
        failedLeads += 1;
        continue;
      }
      const fp = fingerprint({
        name,
        phone: lead.phone ?? undefined,
        website: lead.website ?? undefined,
        address: lead.address ?? undefined,
        source: lead.source,
      });

      const { data: upLead, error: leadErr } = await supabase
        .from("leads")
        .upsert(
          {
            user_id: user.id,
            external_id: lead.id ?? null,
            fingerprint: fp,
            name,
            category: lead.category ?? null,
            phone: lead.phone ?? null,
            website: lead.website ?? null,
            address: lead.address ?? null,
            source: lead.source,
            score: Math.max(
              0,
              Math.min(100, Math.round(lead.score ?? 0))
            ),
            priority_label: lead.priorityLabel ?? null,
            opportunity_type: lead.opportunityType ?? null,
            opportunity_reason: lead.opportunityReason ?? null,
            recommended_action: lead.recommendedAction ?? null,
            data_quality: lead.dataQualityLabel ?? null,
            contact_readiness: lead.contactReadinessLabel ?? null,
            rating: lead.rating ?? null,
            rating_count: lead.ratingCount ?? null,
            maps_url: lead.mapsUrl ?? null,
            signals: lead.signals ?? [],
            raw_data: {},
          },
          { onConflict: "user_id,fingerprint" }
        )
        .select("id")
        .single();

      if (leadErr || !upLead) {
        failedLeads += 1;
        continue;
      }
      upsertedLeads += 1;

      const { error: linkErr } = await supabase
        .from("lead_list_items")
        .upsert(
          {
            user_id: user.id,
            list_id: listId,
            lead_id: upLead.id,
            status: "new",
          },
          { onConflict: "list_id,lead_id" }
        );
      if (!linkErr) linkedMemberships += 1;
    }
  }

  revalidatePath("/app/lists");
  return {
    ok: true,
    value: { createdLists, upsertedLeads, linkedMemberships, failedLeads },
  };
}
