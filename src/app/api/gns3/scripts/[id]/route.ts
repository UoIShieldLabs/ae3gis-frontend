import { NextResponse } from "next/server";

const getAe3gisUrl = () => {
  const url = process.env.AE3GIS_URL;
  if (!url) {
    throw new Error("AE3GIS_URL environment variable is not set");
  }
  return url;
};

// GET /api/gns3/scripts/[id] - Get a script by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const AE3GIS_URL = getAe3gisUrl();

    const response = await fetch(`${AE3GIS_URL}/scripts/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Script not found" }, { status: 404 });
      }
      const text = await response.text();
      throw new Error(`Failed to fetch script: ${response.status} ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch script";
    console.error("Fetch script error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/gns3/scripts/[id] - Update a script
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const AE3GIS_URL = getAe3gisUrl();
    const body = await req.json();

    const response = await fetch(`${AE3GIS_URL}/scripts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Script not found" }, { status: 404 });
      }
      const text = await response.text();
      throw new Error(`Failed to update script: ${response.status} ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update script";
    console.error("Update script error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/gns3/scripts/[id] - Delete a script
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const AE3GIS_URL = getAe3gisUrl();

    const response = await fetch(`${AE3GIS_URL}/scripts/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Script not found" }, { status: 404 });
      }
      const text = await response.text();
      throw new Error(`Failed to delete script: ${response.status} ${text}`);
    }

    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete script";
    console.error("Delete script error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
