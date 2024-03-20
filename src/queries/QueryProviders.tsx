'use client';
import type { QueryKey } from '@tanstack/react-query';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import ky from 'ky';
import _ from 'lodash';
import { useRouter } from 'next/navigation';
import React, { type ReactNode, useRef, useState } from 'react';

import { NEXT_BASE_URL } from '@/lib/helpers';

import useLoginStore from '@/stores/loginStore';
import useRefreshTokenStore from '@/stores/refreshTokenStore';
import { useToast } from '@/components/ui/use-toast';

export default function Providers(props: { children: ReactNode }) {
  const { setIsAlreadyLogin } = useLoginStore();
  const router = useRouter();
  const { setIsRefreshingToken } = useRefreshTokenStore();
  const { toast } = useToast();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30000, // 30 seconds
            retry: (failureCount, error) => {
              // Don't retry for certain error responses
              if (error?.response?.status === 401) {
                return false;
              }
              // Retry others just once
              return failureCount <= 1;
            },
          },
        },
        mutationCache: new MutationCache({
          onError: async (error, variables, context, mutation) => {
            if (error?.response?.status === 401) {
              await refreshAuthToken();
              await mutation.execute(variables);
            } else {
              const data = await error.response.json();
              if (!_.isEmpty(data.error)) {
                const error = data.error;
                return toast({
                  variant: 'destructive',
                  description: error.message,
                });
              }
            }
          },
        }),
        queryCache: new QueryCache({
          onError: async (error, query) => {
            if (error?.response?.status === 401) {
              await refreshAuthToken(query.queryKey);
            }
          },
        }),
      }),
  );

  const isTokenRenewalInProgress = useRef(false);
  const queryKeyQueue = useRef<QueryKey[]>([]);

  const refreshAuthToken = async (queryKey?: QueryKey) => {
    if (!isTokenRenewalInProgress.current) {
      try {
        setIsRefreshingToken(true);
        isTokenRenewalInProgress.current = true;
        const res = await ky.post(`${NEXT_BASE_URL}/api/auth/renew-token`, {
          credentials: 'include',
        });
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey });
          if (queryKey !== undefined) {
            queryKeyQueue.current.forEach((key) => {
              queryClient.invalidateQueries({ queryKey: key });
            });
          }
        }
      } catch {
        setIsAlreadyLogin(false);
        router.replace('/');
      } finally {
        setIsRefreshingToken(false);
        isTokenRenewalInProgress.current = false;
        queryKeyQueue.current = [];
      }
    } else {
      if (queryKey !== undefined) {
        queryKeyQueue.current.push(queryKey);
      }
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {props.children}
      </ReactQueryStreamedHydration>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
