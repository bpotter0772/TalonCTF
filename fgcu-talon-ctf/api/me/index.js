module.exports = async function (context, req) {
  // SWA injects x-ms-client-principal header when authenticated
  const header = req.headers["x-ms-client-principal"];
  if (!header) {
    context.res = {
      status: 401,
      body: { authenticated: false }
    };
    return;
  }

  // header is base64 encoded JSON
  try {
    const decoded = Buffer.from(header, "base64").toString("utf8");
    const principal = JSON.parse(decoded);
    // principal contains userId, userDetails (email), identityProvider, userRoles
    context.res = {
      status: 200,
      body: {
        authenticated: true,
        user: {
          id: principal.userId,
          name: principal.userDetails,
          provider: principal.identityProvider,
          roles: principal.userRoles
        }
      }
    };
  } catch (e) {
    context.res = {
      status: 500,
      body: { authenticated: false, error: "Failed to decode principal" }
    };
  }
};