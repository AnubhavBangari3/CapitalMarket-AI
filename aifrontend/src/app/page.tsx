"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchTrades, type Trade } from "../lib/api";

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTrades() {
      try {
        const data = await fetchTrades();
        setTrades(data);
      } catch {
        setError("Unable to load trades. Please check backend server.");
      } finally {
        setLoading(false);
      }
    }

    loadTrades();
  }, []);

  const openTrades = useMemo(
    () => trades.filter((trade) => trade.trade_status === "OPEN").length,
    [trades]
  );

  const settledTrades = useMemo(
    () => trades.filter((trade) => trade.trade_status === "SETTLED").length,
    [trades]
  );

  return (
    <div>
      <p className="text-blue-500 font-medium">Capital Markets Operations</p>

      <h1 className="text-4xl font-bold text-slate-900 mt-4">
        AI Settlement Dashboard
      </h1>

      <p className="text-slate-600 mt-3">
        Monitor settlement failures, RCA status, escalations, and resolution progress.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
        <Card title="Total Trades" value={String(trades.length)} />
        <Card title="Open Trades" value={String(openTrades)} warning />
        <Card title="Settled Trades" value={String(settledTrades)} success />
        <Card title="Risk Cases" value="Pending Parser" danger />
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          Settlement Trades
        </h2>

        {loading && <p className="mt-6 text-slate-500">Loading trades...</p>}

        {error && <p className="mt-6 text-red-600 font-medium">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-3 px-3">Trade Ref</th>
                  <th className="py-3 px-3">Security</th>
                  <th className="py-3 px-3">ISIN</th>
                  <th className="py-3 px-3">Qty</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Counterparty</th>
                  <th className="py-3 px-3">Direction</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-slate-100">
                    <td className="py-3 px-3 font-semibold">
                      {trade.trade_reference}
                    </td>
                    <td className="py-3 px-3">{trade.security_name}</td>
                    <td className="py-3 px-3 text-slate-500">{trade.isin}</td>
                    <td className="py-3 px-3">{trade.quantity}</td>
                    <td className="py-3 px-3">
                      {trade.currency} {trade.settlement_amount}
                    </td>
                    <td className="py-3 px-3">{trade.counterparty_bic}</td>
                    <td className="py-3 px-3">{trade.settlement_direction}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={trade.trade_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
      <p className="text-slate-500">{title}</p>

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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-yellow-100 text-yellow-700",
    SETTLED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-slate-200 text-slate-700",
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