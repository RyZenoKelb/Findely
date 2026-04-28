import type { Lead, LeadObjective, LeadSignal } from "./leadTypes";

export function detectSignals(
  lead: Lead,
  objective: LeadObjective = "general"
): LeadSignal[] {
  const s = new Set<LeadSignal>();

  const hasWebsite = Boolean(lead.website);
  const hasPhone = Boolean(lead.phone);
  const hasAddress = Boolean(lead.address);

  if (hasWebsite) s.add("has_website");
  else s.add("no_website");

  if (hasPhone) s.add("has_phone");
  else s.add("missing_phone");

  if (hasAddress) s.add("has_address");

  if (!hasPhone && !hasWebsite) s.add("missing_contact_info");

  if (hasAddress && (hasPhone || hasWebsite)) s.add("local_business");

  if (!hasWebsite) s.add("needs_online_presence");

  if (hasPhone && hasAddress) s.add("outreach_ready");

  switch (objective) {
    case "no_website":
      if (!hasWebsite && (hasPhone || hasAddress)) s.add("high_opportunity");
      break;
    case "seo_outreach":
    case "marketing_outreach":
      if (hasWebsite && (hasPhone || hasAddress)) s.add("high_opportunity");
      break;
    case "with_website":
      if (hasWebsite) s.add("high_opportunity");
      break;
    case "with_phone":
      if (hasPhone) s.add("high_opportunity");
      break;
    case "local":
      if (hasAddress && hasPhone) s.add("high_opportunity");
      break;
    case "b2b_clients":
      if (hasWebsite && hasPhone) s.add("high_opportunity");
      break;
    default:
      if (hasPhone && hasAddress && hasWebsite) s.add("high_opportunity");
  }

  return Array.from(s);
}
