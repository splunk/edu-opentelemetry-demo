// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

const pino = require('pino');

// Custom level serializer
const levelMapping = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal'
};

module.exports = pino({
  level: 'info',
  messageKey: 'message',
  formatters: {
    level(label, number) {
      return { severity: levelMapping[number] || number };
    },
    log(object) {
      return { ...object };

    }
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
