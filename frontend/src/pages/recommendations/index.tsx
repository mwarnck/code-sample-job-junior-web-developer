import { ReactElement } from 'react';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { CONFIG } from '@/lib/config/config';
import withSession from '@/lib/helpers/authorization/with-session';

import LayoutComponent from '@/components/layout/layout.component';
import Recommendations from '@/components/recommendations/recommendations.component';
import { dehydrate } from '@tanstack/react-query';
import { AppSession } from '@/lib/auth/auth.types';

import { QUERY_KEYS_RECOMMENDATIONS } from '@/components/recommendations/queries/query-keys.constants';
import { fetchRecommendations } from '@/components/recommendations/queries/useRecommendations.query';
import { useBasicSSRPrefetchQueries } from '@/lib/queries/use-basic-ssr-prefetch.queries';
import { NextPageWithLayout } from '@/pages/_app';
interface Props {
  account: string;
}
const RecommendationsPage: NextPageWithLayout<Props> = ({ account }) => {
  return <Recommendations account={account} />;
};

RecommendationsPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutComponent>{page}</LayoutComponent>;
};

export const getServerSideProps = withSession(async ({ session, locale, query }) => {
  if (!session.isLoggedIn) {
    return {
      redirect: {
        destination: CONFIG.URL.RELOGIN.path,
        permanent: false
      }
    };
  }

  const amazonAccountId = query.account;
  const { queryClient, user } = await useBasicSSRPrefetchQueries({
    session: session as AppSession,
    amazonAccountId
  });
  // additional queries for this page
  if (user) {
    await queryClient.prefetchQuery({
      queryKey: [
        QUERY_KEYS_RECOMMENDATIONS.GET_RECOMMENDATIONS,
        { isPaidUser: user.isPaid, activeAmazonAccountId: amazonAccountId }
      ],
      queryFn: () =>
        fetchRecommendations({
          session: session as AppSession,
          activeAmazonAccountId: amazonAccountId,
          filter: 'all'
        })
    });
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'qi',
        'nav-bar',
        'common',
        'footer',
        'dashboard',
        'assistant',
        'recommendations',
        'api-errors',
        'payment',
        'onboarding',
        'settings',
        'chat'
      ])),
      account: amazonAccountId,
      dehydratedState: dehydrate(queryClient)
    }
  };
});

export default RecommendationsPage;
