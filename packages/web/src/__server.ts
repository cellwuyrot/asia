import app from "./api";

const port = Number(process.env.PORT ?? 3000);
const distDir = `${import.meta.dirname}/../dist`;
const indexPath = `${distDir}/index.html`;
const collectionPaths = ["bundles", "china", "japan", "korea"];
const infoPaths = ["delivery", "payment", "returns", "privacy", "offer"];

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) return app.fetch(request);
    if (url.pathname === "/robots.txt") return textResponse(buildRobots(url.origin), "text/plain; charset=utf-8");
    if (url.pathname === "/sitemap.xml") return textResponse(buildSitemap(url.origin), "application/xml; charset=utf-8");

    const filePath = getStaticFilePath(url.pathname);
    const file = Bun.file(filePath);
    if (await file.exists()) return new Response(file);

    const index = Bun.file(indexPath);
    if (await index.exists()) {
      const html = await index.text();
      const absoluteUrl = `${url.origin}${url.pathname === "/" ? "/" : url.pathname}`;
      const patched = html
        .replace('<link rel="icon"', `<link rel="canonical" href="${escapeAttr(absoluteUrl)}" />\n\t\t<link rel="icon"`)
        .replace('<meta property="og:image" content="/og-image.png" />', `<meta property="og:image" content="${escapeAttr(`${url.origin}/og-image.png`)}" />`)
        .replace('<meta name="twitter:card" content="summary_large_image" />', `<meta property="og:url" content="${escapeAttr(absoluteUrl)}" />\n\t\t<meta name="twitter:card" content="summary_large_image" />`);
      return new Response(patched, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (!isAppRoute(url.pathname)) {
      return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    return new Response("Build output not found. Run `bun run build` first.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
});

console.log(`Web server listening on http://localhost:${server.port}`);

function getStaticFilePath(pathname: string) {
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+/, "").replaceAll("..", "");
  return cleanPath ? `${distDir}/${cleanPath}` : indexPath;
}

function textResponse(body: string, contentType: string) {
  return new Response(body, { headers: { "Content-Type": contentType } });
}

function isAppRoute(pathname: string) {
  return pathname === "/" || pathname === "/admin" || /^\/collections\/(bundles|china|japan|korea)\/?$/.test(pathname) || /^\/info\/(delivery|payment|returns|privacy|offer)\/?$/.test(pathname);
}

function buildRobots(origin: string) {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api/",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
}

function buildSitemap(origin: string) {
  const paths = [
    "/",
    ...collectionPaths.map((slug) => `/collections/${slug}`),
    ...infoPaths.map((slug) => `/info/${slug}`),
  ];
  const urls = paths
    .map((path) => `  <url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function escapeAttr(value: string) {
  return escapeXml(value);
}
