// Step 1 of the OAuth dance.
// Sveltia opens this URL in a popup. We redirect that popup to GitHub's
// authorize page, asking for the scopes we need to commit on the user's
// behalf. GitHub will redirect back to /callback with a temporary code.
export const handler = async (event) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    return { statusCode: 500, body: "OAUTH_CLIENT_ID env var not set" };
  }

  const host = event.headers["x-forwarded-host"] || event.headers.host;
  const proto = event.headers["x-forwarded-proto"] || "https";
  const redirectUri = `${proto}://${host}/.netlify/functions/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "repo,user",
    redirect_uri: redirectUri,
  });

  return {
    statusCode: 302,
    headers: { Location: `https://github.com/login/oauth/authorize?${params}` },
  };
};
