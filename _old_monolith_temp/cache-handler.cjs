/**
 * No-op cache handler: nothing is stored, nothing is read.
 * Use with next.config to disable Next.js Data Cache and Full Route Cache.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/incrementalCacheHandlerPath
 */

module.exports = class CacheHandler {
  constructor(_options) {}

  async get() {
    return null;
  }

  async set() {
    return;
  }

  async revalidateTag() {
    return;
  }
};
