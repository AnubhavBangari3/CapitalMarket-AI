"use client";

import { useEffect, useState } from "react";
import { fetchInvestigations, InvestigationResult } from "../../lib/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<InvestigationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const investigations = await fetchInvestigations();

      const highRisk = investigations.filter((item) =>
        ["HIGH", "CRITICAL"].includes(item.severity)
      );

      setAlerts(highRisk.length > 0 ? highRisk : investigations.slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Alerts</h1>
          <p className="text-slate-600 mt-3">
            High-risk settlement failures and AI-triggered escalation alerts.
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Refresh
        </button>
      </div>

      <div className="mt-8 space-y-5">
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-slate-500">
            Loading alerts...
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-6 shadow-sm text-red-600 font-semibold">
            {error}
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-slate-500">
            No alerts found.
          </div>
        )}

        {!loading &&
          !error &&
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-blue-600">
                    AI Settlement Alert
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900 mt-2">
                    {alert.root_cause}
                  </h2>

                  <p className="text-slate-600 mt-2">
                    Trade {alert.transaction_ref} requires operational review.
                  </p>
                </div>

                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                    alert.severity === "CRITICAL"
                      ? "bg-red-100 text-red-700"
                      : alert.severity === "HIGH"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {alert.severity}
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mt-6">
                <Info label="Message Type" value={alert.message_type} />
                <Info label="Category" value={alert.reason_category} />
                <Info label="Security" value={alert.security_name || "-"} />
                <Info label="Status" value={alert.investigation_status} />
              </div>

              <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-sm font-bold text-slate-500">
                  Recommended Action
                </p>

                <p className="text-slate-900 font-medium mt-2">
                  {alert.recommended_action || "Operational follow-up required."}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-slate-900 font-bold mt-2">{value}</p>
    </div>
  );
}