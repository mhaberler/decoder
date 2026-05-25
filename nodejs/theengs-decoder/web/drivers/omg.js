'use strict';

const OMG_RE = /^N: \[ OMG->SERIAL \] data sent: (\{.*\})\s*$/;

export function createOmgDriver() {
  let buffer = '';
  const td = new TextDecoder('utf-8', { fatal: false });

  return {
    name: 'OMG',
    defaultBaud: 115200,
    candidateBauds: [115200, 921600, 230400, 57600, 9600],
    needsFlowControl: false,

    probeMatches(bytes) {
      const s = td.decode(bytes, { stream: true });
      return /OMG|BTtoMQTT|SYStoMQTT|Enqueue|Dequeue|"rssi"|"servicedata"|"manufacturerdata"/.test(s);
    },

    async start(/* write */) {},
    async stop(/* write */) {},

    ingest(bytes, { onLine, onAdvert }) {
      buffer += td.decode(bytes, { stream: true });
      let idx;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).replace(/\r$/, '');
        buffer = buffer.slice(idx + 1);
        if (!line) continue;
        const m = line.match(OMG_RE);
        if (m) {
          let json = null;
          try { json = JSON.parse(m[1]); } catch {}
          if (json && typeof json.origin === 'string' && json.origin.startsWith('/BTtoMQTT')) {
            onAdvert(json);
            continue;
          }
        }
        onLine?.(line);
      }
    },
  };
}
