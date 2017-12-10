// Enable import syntax on JSON files
declare module "*.json";

// Prevent typescript compile errors for libraries without TypeScript support
declare module 'js-sha256';
declare module 'openid-client';
declare module 'https-proxy-agent';