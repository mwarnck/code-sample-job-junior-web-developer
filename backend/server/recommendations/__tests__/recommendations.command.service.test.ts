import CtasModel from '../../assistant/cta/cta.model';
import { recommendationsCommandService } from '../recommendations.command.service';
import { Resolvers, UniversalStatuses } from '../recommendations.enums';
import RecommendationModel from '../recommendations.model';
import { HydratedFbaMissingInboundRecommendationDoc } from '../usecases/fba_missing_inbound/fba_missing_inbound.types';
import { HydratedQuantityBundlesRecommendationDoc } from '../usecases/quantity_bundles/quantity_bundles.types';
import { HydratedSizeChangeHigherFbaRecommendationDoc } from '../usecases/size_change_higher_fba/size_change_higher_fba.types';
import { faker } from '@faker-js/faker';

const UserModel = require('../../user/user.model');
const { user, recommendations } = require('../../../test/db');

describe('Recommendations Command Service', () => {
  let userWithAmazonAccount: any = null;
  let userWithAmazonAccountId: any = null;

  // fba missing inbound recommendation
  let fakeFbaMissingInbound: any = null;
  let recommendationFbaMissingInbound: HydratedFbaMissingInboundRecommendationDoc;

  // fba size change higher recommendation
  let fakeSizeChangeHigherFba: any = null;
  let recommendationSizeChangeHigherFba: HydratedSizeChangeHigherFbaRecommendationDoc;

  // quantity bundles recommendation
  let fakeQuantityBundles: any = null;
  let recommendationQuantityBundles: HydratedQuantityBundlesRecommendationDoc;

  let ctaUpdateOneSpy: any = null;

  beforeEach(async () => {
    // user setup
    userWithAmazonAccount = await new UserModel(
      user.withAmazonAccount()
    ).save();
    userWithAmazonAccountId = userWithAmazonAccount.amazon_accounts[0].id;

    // fba missing inbound recommendation setup
    fakeFbaMissingInbound = recommendations.fbaMissingInbound();
    fakeFbaMissingInbound.amazon_account_id = userWithAmazonAccountId;
    fakeFbaMissingInbound.user_id = userWithAmazonAccount._id;
    recommendationFbaMissingInbound = await new RecommendationModel(
      fakeFbaMissingInbound
    ).save();

    // size change higher fba recommendation setup
    fakeSizeChangeHigherFba = recommendations.sizeChangeHigherFba();
    fakeSizeChangeHigherFba.amazon_account_id = userWithAmazonAccountId;
    fakeSizeChangeHigherFba.user_id = userWithAmazonAccount._id;
    fakeSizeChangeHigherFba.cta_id = faker.database.mongodbObjectId();
    recommendationSizeChangeHigherFba = await new RecommendationModel(
      fakeSizeChangeHigherFba
    ).save();

    // quantity bundles recommendation setup
    fakeQuantityBundles = recommendations.quantityBundle();
    fakeQuantityBundles.amazon_account_id = userWithAmazonAccountId;
    fakeQuantityBundles.user_id = userWithAmazonAccount._id;
    fakeQuantityBundles.cta_id = faker.database.mongodbObjectId();
    recommendationQuantityBundles = await new RecommendationModel(
      fakeQuantityBundles
    ).save();

    ctaUpdateOneSpy = jest.spyOn(CtasModel, 'updateOne');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateCtaStatusToAcceptForRecommendation', () => {
    it('should update the CTA status to accepted', async () => {
      // @ts-ignore
      jest.spyOn(CtasModel, 'find').mockImplementation(() => {
        return {
          lean: jest.fn().mockReturnValue([
            {
              _id: recommendationQuantityBundles.cta_id,
              user_id: userWithAmazonAccount._id,
              items: [
                {
                  item_id: recommendationQuantityBundles._id,
                  item_type: 'recommendation'
                }
              ]
            }
          ])
        };
      });

      await recommendationsCommandService.updateCtaStatusToAcceptForRecommendation(
        {
          _id: recommendationQuantityBundles._id,
          user_id: userWithAmazonAccount._id,
          resolver: 'test' // -> invalid value, should not be used to update the CTA
        }
      );

      expect(ctaUpdateOneSpy).toBeCalledTimes(1);
      expect(ctaUpdateOneSpy).toBeCalledWith(
        {
          _id: recommendationQuantityBundles.cta_id
        },
        {
          'status.value': 'accepted'
        }
      );
    });

    it('should update the CTA status to accepted', async () => {
      // @ts-ignore
      jest.spyOn(CtasModel, 'find').mockImplementation(() => {
        return {
          lean: jest.fn().mockReturnValue([
            {
              _id: recommendationQuantityBundles.cta_id,
              user_id: userWithAmazonAccount._id,
              items: [
                {
                  item_id: recommendationQuantityBundles._id,
                  item_type: 'recommendation'
                }
              ]
            }
          ])
        };
      });

      await recommendationsCommandService.updateCtaStatusToAcceptForRecommendation(
        {
          _id: recommendationQuantityBundles._id,
          user_id: userWithAmazonAccount._id,
          resolver: 'onboarding'
        }
      );

      expect(ctaUpdateOneSpy).toBeCalledTimes(1);
      expect(ctaUpdateOneSpy).toBeCalledWith(
        {
          _id: recommendationQuantityBundles.cta_id
        },
        {
          resolver: 'onboarding',
          'status.value': 'accepted'
        }
      );
    });
  });

  describe('updateStatus', () => {});

  describe('updateCaseReimbursementId', () => {
    it('should update the recommendation with the case_id updated', async () => {
      const case_reimbursement_id = 'case_reimbursement_id';

      await recommendationsCommandService.updateCaseReimbursementId(
        recommendationFbaMissingInbound,
        case_reimbursement_id
      );

      const updatedRecommendation = await RecommendationModel.findById(
        recommendationFbaMissingInbound._id
      );

      if (!updatedRecommendation) {
        throw new Error('Recommendation not found');
      }

      // @ts-ignore
      expect(updatedRecommendation.case_id).toBe(case_reimbursement_id);
    });
  });

  describe('updateBundleSku', () => {
    it('should update the recommendation with the bundle_sku updated', async () => {
      const bundle_sku = 'bundle_sku';

      await recommendationsCommandService.updateBundleSku(
        recommendationQuantityBundles,
        bundle_sku
      );

      const updatedRecommendation = await RecommendationModel.findById(
        recommendationQuantityBundles._id
      );

      if (!updatedRecommendation) {
        throw new Error('Recommendation not found');
      }

      if (RecommendationModel.isQuantityBundles(updatedRecommendation)) {
        expect(updatedRecommendation.bundle_sku).toBe(bundle_sku);
      } else {
        throw new Error(
          'Recommendation is not a quantity bundles recommendation'
        );
      }
    });
  });

  describe('updateFbaMissingInbound', () => {
    it('should update the recommendation with the refund_by_skus items quantity_send updated and resolved status set to true', async () => {
      const items = [
        {
          sku: recommendationFbaMissingInbound.refund_by_skus![0].sku!,
          quantity_send: 1
        }
      ];

      await recommendationsCommandService.updateFbaMissingInbound(
        recommendationFbaMissingInbound,
        items
      );

      const updatedRecommendation = await RecommendationModel.findById(
        recommendationFbaMissingInbound._id
      );

      if (!updatedRecommendation) {
        throw new Error('Recommendation not found');
      }

      if (RecommendationModel.isFbaMissingInbound(updatedRecommendation)) {
        expect(updatedRecommendation!.refund_by_skus![0].quantity_send).toBe(1);
        expect(updatedRecommendation!.resolved).toBeFalsy();
        expect(updatedRecommendation!.resolved_status).toBeUndefined();
        expect(updatedRecommendation!.resolver).toBeUndefined();
        expect(updatedRecommendation!.resolved_at).toBeUndefined();
      } else {
        throw new Error(
          'Recommendation is not a fba missing inbound recommendation'
        );
      }
    });

    it('should solve the recommendation if all refund_by_skus items quantity_send are equal to quantity_received', async () => {
      const items = recommendationFbaMissingInbound.refund_by_skus!.map(
        (item) => ({
          sku: item.sku!,
          quantity_send: item.quantity_received!
        })
      );

      await recommendationsCommandService.updateFbaMissingInbound(
        recommendationFbaMissingInbound,
        items
      );

      const updatedRecommendation = await RecommendationModel.findById(
        recommendationFbaMissingInbound._id
      );

      if (!updatedRecommendation) {
        throw new Error('Recommendation not found');
      }

      if (RecommendationModel.isFbaMissingInbound(updatedRecommendation)) {
        expect(updatedRecommendation!.resolved).toBe(true);
        expect(updatedRecommendation!.resolved_status).toBe(
          UniversalStatuses.NOT_SHIPPED
        );
        expect(updatedRecommendation!.resolver).toBe(Resolvers.MANUAL);
        expect(updatedRecommendation!.resolved_at).toBeDefined();
      } else {
        throw new Error(
          'Recommendation is not a fba missing inbound recommendation'
        );
      }
    });
  });

  describe('updateSizeChangeHigherFbaConfirmWrongMeasurement', () => {
    it('should update the recommendation with the confirm_wrong_measurement flag set to true and cta status value set to accepted', async () => {
      jest.spyOn(CtasModel, 'findByIdAndUpdate');

      await recommendationsCommandService.updateSizeChangeHigherFbaConfirmWrongMeasurement(
        recommendationSizeChangeHigherFba
      );

      const updatedRecommendation = await RecommendationModel.findById(
        recommendationSizeChangeHigherFba._id
      );

      if (!updatedRecommendation) {
        throw new Error('Recommendation not found');
      }

      if (RecommendationModel.isSizeChangeHigherFba(updatedRecommendation)) {
        expect(updatedRecommendation!.confirm_wrong_measurement).toBe(true);
        expect(CtasModel.findByIdAndUpdate).toHaveBeenCalledWith(
          { _id: recommendationSizeChangeHigherFba.cta_id },
          { 'status.value': 'accepted' }
        );
      } else {
        throw new Error(
          'Recommendation is not a size change higher fba recommendation'
        );
      }
    });
  });
});
