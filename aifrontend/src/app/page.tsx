"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAuditLogs,
  fetchInvestigations,
  fetchTrades,
  type AuditLog,
  type InvestigationResult,
  type Trade,
} from "../lib/api";

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [investigations, setInvestigations] = useState<InvestigationResult[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [tradeData, investigationData, auditData] = await Promise.all([
        fetchTrades(),
        fetchInvestigations(),
        fetchAuditLogs(),
      ]);

      setTrades(tradeData);
      setInvestigations(investigationData);
      setAuditLogs(auditData);
    } catch {
      setError("Unable to load dashboard. Please check backend server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const openTrades = useMemo(
    () => trades.filter((trade) => trade.trade_status === "OPEN").length,
    [trades]
  );

  const settledTrades = useMemo(
    () => trades.filter((trade) => trade.trade_status === "SETTLED").length,
    [trades]
  );

  const highRiskCases = useMemo(
    () =>
      investigations.filter((item) =>
        ["HIGH", "CRITICAL"].includes(item.severity)
      ).length,
    [investigations]
  );

  const latestInvestigation = investigations[0];

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-blue-500 font-medium">Capital Markets Operations</p>

          <h1 className="text-4xl font-bold text-slate-900 mt-4">
            AI Settlement Dashboard
          </h1>

          <p className="text-slate-600 mt-3">
            Monitor settlement failures, RCA status, escalations, and enterprise audit trail.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Refresh Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
        <Card title="Total Trades" value={String(trades.length)} />
        <Card title="Open Trades" value={String(openTrades)} warning />
        <Card title="Settled Trades" value={String(settledTrades)} success />
        <Card title="Risk Cases" value={String(highRiskCases)} danger />
      </div>

      {loading && <p className="mt-8 text-slate-500">Loading dashboard...</p>}

      {error && <p className="mt-8 text-red-600 font-medium">{error}</p>}

      {!loading && !error && (
        <>
          <section className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Latest AI Investigation
              </h2>

              {!latestInvestigation ? (
                <p className="mt-6 text-slate-500">
                  No investigation found yet. Upload a SWIFT message to generate RCA.
                </p>
              ) : (
                <div className="mt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xl font-bold text-slate-900">
                      {latestInvestigation.transaction_ref}
                    </span>
                    <SeverityBadge severity={latestInvestigation.severity} />
                    <StatusPill status={latestInvestigation.investigation_status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <InfoBox label="Message Type" value={latestInvestigation.message_type} />
                    <InfoBox label="Root Cause" value={latestInvestigation.root_cause} />
                    <InfoBox label="Reason Category" value={latestInvestigation.reason_category} />
                  </div>

                  <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-5">
                    <p className="text-sm font-semibold text-slate-500">
                      Recommended Action
                    </p>
                    <p className="mt-2 text-slate-900">
                      {latestInvestigation.recommended_action || "No action available"}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-bold text-slate-900">
                      Cross-System Orchestration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {latestInvestigation.orchestrated_actions.map((action) => (
                        <ActionCard key={action.id} action={action} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Audit Summary
              </h2>

              <div className="mt-6 space-y-4">
                <InfoBox label="Total Audit Events" value={String(auditLogs.length)} />
                <InfoBox
                  label="Successful Events"
                  value={String(auditLogs.filter((log) => log.status === "SUCCESS").length)}
                />
                <InfoBox
                  label="Systems Involved"
                  value={String(new Set(auditLogs.map((log) => log.system)).size)}
                />
              </div>
            </div>
          </section>

          <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              AI Action Timeline
            </h2>

            {auditLogs.length === 0 ? (
              <p className="mt-6 text-slate-500">No audit logs found yet.</p>
            ) : (
              <div className="mt-6 space-y-5">
                {auditLogs.slice(0, 12).map((log, index) => (
                  <TimelineItem key={log.id} log={log} isLast={index === auditLogs.length - 1} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Settlement Trades
            </h2>

            <div className="overflow-x-auto mt-6">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-3">Trade Ref</th>
                    <th className="py-3 px-3">Security</th>
                    <th className="py-3 px-3">ISIN</th>
                    <th className="py-3 px-3">Qty</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Counterparty</th>
                    <th className="py-3 px-3">Direction</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-b border-slate-100">
                      <td className="py-3 px-3 font-semibold">
                        {trade.trade_reference}
                      </td>
                      <td className="py-3 px-3">{trade.security_name}</td>
                      <td className="py-3 px-3 text-slate-500">{trade.isin}</td>
                      <td className="py-3 px-3">{trade.quantity}</td>
                      <td className="py-3 px-3">
                        {trade.currency} {trade.settlement_amount}
                      </td>
                      <td className="py-3 px-3">{trade.counterparty_bic}</td>
                      <td className="py-3 px-3">{trade.settlement_direction}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={trade.trade_status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Card({
  title,
  value,
  danger,
  warning,
  success,
}: {
  title: string;
  value: string;
  danger?: boolean;
  warning?: boolean;
  success?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <p className="text-slate-500">{title}</p>

      <h2
        className={`text-3xl font-bold mt-3 ${
          danger
            ? "text-red-600"
            : warning
            ? "text-yellow-600"
            : success
            ? "text-green-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </h2>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ActionCard({ action }: { action: { target_system: string; title: string; status: string } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-slate-900">{action.target_system}</p>
        <StatusPill status={action.status} />
      </div>
      <p className="mt-3 text-sm text-slate-600">{action.title}</p>
    </div>
  );
}

function TimelineItem({ log }: { log: AuditLog; isLast: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="h-4 w-4 rounded-full bg-blue-600" />
        <div className="h-full w-px bg-slate-200" />
      </div>

      <div className="pb-5 flex-1">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">{log.action}</p>
              <p className="mt-1 text-sm text-slate-500">
                {formatDateTime(log.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <SystemBadge system={log.system} />
              <StatusPill status={log.status} />
            </div>
          </div>

          {log.message && (
            <p className="mt-3 text-sm text-slate-600">{log.message}</p>
          )}

          {log.transaction_ref && (
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Transaction: {log.transaction_ref}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold ${
        styles[severity] || "bg-slate-100 text-slate-700"
      }`}
    >
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-yellow-100 text-yellow-700",
    SETTLED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SUCCESS: "bg-green-100 text-green-700",
    COMPLETED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    SKIPPED: "bg-yellow-100 text-yellow-700",
    INFO: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function SystemBadge({ system }: { system: string }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
      {system}
    </span>
  );
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}
