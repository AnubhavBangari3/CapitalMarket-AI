"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchInvestigations,
  type InvestigationResult,
} from "../../lib/api";

type AgentStep = {
  agent_name: string;
  role: string;
  status: string;
  reasoning: string;
  output?: Record<string, unknown>;
};

type AgentWorkflow = {
  workflow_name?: string;
  workflow_type?: string;
  agentic_mode?: string;
  confidence_score?: number;
  final_agent_summary?: string;
  agents?: AgentStep[];
};

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<InvestigationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInvestigations() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchInvestigations();
      setInvestigations(data);
    } catch {
      setError("Unable to load investigations. Please check backend server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvestigations();
  }, []);

  const latestInvestigation = investigations[0];

  const agentWorkflow = useMemo(() => {
    return latestInvestigation?.investigation_data
      ?.agent_workflow as AgentWorkflow | undefined;
  }, [latestInvestigation]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-blue-500 font-medium">Capital Markets Operations</p>

          <h1 className="text-4xl font-bold text-slate-900 mt-4">
            AI Investigations
          </h1>

          <p className="text-slate-600 mt-3">
            View Azure OpenAI RCA, confidence score, risk impact, and multi-agent investigation trace.
          </p>
        </div>

        <button
          onClick={loadInvestigations}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500">Loading investigations...</p>
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-2xl bg-red-50 border border-red-200 p-6 shadow-sm">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && investigations.length === 0 && (
        <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500">
            No investigations found yet. Upload a new non-duplicate SWIFT file first.
          </p>
        </div>
      )}

      {!loading && !error && latestInvestigation && (
        <>
          <section className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                

                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Azure OpenAI RCA Result
                </h2>
              </div>

              <SeverityBadge severity={latestInvestigation.severity} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <InfoCard
                label="Transaction Ref"
                value={latestInvestigation.transaction_ref}
              />

              <InfoCard
                label="Root Cause"
                value={latestInvestigation.root_cause}
              />

              <InfoCard
                label="Category"
                value={latestInvestigation.reason_category}
              />

              <InfoCard
                label="Azure OpenAI"
                value={
                  latestInvestigation.investigation_data?.azure_openai_used
                    ? "USED"
                    : "FALLBACK"
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <InfoCard
                label="Message Type"
                value={latestInvestigation.message_type}
              />

              <InfoCard
                label="Confidence Score"
                value={
                  latestInvestigation.investigation_data?.confidence_score
                    ? `${latestInvestigation.investigation_data.confidence_score}%`
                    : "-"
                }
              />

              <InfoCard
                label="Investigation Status"
                value={latestInvestigation.investigation_status}
              />
            </div>

            <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-5">
              <p className="text-sm font-semibold text-red-700">
                AI RCA Summary
              </p>

              <p className="mt-3 text-slate-900 leading-7">
                {latestInvestigation.ai_summary || "-"}
              </p>
            </div>

            <div className="mt-5 rounded-xl bg-yellow-50 border border-yellow-200 p-5">
              <p className="text-sm font-semibold text-yellow-700">
                Risk Impact
              </p>

              <p className="mt-3 text-slate-900 leading-7">
                {String(
                  latestInvestigation.investigation_data?.risk_impact || "-"
                )}
              </p>
            </div>

            <div className="mt-5 rounded-xl bg-blue-50 border border-blue-200 p-5">
              <p className="text-sm font-semibold text-blue-700">
                Recommended Action
              </p>

              <p className="mt-3 text-slate-900 font-medium leading-7">
                {latestInvestigation.recommended_action || "-"}
              </p>
            </div>
          </section>

          {agentWorkflow && (
            <section className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <p className="text-sm font-semibold text-blue-600">
                Step 10
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Multi-Agent Investigation Trace
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <InfoCard
                  label="Workflow"
                  value={agentWorkflow.workflow_name || "-"}
                />

                <InfoCard
                  label="Agentic Mode"
                  value={agentWorkflow.agentic_mode || "-"}
                />

                <InfoCard
                  label="Workflow Confidence"
                  value={
                    agentWorkflow.confidence_score
                      ? `${agentWorkflow.confidence_score}%`
                      : "-"
                  }
                />
              </div>

              <div className="mt-6 space-y-4">
                {agentWorkflow.agents?.map((agent, index) => (
                  <AgentCard
                    key={`${agent.agent_name}-${index}`}
                    agent={agent}
                    index={index}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="mt-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              All Investigations
            </h2>

            <div className="overflow-x-auto mt-6">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-3">Transaction</th>
                    <th className="py-3 px-3">Message</th>
                    <th className="py-3 px-3">Root Cause</th>
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3">Confidence</th>
                    <th className="py-3 px-3">Azure</th>
                    <th className="py-3 px-3">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {investigations.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 px-3 font-semibold">
                        {item.transaction_ref}
                      </td>
                      <td className="py-3 px-3">{item.message_type}</td>
                      <td className="py-3 px-3">{item.root_cause}</td>
                      <td className="py-3 px-3">
                        <SeverityBadge severity={item.severity} />
                      </td>
                      <td className="py-3 px-3">
                        {item.investigation_data?.confidence_score
                          ? `${item.investigation_data.confidence_score}%`
                          : "-"}
                      </td>
                      <td className="py-3 px-3">
                        {item.investigation_data?.azure_openai_used
                          ? "USED"
                          : "FALLBACK"}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {formatDate(item.created_at)}
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

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-slate-900 break-words">
        {value}
      </p>
    </div>
  );
}

function AgentCard({
  agent,
  index,
}: {
  agent: AgentStep;
  index: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-600">
            Agent {index + 1}
          </p>

          <h3 className="text-xl font-bold text-slate-900 mt-1">
            {agent.agent_name}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {agent.role}
          </p>
        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
          {agent.status}
        </span>
      </div>

      <p className="mt-4 text-slate-700 leading-7">
        {agent.reasoning}
      </p>
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

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}