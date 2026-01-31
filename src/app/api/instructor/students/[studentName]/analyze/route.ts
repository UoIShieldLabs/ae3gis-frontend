import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentName: string }> }
) {
  const { studentName } = await params;
  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get("submission_id");
  const live = searchParams.get("live");

  // Build query string for backend
  const queryParams = new URLSearchParams();
  if (submissionId) queryParams.set("submission_id", submissionId);
  if (live) queryParams.set("live", live);

  const queryString = queryParams.toString();
  const backendUrl = `http://localhost:8000/instructor/students/${encodeURIComponent(
    studentName
  )}/analyze${queryString ? `?${queryString}` : ""}`;

  try {
    // Get credentials from request body if provided
    const body = await request.json().catch(() => ({}));
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add basic auth if credentials provided
    if (body.username && body.password) {
      const credentials = Buffer.from(
        `${body.username}:${body.password}`
      ).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    const response = await fetch(backendUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to analyze submission" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error analyzing submission:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend server" },
      { status: 500 }
    );
  }
}
