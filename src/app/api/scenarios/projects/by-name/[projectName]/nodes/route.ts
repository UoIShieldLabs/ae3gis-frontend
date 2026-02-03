import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// DELETE /api/scenarios/projects/by-name/[projectName]/nodes - Delete all nodes by project name (maps to /topologies on backend)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectName: string }> }
) {
  try {
    const { projectName } = await params;
    const body = await request.json();

    // Call the backend's by-name endpoint
    const response = await fetch(
      `${BACKEND_URL}/topologies/projects/by-name/${encodeURIComponent(projectName)}/nodes`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Failed to delete project nodes" }));
      return NextResponse.json(
        error,
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting project nodes by name:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
