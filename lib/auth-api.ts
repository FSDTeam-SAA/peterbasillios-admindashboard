interface ApiResponse<T = unknown> {
  statusCode?: number;
  status?: boolean;
  success?: boolean;
  message?: string;
  data?: T;
}

function getBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("API base URL is not configured");
  }

  return baseUrl.replace(/\/+$/, "");
}

function getApiMessage(response: ApiResponse | null, fallback: string) {
  return response?.message?.trim() || fallback;
}

export async function postAuth<T = unknown>(
  path: string,
  body: Record<string, unknown>,
  fallbackError = "Request failed. Please try again.",
) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data: ApiResponse<T> | null = await response.json().catch(() => null);
  const hasExplicitFailure = data?.success === false || data?.status === false;

  if (!response.ok || hasExplicitFailure) {
    throw new Error(getApiMessage(data, fallbackError));
  }

  return {
    data: data?.data,
    message: getApiMessage(data, "Request completed successfully"),
  };
}
