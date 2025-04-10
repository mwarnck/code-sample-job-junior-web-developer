import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { CONFIG } from '@/lib/config/config';
import { useGlobalStore } from '@/lib/state-management/useGlobalStore';
import { processApiResponseReactQuery } from '@/lib/api/process-api-response-react-query.helper';
import { requestApi } from '@/lib/api/request-api.helper';

import { Recommendation } from '@/types/recommendations/recommendation.type';
import { QUERY_KEYS_RECOMMENDATIONS } from '../query-keys.constants';

type NewRecommendation = {
  _id: string | string[];
  bundle_sku: string;
  multi?: boolean;
};

export const useUpdateBundleSku = () => {
  const url = `${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.RECOMMENDATIONS.UPDATE_BUNDLE_SKU}`;
  const session = useSession({ required: true });
  const queryClient = useQueryClient();
  const selectedAmazonAccount = useGlobalStore((state) => state.selectedAmazonAccount);

  const queryKeyRecommendations = [
    QUERY_KEYS_RECOMMENDATIONS.GET_RECOMMENDATIONS,
    { isPaidUser: true, activeAmazonAccountId: selectedAmazonAccount?._id }
  ];

  return useMutation({
    mutationFn: async ({ _id, bundle_sku, multi = false }: NewRecommendation) =>
      requestApi
        // @ts-ignore
        .patch({ url, session, body: { _id, bundle_sku, multi } })
        .then((response) => {
          // @ts-ignore
          processApiResponseReactQuery({ response });
        }),
    onMutate: async ({ _id: recommendationId, bundle_sku }) => {
      // Snapshot the previous value
      const previousRecommendations = queryClient.getQueryData(
        queryKeyRecommendations
      ) as Recommendation;
      // console.log('previousRecommendations:', previousRecommendations)
      if (!previousRecommendations) {
        return;
      }
      const recommendationsObject = Object.keys(previousRecommendations).reduce((acc, cur) => {
        acc = {
          ...acc,
          [cur]: {
            ...previousRecommendations[cur],
            data: previousRecommendations[cur].data.map((recommendation) => {
              if (recommendation._id === recommendationId) {
                recommendation.bundle_sku = bundle_sku;
              }
              return recommendation;
            })
          }
        };
        return acc;
      }, {});

      // // Cancel any outgoing refetches
      // // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(queryKeyRecommendations);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeyRecommendations, () => {
        return recommendationsObject;
      });

      // Return a context with the previous recommendations
      return { previousRecommendations };
    },
    // If the mutation fails, use the context we returned above
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: (_err, _newRecommendations, context) => {
      if (context?.previousRecommendations) {
        queryClient.setQueryData(queryKeyRecommendations, context.previousRecommendations);
      }
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries(queryKeyRecommendations);
    }
  });
};
