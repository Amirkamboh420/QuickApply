import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const history = await db.statusHistory.findMany({
    where: { applicationId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(history);
}
