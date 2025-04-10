export const sortRecommendationsByMessages = async (
  userRecommendations: any,
  user: any,
  amazon_account_id?: any
) => {
  // sort recommendations with messages up
  const sortedByMessagesAvailable = userRecommendations.sort(
    (a: any, b: any) => {
      const aMessagesAvailable = a?.messages?.length;
      const bMessagesAvailable = b?.messages?.length;

      if (aMessagesAvailable && !bMessagesAvailable) {
        return -1;
      }
      if (!aMessagesAvailable && bMessagesAvailable) {
        return 1;
      }

      return 0;
    }
  );

  if (!user) {
    return sortedByMessagesAvailable;
  }

  const isAutomationUser = user.isAutomationUser();

  let sortedForTypeOfUser = sortedByMessagesAvailable;
  if (!isAutomationUser) {
    const automationUser =
      await user.getAutomationUserOfAmazonAccount(amazon_account_id);
    // sort recommendations with last message from arthy up
    if (automationUser) {
      sortedForTypeOfUser = sortForOwnerUser(
        sortedByMessagesAvailable,
        automationUser?._id //automationUserId
      );
    }
  }
  // sort recommendations with last message from user up
  if (isAutomationUser) {
    sortedForTypeOfUser = sortForAutomationUser(
      sortedByMessagesAvailable,
      user._id
    );
  }

  return sortedForTypeOfUser;
};

const sortForOwnerUser = (
  sortedByMessagesAvailable: any,
  automationUserId: any
) => {
  const sortedRecommendations = sortedByMessagesAvailable.sort(
    (a: any, b: any) => {
      const aLastMessageIsFromAutomation =
        a?.messages?.[0]?.sender?.toString() === automationUserId?.toString();
      const bLastMessageIsFromAutomation =
        b?.messages?.[0]?.sender?.toString() === automationUserId?.toString();
      const aMessagesAvailable = a?.messages?.length;
      const bMessagesAvailable = b?.messages?.length;

      if (
        aMessagesAvailable &&
        bMessagesAvailable &&
        !aLastMessageIsFromAutomation &&
        bLastMessageIsFromAutomation
      ) {
        return 1;
      }
      if (
        bMessagesAvailable &&
        aMessagesAvailable &&
        aLastMessageIsFromAutomation &&
        !bLastMessageIsFromAutomation
      ) {
        return -1;
      }

      return 0;
    }
  );
  return sortedRecommendations;
};

const sortForAutomationUser = (
  sortedByMessagesAvailable: any,
  automationUserId: any
) => {
  const sortedRecommendations = sortedByMessagesAvailable.sort(
    (a: any, b: any) => {
      const aLastMessageIsFromAutomation =
        a?.messages?.[0]?.sender?.toString() === automationUserId.toString();
      const bLastMessageIsFromAutomation =
        b?.messages?.[0]?.sender?.toString() === automationUserId.toString();
      const aMessagesAvailable = a?.messages?.length;
      const bMessagesAvailable = b?.messages?.length;

      if (
        aMessagesAvailable &&
        bMessagesAvailable &&
        aLastMessageIsFromAutomation &&
        !bLastMessageIsFromAutomation
      ) {
        return 1;
      }
      if (
        bMessagesAvailable &&
        aMessagesAvailable &&
        !aLastMessageIsFromAutomation &&
        bLastMessageIsFromAutomation
      ) {
        return -1;
      }

      return 0;
    }
  );
  return sortedRecommendations;
};
