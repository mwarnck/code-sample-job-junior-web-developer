import { RecommendationsHeader } from './recommendations.header.component';

export const RecommendationsHeaderForTests = ({ isAutomationAccount, isSelectedAccountPaid }) => {
  const mockedUseSelectedAccPaidStatusQ = () => {
    return { data: { isSelectedAccPaid: isSelectedAccountPaid } };
  };
  const useIsAutomationAccountQMocked = () => {
    return isAutomationAccount;
  };
  return (
    <RecommendationsHeader
      isAccordion
      numberOfRecommendations={{ total: 10, completed: 4 }}
      // @ts-ignore
      useIsAutomationAccount={useIsAutomationAccountQMocked}
      // @ts-ignore
      useSelectedAccPaidStatusQ={mockedUseSelectedAccPaidStatusQ}
    />
  );
};
