import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { AppSession } from '@/lib/auth/auth.types';
import { CONFIG } from '@/lib/config/config';

import { processApiResponseReactQuery } from '@/lib/api/process-api-response-react-query.helper';
import { requestApi } from '@/lib/api/request-api.helper';

import { QUERY_KEYS_RECOMMENDATIONS } from './query-keys.constants';
import { GetAllRecommendationsData } from '@/types/api/recommendations/get-all';

type Props = {
  session: AppSession;
  activeAmazonAccountId: string;
  filter: string;
};

export const fetchRecommendations = ({ session, activeAmazonAccountId, filter }: Props) => {
  if (!session) {
    throw new Error('Session must be provided to fetchRecommendations');
  }
  if (!activeAmazonAccountId) {
    throw new Error('id of active amazon account must be provided to fetch recommendations');
  }

  const baseUrl = `${CONFIG.API.ENDPOINT}${CONFIG.API.METHODS.RECOMMENDATIONS.GET_RECOMMENDATIONS}/${activeAmazonAccountId}`;
  const urlObj = new URL(baseUrl);
  if (filter) {
    urlObj.searchParams.append('filter', filter);
  }
  const url = urlObj.toString();

  return requestApi
    .get({
      url,
      session
    })
    .then((response) => processApiResponseReactQuery<GetAllRecommendationsData>({ response }));
};

export const useRecommendationsQuery = ({
  isPaidUser,
  activeAmazonAccountId,
  filter
}: {
  isPaidUser: boolean;
  activeAmazonAccountId: string;
  filter: string;
}) => {
  const session = useSession({ required: true });

  const queryResult = useQuery({
    enabled: session.status === 'authenticated' && activeAmazonAccountId != null,
    queryKey: [
      QUERY_KEYS_RECOMMENDATIONS.GET_RECOMMENDATIONS,

      { isPaidUser, activeAmazonAccountId, filter }
    ],
    queryFn: async () => {
      return fetchRecommendations({
        session: session as AppSession,
        activeAmazonAccountId,
        filter
      });
    }
  });

  return { ...queryResult };
};
