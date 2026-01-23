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
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">GNS3 Scenario Builder</h1>
          <p className="text-[var(--muted)]">
            Create and deploy network lab scenarios
          </p>
        </div>

        {/* Role Selection Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Select your role</h2>

          {/* Role Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setSelectedRole("instructor")}
              className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                selectedRole === "instructor"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] hover:border-[var(--muted)]"
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="font-medium">Instructor</span>
            </button>
            <button
              onClick={() => setSelectedRole("student")}
              className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                selectedRole === "student"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--border)] hover:border-[var(--muted)]"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Student</span>
            </button>
          </div>

          {/* Role Description */}
          <div className="bg-[var(--input-bg)] rounded-lg p-4 mb-6">
            {selectedRole === "instructor" ? (
              <div>
                <h3 className="font-medium mb-2">Instructor Access</h3>
                <ul className="text-sm text-[var(--muted)] space-y-1">
                  <li>• Create and manage scenarios</li>
                  <li>• Manage script library</li>
                  <li>• Deploy and test scenarios</li>
                  <li>• Push scripts to running nodes</li>
                </ul>
              </div>
            ) : (
              <div>
                <h3 className="font-medium mb-2">Student Access</h3>
                <ul className="text-sm text-[var(--muted)] space-y-1">
                  <li>• Browse available scenarios</li>
                  <li>• Deploy scenarios to your GNS3 server</li>
                  <li>• Push scripts to running nodes</li>
                </ul>
              </div>
            )}
          </div>

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
        <p className="text-center text-sm text-[var(--muted)] mt-6">
          No authentication required (prototype mode)
        </p>
      </div>
    </div>
  );
}
