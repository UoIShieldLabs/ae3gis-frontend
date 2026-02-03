import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// GET /api/topologies - List all topologies
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/topologies/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching topologies:", error);
    return NextResponse.json(
      { error: "Failed to fetch topologies" },
      { status: 500 }
    );
  }
}

// POST /api/topologies - Create a new topology
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/topologies/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating topology:", error);
    return NextResponse.json(
      { error: "Failed to create topology" },
      { status: 500 }
    );
  }
}
