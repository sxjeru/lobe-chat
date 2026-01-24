import dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

dotenv.config();

const startedAt = Date.now();
const logStep = (message: string) => {
  const elapsed = Date.now() - startedAt;
  // eslint-disable-next-line no-console
  console.info(`[build-sitemap] ${message} (+${elapsed}ms)`);
};

const genSitemap = async () => {
  logStep('script start');
  logStep('importing Sitemap');
  const { Sitemap } = await import('@/server/sitemap');
  logStep('Sitemap imported');

  const sitemapModule = new Sitemap();
  logStep('Sitemap instance created');

  logStep('getIndex start');
  const sitemapIndexXML = await sitemapModule.getIndex();
  logStep('getIndex done');
  const filename = resolve(__dirname, '../../', 'public', 'sitemap-index.xml');
  logStep(`write file: ${filename}`);
  writeFileSync(filename, sitemapIndexXML);
  logStep('write file done');
};

// eslint-disable-next-line unicorn/prefer-top-level-await
genSitemap().catch((error) => {
  logStep('error');
  // eslint-disable-next-line no-console
  console.error(error);
});
