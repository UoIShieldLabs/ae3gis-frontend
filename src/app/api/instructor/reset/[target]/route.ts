import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ target: string }> }
) {
  try {
    const { target } = await params;

    // target can be "submissions", "students", or "all"
    const validTargets = ["submissions", "students", "all"];
    if (!validTargets.includes(target)) {
      return NextResponse.json(
        { detail: `Invalid reset target: ${target}` },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/instructor/reset/${target}`,
      { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Failed to reset" },
      { status: 500 }
    );
  }
}
