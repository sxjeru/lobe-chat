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
  apiKey?: string;
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
    const apiKey = keyVaults.apiKey;

    if (!baseURL) {
      return createErrorResponse(ChatErrorType.BadRequest, {
        message: 'Provider baseURL not configured.',
      });
    }

    const pricingUrl = new URL('/api/pricing', baseURL).toString();

    const headers: Record<string, string> = {
      Accept: 'application/json; charset=utf-8',
    };

    const fetchWithAuth = async (useAuth: boolean) => {
      const currentHeaders = { ...headers };
      if (useAuth && apiKey) {
        currentHeaders.Authorization = `Bearer ${apiKey}`;
      }
      return ssrfSafeFetch(pricingUrl, { headers: currentHeaders });
    };

    const authAttempts = apiKey ? [false, true] : [false];
    let lastError: unknown;
    let lastResponse: Response | undefined;

    for (const useAuth of authAttempts) {
      try {
        const res = await fetchWithAuth(useAuth);
        lastResponse = res;

        if (!res.ok) continue;

        try {
          const body: unknown = await res.json();
          return NextResponse.json(body);
        } catch (error) {
          lastError = error;
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (!lastResponse) throw lastError;

    if (!lastResponse.ok) {
      return createErrorResponse(ChatErrorType.BadGateway, {
        message: `Failed to fetch pricing from provider: ${lastResponse.statusText}`,
      });
    }

    return createErrorResponse(ChatErrorType.BadGateway, {
      message: 'Provider pricing endpoint returned an invalid JSON response.',
      upstreamPath: new URL(pricingUrl).pathname,
    });
  } catch (e) {
    log(`Route: [${provider}] pricing error: %O`, e);
    const error = e instanceof Error ? { message: e.message, name: e.name } : e;
    return createErrorResponse(ChatErrorType.InternalServerError, { error });
  }
});
