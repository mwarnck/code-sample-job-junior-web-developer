import { ChatState } from '@/lib/state-management/useChatStore';
import { State } from '@/lib/state-management/useGlobalStore';
import { AmazonAccount } from '@/types/user/user-amazon-account.type';

type query = {
  [key: string]: string;
};
export type HooksConfig = {
  setState?: State;
  setAmazonAccount?: AmazonAccount;
  setSelectedProducts?: string[];
  head?: undefined;
  route?: query;
  setChatStore?: ChatState;
};
