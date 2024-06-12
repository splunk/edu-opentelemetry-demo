// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

/** @type {import('next').NextConfig} */

const dotEnv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const { resolve } = require('path');

const myEnv = dotEnv.config({
  path: resolve(__dirname, '../../.env'),
});
dotenvExpand.expand(myEnv);
console.log(`in next.config.js, process.env: ${JSON.stringify(process.env, null, 2)}`)


const {
  AD_SERVICE_ADDR = '',
  CART_SERVICE_ADDR = '',
  CHECKOUT_SERVICE_ADDR = '',
  CURRENCY_SERVICE_ADDR = '',
  PRODUCT_CATALOG_SERVICE_ADDR = '',
  RECOMMENDATION_SERVICE_ADDR = '',
  SHIPPING_SERVICE_ADDR = '',
  ENV_PLATFORM = '',
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '',
  OTEL_SERVICE_NAME = 'frontend',
  PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = '',
  NEXT_PUBLIC_SPLUNK_REALM = '',
  NEXT_PUBLIC_SPLUNK_RUM_TOKEN = '',
  NEXT_PUBLIC_SPLUNK_RUM_APP_NAME = '',
  NEXT_PUBLIC_SPLUNK_RUM_ENV = '',
} = process.env;

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.http2 = false;
      config.resolve.fallback.tls = false;
      config.resolve.fallback.net = false;
      config.resolve.fallback.dns = false;
      config.resolve.fallback.fs = false;
    }

    // Leave server bundle as-is
    if (isServer) {
      return config;
    }
    // Overwrite current entrypoints
    const origEntry = config.entry;
    const entry = async () => {
      let entries = origEntry;
      if (typeof entries === 'function') {
        entries = await entries();
      }

      const instrumentFile = './splunk-rum.js';

      // Webpack accepts string, string[] or object as entrypoint values
      // https://webpack.js.org/configuration/entry-context/#entry
      // Generally, in our testing main is just a string value
      // but for completeness/future safety this covers all
      if (typeof entries.main === 'string') {
        entries.main = [instrumentFile, entries.main];
      } else if (Array.isArray(entries.main)) {
        entries.main = [instrumentFile, ...entries.main];
      } else {
        let imported = entries.main.import;
        if (typeof imported === 'string') {
          imported = [instrumentFile, imported];
        } else {
          imported = [instrumentFile, ...imported];
        }

        entries.main = {
          ...entries.main,
          import: imported
        };
      }

      return entries;
    };

    // Replace entry in config with new value
    return {
      ...config,
      entry
    };

  },
  env: {
    AD_SERVICE_ADDR,
    CART_SERVICE_ADDR,
    CHECKOUT_SERVICE_ADDR,
    CURRENCY_SERVICE_ADDR,
    PRODUCT_CATALOG_SERVICE_ADDR,
    RECOMMENDATION_SERVICE_ADDR,
    SHIPPING_SERVICE_ADDR,
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    NEXT_PUBLIC_PLATFORM: ENV_PLATFORM,
    NEXT_PUBLIC_OTEL_SERVICE_NAME: OTEL_SERVICE_NAME,
    NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    NEXT_PUBLIC_SPLUNK_REALM,
    NEXT_PUBLIC_SPLUNK_RUM_TOKEN,
    NEXT_PUBLIC_SPLUNK_RUM_APP_NAME,
    NEXT_PUBLIC_SPLUNK_RUM_ENV,
  },
};

module.exports = nextConfig;
