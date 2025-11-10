import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    let url = searchParams.get("url");

    if (!url) {
        return new NextResponse("URL parameter is required", { status: 400 });
    }

    // Decode URL until it's fully decoded (handles double/triple encoding)
    let previousUrl = '';
    while (url !== previousUrl && url.includes('%')) {
        previousUrl = url;
        try {
            url = decodeURIComponent(url);
        } catch (e) {
            // If decode fails, stop
            break;
        }
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return new NextResponse(`Failed to fetch content: ${response.statusText}`, {
                status: response.status,
            });
        }

        const contentBuffer = await response.arrayBuffer();
        const contentType = response.headers.get("Content-Type") || "application/octet-stream";

        const headers = new Headers();
        headers.set("Content-Type", contentType);
        headers.set("Access-Control-Allow-Origin", "*");
        // Remove restrictive CSP that might block resources
        headers.delete("Content-Security-Policy");
        headers.delete("X-Frame-Options");

        const urlObj = new URL(url);
        const origin = urlObj.origin;

        // Calculate base path for relative URLs
        // Check if the last path segment has a file extension (like .html, .css, .js)
        const lastSegment = url.substring(url.lastIndexOf('/') + 1);
        const hasFileExtension = /\.(html?|css|js|json|xml|txt|pdf|png|jpg|jpeg|gif|svg|woff2?|ttf|eot)(\?|#|$)/i.test(lastSegment);

        let basePath = url;
        if (!hasFileExtension) {
            // No file extension means it's a directory or path-based URL
            basePath = url.endsWith('/') ? url : url + '/';
        } else {
            // Has extension, get the directory
            basePath = url.substring(0, url.lastIndexOf('/') + 1);
        }

        const rewriteUrl = (urlPath: string): string => {
            // Skip data URIs, javascript:, mailto:, and anchors
            if (urlPath.startsWith('data:') ||
                urlPath.startsWith('javascript:') ||
                urlPath.startsWith('mailto:') ||
                urlPath.startsWith('#')) {
                return urlPath;
            }

            // If already proxied, skip
            if (urlPath.includes('/api/proxy?url=')) {
                return urlPath;
            }

            // Handle URLs with fragments (anchors like "page.html#section")
            let fragment = '';
            let urlWithoutFragment = urlPath;
            if (urlPath.includes('#')) {
                const parts = urlPath.split('#');
                urlWithoutFragment = parts[0];
                fragment = '#' + parts[1];

                // If it's just a different page on the same site with an anchor, keep it relative
                if (!urlWithoutFragment || urlWithoutFragment === '') {
                    return urlPath; // Just "#anchor"
                }
            }

            let fullUrl;

            // Handle different URL types
            if (urlWithoutFragment.startsWith('http://') || urlWithoutFragment.startsWith('https://')) {
                fullUrl = urlWithoutFragment;
            } else if (urlWithoutFragment.startsWith('//')) {
                fullUrl = 'https:' + urlWithoutFragment;
            } else if (urlWithoutFragment.startsWith('/')) {
                fullUrl = origin + urlWithoutFragment;
            } else {
                fullUrl = basePath + urlWithoutFragment;
            }

            // If this URL points to the same document (with or without version), just use the anchor
            if (fragment) {
                if (!fullUrl) {
                    return fragment; // Just an anchor, no URL part
                }

                const currentDoc = url.split('#')[0].split('?')[0].replace(/\/$/, ''); // Current document without anchor, query, or trailing slash
                const targetDoc = fullUrl.split('#')[0].split('?')[0].replace(/\/$/, ''); // Target document without anchor, query, or trailing slash

                // Normalize both URLs by removing version numbers for comparison
                const normalizeUrl = (u: string) => {
                    // Remove version numbers like v1, v2, etc. and any trailing slashes
                    return u.replace(/v\d+$/, '').replace(/\/$/, '');
                };

                const currentNormalized = normalizeUrl(currentDoc);
                const targetNormalized = normalizeUrl(targetDoc);

                // Check if they're the same document
                const isSameDoc = currentNormalized === targetNormalized ||
                                  currentDoc === targetDoc ||
                                  // Check if one is a prefix of the other (handles version differences)
                                  currentNormalized === targetDoc ||
                                  targetNormalized === currentDoc;

                if (isSameDoc) {
                    console.log(`Same document detected: ${urlPath} -> ${fragment} (current: ${currentDoc}, target: ${targetDoc})`);
                    return fragment; // Same document, just use the anchor
                }
            }

            return `/api/proxy?url=${encodeURIComponent(fullUrl)}${fragment}`;
        };

        // For HTML content, rewrite URLs to use the proxy
        if (contentType.includes("text/html")) {
            let html = new TextDecoder().decode(contentBuffer);

            console.log(`Processing HTML from: ${url}`);

            // Rewrite all src and href attributes
            let rewriteCount = 0;
            html = html.replace(
                /((?:src|href)\s*=\s*["'])([^"']+)(["'])/gi,
                (match, prefix, urlPath, suffix) => {
                    const rewritten = `${prefix}${rewriteUrl(urlPath)}${suffix}`;
                    if (rewritten !== match) {
                        rewriteCount++;
                        if (rewriteCount <= 3) {
                            console.log(`Rewrote: ${match} -> ${rewritten}`);
                        }
                    }
                    return rewritten;
                }
            );

            console.log(`Total rewrites: ${rewriteCount}`);

            return new NextResponse(html, { headers });
        }

        // For CSS content, rewrite url() and @import references
        if (contentType.includes("text/css") || contentType.includes("css")) {
            let css = new TextDecoder().decode(contentBuffer);

            console.log(`Processing CSS from: ${url}`);

            // Rewrite @import statements
            css = css.replace(
                /@import\s+["']([^"']+)["']/gi,
                (match, urlPath) => {
                    const rewritten = rewriteUrl(urlPath);
                    console.log(`CSS @import: ${match} -> @import "${rewritten}"`);
                    return `@import "${rewritten}"`;
                }
            );

            // Rewrite url() in CSS
            css = css.replace(
                /url\(["']?([^"')]+)["']?\)/gi,
                (match, urlPath) => {
                    return `url("${rewriteUrl(urlPath)}")`;
                }
            );

            return new NextResponse(css, { headers });
        }

        return new NextResponse(contentBuffer, { headers });
    } catch (error) {
        console.error("Error proxying content:", error);
        return new NextResponse("Failed to proxy content", { status: 500 });
    }
}