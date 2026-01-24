"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentDeployPage() {
  const router = useRouter();

  useEffect(() => {
    // Deploy is now integrated into the scenarios page
    router.replace("/student/scenarios");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
    </div>
  );
}
