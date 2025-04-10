const User = require('../../user/user.model.js');

// TODO (REFACTOR:RECOMMENDATIONS) - remove?
export const validateIDs = async (that: any) => {
  try {
    const user = await User.findOne({ _id: that.user_id }).lean();

    if (!user) {
      return false;
    }
    const usecase = that.usecase;
    const amazon_account = user?.amazon_accounts?.find(
      (amazon_account: any) =>
        amazon_account?._id?.toString() === that?.amazon_account_id?.toString()
    );

    if (amazon_account) {
      return true;
    }
    // if you dont have amazon acc but usecase equals seller_account_not_connected it shoul return true
    if (usecase === 'seller_account_not_connected') {
      return true;
    }

    return false;
  } catch (error: any) {
    console.log(error);
    return false;
  }
};
