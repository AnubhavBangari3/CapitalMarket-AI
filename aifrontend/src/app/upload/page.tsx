"use client";

import { useState } from "react";

import UploadBox, {
  UploadedFile,
} from "../../components/upload/UploadBox";

import UploadSummary from "../../components/upload/UploadSummary";

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] =
    useState<UploadedFile | null>(null);

  const [status, setStatus] = useState<
    | "idle"
    | "uploaded"
    | "processing"
    | "completed"
  >("idle");

  const handleFileUpload = (
    file: UploadedFile
  ) => {
    setUploadedFile(file);

    setStatus("uploaded");
  };

  const handleStartAnalysis = () => {
    if (!uploadedFile) {
      return;
    }

    setStatus("processing");

    setTimeout(() => {
      setStatus("completed");
    }, 2500);
  };

  return (
    <div>
      <p className="text-blue-500 font-medium">
        Capital Markets Operations
      </p>

      <h1 className="text-4xl font-bold text-slate-900 mt-4">
        Upload SWIFT Message
      </h1>

      <p className="text-slate-600 mt-3">
        Upload SWIFT messages for
        AI-powered settlement failure
        investigation.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">
        <div className="xl:col-span-2">
          <UploadBox
            uploadedFile={uploadedFile}
            status={status}
            onFileUpload={handleFileUpload}
            onStartAnalysis={
              handleStartAnalysis
            }
          />
        </div>

        <UploadSummary
          uploadedFile={uploadedFile}
          status={status}
        />
      </div>

      {status === "completed" && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            AI Investigation Result
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Result
              title="Detected Issue"
              value="SSI Mismatch"
            />

            <Result
              title="Severity"
              value="High"
            />

            <Result
              title="Action"
              value="Escalate to Ops"
            />
          </div>

          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-5">
            <p className="font-semibold text-red-700">
              Root Cause Analysis
            </p>

            <p className="text-red-600 mt-2">
              Counterparty settlement
              instruction does not
              match registered SSI.
              Validate SSI details and
              trigger operations
              escalation.
            </p>
          </div>
        </div>
      )}
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
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
      <p className="text-slate-500 text-sm">
        {title}
      </p>

      <p className="text-slate-900 font-bold text-lg mt-1">
        {value}
      </p>
    </div>
  );
}