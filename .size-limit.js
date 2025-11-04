// Bundle Size Limits Configuration
// Automatically fails builds if bundle size exceeds these thresholds

module.exports = [
  {
    name: "Total App Bundle",
    path: "dist/**/*.js",
    limit: "500 KB",
    gzip: true,
    brotli: false,
    running: false
  },
  {
    name: "Main Bundle (Entry)",
    path: "dist/assets/index-*.js",
    limit: "300 KB",
    gzip: true,
    brotli: false,
    running: false
  },
  {
    name: "CSS Bundle",
    path: "dist/assets/index-*.css",
    limit: "100 KB",
    gzip: true,
    brotli: false,
    running: false
  },
  {
    name: "Vendor Chunk",
    path: "dist/assets/vendor-*.js",
    limit: "250 KB",
    gzip: true,
    brotli: false,
    running: false,
    ignore: ["dist/assets/index-*.js"]
  }
];
