// Structured logger: one JSON object per line, always the same core fields
// (ts, level, event, requestId), so logs can be filtered with jq/grep
// instead of read by eye.
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function createLogger({
  level = process.env.LOG_LEVEL || 'info',
  write = (line) => process.stdout.write(line + '\n'),
  base = {},
} = {}) {
  const threshold = LEVELS[level] ?? LEVELS.info;

  function log(lvl, event, fields = {}) {
    if (LEVELS[lvl] < threshold) return;
    write(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: lvl,
        event,
        ...base,
        ...fields,
      })
    );
  }

  return {
    debug: (event, fields) => log('debug', event, fields),
    info: (event, fields) => log('info', event, fields),
    warn: (event, fields) => log('warn', event, fields),
    error: (event, fields) => log('error', event, fields),
    child: (fields) => createLogger({ level, write, base: { ...base, ...fields } }),
  };
}

const silentLogger = createLogger({ write: () => {} });

module.exports = { createLogger, silentLogger };
