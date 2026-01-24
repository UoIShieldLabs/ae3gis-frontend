"use client";

import { usePathname, useRouter } from "next/navigation";
import { Network, Settings, LogOut } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const tabs = [
  { name: "Scenarios", href: "/student/scenarios", icon: Network },
  { name: "Settings", href: "/student/settings", icon: Settings },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[var(--card-bg)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <Network className="w-6 h-6 text-[var(--accent)]" />
              <span className="font-semibold text-lg">
                AE<sup className="text-sm">3</sup>GIS
              </span>
              <span className="text-xs bg-[var(--success)] text-white px-2 py-0.5 rounded">
                Student
              </span>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Switch Role
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => router.push(tab.href)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
