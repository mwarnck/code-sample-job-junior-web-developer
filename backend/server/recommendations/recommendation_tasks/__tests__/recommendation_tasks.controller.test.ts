import { recommendationTasksControllerInstance } from '../../../config/initializer';
import {
  operations,
  permissionLayerKeys
} from '../../../user/sharing/model.permissions';
const { buildReq, buildRes } = require('../../../../test/utils');
const createSharingRelation = require('../../../../test/db/compositions/sharing');

describe('RecommendationTaskCountController', () => {
  let userWithAmazonAccount: any = null;
  let userWithAmazonAccountAmazonAccountId: string | null = null;

  let userAutomation: any = null;

  beforeEach(async () => {
    ({
      userWithAmazonAccount: userWithAmazonAccount,
      userWithoutAccount: userAutomation
    } = await createSharingRelation({
      name: permissionLayerKeys.recommendations_automated,
      access: [operations.write],
      subTypes: ['automated_recommendations']
    }));
    userWithAmazonAccountAmazonAccountId =
      userWithAmazonAccount.amazon_accounts[0].id;
  });

  describe('getTasksCount', () => {
    it('should return a 422 status if an error occurs', async () => {
      jest
        .spyOn(
          recommendationTasksControllerInstance.recommendationTasksService,
          'getTaskCount'
        )
        .mockRejectedValue(new Error('Test Error'));

      const res = buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        params: {
          amazon_account_id: userWithAmazonAccountAmazonAccountId
        }
      });

      await recommendationTasksControllerInstance.getTaskCount(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('should return a 200 status and a JSON object with the tasks count', async () => {
      const mockData = {
        data: [
          {
            amazon_account_id: userWithAmazonAccountAmazonAccountId,
            tasks: {
              newCount: 0,
              openCount: 0
            }
          }
        ],
        meta: {
          newOverall: 0,
          openOverall: 0,
          lastUpdated: new Date()
        }
      };

      jest
        .spyOn(
          recommendationTasksControllerInstance.recommendationTasksService,
          'getTaskCount'
        )
        .mockResolvedValue(mockData);

      const res = buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        params: {
          amazon_account_id: userWithAmazonAccountAmazonAccountId
        }
      });

      await recommendationTasksControllerInstance.getTaskCount(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });
  });
});
