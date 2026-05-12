const recentUploads = [
  "MT548_20260512_123045.txt",
  "MT544_20260511_091230.txt",
  "LOG_20260510_091530.log",
];

export default function UploadSummary() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 mb-5">
          Upload Summary
        </h3>

        <div className="space-y-4 text-sm">
          <Info label="File Type" value="MT548" />
          <Info label="Message Type" value="Settlement Status" />
          <Info label="Uploaded By" value="Ops User" />
          <Info label="Storage" value="Azure Blob Storage" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 mb-5">
          Recent Uploads
        </h3>

        <div className="space-y-3">
          {recentUploads.map((file) => (
            <div
              key={file}
              className="flex justify-between items-center text-sm border-b border-slate-100 pb-3"
            >
              <span className="text-slate-700">{file}</span>
              <span className="text-green-600 font-medium">Uploaded</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 text-right">{value}</span>
    </div>
  );
}