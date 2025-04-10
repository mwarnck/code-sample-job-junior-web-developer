import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { CONFIG } from '@/lib/config/config';
import { useGlobalStore } from '@/lib/state-management/useGlobalStore';
import { processApiResponseReactQuery } from '@/lib/api/process-api-response-react-query.helper';
import { requestApi } from '@/lib/api/request-api.helper';

import { QUERY_KEYS_RECOMMENDATIONS } from '../query-keys.constants';
import { QUERY_KEYS_USERFLOWS } from '@/components/userflow/queries/query-keys.constants';
import { Recommendation } from '@/types/recommendations/recommendation.type';
import { MIXPANEL_EVENTS } from '@/lib/mixpanel/mixpanel-events.constants';
import { MixpanelWrapper } from '@/lib/mixpanel/useMixpanel';
import { useRecommendationTasksCountQuery } from '@/components/automations/automation-user/queries/useRecommendationTaskCount.query';

type NewRecommendation = {
  _id: string | string[];
  status: string;
  multi?: boolean;
  resolver?: string;
};

export const useUpdateRecommendationsStatus = () => {
  const url = `${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.RECOMMENDATIONS.UPDATE_STATUS}`;
  const session = useSession({ required: true });
  const queryClient = useQueryClient();
  const selectedAmazonAccount = useGlobalStore((state) => state.selectedAmazonAccount);

  const queryKeyRecommendations = [
    QUERY_KEYS_RECOMMENDATIONS.GET_RECOMMENDATIONS,
    { isPaidUser: true, activeAmazonAccountId: selectedAmazonAccount?._id }
  ];

  const { refetch } = useRecommendationTasksCountQuery();

  return useMutation({
    mutationFn: async ({ _id, status }: NewRecommendation) => {
      MixpanelWrapper.track(MIXPANEL_EVENTS.RECOMMENDATIONS.UPDATE_STARTED, {
        recommendationId: _id,
        resolved_status: status
      });

      const response = await requestApi
        // @ts-ignore
        .patch({ url, session, body: { _id, resolved_status: status } });

      // Refetch the recommendatoins counter
      refetch();
      // @ts-ignore
      return await processApiResponseReactQuery({ response });
    },
    onMutate: async ({ _id: recommendationId, status: recommendationStatus }) => {
      // Snapshot the previous value

      const previousRecommendations = queryClient.getQueryData(
        queryKeyRecommendations
      ) as Recommendation;

      let recommendationsObject;
      if (previousRecommendations) {
        recommendationsObject = Object.keys(previousRecommendations).reduce((acc, cur) => {
          acc = {
            ...acc,
            [cur]: {
              ...previousRecommendations[cur],
              data: previousRecommendations[cur].data.map((recommendation) => {
                if (recommendation._id === recommendationId) {
                  recommendation.resolved_status = recommendationStatus;
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
      }
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
      queryClient.invalidateQueries([
        QUERY_KEYS_USERFLOWS.GET_USERFLOW,
        { amazonAccountId: selectedAmazonAccount?._id }
      ]);
    }
  });
};
