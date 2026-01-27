import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ studentName: string }> }
) {
  try {
    const { studentName } = await params;
    const searchParams = req.nextUrl.searchParams;

    // Build query string from search params
    const queryParams = new URLSearchParams();
    if (searchParams.get("gns3_server_ip")) {
      queryParams.set("gns3_server_ip", searchParams.get("gns3_server_ip")!);
    }
    if (searchParams.get("gns3_server_port")) {
      queryParams.set("gns3_server_port", searchParams.get("gns3_server_port")!);
    }
    if (searchParams.get("username")) {
      queryParams.set("username", searchParams.get("username")!);
    }
    if (searchParams.get("password")) {
      queryParams.set("password", searchParams.get("password")!);
    }

    const response = await fetch(
      `${BACKEND_URL}/logging/${encodeURIComponent(studentName)}/teardown?${queryParams.toString()}`,
      { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Failed to teardown logging" },
      { status: 500 }
    );
  }
}
