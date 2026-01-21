import { NextResponse } from "next/server";

const getAe3gisUrl = () => {
  const url = process.env.AE3GIS_URL;
  if (!url) {
    throw new Error("AE3GIS_URL environment variable is not set");
  }
  return url;
};

// POST /api/gns3/dhcp - Assign DHCP
export async function POST(req: Request) {
  try {
    const AE3GIS_URL = getAe3gisUrl();
    const body = await req.json();
    const { dhcp_server_nodes, client_nodes, gns3_server_ip } = body;

    if (!dhcp_server_nodes || !client_nodes) {
      return NextResponse.json(
        { error: "dhcp_server_nodes and client_nodes are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${AE3GIS_URL}/dhcp/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dhcp_server_nodes, client_nodes, gns3_server_ip }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to assign DHCP: ${response.status} ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "DHCP assignment failed";
    console.error("DHCP assign error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
