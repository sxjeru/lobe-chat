import { ssrfSafeFetch } from '@lobechat/ssrf-safe-fetch';
import { ChatErrorType } from '@lobechat/types';
import debug from 'debug';
import { NextResponse } from 'next/server';

import { checkAuth } from '@/app/(backend)/middleware/auth';
import { AiProviderModel } from '@/database/models/aiProvider';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import { createErrorResponse } from '@/utils/errorResponse';

const log = debug('lobe-server:models:pricing');

interface NewApiPricingKeyVaults {
  baseURL?: string;
}

export const GET = checkAuth(async (req, { params, userId, serverDB }) => {
  const provider = (await params).provider;

  if (!provider) {
    return createErrorResponse(ChatErrorType.BadRequest, {
      message: 'Provider is required.',
    });
  }

  try {
    // 1. Get user's provider configuration from database
    const aiProviderModel = new AiProviderModel(serverDB, userId);
    const providerConfig = await aiProviderModel.getAiProviderById(
      provider,
      KeyVaultsGateKeeper.getUserKeyVaults,
    );

    if (!providerConfig) {
      return createErrorResponse(ChatErrorType.ContentNotFound, {
        message: 'Provider configuration not found.',
      });
    }

    const keyVaults = (providerConfig.keyVaults || {}) as NewApiPricingKeyVaults;
    const baseURL = keyVaults.baseURL;

    if (!baseURL) {
      return createErrorResponse(ChatErrorType.BadRequest, {
        message: 'Provider baseURL not configured.',
      });
    }

    const pricingUrl = new URL('/api/pricing', baseURL).toString();

    const res = await ssrfSafeFetch(pricingUrl, {
      headers: { Accept: 'application/json; charset=utf-8' },
    });

    if (!res.ok) {
      return createErrorResponse(ChatErrorType.BadGateway, {
        message: `Failed to fetch pricing from provider: ${res.statusText}`,
      });
    }

    try {
      const body: unknown = await res.json();
      return NextResponse.json(body);
    } catch {
      return createErrorResponse(ChatErrorType.BadGateway, {
        message: 'Provider pricing endpoint returned an invalid JSON response.',
        upstreamPath: new URL(pricingUrl).pathname,
      });
    }
  } catch (e) {
    log(`Route: [${provider}] pricing error: %O`, e);
    const error = e instanceof Error ? { message: e.message, name: e.name } : e;
    return createErrorResponse(ChatErrorType.InternalServerError, { error });
  }
});
