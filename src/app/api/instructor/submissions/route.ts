import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const studentName = searchParams.get("student_name");

    let url = `${BACKEND_URL}/instructor/submissions`;
    if (studentName) {
      url += `?student_name=${encodeURIComponent(studentName)}`;
    }

    const response = await fetch(url, { method: "GET" });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
