import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");

  const where = site && site !== "all" ? { siteName: site } : {};
  const mappings = await db.fieldMapping.findMany({ where, orderBy: [{ siteName: "asc" }, { fieldName: "asc" }] });
  return NextResponse.json(mappings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await db.fieldMapping.create({
    data: {
      siteName: body.siteName,
      fieldName: body.fieldName,
      selector: body.selector,
      fieldType: body.fieldType ?? "text",
      profileField: body.profileField,
      isCustom: body.isCustom ?? true,
    },
  });
  return NextResponse.json(created);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const updated = await db.fieldMapping.update({
    where: { id: body.id },
    data: {
      selector: body.selector,
      fieldType: body.fieldType,
      profileField: body.profileField,
    },
  });
  return NextResponse.json(updated);
}
