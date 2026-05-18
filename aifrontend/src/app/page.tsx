"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAuditLogs,
  fetchInvestigations,
  fetchTrades,
  type AuditLog,
  type InvestigationResult,
  type OrchestratedAction,
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

  const latestInvestigation = investigations[0];

  const openTrades = useMemo(
    () => trades.filter((trade) => trade.trade_status === "OPEN").length,
    [trades]
  );

  const failedTrades = useMemo(
    () => trades.filter((trade) => trade.trade_status === "FAILED").length,
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

  const totalActions = useMemo(
    () =>
      investigations.reduce(
        (count, item) => count + (item.orchestrated_actions?.length || 0),
        0
      ),
    [investigations]
  );

  const systemsInvolved = useMemo(
    () => new Set(auditLogs.map((log) => log.system)).size,
    [auditLogs]
  );

  const latestAuditLogs = auditLogs.slice(0, 12);

  const jiraAction = latestInvestigation?.orchestrated_actions?.find((action) =>
    action.target_system?.toUpperCase().includes("JIRA")
  );

  const teamsAction = latestInvestigation?.orchestrated_actions?.find((action) =>
    action.target_system?.toUpperCase().includes("TEAMS")
  );

  const emailAction = latestInvestigation?.orchestrated_actions?.find((action) =>
    action.target_system?.toUpperCase().includes("EMAIL")
  );

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-blue-500 font-medium">
            Capital Markets Operations
          </p>

          <h1 className="text-4xl font-bold text-slate-900 mt-4">
            AI Settlement Command Center
          </h1>

          <p className="text-slate-600 mt-3">
            Monitor settlement failures, AI root cause analysis, action orchestration, and audit history.
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
        <MetricCard title="Total Trades" value={String(trades.length)} />
        <MetricCard title="Open Trades" value={String(openTrades)} warning />
        <MetricCard title="Failed Trades" value={String(failedTrades)} danger />
        <MetricCard title="Settled Trades" value={String(settledTrades)} success />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <MetricCard title="AI Investigations" value={String(investigations.length)} />
        <MetricCard title="High Risk Cases" value={String(highRiskCases)} danger />
        <MetricCard title="Actions Triggered" value={String(totalActions)} success />
        <MetricCard title="Systems Involved" value={String(systemsInvolved)} />
      </div>

      {loading && (
        <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-6">
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-2xl bg-red-50 border border-red-200 p-6">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Step 15: RCA + Severity View
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    Latest AI Investigation
                  </h2>
                </div>

                {latestInvestigation && (
                  <SeverityBadge severity={latestInvestigation.severity} />
                )}
              </div>

              {!latestInvestigation ? (
                <p className="mt-6 text-slate-500">
                  No investigation found yet. Upload a SWIFT settlement message to generate RCA.
                </p>
              ) : (
                <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InfoBox
                      label="Transaction Ref"
                      value={latestInvestigation.transaction_ref}
                    />
                    <InfoBox
                      label="Message Type"
                      value={latestInvestigation.message_type}
                    />
                    <InfoBox
                      label="Security"
                      value={latestInvestigation.security_name || "-"}
                    />
                    <InfoBox
                      label="ISIN"
                      value={latestInvestigation.isin || "-"}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <InfoBox
                      label="Root Cause"
                      value={latestInvestigation.root_cause}
                    />
                    <InfoBox
                      label="Reason Category"
                      value={latestInvestigation.reason_category}
                    />
                    <InfoBox
                      label="Investigation Status"
                      value={latestInvestigation.investigation_status}
                    />
                  </div>

                  <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-5">
                    <p className="text-sm font-semibold text-red-700">
                      AI Root Cause Summary
                    </p>

                    <p className="mt-2 text-slate-900 font-medium">
                      {latestInvestigation.ai_summary ||
                        `Trade ${latestInvestigation.transaction_ref} failed due to ${latestInvestigation.root_cause}.`}
                    </p>
                  </div>

                  <div className="mt-5 rounded-xl bg-blue-50 border border-blue-200 p-5">
                    <p className="text-sm font-semibold text-blue-700">
                      Recommended Action
                    </p>

                    <p className="mt-2 text-slate-900 font-medium">
                      {latestInvestigation.recommended_action ||
                        "No recommended action available."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">
                Audit Summary
              </h2>

              <div className="mt-6 space-y-4">
                <InfoBox
                  label="Total Audit Events"
                  value={String(auditLogs.length)}
                />

                <InfoBox
                  label="Successful Events"
                  value={String(
                    auditLogs.filter((log) => log.status === "SUCCESS").length
                  )}
                />

                <InfoBox
                  label="Failed Events"
                  value={String(
                    auditLogs.filter((log) => log.status === "FAILED").length
                  )}
                />

                <InfoBox
                  label="Systems Involved"
                  value={String(systemsInvolved)}
                />
              </div>
            </div>
          </section>

          {latestInvestigation && (
            <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Step 13: Dashboard Timeline
                </p>

                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  AI Agent Workflow
                </h2>

                <p className="text-slate-600 mt-2">
                  Visual flow of how the AI agent parsed, investigated, decided, and orchestrated actions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4 mt-6">
                <WorkflowStep title="Upload" subtitle="Message received" active />
                <WorkflowStep title="Parse" subtitle="SWIFT extracted" active />
                <WorkflowStep title="Detect" subtitle="Failure found" active />
                <WorkflowStep title="Investigate" subtitle="RCA generated" active />
                <WorkflowStep title="Classify" subtitle={latestInvestigation.severity} active />
                <WorkflowStep title="Jira" subtitle={jiraAction?.status || "Created"} active />
                <WorkflowStep title="Teams" subtitle={teamsAction?.status || "Sent"} active />
                <WorkflowStep title="Email" subtitle={emailAction?.status || "Sent"} active />
              </div>
            </section>
          )}

          {latestInvestigation && (
            <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Cross-System Orchestration
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    Jira / Teams / Email Actions
                  </h2>
                </div>

                <SeverityBadge severity={latestInvestigation.severity} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <JiraPreview investigation={latestInvestigation} action={jiraAction} />
                <TeamsPreview investigation={latestInvestigation} action={teamsAction} />
                <EmailPreview investigation={latestInvestigation} action={emailAction} />
              </div>
            </section>
          )}

          <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Audit Timeline
            </h2>

            {latestAuditLogs.length === 0 ? (
              <p className="mt-6 text-slate-500">No audit logs found yet.</p>
            ) : (
              <div className="mt-6 space-y-5">
                {latestAuditLogs.map((log, index) => (
                  <TimelineItem
                    key={log.id}
                    log={log}
                    isLast={index === latestAuditLogs.length - 1}
                  />
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

function WorkflowStep({
  title,
  subtitle,
  active,
}: {
  title: string;
  subtitle: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        active
          ? "bg-green-50 border-green-200"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <div
        className={`h-3 w-3 rounded-full ${
          active ? "bg-green-500" : "bg-slate-300"
        }`}
      />

      <p className="mt-3 font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function JiraPreview({
  investigation,
  action,
}: {
  investigation: InvestigationResult;
  action?: OrchestratedAction;
}) {
  const ticketId =
    action?.external_reference ||
    `JIRA-${investigation.transaction_ref}-${investigation.reason_category}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Mock Jira Ticket
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">{ticketId}</h3>
        </div>

        <StatusPill status={action?.status || "CREATED"} />
      </div>

      <div className="mt-5 space-y-3">
        <PreviewRow label="Issue Type" value="Settlement Failure" />
        <PreviewRow label="Priority" value={getPriority(investigation.severity)} />
        <PreviewRow label="Severity" value={investigation.severity} />
        <PreviewRow label="Root Cause" value={investigation.root_cause} />
        <PreviewRow label="Assigned To" value="Settlement Operations Team" />
      </div>

      <div className="mt-5 rounded-xl bg-white border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-500">Description</p>

        <p className="mt-2 text-sm text-slate-700">
          Trade {investigation.transaction_ref} failed due to{" "}
          {investigation.root_cause}. AI investigation recommends:{" "}
          {investigation.recommended_action}
        </p>
      </div>
    </div>
  );
}

function TeamsPreview({
  investigation,
  action,
}: {
  investigation: InvestigationResult;
  action?: OrchestratedAction;
}) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Teams Alert Preview
          </p>

          <h3 className="mt-2 text-lg font-bold text-slate-900">
            Settlement Alert
          </h3>
        </div>

        <StatusPill status={action?.status || "SENT"} />
      </div>

      <div className="mt-5 rounded-xl bg-white border border-blue-100 p-4">
        <p className="font-bold text-slate-900">
          Settlement failure detected
        </p>

        <p className="mt-3 text-sm text-slate-700">
          Trade <b>{investigation.transaction_ref}</b> failed because of{" "}
          <b>{investigation.root_cause}</b>.
        </p>

        <div className="mt-4 space-y-3">
          <PreviewRow label="Severity" value={investigation.severity} />
          <PreviewRow label="Message Type" value={investigation.message_type} />
          <PreviewRow label="Reason" value={investigation.reason_category} />
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold text-blue-700">
        Channel: #settlement-operations
      </p>
    </div>
  );
}

function EmailPreview({
  investigation,
  action,
}: {
  investigation: InvestigationResult;
  action?: OrchestratedAction;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Email Escalation Preview
          </p>

          <h3 className="mt-2 text-lg font-bold text-slate-900">
            Ops Escalation Email
          </h3>
        </div>

        <StatusPill status={action?.status || "SENT"} />
      </div>

      <div className="mt-5 rounded-xl bg-white border border-amber-100 p-4">
        <div className="space-y-3">
          <PreviewRow label="To" value="ops@bank.com" />
          <PreviewRow label="CC" value="treasury@bank.com" />
          <PreviewRow
            label="Subject"
            value={`Settlement Escalation - ${investigation.transaction_ref}`}
          />
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-700">Hello Operations Team,</p>

          <p className="mt-3 text-sm text-slate-700">
            AI investigation detected a settlement failure for trade{" "}
            <strong>{investigation.transaction_ref}</strong>.
          </p>

          <p className="mt-3 text-sm text-slate-700">
            Root Cause: <strong>{investigation.root_cause}</strong>
          </p>

          <p className="mt-3 text-sm text-slate-700">
            Recommended Action: {investigation.recommended_action}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
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

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function TimelineItem({ log, isLast }: { log: AuditLog; isLast: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="h-4 w-4 rounded-full bg-blue-600" />
        {!isLast && <div className="h-full w-px bg-slate-200" />}
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
    CREATED: "bg-green-100 text-green-700",
    SENT: "bg-green-100 text-green-700",
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

function getPriority(severity: string) {
  if (severity === "CRITICAL") return "P1";
  if (severity === "HIGH") return "P2";
  if (severity === "MEDIUM") return "P3";
  return "P4";
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}