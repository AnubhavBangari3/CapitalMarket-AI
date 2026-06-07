"use client";

import { useEffect, useState } from "react";
import { fetchTrades, Trade } from "../../lib/api";

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchTrades();
      setTrades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Trades</h1>
          <p className="text-slate-600 mt-3">View settlement trade records.</p>
        </div>

        <button
          onClick={loadTrades}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold"
        >
          Refresh
        </button>
      </div>

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && <p className="p-6 text-slate-500">Loading trades...</p>}

        {error && <p className="p-6 text-red-600 font-semibold">{error}</p>}

        {!loading && !error && trades.length === 0 && (
          <p className="p-6 text-slate-500">No trades found.</p>
        )}

        {!loading && !error && trades.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-sm font-bold text-slate-500">Trade Ref</th>
                  <th className="p-4 text-sm font-bold text-slate-500">Security</th>
                  <th className="p-4 text-sm font-bold text-slate-500">ISIN</th>
                  <th className="p-4 text-sm font-bold text-slate-500">Direction</th>
                  <th className="p-4 text-sm font-bold text-slate-500">Quantity</th>
                  <th className="p-4 text-sm font-bold text-slate-500">Amount</th>
                  <th className="p-4 text-sm font-bold text-slate-500">Status</th>
                </tr>
              </thead>

              <tbody>
                {trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4 font-bold text-slate-900">
                      {trade.trade_reference}
                    </td>

                    <td className="p-4 text-slate-700">
                      {trade.security_name}
                    </td>

                    <td className="p-4 text-slate-700">
                      {trade.isin}
                    </td>

                    <td className="p-4 text-slate-700">
                      {trade.settlement_direction}
                    </td>

                    <td className="p-4 text-slate-700">
                      {trade.quantity}
                    </td>

                    <td className="p-4 text-slate-700">
                      {trade.settlement_amount
                        ? `${trade.currency} ${trade.settlement_amount}`
                        : "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          trade.trade_status === "SETTLED"
                            ? "bg-green-100 text-green-700"
                            : trade.trade_status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {trade.trade_status}
                      </span>
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