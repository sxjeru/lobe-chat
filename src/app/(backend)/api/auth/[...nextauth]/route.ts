import NextAuthNode from '@/libs/next-auth';

export const runtime = 'edge';

export const { GET, POST } = NextAuthNode.handlers;
