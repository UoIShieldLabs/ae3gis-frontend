import { NextResponse } from "next/server";

const getAe3gisUrl = () => {
  const url = process.env.AE3GIS_URL;
  if (!url) {
    throw new Error("AE3GIS_URL environment variable is not set");
  }
  return url;
};

// GET /api/gns3/scripts - List all scripts
export async function GET() {
  try {
    const AE3GIS_URL = getAe3gisUrl();

    const response = await fetch(`${AE3GIS_URL}/scripts/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch scripts: ${response.status} ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch scripts";
    console.error("Fetch scripts error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/gns3/scripts - Create a new script
export async function POST(req: Request) {
  try {
    const AE3GIS_URL = getAe3gisUrl();
    const body = await req.json();
    const { name, description, content } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${AE3GIS_URL}/scripts/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, content }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to create script: ${response.status} ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create script";
    console.error("Create script error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
