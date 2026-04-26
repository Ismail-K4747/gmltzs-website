/**
 * GitHub OAuth proxy for Sveltia / Decap CMS
 * Deploy as a Cloudflare Worker (free tier).
 *
 * 1. Create a GitHub OAuth App:
 *    Settings → Developer settings → OAuth Apps → New
 *    - Homepage URL:  https://gmltzs.com
 *    - Callback URL:  https://YOUR-WORKER.workers.dev/callback
 *    Copy the Client ID + Client Secret.
 *
 * 2. Set Worker secrets (wrangler secret put):
 *    GITHUB_CLIENT_ID
 *    GITHUB_CLIENT_SECRET
 *
 * 3. In public/admin/config.yml, set:
 *    backend.base_url:       https://YOUR-WORKER.workers.dev
 *    backend.auth_endpoint:  /auth
 */

const SCOPE = 'repo,user';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (url.pathname === '/auth') {
      // Step 1 — bounce the user to GitHub
      const redirect = new URL('https://github.com/login/oauth/authorize');
      redirect.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      redirect.searchParams.set('scope', SCOPE);
      redirect.searchParams.set('redirect_uri', `${url.origin}/callback`);
      return Response.redirect(redirect.toString(), 302);
    }

    if (url.pathname === '/callback') {
      // Step 2 — exchange code for token, then post message back to CMS
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const data = await tokenRes.json();

      if (!data.access_token) {
        return new Response(`OAuth failed: ${JSON.stringify(data)}`, { status: 400 });
      }

      // Tell the CMS via window.postMessage
      const payload = JSON.stringify({ token: data.access_token, provider: 'github' });
      const html = `<!DOCTYPE html><html><body><script>
        (function() {
          function send(msg) {
            window.opener && window.opener.postMessage('authorization:github:' + msg + ':' + ${JSON.stringify(payload)}, '*');
          }
          window.addEventListener('message', function(e) {
            if (e.data === 'authorizing:github') send('success');
          }, false);
          send('success');
        })();
      </script><p>Login successful. You can close this window.</p></body></html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html', ...corsHeaders() } });
    }

    return new Response('GM Group CMS auth proxy', { headers: corsHeaders() });
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
