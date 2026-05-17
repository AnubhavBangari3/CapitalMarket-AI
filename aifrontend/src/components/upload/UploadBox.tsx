"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

export type UploadStatus =
  | "idle"
  | "uploaded"
  | "processing"
  | "completed"
  | "duplicate"
  | "failed";

export type UploadedFile = {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  file: File;
};

type Props = {
  uploadedFile?: UploadedFile | null;
  status?: UploadStatus;
  onFileUpload: (file: UploadedFile) => void;
  onStartAnalysis: () => void;
};

export default function UploadBox({
  uploadedFile = null,
  status = "idle",
  onFileUpload,
  onStartAnalysis,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    onFileUpload({
      name: file.name,
      size: file.size,
      type: file.name.split(".").pop()?.toUpperCase() || "UNKNOWN",
      uploadedAt: new Date().toLocaleString(),
      file,
    });
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      processFile(file);
    }

    event.target.value = "";
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      processFile(file);
    }
  };

  const statusLabel =
    status === "duplicate"
      ? "DUPLICATE"
      : status === "failed"
      ? "FAILED"
      : status.toUpperCase();

  const statusClass =
    status === "duplicate"
      ? "bg-yellow-100 text-yellow-800"
      : status === "failed"
      ? "bg-red-100 text-red-700"
      : status === "completed"
      ? "bg-green-100 text-green-700"
      : status === "processing"
      ? "bg-blue-100 text-blue-700"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Upload File
          </h2>

          <p className="text-slate-500 mt-2">
            Supported: MT548, MT544, MT545, MT546, MT547, TXT, LOG
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-bold ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-14 text-center transition-all duration-200 ${
          isDragging
            ? "border-blue-600 bg-blue-100"
            : "border-blue-300 bg-blue-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".txt,.log,.swift,.csv"
          onChange={handleInputChange}
        />

        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl">
          ↑
        </div>

        <h3 className="text-xl font-bold text-slate-900">
          Drag and drop your SWIFT/log file here
        </h3>

        <p className="text-slate-500 my-4">or</p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition"
        >
          Browse File
        </button>
      </div>

      {uploadedFile && (
        <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">

          <p className="font-bold text-slate-900">
            {uploadedFile.name}
          </p>

          <p className="text-slate-500 text-sm mt-1">
            {(uploadedFile.size / 1024).toFixed(2)} KB •{" "}
            {uploadedFile.uploadedAt}
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={
          !uploadedFile || status === "processing"
        }
        onClick={onStartAnalysis}
        className={`mt-6 w-full rounded-xl px-6 py-4 font-bold transition ${
          !uploadedFile || status === "processing"
            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
            : "bg-slate-900 hover:bg-slate-800 text-white"
        }`}
      >
        {status === "processing"
          ? "AI Analysis Running..."
          : "Start AI Investigation"}
      </button>
    </div>
  );
}