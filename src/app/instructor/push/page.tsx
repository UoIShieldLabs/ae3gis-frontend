"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InstructorPushPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified scripts page
    router.replace("/instructor/scripts");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
    </div>
  );
}
