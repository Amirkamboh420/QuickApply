import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const where = role && role !== "all" ? { role } : {};
  const users = await db.user.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await db.user.create({
    data: {
      email: body.email,
      name: body.name,
      role: body.role ?? "job_seeker",
      plan: body.plan ?? "free",
      avatarColor: body.avatarColor ?? "#0077B6",
    },
  });
  return NextResponse.json(created);
}
