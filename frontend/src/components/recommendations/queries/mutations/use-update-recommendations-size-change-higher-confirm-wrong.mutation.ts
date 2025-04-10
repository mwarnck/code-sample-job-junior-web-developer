import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { CONFIG } from '@/lib/config/config';
import { useGlobalStore } from '@/lib/state-management/useGlobalStore';
import { processApiResponseReactQuery } from '@/lib/api/process-api-response-react-query.helper';
import { requestApi } from '@/lib/api/request-api.helper';

import { QUERY_KEYS_ASSISTANT } from '@/components/assistant/queries/query-keys.constants';

import { QUERY_KEYS_RECOMMENDATIONS } from '../query-keys.constants';

export const useUpdateRecommendationsSizeChangeHigherConfirmWrong = () => {
  const url = `${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.RECOMMENDATIONS.UPDATE_SIZE_CHANGE_HIGHER_CONFIRM_WRONG}`;
  const session = useSession({ required: true });
  const queryClient = useQueryClient();
  const selectedAmazonAcc = useGlobalStore((state) => state.selectedAmazonAccount);
  const queryKeyToInvalidateRecommendations = [
    QUERY_KEYS_RECOMMENDATIONS.GET_RECOMMENDATIONS,
    { activeAmazonAccountId: selectedAmazonAcc?._id, isPaidUser: true }
  ];
  const queryKeyToInvalidateCtas = [
    QUERY_KEYS_ASSISTANT.GET_CTAS,
    {
      isPaidUser: true
    }
  ];

  return useMutation({
    mutationFn: async ({ _id }: { _id: string }) => {
      const response = await requestApi
        // @ts-ignore
        .patch({ url, session, body: { _id } });

      // @ts-ignore
      return await processApiResponseReactQuery({ response });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeyToInvalidateRecommendations
      });
      queryClient.invalidateQueries({
        queryKey: queryKeyToInvalidateCtas
      });
    }
  });
};
