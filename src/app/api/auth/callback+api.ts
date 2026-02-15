import { APP_SCHEME, BASE_URL } from "@/src/utils/constants";

export async function GET(request: Request) {
  const incomingParams = new URLSearchParams(request.url.split("?")[1]);
  const combinedPlatformAndState = incomingParams.get("state");
  if (!combinedPlatformAndState) {
    return Response.json({ error: "Invalid state" }, { status: 400 });
  }
  // strip platform to return state as it was set on the client
  const [platform, state] = combinedPlatformAndState.split("|");

  const outgoingParams = new URLSearchParams({
    code: incomingParams.get("code")?.toString() || "",
    state,
  });

  return Response.redirect(
    (platform === "web" ? BASE_URL : APP_SCHEME) +
      "?" +
      outgoingParams.toString()
  );
}