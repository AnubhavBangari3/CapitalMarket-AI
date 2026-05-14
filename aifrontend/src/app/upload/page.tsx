"use client";

import { useState } from "react";

import UploadBox, {
  UploadedFile,
} from "../../components/upload/UploadBox";

import UploadSummary from "../../components/upload/UploadSummary";
import { uploadSwiftFile } from "../../lib/api";

type UploadApiResponse = {
  message: string;
  file_id: number;
  filename: string;
  status: string;
};

export default function UploadPage() {
  const [uploadedFile, setUploadedFile] =
    useState<UploadedFile | null>(null);

  const [apiResponse, setApiResponse] =
    useState<UploadApiResponse | null>(null);

  const [error, setError] = useState<string>("");

  const [status, setStatus] = useState<
    | "idle"
    | "uploaded"
    | "processing"
    | "completed"
  >("idle");

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFile(file);
    setApiResponse(null);
    setError("");
    setStatus("uploaded");
  };

  const handleStartAnalysis = async () => {
    if (!uploadedFile) {
      setError("Please select a SWIFT file first.");
      return;
    }

    const selectedFile = (uploadedFile as UploadedFile & {
      file?: File;
      rawFile?: File;
      originalFile?: File;
    }).file ||
      (uploadedFile as UploadedFile & { rawFile?: File }).rawFile ||
      (uploadedFile as UploadedFile & { originalFile?: File }).originalFile;

    if (!selectedFile) {
      setError(
        "Native File object not found. Please pass the browser File object from UploadBox."
      );
      return;
    }

    try {
      setStatus("processing");
      setError("");
      setApiResponse(null);

      const result = await uploadSwiftFile(selectedFile);

      setApiResponse(result);
      setStatus("completed");
    } catch (err) {
      setStatus("uploaded");
      setError(
        err instanceof Error
          ? err.message
          : "File upload failed. Please try again."
      );
    }
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
        Upload SWIFT messages for AI-powered settlement failure
        investigation.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">
        <div className="xl:col-span-2">
          <UploadBox
            uploadedFile={uploadedFile}
            status={status}
            onFileUpload={handleFileUpload}
            onStartAnalysis={handleStartAnalysis}
          />

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="font-medium text-red-700">Upload failed</p>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}
        </div>

        <UploadSummary
          uploadedFile={uploadedFile}
          status={status}
        />
      </div>

      {status === "completed" && apiResponse && (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Upload Completed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Result
              title="File ID"
              value={String(apiResponse.file_id)}
            />

            <Result
              title="Filename"
              value={apiResponse.filename}
            />

            <Result
              title="Status"
              value={apiResponse.status}
            />
          </div>

          <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-5">
            <p className="font-semibold text-green-700">
              {apiResponse.message}
            </p>

            <p className="text-green-600 mt-2">
              The SWIFT file has been uploaded to the Django DRF backend
              successfully. This completes the frontend-to-backend upload flow.
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

      <p className="text-slate-900 font-bold text-lg mt-1 break-words">
        {value}
      </p>
    </div>
  );
}
