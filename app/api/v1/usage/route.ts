import { NextResponse } from "next/server";
import { readBearer, resolveApiKey } from "@/lib/apiKeys";
import { getPlanLimits } from "@/lib/plans";
import { getMonthlyUsage } from "@/lib/quota";
import { getRateLimitKey, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = readBearer(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json(
      { error: "Missing Authorization: Bearer <token>", code: "unauthorized" },
      { status: 401 }
    );
  }
  const apiKey = await resolveApiKey(token);
  if (!apiKey) {
    return NextResponse.json(
      { error: "Invalid or revoked API key", code: "unauthorized" },
      { status: 401 }
    );
  }

  const rl = rateLimit(
    `usage:${getRateLimitKey(request, apiKey.userId)}`,
    60,
    60_000
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests", code: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) },
      }
    );
  }

  const limits = getPlanLimits(apiKey.plan);
  const usage = await getMonthlyUsage(apiKey.userId);

  return NextResponse.json({
    plan: apiKey.plan,
    apiKey: { prefix: apiKey.keyPrefix },
    credits: {
      limit: limits.apiCredits,
      used: usage.apiCredits,
      remaining: Math.max(0, limits.apiCredits - usage.apiCredits),
    },
    apiSearches: usage.apiSearches,
    uiUsage: {
      searches: usage.searches,
      leads: usage.leads,
      exports: usage.exports,
    },
    cycle: { start: usage.cycleStart, end: usage.cycleEnd },
  });
}
