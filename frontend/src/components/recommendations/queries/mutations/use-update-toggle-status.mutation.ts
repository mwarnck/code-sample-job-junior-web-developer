import { CONFIG } from '@/lib/config/config';
import { MIXPANEL_EVENTS } from '@/lib/mixpanel/mixpanel-events.constants';
import { MixpanelWrapper } from '@/lib/mixpanel/useMixpanel';
import { processApiResponseReactQuery } from '@/lib/api/process-api-response-react-query.helper';
import { QUERY_KEYS_ASSISTANT } from '@/components/assistant/queries/query-keys.constants';
import { QUERY_KEYS_AUTOMATIONS } from '@/components/automations/queries/query-keys.constants';
import { QUERY_KEYS_USERFLOWS } from '@/components/userflow/queries/query-keys.constants';
import { requestApi } from '@/lib/api/request-api.helper';
import { useGlobalStore } from '@/lib/state-management/useGlobalStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type { AppSession } from '@/lib/auth/auth.types';
import type { Userflow } from '@/types/userflow/userflow.type';
import { QUERY_KEYS_DASHBOARD } from '@/components/dashboard/queries/query-keys.constants';

type NewToggle = {
  _id: string;
  status: boolean;
  toggle_name: string;
  amazon_account_id: string;
  resolver: string;
};

export const useUpdateTogglesStatus = () => {
  const url = `${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.AUTOMATIONS.UPDATE_AUTOMATIONS}`;
  const queryClient = useQueryClient();
  const selectedAmazonAccount = useGlobalStore((state) => state.selectedAmazonAccount);
  const session = useSession({ required: true });
  const queryKeyToInvalidate = [QUERY_KEYS_AUTOMATIONS.GET_AUTOMATIONS, { isPaidUser: true }];
  const queryKeyToInvalidateUserflow = [
    QUERY_KEYS_USERFLOWS.GET_USERFLOW,
    { amazonAccountId: selectedAmazonAccount?._id }
  ];
  const queryKeyToInvalidateAssitantCTAs = [
    QUERY_KEYS_ASSISTANT.GET_CTAS,
    { isPaidUser: true, amazon_account_id: selectedAmazonAccount?._id }
  ];
  const queryKeyToInvalidateMainDashboardWidgets = [
    QUERY_KEYS_DASHBOARD.GET_MAIN_DASHBOARD_DATA,
    { activeAmazonAccountId: selectedAmazonAccount?._id }
  ];

  return useMutation({
    mutationFn: async ({ _id, status, toggle_name, amazon_account_id, resolver }) => {
      MixpanelWrapper.track(MIXPANEL_EVENTS.TOGGLES.UPDATE_STARTED, {
        toggleId: _id,
        toggleStatus: status,
        toggle_name,
        amazon_account_id,
        resolver
      });

      return (
        requestApi
          // @ts-ignore
          .patch({
            url,
            session: session as AppSession,
            body: {
              _id,
              toggleStatus: status,
              toggle_name,
              amazon_account_id,
              resolver
            }
          })
          .then((response) => {
            processApiResponseReactQuery({ response });
          })
      );
    },
    onMutate: async (newToggle: NewToggle) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(queryKeyToInvalidate);
      await queryClient.cancelQueries(queryKeyToInvalidateUserflow);
      // Snapshot the previous value
      const previousRecommendations = queryClient.getQueryData(queryKeyToInvalidate);
      const previousUserflow = queryClient.getQueryData(queryKeyToInvalidateUserflow);
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeyToInvalidate, (oldData) => {
        if (oldData?.[newToggle.toggle_name]._id === newToggle?._id) {
          oldData[newToggle.toggle_name].active = newToggle.status;
        }
        return oldData;
      });
      queryClient.setQueryData(queryKeyToInvalidateUserflow, (oldData) => {
        if (oldData) {
          const userflowData = oldData as Userflow;
          const optimisticData = {
            ...userflowData,
            steps: userflowData.steps.map((step) => {
              if (step.type === newToggle.toggle_name) {
                step.completed = true;
              }
              return step;
            })
          };
          return optimisticData;
        }
        return oldData;
      });
      // Return a context with the previous and new todo
      return { previousRecommendations, previousUserflow };
    },

    // If the mutation fails, use the context we returned above
    onError: (_err, _newCtas, context) => {
      queryClient.setQueryData(queryKeyToInvalidate, context?.previousRecommendations);
      queryClient.setQueryData(queryKeyToInvalidateUserflow, context?.previousUserflow);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeyToInvalidate
      });
      queryClient.invalidateQueries({
        queryKey: queryKeyToInvalidateAssitantCTAs
      });
      queryClient.invalidateQueries({
        queryKey: queryKeyToInvalidateMainDashboardWidgets
      });
    }
  });
};
