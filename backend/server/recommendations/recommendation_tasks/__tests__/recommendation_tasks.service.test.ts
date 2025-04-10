import { Types } from 'mongoose';
import { recommendationTasksServiceInstance } from '../../../config/initializer';
import {
  operations,
  permissionLayerKeys
} from '../../../user/sharing/model.permissions';
const createSharingRelation = require('../../../../test/db/compositions/sharing');

describe('RecommendationTasksService', () => {
  let userWithAcc: any = null;
  let userWithAccAmazonAccountId: string | null = null;

  let userAutomation: any = null;

  beforeEach(async () => {
    ({
      userWithAmazonAccount: userWithAcc,
      userWithoutAccount: userAutomation
    } = await createSharingRelation({
      name: permissionLayerKeys.recommendations_automated,
      access: [operations.write],
      subTypes: ['automated_recommendations']
    }));
    userWithAccAmazonAccountId = userWithAcc.amazon_accounts[0].id;
  });

  describe('getTaskCountDataForAmazonAccount', () => {
    it('it should throw an error if required parameters are missing', async () => {
      await expect(
        recommendationTasksServiceInstance.getTaskCountDataForAmazonAccount({
          user: null,
          amazon_account_id: new Types.ObjectId()
        })
      ).rejects.toThrow('Missing required parameters');
    });

    it('it should return the correct structure for normal user', async () => {
      const result =
        await recommendationTasksServiceInstance.getTaskCountDataForAmazonAccount(
          {
            user: userWithAcc,
            amazon_account_id: userWithAccAmazonAccountId
          }
        );
      expect(result).toEqual(
        expect.objectContaining({
          amazon_account_id: expect.any(String),
          tasks: expect.objectContaining({
            newCount: expect.any(Number),
            openCount: expect.any(Number)
          })
        })
      );
    });

    it('it should return the correct structure for automation user', async () => {
      const result =
        await recommendationTasksServiceInstance.getTaskCountDataForAmazonAccount(
          {
            user: userAutomation,
            amazon_account_id: userWithAccAmazonAccountId
          }
        );
      expect(result).toEqual(
        expect.objectContaining({
          amazon_account_id: expect.any(String),
          tasks: expect.objectContaining({
            newCount: expect.any(Number),
            openCount: expect.any(Number)
          })
        })
      );
    });
  });

  describe('getTaskCount', () => {
    it('it should throw an error if required parameters are missing', async () => {
      await expect(
        recommendationTasksServiceInstance.getTaskCount(null)
      ).rejects.toThrow('Missing required parameters');
    });

    it('it should return the correct structure', async () => {
      const result =
        await recommendationTasksServiceInstance.getTaskCount(userWithAcc);

      expect(result.meta).toEqual(
        expect.objectContaining({
          newOverall: expect.any(Number),
          openOverall: expect.any(Number)
        })
      );
      expect(result.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            amazon_account_id: expect.any(String),
            tasks: expect.objectContaining({
              newCount: expect.any(Number),
              openCount: expect.any(Number)
            })
          })
        ])
      );
    });

    it.todo('should return the correct numbers just for own accounts');

    it.todo('should return the correct numbers just for shared accounts');

    it.todo('should return the correct numbers for own and shared accounts');
  });
});
