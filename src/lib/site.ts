const configuredOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  "http://localhost:3000";
const parsedOrigin = new URL(configuredOrigin);
if (!["http:", "https:"].includes(parsedOrigin.protocol))
  throw new Error("Site URL must be an absolute HTTP or HTTPS URL.");
export const siteOrigin = parsedOrigin.origin;
