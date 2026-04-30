// Step 2 of the OAuth dance.
// GitHub redirects the popup here with ?code=... after the user authorises
// the app. We swap that code for an access token using our client_secret,
// then post the token back to the CMS window via postMessage.
//
// The handshake matches the protocol Decap/Sveltia expects:
//   1. Popup posts "authorizing:github" to its opener (the CMS).
//   2. CMS replies with a handshake message (any payload).
//   3. Popup responds with "authorization:github:success:<JSON token>".
//   4. CMS stores the token and closes the popup.
export const handler = async (event) => {
  const code = event.queryStringParameters?.code;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!code) return errorPage("Missing ?code from GitHub.");
  if (!clientId || !clientSecret) {
    return errorPage("OAUTH_CLIENT_ID or OAUTH_CLIENT_SECRET env var not set.");
  }

  const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const data = await tokenResp.json();
  if (data.error) return errorPage(data.error_description || data.error);
  if (!data.access_token) return errorPage("GitHub returned no access_token.");

  const payload = JSON.stringify({
    token: data.access_token,
    provider: "github",
  });

  // Single string passed via postMessage; CMS parses out the JSON suffix.
  const successMsg = `authorization:github:success:${payload}`;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Authorising…</title></head>
<body style="font:14px/1.5 system-ui;text-align:center;padding:60px">
<p>Authorising…</p>
<script>
(function () {
  function receiveMessage(e) {
    if (!window.opener) return;
    window.opener.postMessage(${JSON.stringify(successMsg)}, e.origin);
    window.removeEventListener("message", receiveMessage, false);
    setTimeout(function(){ window.close(); }, 200);
  }
  window.addEventListener("message", receiveMessage, false);
  // Tell the opener we're ready, broadcasting to any origin.
  if (window.opener) window.opener.postMessage("authorizing:github", "*");
  else document.body.textContent = "Login window has no opener; close this tab.";
})();
</script>
</body></html>`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html,
  };
};

function errorPage(message) {
  const html = `<!doctype html>
<html><body style="font:14px/1.5 system-ui;padding:40px">
<h1>OAuth error</h1>
<pre>${escapeHtml(message)}</pre>
</body></html>`;
  return {
    statusCode: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: html,
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
