import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const referrals = await db.referral.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(referrals);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await db.referral.create({
    data: {
      name: body.name,
      company: body.company ?? null,
      role: body.role ?? null,
      email: body.email ?? null,
      linkedinUrl: body.linkedinUrl ?? null,
      phone: body.phone ?? null,
      notes: body.notes ?? null,
      status: body.status ?? "active",
    },
  });
  return NextResponse.json(created);
}
