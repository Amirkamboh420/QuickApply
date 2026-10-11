import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const sites = await db.siteTemplate.findMany({ orderBy: { siteName: "asc" } });
  return NextResponse.json(sites);
}
