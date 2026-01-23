import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// GET /api/scenarios/[id] - Get a single scenario
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/scenarios/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || "Scenario not found" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching scenario:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}

// PATCH /api/scenarios/[id] - Update a scenario
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/scenarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || "Failed to update scenario" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating scenario:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}

// DELETE /api/scenarios/[id] - Delete a scenario
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/scenarios/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || "Failed to delete scenario" },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
