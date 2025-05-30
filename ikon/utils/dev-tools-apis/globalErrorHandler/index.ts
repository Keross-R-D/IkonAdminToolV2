export async function apiErrorHandler(response: Response) {
  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error);
  }
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Somthing went wrong.");
  }
}
