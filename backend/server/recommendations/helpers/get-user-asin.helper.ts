const UserAsin = require('../../user/user_asins.model');

// TODO (REFACTOR:USERASIN) move to user-asin service or model

export const getUserAsin = async (
  recommendationData: any,
  sku: string,
  amazonAcc: any
) => {
  let userAsin = await UserAsin.findOne({
    sku,
    amazon_account_id: recommendationData.amazon_account_id,
    country_code: amazonAcc.default_marketplace.country
  });

  if (!userAsin) {
    userAsin = await UserAsin.findOne({
      sku,
      amazon_account_id: recommendationData.amazon_account_id
    });
  }
  return userAsin;
};

export const getUserAsinsAggregate = async (
  skus: any,
  amazonAccounts: any,
  amazonAccountIDs: any,
  countries: any
) => {
  let userAsin = await UserAsin.aggregate([
    {
      $match: {
        sku: {
          $in: skus
        },
        amazon_account_id: { $in: amazonAccountIDs },
        country_code: { $in: countries }
      }
    }
  ]);
  if (!userAsin.length) {
    userAsin = await UserAsin.aggregate([
      {
        $match: {
          sku: {
            $in: skus
          },
          amazon_account_id: { $in: amazonAccounts }
        }
      }
    ]);
  }
  return userAsin;
};
