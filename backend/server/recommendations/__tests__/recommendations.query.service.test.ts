import { recommendationsQueryService } from '../recommendations.query.service';
import Toggle from '../../toggles/toggles.model';

const RecommendationModel = require('../recommendations.model');

describe('Recommendations Query Service', () => {
  describe('getDataByMetric', () => {
    it('should return undefined for an invalid metric', () => {
      const metric = 'invalid.metric';
      const fn = recommendationsQueryService.getDataByMetric(metric);
      expect(fn).toBeUndefined();
    });

    it('should throw error if amazon_account_id is not provided', () => {
      const metric = 'costsavings.overall';
      expect(() =>
        recommendationsQueryService.getDataByMetric(metric)()
      ).toThrowError(
        `amazon account id is required by recommendationsQueryService.getDataByMetric.${metric}`
      );
    });

    it('should return a function that calls RecommendationModel.getMaxCostsavingsAsArrByAmzAccId', async () => {
      const metric = 'costsavings.overall';
      const amazonAccountId = 'test_account_id';
      const expectedData = ['data1', 'data2'];
      jest
        .spyOn(RecommendationModel, 'getMaxCostsavingsAsArrByAmzAccId')
        .mockResolvedValue(expectedData);

      const resultFunction =
        recommendationsQueryService.getDataByMetric(metric);
      const result = await resultFunction(amazonAccountId);
      expect(result).toBe(expectedData);
    });

    it('should return a function that calls Toggle.getTimeSavingsReviewsTrigger', async () => {
      const metric = 'timesavings.overall';
      const amazonAccountId = 'test_account_id';
      const expectedData: any = ['data1', 'data2'];
      jest
        .spyOn(Toggle, 'getTimeSavingsReviewsTrigger')
        .mockResolvedValue(expectedData);

      const resultFunction =
        recommendationsQueryService.getDataByMetric(metric);
      const result = await resultFunction(amazonAccountId);
      expect(result).toBe(expectedData);
    });

    it('should return a function that calls RecommendationModel.getRecommendationCountData', async () => {
      const metric = 'recommendations.overall';
      const amazonAccountId = 'test_account_id';
      const expectedData = { all: 'all_data' };
      jest
        .spyOn(RecommendationModel, 'getRecommendationCountData')
        .mockResolvedValue(expectedData);

      const resultFunction =
        recommendationsQueryService.getDataByMetric(metric);
      const result = await resultFunction(amazonAccountId);
      expect(result).toEqual([expectedData.all]);
    });

    it('should return a function that calls RecommendationModel.getRecommendationCountData', async () => {
      const metric = 'recommendations.resolved.overall';
      const amazonAccountId = 'test_account_id';
      const expectedData = { resolved: 'resolved_data' };
      jest
        .spyOn(RecommendationModel, 'getRecommendationCountData')
        .mockResolvedValue(expectedData);

      const resultFunction =
        recommendationsQueryService.getDataByMetric(metric);
      const result = await resultFunction(amazonAccountId);
      expect(result).toEqual([expectedData.resolved]);
    });
  });
});
