export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export type UploadSwiftFileResponse = {
  message: string;
  file_id: number;
  filename: string;
  status: string;
};

export type Trade = {
  id: number;
  trade_reference: string;
  isin: string;
  security_name: string;
  trade_date: string;
  settlement_date: string;
  quantity: string;
  settlement_amount: string | null;
  currency: string;
  counterparty_bic: string;
  custody_account: string | null;
  cash_account: string | null;
  settlement_direction: string;
  payment_type: string;
  trade_status: string;
  created_at: string;
};

export async function uploadSwiftFile(
  file: File
): Promise<UploadSwiftFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/uploads/swift/upload/`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.file?.[0] || data?.detail || data?.message || "File upload failed"
    );
  }

  return data;
}

export async function fetchTrades(): Promise<Trade[]> {
  const response = await fetch(`${API_BASE_URL}/api/uploads/trades/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch trades");
  }

  return response.json();
}