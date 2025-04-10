import CtasModel from '../../assistant/cta/cta.model';
import {
  permissionLayerKeys,
  operations
} from '../../user/sharing/model.permissions';
import { recommendationsAccessService } from '../recommendations.access.service';
import { faker } from '@faker-js/faker';

const UserModel = require('../../user/user.model');
const { recommendations, user } = require('../../../test/db');
const createSharingRelation = require('../../../test/db/compositions/sharing');

describe('Recommendations Access Service', () => {
  let quantityBundlesRecommendation: any = null;
  let userWithAcc: any = null;
  let userAutomation: any = null;
  let userWithAccAmazonAccountId: any = null;
  let userWithoutAccountButWithSharedReceivingRecommendations: any = null;
  let userWithoutAccountButWithSharedReceivingRecommendationsAutomated: any =
    null;
  let userWithAccountAndWithSharedSendingRecommendationsAutomated: any = null;
  let amazonAccountIdRecommendationsAutomated: any = null;

  beforeEach(async () => {
    userAutomation = await new UserModel(user.automation()).save();
    jest.spyOn(CtasModel, 'find');
    userWithAcc = await new UserModel(user.withAmazonAccount()).save();
    userWithAccAmazonAccountId = userWithAcc.amazon_accounts[0].id;
    quantityBundlesRecommendation = recommendations.quantityBundle();
    quantityBundlesRecommendation.amazon_account_id =
      userWithAccAmazonAccountId;
    quantityBundlesRecommendation.user_id = userWithAcc._id;
    quantityBundlesRecommendation.cta_id = faker.database.mongodbObjectId();

    ({
      userWithoutAccount:
        userWithoutAccountButWithSharedReceivingRecommendations
    } = await createSharingRelation(
      {
        name: permissionLayerKeys.recommendations,
        access: [operations.write]
      },
      userAutomation
    ));

    ({
      userWithoutAccount:
        userWithoutAccountButWithSharedReceivingRecommendationsAutomated,
      userWithAmazonAccount:
        userWithAccountAndWithSharedSendingRecommendationsAutomated
    } = await createSharingRelation(
      {
        name: permissionLayerKeys.recommendations_automated,
        access: [operations.write],
        subTypes: ['automated_recommendations']
      },
      userAutomation
    ));

    userWithoutAccountButWithSharedReceivingRecommendationsAutomated.username =
      // config.automationAccount.username;
      userAutomation.username;
    userWithoutAccountButWithSharedReceivingRecommendationsAutomated.email =
      // config.automationAccount.email;
      userAutomation.email;

    amazonAccountIdRecommendationsAutomated =
      userWithAccountAndWithSharedSendingRecommendationsAutomated
        .amazon_accounts[0].id;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkUserRecommendationsAccess', () => {
    it('should return true if user is owner of the account', async () => {
      const result =
        await recommendationsAccessService.checkUserRecommendationsAccess(
          userWithAcc,
          userWithAccAmazonAccountId
        );
      expect(result).toBe(true);
    });

    it('with sharing recommendations automated enabled and valid access', async () => {
      const result =
        await recommendationsAccessService.checkUserRecommendationsAccess(
          userWithoutAccountButWithSharedReceivingRecommendationsAutomated,
          amazonAccountIdRecommendationsAutomated
        );

      expect(result).toBe(true);
    });

    it('with both sharing recommendations and automated enabled but no valid access', async () => {
      const result =
        await recommendationsAccessService.checkUserRecommendationsAccess(
          userWithoutAccountButWithSharedReceivingRecommendations,
          '123'
        );

      expect(result).toBe(false);
    });
  });
});
