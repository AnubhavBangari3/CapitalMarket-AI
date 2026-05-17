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

export default function UploadPage() {

  const [uploadedFile, setUploadedFile] =
    useState<UploadedFile | null>(null);

  const [apiResponse, setApiResponse] =
    useState<UploadSwiftFileResponse | null>(null);

  const [error, setError] = useState("");

  const [status, setStatus] =
    useState<UploadStatus>("idle");

  const handleFileUpload = (
    file: UploadedFile
  ) => {

    setUploadedFile(file);

    setApiResponse(null);

    setError("");

    setStatus("uploaded");
  };

  const handleStartAnalysis = async () => {

    if (!uploadedFile?.file) {

      setError(
        "Please select a SWIFT file first."
      );

      return;
    }

    try {

      setStatus("processing");

      setError("");

      setApiResponse(null);

      const result = await uploadSwiftFile(
        uploadedFile.file
      );

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

  const isDuplicate =
    apiResponse?.is_duplicate === true;

  const isFinished =
    status === "completed" ||
    status === "duplicate";

  return (
    <div>

      <p className="text-blue-500 font-medium">
        Capital Markets Operations
      </p>

      <h1 className="text-4xl font-bold text-slate-900 mt-4">
        Upload SWIFT Message
      </h1>

      <p className="text-slate-600 mt-3">
        Upload SWIFT settlement messages for AI investigation.
      </p>

      {isDuplicate && apiResponse && (

        <div className="mt-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-5 shadow-sm">

          <p className="text-xl font-bold text-yellow-900">
            Duplicate SWIFT Message Detected
          </p>

          <p className="mt-2 text-yellow-800">

            Message Type:
            {" "}
            <b>{apiResponse.message_type}</b>

            <br />

            Transaction Reference:
            {" "}
            <b>{apiResponse.transaction_ref}</b>

            <br />

            Existing SWIFT Message ID:
            {" "}
            <b>{apiResponse.swift_message_id}</b>

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

          <p className="text-red-700 mt-2">
            {error}
          </p>
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

            <Result
              title="File ID"
              value={String(apiResponse.file_id)}
            />

            <Result
              title="Filename"
              value={apiResponse.filename || "-"}
            />

            <Result
              title="Status"
              value={
                apiResponse.upload_status ||
                apiResponse.status ||
                "-"
              }
            />

            <Result
              title="Duplicate"
              value={
                apiResponse.is_duplicate
                  ? "YES"
                  : "NO"
              }
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
                isDuplicate
                  ? "text-yellow-900"
                  : "text-green-700"
              }`}
            >

              {isDuplicate
                ? "Duplicate SWIFT message detected"
                : "File uploaded successfully"}

            </p>

            <p
              className={`mt-2 ${
                isDuplicate
                  ? "text-yellow-800"
                  : "text-green-600"
              }`}
            >

              {isDuplicate
                ? `${apiResponse.message_type} already exists with transaction reference ${apiResponse.transaction_ref}.`
                : "SWIFT file uploaded and parsed successfully."}

            </p>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-5">

            <p className="font-semibold text-slate-800">
              Parsed SWIFT Summary
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

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
                value={
                  apiResponse.swift_message_id
                    ? String(apiResponse.swift_message_id)
                    : "-"
                }
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
                value={apiResponse.quantity || "-"}
              />

              <Result
                title="Amount"
                value={
                  apiResponse.settlement_amount
                    ? `${apiResponse.currency} ${apiResponse.settlement_amount}`
                    : "-"
                }
              />
            </div>
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