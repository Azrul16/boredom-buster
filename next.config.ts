import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// Allow this machine's LAN addresses for phone/tablet testing in development.
const localAddresses = Object.values(networkInterfaces()).flatMap((entries) =>
  (entries ?? [])
    .filter((entry) => entry.family === "IPv4")
    .map((entry) => entry.address),
);
const config: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", ...localAddresses],
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default config;
