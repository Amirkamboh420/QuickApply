import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const userEmail = searchParams.get("userEmail");
  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (userEmail) where.userEmail = userEmail;
  const tickets = await db.supportTicket.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await db.supportTicket.create({
    data: {
      userId: body.userId ?? null,
      userEmail: body.userEmail,
      subject: body.subject,
      category: body.category ?? "general",
      message: body.message,
      priority: body.priority ?? "normal",
    },
  });
  return NextResponse.json(created);
}
