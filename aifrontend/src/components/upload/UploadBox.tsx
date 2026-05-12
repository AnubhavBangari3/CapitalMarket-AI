export default function UploadBox() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900 mb-1">
        Upload File
      </h3>

      <p className="text-sm text-slate-500 mb-6">
        Supported files: MT548, MT544, MT545, MT546, MT547, logs
      </p>

      <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl p-12 text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
          ↑
        </div>

        <h4 className="text-lg font-semibold text-slate-900">
          Drag and drop your file here
        </h4>

        <p className="text-sm text-slate-500 my-3">or</p>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold">
          Browse File
        </button>
      </div>

      <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-semibold text-green-700">
          Ready for upload
        </p>
        <p className="text-sm text-green-600">
          Backend API will be connected in the next phase.
        </p>
      </div>
    </div>
  );
}