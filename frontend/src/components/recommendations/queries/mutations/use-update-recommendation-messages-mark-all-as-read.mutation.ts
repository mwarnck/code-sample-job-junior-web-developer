import { QUERY_KEYS_AUTOMATION_USER } from '@/components/automations/automation-user/queries/query-keys.constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AppSession } from '@/lib/auth/auth.types';
import { useSession } from 'next-auth/react';
import { CONFIG } from '@/lib/config/config';
import { processApiResponseReactQuery } from '@/lib/api/process-api-response-react-query.helper';

import { requestApi } from '@/lib/api/request-api.helper';

export const useUpdateRecommendationMessagesMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const session = useSession({ required: true }) as AppSession;
  const queryKeyToInvalidate = [QUERY_KEYS_AUTOMATION_USER.GET_RECOMMENDATION_TASK_COUNT];

  return useMutation({
    mutationFn: async (recommendation_id: string) => {
      if (!session) {
        throw Error(
          'Session must be provided to useUpdateRecommendationMessagesMarkAllAsRead mutation'
        );
      }
      if (!recommendation_id) {
        throw Error(
          'recommendation_id must be provided to useUpdateRecommendationMessagesMarkAllAsRead mutation'
        );
      }
      const url = `${CONFIG.API.ENDPOINT}/recommendations/${recommendation_id}/messages/mark-all-as-read`;
      const response = await requestApi.patch({
        url,
        session
      });
      return await processApiResponseReactQuery({
        response
      });
    },
    onSettled: async () => {
      queryClient.invalidateQueries(queryKeyToInvalidate);
    }
  });
};
