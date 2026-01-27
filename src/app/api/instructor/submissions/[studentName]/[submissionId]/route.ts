import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ studentName: string; submissionId: string }> }
) {
  try {
    const { studentName, submissionId } = await params;

    const response = await fetch(
      `${BACKEND_URL}/instructor/submissions/${encodeURIComponent(studentName)}/${encodeURIComponent(submissionId)}`,
      { method: "GET" }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ studentName: string; submissionId: string }> }
) {
  try {
    const { studentName, submissionId } = await params;

    const response = await fetch(
      `${BACKEND_URL}/instructor/submissions/${encodeURIComponent(studentName)}/${encodeURIComponent(submissionId)}`,
      { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Failed to delete submission" },
      { status: 500 }
    );
  }
}
