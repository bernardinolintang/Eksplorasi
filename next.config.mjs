/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabled: react-leaflet's MapContainer doesn't clean up its Leaflet
  // instance fast enough for StrictMode's dev double-mount, which throws
  // "Map container is already initialized".
  reactStrictMode: false,
};

export default nextConfig;
