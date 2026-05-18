"use client";

import { useState } from "react";

import UploadBox, {
  UploadedFile,
  UploadStatus,
} from "../../components/upload/UploadBox";

import UploadSummary from "../../components/upload/UploadSummary";

import {
  uploadSwiftFile,
  UploadSwiftFileResponse,
} from "../../lib/api";

type OrchestratedAction = {
  id?: number | string;
  target_system: string;
  action_type?: string;
  title: string;
  status: string;
  external_reference?: string;
};

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] =
    useState<UploadedFile | null>(null);

  const [apiResponse, setApiResponse] =
    useState<UploadSwiftFileResponse | null>(null);

  const [error, setError] = useState("");

  const [status, setStatus] =
    useState<UploadStatus>("idle");

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFile(file);
    setApiResponse(null);
    setError("");
    setStatus("uploaded");
  };

  const handleStartAnalysis = async () => {
    if (!uploadedFile?.file) {
      setError("Please select a SWIFT file first.");
      return;
    }

    try {
      setStatus("processing");
      setError("");
      setApiResponse(null);

      const result = await uploadSwiftFile(uploadedFile.file);

      setApiResponse(result);

      if (result.is_duplicate) {
        setStatus("duplicate");
      } else {
        setStatus("completed");
      }
    } catch (err) {
      setStatus("failed");

      setError(
        err instanceof Error
          ? err.message
          : "File upload failed"
      );
    }
  };

  const isDuplicate = apiResponse?.is_duplicate === true;

  const isFinished =
    status === "completed" || status === "duplicate";

  const investigation = apiResponse?.investigation;
  const actions =
    (apiResponse?.orchestration?.actions_triggered || []) as OrchestratedAction[];

  const jiraAction = actions.find((action) =>
    action.target_system?.toUpperCase().includes("JIRA")
  );

  const teamsAction = actions.find((action) =>
    action.target_system?.toUpperCase().includes("TEAMS")
  );

  const emailAction = actions.find((action) =>
    action.target_system?.toUpperCase().includes("EMAIL")
  );

  return (
    <div>
      <p className="text-blue-500 font-medium">
        Capital Markets Operations
      </p>

      <h1 className="text-4xl font-bold text-slate-900 mt-4">
        Upload SWIFT Message
      </h1>

      <p className="text-slate-600 mt-3">
        Upload SWIFT settlement messages for AI investigation and action orchestration.
      </p>

      {isDuplicate && apiResponse && (
        <div className="mt-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-5 shadow-sm">
          <p className="text-xl font-bold text-yellow-900">
            Duplicate SWIFT Message Detected
          </p>

          <p className="mt-2 text-yellow-800">
            Message Type: <b>{apiResponse.message_type}</b>
            <br />
            Transaction Reference: <b>{apiResponse.transaction_ref}</b>
            <br />
            Existing SWIFT Message ID: <b>{apiResponse.swift_message_id}</b>
            <br />
            No duplicate row was created.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 p-5 shadow-sm">
          <p className="text-xl font-bold text-red-800">
            Upload Failed
          </p>

          <p className="text-red-700 mt-2">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">
        <div className="xl:col-span-2">
          <UploadBox
            uploadedFile={uploadedFile}
            status={status}
            onFileUpload={handleFileUpload}
            onStartAnalysis={handleStartAnalysis}
          />
        </div>

        <UploadSummary
          uploadedFile={uploadedFile}
          status={status}
          apiResponse={apiResponse}
        />
      </div>

      {isFinished && apiResponse && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            {isDuplicate
              ? "Duplicate Message Details"
              : "Upload Completed"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Result title="File ID" value={String(apiResponse.file_id)} />

            <Result
              title="Filename"
              value={apiResponse.filename || "-"}
            />

            <Result
              title="Status"
              value={apiResponse.upload_status || apiResponse.status || "-"}
            />

            <Result
              title="Duplicate"
              value={apiResponse.is_duplicate ? "YES" : "NO"}
            />
          </div>

          <div
            className={`mt-6 rounded-xl border p-5 ${
              isDuplicate
                ? "bg-yellow-50 border-yellow-300"
                : "bg-green-50 border-green-200"
            }`}
          >
            <p
              className={`font-semibold ${
                isDuplicate ? "text-yellow-900" : "text-green-700"
              }`}
            >
              {isDuplicate
                ? "Duplicate SWIFT message detected"
                : "File uploaded successfully"}
            </p>

            <p
              className={`mt-2 ${
                isDuplicate ? "text-yellow-800" : "text-green-600"
              }`}
            >
              {isDuplicate
                ? `${apiResponse.message_type} already exists with transaction reference ${apiResponse.transaction_ref}.`
                : "SWIFT file uploaded, parsed, investigated, and orchestrated successfully."}
            </p>
          </div>

          {investigation && (
            <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-5">
              <p className="font-bold text-red-900 text-xl">
                AI Investigation Result
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Result
                  title="Root Cause"
                  value={investigation.root_cause}
                />

                <Result
                  title="Category"
                  value={investigation.reason_category}
                />

                <Result
                  title="Severity"
                  value={investigation.severity}
                />
              </div>

              <div className="mt-5 rounded-xl bg-white border border-red-100 p-4">
                <p className="text-slate-500 text-sm">
                  Recommended Action
                </p>

                <p className="text-slate-900 font-semibold mt-1">
                  {investigation.recommended_action}
                </p>
              </div>
            </div>
          )}

          {actions.length > 0 && (
            <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-5">
              <p className="font-bold text-blue-900 text-xl">
                Action Orchestrator
              </p>

              <p className="mt-2 text-blue-800">
                AI triggered {actions.length} operational action
                {actions.length > 1 ? "s" : ""} across enterprise systems.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                {actions.map((action, index) => (
                  <div
                    key={action.id || `${action.target_system}-${index}`}
                    className="rounded-xl bg-white border border-blue-100 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-blue-900 font-bold">
                        {action.target_system}
                      </p>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        {action.status}
                      </span>
                    </div>

                    <p className="mt-3 text-slate-900 font-semibold">
                      {action.title}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      {action.external_reference || action.action_type}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {investigation && (
            <EscalationPreview
              transactionRef={apiResponse.transaction_ref || "-"}
              messageType={apiResponse.message_type || "-"}
              rootCause={investigation.root_cause}
              category={investigation.reason_category}
              severity={investigation.severity}
              recommendedAction={investigation.recommended_action}
              jiraAction={jiraAction}
              teamsAction={teamsAction}
              emailAction={emailAction}
            />
          )}

          <AgentTimeline />

          <ParsedSwiftSummary apiResponse={apiResponse} />
        </div>
      )}
    </div>
  );
}

function EscalationPreview({
  transactionRef,
  messageType,
  rootCause,
  category,
  severity,
  recommendedAction,
  jiraAction,
  teamsAction,
  emailAction,
}: {
  transactionRef: string;
  messageType: string;
  rootCause: string;
  category: string;
  severity: string;
  recommendedAction: string;
  jiraAction?: OrchestratedAction;
  teamsAction?: OrchestratedAction;
  emailAction?: OrchestratedAction;
}) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Step 16: Mock Email / Teams Preview UI
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Enterprise Escalation Preview
          </h2>

          <p className="mt-2 text-slate-600">
            This shows exactly what the AI agent sent to Jira, Teams, and Email.
          </p>
        </div>

        <SeverityBadge severity={severity} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6">
        <JiraPreview
          transactionRef={transactionRef}
          rootCause={rootCause}
          category={category}
          severity={severity}
          recommendedAction={recommendedAction}
          action={jiraAction}
        />

        <TeamsPreview
          transactionRef={transactionRef}
          messageType={messageType}
          rootCause={rootCause}
          category={category}
          severity={severity}
          recommendedAction={recommendedAction}
          action={teamsAction}
        />

        <EmailPreview
          transactionRef={transactionRef}
          messageType={messageType}
          rootCause={rootCause}
          category={category}
          severity={severity}
          recommendedAction={recommendedAction}
          action={emailAction}
        />
      </div>
    </div>
  );
}

function JiraPreview({
  transactionRef,
  rootCause,
  category,
  severity,
  recommendedAction,
  action,
}: {
  transactionRef: string;
  rootCause: string;
  category: string;
  severity: string;
  recommendedAction: string;
  action?: OrchestratedAction;
}) {
  const ticketId =
    action?.external_reference || `JIRA-${transactionRef}-${category}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Mock Jira Ticket
          </p>

          <h3 className="mt-2 text-lg font-bold text-slate-900">
            {ticketId}
          </h3>
        </div>

        <StatusPill status={action?.status || "CREATED"} />
      </div>

      <div className="mt-5 space-y-3">
        <PreviewRow label="Issue Type" value="Settlement Failure" />
        <PreviewRow label="Priority" value={getPriority(severity)} />
        <PreviewRow label="Severity" value={severity} />
        <PreviewRow label="Root Cause" value={rootCause} />
        <PreviewRow label="Assigned To" value="Settlement Operations Team" />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-500">
          Description
        </p>

        <p className="mt-2 text-sm text-slate-700">
          Trade {transactionRef} failed because of {rootCause}. AI recommended action:
          {" "}{recommendedAction}
        </p>
      </div>
    </div>
  );
}

function TeamsPreview({
  transactionRef,
  messageType,
  rootCause,
  category,
  severity,
  recommendedAction,
  action,
}: {
  transactionRef: string;
  messageType: string;
  rootCause: string;
  category: string;
  severity: string;
  recommendedAction: string;
  action?: OrchestratedAction;
}) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            Teams Alert Preview
          </p>

          <h3 className="mt-2 text-lg font-bold text-slate-900">
            Settlement Alert
          </h3>
        </div>

        <StatusPill status={action?.status || "SENT"} />
      </div>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="font-bold text-blue-950">
          Settlement failure detected
        </p>

        <p className="mt-3 text-sm text-slate-700">
          Trade <b>{transactionRef}</b> failed due to <b>{rootCause}</b>.
        </p>

        <div className="mt-4 space-y-3">
          <PreviewRow label="Severity" value={severity} />
          <PreviewRow label="Message Type" value={messageType} />
          <PreviewRow label="Category" value={category} />
        </div>

        <div className="mt-4 rounded-xl bg-white border border-blue-100 p-3">
          <p className="text-xs font-semibold text-slate-500">
            AI Recommended Action
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {recommendedAction}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold text-blue-700">
        Channel: #settlement-operations
      </p>
    </div>
  );
}

function EmailPreview({
  transactionRef,
  messageType,
  rootCause,
  category,
  severity,
  recommendedAction,
  action,
}: {
  transactionRef: string;
  messageType: string;
  rootCause: string;
  category: string;
  severity: string;
  recommendedAction: string;
  action?: OrchestratedAction;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
            Email Escalation Preview
          </p>

          <h3 className="mt-2 text-lg font-bold text-slate-900">
            Ops Escalation Email
          </h3>
        </div>

        <StatusPill status={action?.status || "SENT"} />
      </div>

      <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <div className="space-y-3">
          <PreviewRow label="To" value="ops@bank.com" />
          <PreviewRow label="CC" value="treasury@bank.com" />
          <PreviewRow
            label="Subject"
            value={`Settlement Escalation - ${transactionRef}`}
          />
        </div>

        <div className="mt-5 rounded-xl bg-white border border-amber-100 p-4">
          <p className="text-sm text-slate-700">
            Hello Operations Team,
          </p>

          <p className="mt-3 text-sm text-slate-700">
            AI investigation detected a settlement failure for trade{" "}
            <b>{transactionRef}</b>.
          </p>

          <p className="mt-3 text-sm text-slate-700">
            Message Type: <b>{messageType}</b>
          </p>

          <p className="mt-3 text-sm text-slate-700">
            Root Cause: <b>{rootCause}</b>
          </p>

          <p className="mt-3 text-sm text-slate-700">
            Category: <b>{category}</b>
          </p>

          <p className="mt-3 text-sm text-slate-700">
            Severity: <b>{severity}</b>
          </p>

          <p className="mt-3 text-sm text-slate-700">
            Recommended Action: {recommendedAction}
          </p>
        </div>
      </div>
    </div>
  );
}

function AgentTimeline() {
  const steps = [
    "File uploaded",
    "Message parsed",
    "Failure detected",
    "AI investigation completed",
    "Jira ticket created",
    "Teams alert generated",
    "Email escalation generated",
    "Audit trail updated",
  ];

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-2xl font-bold text-slate-900">
        AI Agent Workflow Timeline
      </h2>

      <div className="mt-6 space-y-4">
        {steps.map((step, index) => (
          <div key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-4 w-4 rounded-full bg-green-500" />
              {index !== steps.length - 1 && (
                <div className="h-8 w-px bg-slate-200" />
              )}
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                {step}
              </p>

              <p className="text-sm text-slate-500">
                Step {index + 1} completed successfully.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParsedSwiftSummary({
  apiResponse,
}: {
  apiResponse: UploadSwiftFileResponse;
}) {
  return (
    <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-5">
      <p className="font-bold text-slate-900 text-xl">
        Parsed SWIFT Summary
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        <Result
          title="Message Type"
          value={apiResponse.message_type || "-"}
        />

        <Result
          title="Transaction Ref"
          value={apiResponse.transaction_ref || "-"}
        />

        <Result
          title="SWIFT Message ID"
          value={String(apiResponse.swift_message_id || "-")}
        />

        <Result
          title="Related Ref"
          value={apiResponse.related_ref || "-"}
        />

        <Result
          title="ISIN"
          value={apiResponse.isin || "-"}
        />

        <Result
          title="Security"
          value={apiResponse.security_name || "-"}
        />

        <Result
          title="Settlement Status"
          value={apiResponse.settlement_status || "-"}
        />

        <Result
          title="Quantity"
          value={String(apiResponse.quantity || "-")}
        />

        <Result
          title="Amount"
          value={`${apiResponse.currency || ""} ${apiResponse.settlement_amount || "-"}`}
        />
      </div>
    </div>
  );
}

function Result({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-slate-500 text-sm">
        {title}
      </p>

      <p className="mt-2 text-slate-900 font-bold">
        {value}
      </p>
    </div>
  );
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">
        {value}
      </span>
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

function getPriority(severity: string) {
  if (severity === "CRITICAL") return "P1";
  if (severity === "HIGH") return "P2";
  if (severity === "MEDIUM") return "P3";
  return "P4";
}