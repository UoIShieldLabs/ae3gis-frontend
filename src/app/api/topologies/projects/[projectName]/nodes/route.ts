import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// GET /api/topologies/projects/[projectName]/nodes - List nodes in a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectName: string }> }
) {
  try {
    const { projectName } = await params;
    const { searchParams } = new URL(request.url);
    
    // Build query string
    const queryParams = new URLSearchParams();
    const serverIp = searchParams.get("server_ip");
    const serverPort = searchParams.get("server_port");
    const username = searchParams.get("username");
    const password = searchParams.get("password");

    if (serverIp) queryParams.set("server_ip", serverIp);
    if (serverPort) queryParams.set("server_port", serverPort);
    if (username) queryParams.set("username", username);
    if (password) queryParams.set("password", password);

    const url = `${BACKEND_URL}/topologies/projects/${encodeURIComponent(projectName)}/nodes?${queryParams}`;
    
    const response = await fetch(url, {
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
    console.error("Error fetching project nodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch project nodes" },
      { status: 500 }
    );
  }
}
