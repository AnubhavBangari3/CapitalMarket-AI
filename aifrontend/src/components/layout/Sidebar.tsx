"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    href: "/",
  },
  {
    label: "Upload SWIFT",
    href: "/upload",
  },
  {
    label: "Investigations",
    href: "/investigations",
  },
  {
    label: "Trades",
    href: "/trades",
  },
  {
    label: "Alerts",
    href: "/alerts",
  },
  {
    label: "Audit Logs",
    href: "/audit-logs",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 min-h-screen bg-[#07111f] border-r border-slate-800 p-6 hidden md:flex flex-col justify-between">
      <div>
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-white">
            Capital Market AI
          </h1>

          <p className="text-slate-400 mt-1">
            Resolution System
          </p>
        </div>

        <nav className="space-y-3">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-5 py-4 rounded-xl text-base transition ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="text-sm text-slate-400">
        <p className="font-semibold text-white">
          Ops User
        </p>

        <p>
          Operations
        </p>
      </div>
    </aside>
  );
}