type TTaskCountForAmazonAccountResult = {
  amazon_account_id: string;
  tasks: {
    newCount: number;
    openCount: number;
  };
};

type TTaskCountResult = {
  data: TTaskCountForAmazonAccountResult[];
  meta: {
    newOverall: number;
    openOverall: number;
  };
};

type TGetTaskCountUserArgs = {
  user: any;
  amazon_account_id: string;
  usecases: string[];
};

export {
  TGetTaskCountUserArgs,
  TTaskCountForAmazonAccountResult,
  TTaskCountResult
};
