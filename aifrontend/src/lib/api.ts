export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export type AuditLog = {
  id: number;
  transaction_ref: string | null;
  message_type: string | null;
  root_cause: string | null;
  action: string;
  system: string;
  status: string;
  severity: string | null;
  message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type OrchestratedAction = {
  id: number;
  action_type: string;
  target_system: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  external_reference: string | null;
  payload: Record<string, unknown>;
  audit_logs?: AuditLog[];
  created_at?: string;
};

export type InvestigationResult = {
  id: number;
  swift_message_id?: number;
  transaction_ref: string;
  message_type: string;
  isin: string | null;
  security_name: string | null;
  root_cause: string;
  reason_category: string;
  severity: string;
  investigation_status: string;
  ai_summary: string | null;
  recommended_action: string;
  investigation_data: Record<string, unknown>;
  orchestrated_actions: OrchestratedAction[];
  audit_logs: AuditLog[];
  created_at: string;
};

export type OrchestrationResult = {
  actions_triggered: OrchestratedAction[];
  total_actions: number;
};

export type UploadSwiftFileResponse = {
  message: string;
  is_duplicate: boolean;
  file_id: number;
  filename: string;
  status: string;
  upload_status?: string;
  swift_message_id?: number;
  message_type?: string;
  transaction_ref?: string;
  related_ref?: string | null;
  isin?: string | null;
  security_name?: string | null;
  quantity?: string | null;
  settlement_amount?: string | null;
  currency?: string | null;
  settlement_status?: string | null;
  matching_status?: string | null;
  reason_code?: string | null;
  narrative_reason?: string | null;
  settlement_direction?: string | null;
  payment_type?: string | null;
  sender_bic?: string | null;
  receiver_bic?: string | null;
  delivering_agent?: string | null;
  receiving_agent?: string | null;
  place_of_settlement?: string | null;
  parsed_json?: Record<string, unknown>;
  investigation?: Partial<InvestigationResult> | null;
  orchestration?: OrchestrationResult;
  audit_logs?: AuditLog[];
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

export async function uploadSwiftFile(file: File): Promise<UploadSwiftFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/uploads/swift/upload/`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (response.status === 409 && data) {
    return {
      ...data,
      is_duplicate: true,
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.file?.[0] ||
        data?.detail ||
        data?.message ||
        data?.error ||
        "File upload failed"
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

export async function fetchInvestigations(): Promise<InvestigationResult[]> {
  const response = await fetch(`${API_BASE_URL}/api/uploads/investigations/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch investigations");
  }

  return response.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const response = await fetch(`${API_BASE_URL}/api/uploads/audit-logs/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch audit logs");
  }

  return response.json();
}