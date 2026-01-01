import { glitch } from './glitcher.js';
import { html } from './frontend.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const targetUrl = url.searchParams.get('url');
        const amountStr = url.searchParams.get('amount') || '10';
        const seed = url.searchParams.get('seed');
        const mode = url.searchParams.get('mode') || 'auto';

        // Serve Frontend
        if (url.pathname === '/') {
            return new Response(html, {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        // Handle /glitch endpoint
        if (url.pathname === '/glitch') {
            if (!targetUrl) {
                return new Response('Missing "url" query parameter', { status: 400 });
            }

            try {
                const imageRes = await fetch(targetUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                if (!imageRes.ok) {
                    return new Response(`Failed to fetch image: ${imageRes.statusText}`, { status: imageRes.status });
                }

                const arrayBuffer = await imageRes.arrayBuffer();
                const contentType = imageRes.headers.get('content-type') || 'application/octet-stream';

                // --- Cache Logic Start ---
                const cacheUrl = new URL(request.url);
                // Ensure the key is unique to parameters
                const cacheKey = new Request(cacheUrl.toString(), request);
                const cache = caches.default;
                let response = await cache.match(cacheKey);

                if (!response) {
                    // Cache Miss or No Cache found
                    const glitchedData = await glitch(new Uint8Array(arrayBuffer), contentType, parseInt(amountStr, 10), seed, mode);

                    // Create response with headers
                    response = new Response(glitchedData, {
                        headers: {
                            'Content-Type': contentType,
                            'Access-Control-Allow-Origin': '*',
                            // Cache Control Header determined by Env Var
                            'Cache-Control': `public, max-age=${env.CACHE_TTL || 3600}`
                        }
                    });

                    // Put in cache (waitUntil ensures it finishes even after response returned)
                    // Note: put() requires the response to have Cache-Control headers set!
                    ctx.waitUntil(cache.put(cacheKey, response.clone()));
                }

                return response;
                // --- Cache Logic End ---

            } catch (e) {
                return new Response(`Error: ${e.message}`, { status: 500 });
            }
        }

        return new Response('Not Found. Use /glitch', { status: 404 });
    },
};
