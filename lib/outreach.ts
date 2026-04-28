import type { Lead } from "./leadTypes";

export function getOutreachAngle(lead: Lead): string {
  const parts: string[] = [];

  if (!lead.website) {
    parts.push(
      "This business has no website, making it a strong opportunity for a web agency or someone offering online presence services."
    );
  } else {
    parts.push(
      "This business already has a website, which still makes it useful for SEO, ads, redesign, or marketing outreach."
    );
  }

  if (lead.phone && lead.address) {
    parts.push(
      "It has enough contact data (phone and address) for direct outreach — a cold call or in-person visit are both viable."
    );
  } else if (lead.phone) {
    parts.push("A phone number is available, so cold calling is viable.");
  } else if (lead.address) {
    parts.push(
      "An address is known, so door-to-door or physical mail could work."
    );
  } else {
    parts.push(
      "Contact data is limited — consider enriching via LinkedIn or a business registry before outreach."
    );
  }

  if (lead.score >= 85) {
    parts.push("This is a high-priority lead — reach out first.");
  } else if (lead.score < 50) {
    parts.push(
      "Signal strength is low — likely worth skipping or enriching first."
    );
  }

  return parts.join(" ");
}
