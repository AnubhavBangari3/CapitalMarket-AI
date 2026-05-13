export default function DashboardPage() {
  return (
    <div>
      <p className="text-blue-500 font-medium">
        Capital Markets Operations
      </p>

      <h1 className="text-4xl font-bold text-slate-900 mt-4">
        AI Settlement Dashboard
      </h1>

      <p className="text-slate-600 mt-3">
        Monitor settlement failures, RCA status,
        escalations, and resolution progress.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
        <Card title="Total Trades" value="1,248" />
        <Card title="Failed Trades" value="72" danger />
        <Card title="In Progress" value="18" warning />
        <Card title="Resolved" value="1,158" success />
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          Recent Failed Trades
        </h2>

        <div className="mt-6 space-y-4">
          {["TRD1234567", "TRD1234568", "TRD1234569"].map((trade) => (
            <div
              key={trade}
              className="flex justify-between border-b border-slate-100 pb-4"
            >
              <span className="font-medium text-slate-900">
                {trade}
              </span>

              <span className="text-red-600 font-semibold">
                SSI Mismatch
              </span>

              <span className="text-slate-500">
                High Severity
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  danger,
  warning,
  success,
}: {
  title: string;
  value: string;
  danger?: boolean;
  warning?: boolean;
  success?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <p className="text-slate-500">
        {title}
      </p>

      <h2
        className={`text-3xl font-bold mt-3 ${
          danger
            ? "text-red-600"
            : warning
            ? "text-yellow-600"
            : success
            ? "text-green-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </h2>
    </div>
  );
}