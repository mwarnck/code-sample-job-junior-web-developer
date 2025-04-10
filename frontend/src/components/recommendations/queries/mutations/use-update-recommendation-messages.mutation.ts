import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { AppSession } from '@/lib/auth/auth.types';
import { CONFIG } from '@/lib/config/config';
import { useGlobalStore } from '@/lib/state-management/useGlobalStore';

import { processApiResponseReactQuery } from '@/lib/api/process-api-response-react-query.helper';
import { requestApi } from '@/lib/api/request-api.helper';

import { QUERY_KEYS_RECOMMENDATIONS } from '../query-keys.constants';
import { Recommendations } from '@/types/recommendations/recommendation.type';

export const useUpdateRecommendationMessages = () => {
  const queryClient = useQueryClient();
  const session = useSession({ required: true }) as AppSession;
  const selectedAmazonAcc = useGlobalStore((state) => state.selectedAmazonAccount);
  const queryKeyToInvalidate = [
    QUERY_KEYS_RECOMMENDATIONS.GET_RECOMMENDATIONS,
    { activeAmazonAccountId: selectedAmazonAcc?._id, isPaidUser: true }
  ];

  return useMutation({
    mutationFn: async ({
      recommendation_id,
      new_message,
      messengerUploads,
      reply_required = true,
      with_cta = true
    }: {
      recommendation_id: string;
      new_message: string;
      messengerUploads?: string[];
      reply_required?: boolean;
      with_cta?: boolean;
    }) =>
      requestApi
        .post({
          url: `${CONFIG.API.ENDPOINT}/recommendations/${recommendation_id}/messages`,
          session,
          //@ts-ignore
          body: { text: new_message, files: messengerUploads || [], reply_required, with_cta }
        })
        .then((response) => {
          const data = response as Response;
          return processApiResponseReactQuery({ response: data });
        }),
    onMutate: async (newRecommendation: {
      recommendation_id: string;
      new_message: string;
      messengerUploads?: string[];
      reply_required?: boolean;
      usecase: string;
    }) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(queryKeyToInvalidate);
      // Snapshot the previous value
      const previousRecommendations: Recommendations | undefined =
        queryClient.getQueryData(queryKeyToInvalidate);
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeyToInvalidate, (oldData) => {
        oldData &&
          Array.isArray(oldData) &&
          oldData?.[newRecommendation?.usecase].data
            .find((recommendation) => recommendation?._id === newRecommendation?.recommendation_id)
            .messages.push(newRecommendation?.new_message);
      });
      // Return a context with the previous and new todo
      return { previousRecommendations };
    },

    // If the mutation fails, use the context we returned above
    onError: (_err, _newCtas, context) => {
      queryClient.setQueryData(queryKeyToInvalidate, context?.previousRecommendations);
    }
  });
};
