import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const filePath = path.join(process.cwd(), "public/folderStructure.json");

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Folder structure not found. Run 'app1 run' first." }, { status: 404 });
  }

  const data = fs.readFileSync(filePath, "utf-8");
  return NextResponse.json(JSON.parse(data));
}
