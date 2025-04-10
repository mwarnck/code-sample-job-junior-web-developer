import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

const UserModel = require('../../user/user.model');
const {
  recommendations,
  user,
  addresses,
  shipment
} = require('../../../test/db');
const RecommendationModel = require('../recommendations.model');
const FBAInboundShipmentModel = require('../../shipments/fba_inbound_shipment.model');
const UserAddressModel = require('../../addresses/user_address.model');

const { default: routing } = require('../../config/routing');
const { default: expressService } = require('../../config/lib/express');

describe('Recommendations Routes', () => {
  let userWithAmazonAccount: any = null;
  let userWithAmazonAccountId: any = null;
  let userWithoutAccAndNoShared: any = null;
  let automationUser1: any = null;
  let automationUser2: any = null;
  let fakeQuantityBundles: any = null;
  let recommendationQuantityBundles: any = null;
  let fakeDamagedInventory: any = null;
  let recommendationDamagedInventory: any = null;
  let fakeMisplacedInventory: any = null;
  let recommendationMisplacedInventory: any = null;
  let fakeMissingInbound: any = null;
  let recommendationMissingInbound: any = null;
  let fakeSizeChangeHigher: any = null;
  let recommendationSizeChangeHigher: any = null;

  let fakeUserAddress: any;
  let fakeMissingInboundWithQuantitySend: any = null;
  let fakeShipment: any = null;

  let recommendationMissingInboundWithQuantitySend: any = null;

  let supertestRequest: any = null;

  beforeEach(async () => {
    const automation1 = user.automation();
    let automation2 = user.automation();
    while (automation1.username === automation2.username) {
      automation2 = user.automation();
    }
    automationUser1 = await new UserModel(automation1).save();
    automationUser2 = await new UserModel(automation2).save();
    userWithAmazonAccount = await new UserModel(user.withAmazonAccount());
    userWithAmazonAccountId = userWithAmazonAccount.amazon_accounts[0].id;
    userWithAmazonAccount.roles = ['paid'];
    await userWithAmazonAccount.save();

    const sharingObject = {
      user: userWithAmazonAccount._id,
      shared_id: '8ac30c8b-bb15-43b4-af3f-904a797f45db',
      status: 'accepted',
      amazon_accounts: [
        {
          amazon_account_id: userWithAmazonAccountId,
          brands: [],
          permission: {
            type: 'custom',
            value: [
              {
                name: 'recommendations_automated',
                access: 'write',
                subTypes: ['automated_recommendations']
              }
            ]
          }
        }
      ]
    };
    automationUser2.sharing.receiving.push(sharingObject);
    await automationUser2.save();

    userWithoutAccAndNoShared = new UserModel(user.minimal());
    await userWithoutAccAndNoShared.save();

    fakeQuantityBundles = recommendations.quantityBundle();
    fakeDamagedInventory = recommendations.fbaDamagedInventory();
    fakeMisplacedInventory = recommendations.fbaMisplacedInventory();
    fakeMissingInbound = recommendations.fbaMissingInbound();
    fakeMissingInboundWithQuantitySend =
      recommendations.fbaMissingInboundWithQuantitySend();
    fakeSizeChangeHigher = recommendations.sizeChangeHigherFba();

    fakeQuantityBundles.amazon_account_id = userWithAmazonAccountId;
    fakeQuantityBundles.user_id = userWithAmazonAccount._id;
    recommendationQuantityBundles = await new RecommendationModel(
      fakeQuantityBundles
    ).save();

    fakeDamagedInventory.amazon_account_id = userWithAmazonAccountId;
    fakeDamagedInventory.user_id = userWithAmazonAccount._id;
    recommendationDamagedInventory = await new RecommendationModel(
      fakeDamagedInventory
    ).save();

    fakeMisplacedInventory.amazon_account_id = userWithAmazonAccountId;
    fakeMisplacedInventory.user_id = userWithAmazonAccount._id;
    recommendationMisplacedInventory = await new RecommendationModel(
      fakeMisplacedInventory
    ).save();

    fakeMissingInbound.amazon_account_id = userWithAmazonAccountId;
    fakeMissingInbound.user_id = userWithAmazonAccount._id;
    recommendationMissingInbound = await new RecommendationModel(
      fakeMissingInbound
    ).save();

    fakeUserAddress = addresses.userAddress();
    const userAddress = await new UserAddressModel(fakeUserAddress).save();

    fakeShipment = shipment.fbaInboundShipment();
    fakeShipment.amazon_account_id = userWithAmazonAccountId;
    fakeShipment.shipment_id = fakeMissingInboundWithQuantitySend.shipment_id;
    fakeShipment.user_address = userAddress._id;
    await new FBAInboundShipmentModel(fakeShipment).save();

    fakeMissingInboundWithQuantitySend.amazon_account_id =
      userWithAmazonAccountId;
    fakeMissingInboundWithQuantitySend.user_id = userWithAmazonAccount._id;
    recommendationMissingInboundWithQuantitySend =
      await new RecommendationModel(fakeMissingInboundWithQuantitySend).save();

    fakeSizeChangeHigher.amazon_account_id = userWithAmazonAccountId;
    fakeSizeChangeHigher.user_id = userWithAmazonAccount._id;
    recommendationSizeChangeHigher = await new RecommendationModel(
      fakeSizeChangeHigher
    ).save();

    const app = expressService.init(mongoose.connection);
    routing.init(app);
    supertestRequest = supertest(app);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  describe('GET /recommendations/get-all/:amazon_account_id', () => {
    it('should return all recommendations for an Amazon account', async () => {
      const amazon_account_id = userWithAmazonAccountId;
      const response = await supertestRequest
        .get(`/recommendations/get-all/${amazon_account_id}`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 200 with empty data if user does not have access to amazon account', async () => {
      const amazon_account_id = new Types.ObjectId();
      const response = await supertestRequest
        .get(`/recommendations/get-all/${amazon_account_id}`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`);
      expect(response.status).toBe(200);
      expect(response.body).toMatchInlineSnapshot(`
{
  "data": {},
}
`);
    });

    it('should return 422 if check schema fails', async () => {
      const amazon_account_id = 'not-a-valid-object-id';
      const response = await supertestRequest
        .get(`/recommendations/get-all/${amazon_account_id}`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`);
      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toMatchObject([
        {
          type: 'field',
          value: 'not-a-valid-object-id',
          msg: 'Invalid value',
          path: 'amazon_account_id',
          location: 'params'
        }
      ]);
    });

    it('should return 200 with query usecase', async () => {
      const amazon_account_id = userWithAmazonAccountId;
      const usecase = 'quantity_bundles';
      const response = await supertestRequest
        .get(`/recommendations/get-all/${amazon_account_id}?usecase=${usecase}`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty(usecase);
      expect(Object.keys(response.body.data).length).toBe(1);
    });

    it('should return 422 if query usecase is invalid', async () => {
      const amazon_account_id = userWithAmazonAccountId;
      const usecase = 'invalid_usecase';
      const response = await supertestRequest
        .get(`/recommendations/get-all/${amazon_account_id}?usecase=${usecase}`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`);
      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toMatchObject([
        {
          type: 'field',
          value: 'invalid_usecase',
          msg: 'Invalid value',
          path: 'usecase',
          location: 'query'
        }
      ]);
    });
  });

  describe('PATCH /recommendations/update-status', () => {
    it('should return no access if automation user is wrong', async () => {
      const recommendation = await RecommendationModel.findOne({
        amazon_account_id: userWithAmazonAccountId,
        usecase: 'fba_missing_inbound'
      });
      const resolved_status = 'done';

      const response = await supertestRequest
        .patch(`/recommendations/update-status`)
        .set('Authorization', `Bearer ${automationUser1.bearer_token}`)
        .send({ _id: recommendation._id, resolved_status });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors[0]).toHaveProperty('msg');
      expect(response.body.errors[0].msg).toBe('recommendations.noAccess');
    });

    it('should return access if automation user is right', async () => {
      const recommendation = await RecommendationModel.findOne({
        amazon_account_id: userWithAmazonAccountId,
        usecase: 'fba_missing_inbound'
      });
      const resolved_status = 'done';

      const response = await supertestRequest
        .patch(`/recommendations/update-status`)
        .set('Authorization', `Bearer ${automationUser2.bearer_token}`)
        .send({ _id: recommendation._id, resolved_status });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.resolved_status).toBe(resolved_status);
      expect(response.body.data.amazon_account_id).toBe(
        userWithAmazonAccountId
      );
    });

    it('should update the status of a recommendation', async () => {
      const recommendation = await RecommendationModel.findOne({
        amazon_account_id: userWithAmazonAccountId,
        usecase: 'quantity_bundles'
      });
      const resolved_status = 'done';

      const response = await supertestRequest
        .patch(`/recommendations/update-status`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`)
        .send({ _id: recommendation._id, resolved_status });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.resolved_status).toBe(resolved_status);
      expect(response.body.data.amazon_account_id).toBe(
        userWithAmazonAccountId
      );
      expect(response.body.data.usecase).toBe('quantity_bundles');
    });

    it('should return 422 if the resolved_status is invalid', async () => {
      const recommendation = await RecommendationModel.findOne({
        amazon_account_id: userWithAmazonAccountId,
        usecase: 'quantity_bundles'
      });
      const resolved_status = 'invalid_resolved_status';
      const response = await supertestRequest
        .patch(`/recommendations/update-status`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`)
        .send({ _id: recommendation._id, resolved_status });
      expect(response.status).toBe(422);
    });
  });

  describe('PATCH /recommendations/update-case-reimbursement-id', () => {});

  describe('GET /recommendations/total-costsavings', () => {
    it('should return 200 with total costsavings', async () => {
      const response = await supertestRequest
        .get(`/recommendations/total-costsavings`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('savings');
    });

    it('should return 500 if getMaxCostSavingsByUser fails', async () => {
      jest
        .spyOn(RecommendationModel, 'getMaxCostsavingsByUser')
        .mockImplementationOnce(() => {
          throw new Error('Error');
        });

      const response = await supertestRequest
        .get(`/recommendations/total-costsavings`)
        .set(
          'Authorization',
          `Bearer ${userWithoutAccAndNoShared.bearer_token}`
        );
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /recommendations/update-missing-inbound', () => {
    it('should update the refund_by_skus quantity_send of a recomendaion', async () => {
      const recommendation = await RecommendationModel.findOne({
        amazon_account_id: userWithAmazonAccountId,
        usecase: 'fba_missing_inbound'
      });
      const requestData = {
        _id: recommendation._id,
        items: recommendation.refund_by_skus.map((item: any) => ({
          sku: item.sku,
          quantity_send: 42
        }))
      };
      const response = await supertestRequest
        .patch(`/recommendations/update-missing-inbound`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`)
        .send(requestData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.refund_by_skus[0].quantity_send).toBe(42);
    });
  });

  describe('PATCH /recommendations/size-change-higher-confirm-wrong-measurement', () => {
    it('should update the confirm_wrong_measurement value of a recomendaion', async () => {
      const recommendation = await RecommendationModel.findOne({
        amazon_account_id: userWithAmazonAccountId,
        usecase: 'size_change_higher_fba'
      });
      const requestData = {
        _id: recommendation._id
      };
      const response = await supertestRequest
        .patch(`/recommendations/size-change-higher-confirm-wrong-measurement`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`)
        .send(requestData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.confirm_wrong_measurement).toBe(true);
    });

    it('should return 500 if recommendation is not type Size Change Higher FBA', async () => {
      const recommendation = await RecommendationModel.findOne({
        amazon_account_id: userWithAmazonAccountId,
        usecase: 'fba_missing_inbound'
      });
      const requestData = {
        _id: recommendation._id
      };
      const response = await supertestRequest
        .patch(`/recommendations/size-change-higher-confirm-wrong-measurement`)
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`)
        .send(requestData);
      expect(response.status).toBe(500);
    });
  });

  describe('GET /recommendations/:recommendation_id/generate-packing-list', () => {
    it('should return 200 with a packing list', async () => {
      const response = await supertestRequest
        .get(
          `/recommendations/${recommendationMissingInboundWithQuantitySend.id}/generate-packing-list`
        )
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`);
      console.log(response.body);
      expect(response.status).toBe(200);
    });

    it('should return 500 if recommendation is not type FBA Missing Inbound', async () => {
      const response = await supertestRequest
        .get(
          `/recommendations/${recommendationQuantityBundles.id}/generate-packing-list`
        )
        .set('Authorization', `Bearer ${userWithAmazonAccount.bearer_token}`);

      expect(response.status).toBe(500);
    });
  });
});
