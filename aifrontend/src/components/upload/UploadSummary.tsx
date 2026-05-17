import { UploadedFile, UploadStatus } from "./UploadBox";

type Props = {
  uploadedFile: UploadedFile | null;
  status: UploadStatus;
};

export default function UploadSummary({ uploadedFile, status }: Props) {
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
            value={uploadedFile ? `${(uploadedFile.size / 1024).toFixed(2)} KB` : "-"}
          />
          <Info label="Status" value={statusLabel} />
          <Info label="Storage Target" value="Azure Blob Storage" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Agent Steps
        </h2>

        <Step title="File uploaded" active={!!uploadedFile} />
        <Step
          title="Message parsed"
          active={status === "processing" || status === "completed" || status === "duplicate"}
        />
        <Step
          title={status === "duplicate" ? "Duplicate detected" : "Failure detected"}
          active={status === "completed" || status === "duplicate"}
          warning={status === "duplicate"}
        />
        <Step
          title="RCA generated"
          active={status === "completed"}
        />
        <Step
          title="Escalation prepared"
          active={status === "completed"}
        />
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