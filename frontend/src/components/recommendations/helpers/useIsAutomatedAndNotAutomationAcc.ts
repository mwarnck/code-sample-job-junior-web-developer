import { useIsAutomationAccount } from './useIsAutomationAccount';

const useIsAutomatedAndNotAutomationAcc = (isAutomated: boolean) => {
  const isAutomationAccount = useIsAutomationAccount();

  const isAutomatedAndNotAutomationAcc = isAutomated && !isAutomationAccount;

  return isAutomatedAndNotAutomationAcc;
};

export default useIsAutomatedAndNotAutomationAcc;
