"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentPushPage() {
  const router = useRouter();

  useEffect(() => {
    // Students cannot push scripts, redirect to scenarios
    router.replace("/student/scenarios");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
    </div>
  );
}
