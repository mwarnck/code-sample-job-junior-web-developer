import { useUserQ } from '@/lib/hooks/queries/useUser.query';

export const useIsAutomationAccount = () => {
  const { data: user } = useUserQ();
  // return user?.username === 'automation'; // (FIXED) TODO [AMZ-2345]: user.roles.includes('automation') benutzen
  return user?.userModules?.some((module) => module.key === 'automation');
};
