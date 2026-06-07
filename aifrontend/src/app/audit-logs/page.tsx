"use client";

import { useEffect, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://capitalmarket-backend-anubhav-cqbhh2gpaya4btfb.southeastasia-01.azurewebsites.net";

interface AuditLog {
  id: number;
  action?: string;
  system?: string;
  status?: string;
  severity?: string | null;
  message?: string | null;
  created_at?: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/uploads/audit-logs/`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error(error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef3f8] p-12">
      <h1 className="text-5xl font-bold text-[#0f172a]">Audit Logs</h1>
      <p className="mt-4 text-xl text-slate-600">
        View AI investigation, orchestration, and escalation audit history.
      </p>

      <section className="mt-10 rounded-2xl bg-white p-8 shadow-sm">
        {loading ? (
          <p className="text-slate-600">Loading audit logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-slate-600">No audit logs found.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase text-blue-600">
                      {log.system || "SYSTEM"}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">
                      {log.action || "Audit Event"}
                    </h3>
                  </div>

                  <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-bold text-green-700">
                    {log.status || "SUCCESS"}
                  </span>
                </div>

                <p className="mt-3 text-slate-700">
                  {log.message || "Audit event recorded successfully."}
                </p>

                <p className="mt-3 text-sm text-slate-400">
                  {log.created_at || "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}