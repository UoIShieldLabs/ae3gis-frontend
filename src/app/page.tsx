"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, User, ArrowRight } from "lucide-react";
import ThemeToggle from "./components/ThemeToggle";

type Role = "instructor" | "student";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("instructor");
  const router = useRouter();

  const handleContinue = () => {
    router.push(`/${selectedRole}/scenarios`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Theme toggle in top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo/Title - Styled for login page */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-[var(--accent)] to-purple-500 bg-clip-text text-transparent">
            AE³GIS
          </h1>
          <p className="text-lg text-[var(--muted)] mb-2">
            Agile Emulated Educational Environment for Guided Industrial Security Training
          </p>
          {/* <p className="text-xs text-[var(--muted)]">
            Network Scenario Builder
          </p> */}
        </div>

        {/* Role Selection Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-8">Select your role</h2>

          {/* Role Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setSelectedRole("instructor")}
              className={`flex-1 flex items-center justify-center gap-2 p-6 rounded-lg border-2 transition-all ${
                selectedRole === "instructor"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] hover:border-[var(--muted)]"
              }`}
            >
              <GraduationCap className="w-6 h-6" />
              <span className="font-medium text-lg">Instructor</span>
            </button>
            <button
              onClick={() => setSelectedRole("student")}
              className={`flex-1 flex items-center justify-center gap-2 p-6 rounded-lg border-2 transition-all ${
                selectedRole === "student"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] hover:border-[var(--muted)]"
              }`}
            >
              <User className="w-6 h-6" />
              <span className="font-medium text-lg">Student</span>
            </button>
          </div>

          {/* Role Description */}
          {/* <div className="bg-[var(--input-bg)] rounded-lg p-4 mb-6">
            {selectedRole === "instructor" ? (
              <div>
                <h3 className="font-medium mb-2">Instructor Access</h3>
                <ul className="text-sm text-[var(--muted)] space-y-1">
                  <li>• Create and manage scenarios</li>
                  <li>• Manage script library &amp; push scripts</li>
                  <li>• Deploy and test scenarios</li>
                </ul>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">Student Access</h3>
                <ul className="text-sm text-[var(--muted)] space-y-1">
                  <li>• Browse available scenarios</li>
                  <li>• Deploy scenarios to your GNS3 server</li>
                </ul>
              </div>
            )}
          </div> */}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Continue as {selectedRole === "instructor" ? "Instructor" : "Student"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer note */}
        {/* <p className="text-center text-sm text-[var(--muted)] mt-6">
          No authentication required (prototype mode)
        </p> */}
      </div>
    </div>
  );
}
