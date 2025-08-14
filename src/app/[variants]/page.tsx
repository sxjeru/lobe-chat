import { Metadata } from 'next';

import { getCanonicalUrl } from '@/server/utils/url';

export const runtime = 'edge';

export const metadata: Metadata = {
  alternates: { canonical: getCanonicalUrl('/') },
};

export { default } from './loading';
