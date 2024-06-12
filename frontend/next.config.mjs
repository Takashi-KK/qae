/** @type {import('next').NextConfig} */
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

dns.lookup("github.com", { all: true }, (err, addresses) => {
  console.log("[next.config.mjs]: dns.lookup()");
  console.log({ addresses, err });
});

const nextConfig = {};

export default nextConfig;
