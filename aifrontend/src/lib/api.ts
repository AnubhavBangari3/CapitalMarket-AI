export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export type UploadSwiftFileResponse = {
  message: string;
  file_id: number;
  filename: string;
  status: string;
};

export async function uploadSwiftFile(
  file: File
): Promise<UploadSwiftFileResponse> {
  const formData = new FormData();

  // Must match Django serializer FileField name
  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/uploads/swift/upload/`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.file?.[0] ||
      data?.detail ||
      data?.message ||
      "File upload failed";

    throw new Error(errorMessage);
  }

  return data;
}
