import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ studentName: string }> }
) {
  try {
    const { studentName } = await params;

    const response = await fetch(
      `${BACKEND_URL}/logging/${encodeURIComponent(studentName)}/status`,
      { method: "GET" }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Failed to get logging status" },
      { status: 500 }
    );
  }
}
