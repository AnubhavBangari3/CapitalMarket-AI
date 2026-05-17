import { UploadedFile, UploadStatus } from "./UploadBox";
import { UploadSwiftFileResponse } from "../../lib/api";

type Props = {
  uploadedFile: UploadedFile | null;
  status: UploadStatus;
  apiResponse?: UploadSwiftFileResponse | null;
};

export default function UploadSummary({
  uploadedFile,
  status,
  apiResponse = null,
}: Props) {
  const investigation = apiResponse?.investigation;
  const actions = apiResponse?.orchestration?.actions_triggered || [];

  const statusLabel =
    status === "duplicate"
      ? "DUPLICATE"
      : status === "failed"
      ? "FAILED"
      : status.toUpperCase();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Upload Summary
        </h2>

        <div className="space-y-5">
          <Info label="File Name" value={uploadedFile?.name || "-"} />
          <Info label="File Type" value={uploadedFile?.type || "-"} />
          <Info
            label="File Size"
            value={
              uploadedFile
                ? `${(uploadedFile.size / 1024).toFixed(2)} KB`
                : "-"
            }
          />
          <Info label="Status" value={statusLabel} />
          <Info label="Message Type" value={apiResponse?.message_type || "-"} />
          <Info label="Trade Ref" value={apiResponse?.transaction_ref || "-"} />
        </div>
      </div>

      {investigation && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            AI Investigation
          </h2>

          <div className="space-y-5">
            <Info label="Root Cause" value={investigation.root_cause} />
            <Info label="Category" value={investigation.reason_category} />
            <Info label="Severity" value={investigation.severity} />
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-sm text-slate-500 font-semibold">
              Recommended Action
            </p>

            <p className="mt-2 text-slate-900 font-medium">
              {investigation.recommended_action}
            </p>
          </div>
        </div>
      )}

      {actions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Action Orchestrator
          </h2>

          <div className="space-y-4">
            {actions.map((action) => (
              <div
                key={action.id}
                className="rounded-xl bg-slate-50 border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-slate-900">
                    {action.target_system}
                  </p>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    {action.status}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {action.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {action.action_type}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Agent Steps
        </h2>

        <Step title="File uploaded" active={!!uploadedFile} />

        <Step
          title="Message parsed"
          active={
            status === "processing" ||
            status === "completed" ||
            status === "duplicate"
          }
        />

        <Step
          title={status === "duplicate" ? "Duplicate detected" : "Failure detected"}
          active={status === "completed" || status === "duplicate"}
          warning={status === "duplicate"}
        />

        <Step title="Investigation completed" active={!!investigation} />

        <Step title="Actions orchestrated" active={actions.length > 0} />

        <Step title="Jira / Teams / Email triggered" active={actions.length > 0} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-base">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900 text-right">{value}</span>
    </div>
  );
}

function Step({
  title,
  active,
  warning = false,
}: {
  title: string;
  active: boolean;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 pb-5">
      <div
        className={`h-4 w-4 rounded-full ${
          active ? (warning ? "bg-yellow-500" : "bg-green-500") : "bg-slate-300"
        }`}
      />

      <p className={active ? "text-slate-900 font-semibold" : "text-slate-400"}>
        {title}
      </p>
    </div>
  );
}