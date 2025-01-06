import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslintConfig: {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
};

export default nextConfig;
