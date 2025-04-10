import RecommendationModel from './recommendations.model';
import { Types } from 'mongoose';

import {
  GetRecommendationCountDataResult,
  HydratedRecommendationDoc,
  IRecommendationQueryParams
} from './recommendations.types';
import { recommendation_types } from './recommendations.constants';

/**
 * @deperecated Use RecommendationTasksService.getTaskCount() instead
 */
export const getRecommendationCountData = async function (
  this: typeof RecommendationModel,
  { amazon_account_id }: { amazon_account_id: Types.ObjectId }
) {
  const recommendations = await this.find({
    usecase: {
      $in: recommendation_types
    },
    amazon_account_id,
    cta_id: { $exists: true }
  });

  const recommendationsFiltered = filterForInboundReceived(recommendations);

  const resolvedRecommendations = recommendationsFiltered.filter(
    (reco: any) => reco.resolved
  ).length;
  const allRecommendations = recommendationsFiltered.length;
  const unresolvedRecommendations =
    allRecommendations - resolvedRecommendations;

  const counterData: GetRecommendationCountDataResult = {
    all: allRecommendations,
    resolved: resolvedRecommendations,
    unresolved: unresolvedRecommendations
  };

  return counterData;
};

/**
 * TODO: refactor here without array
 */
export const getMaxCostsavingsAsArrByAmzAccId = async function (
  this: any,
  amazon_account_id: Types.ObjectId
) {
  try {
    const query = [
      {
        $match: {
          amazon_account_id,
          usecase: {
            $in: recommendation_types
          }
        }
      },
      {
        $group: {
          _id: null,
          costsavings: {
            $sum: '$costsavings.min'
          },
          refunds: {
            $sum: '$refund_total'
          },
          possible_refund: {
            $sum: '$refunds.possible'
          },
          yearly_savings: {
            $sum: '$yearly_savings'
          },
          additional_fees: {
            $sum: '$additional_fees.yearly'
          }
        }
      },
      {
        $project: {
          savings: {
            $add: [
              '$costsavings',
              '$refunds',
              '$yearly_savings',
              '$possible_refund',
              '$additional_fees'
            ]
          }
        }
      }
    ];

    const totalCostSavings = await this.aggregate(query);

    return [totalCostSavings[0]?.savings] || [0];
  } catch (error) {
    return error;
  }
};

export const getMaxCostsavingsByUser = async function (
  this: typeof RecommendationModel,
  user: any
) {
  const userId: Types.ObjectId = user._id;

  try {
    const query = [
      {
        $match: {
          user_id: new Types.ObjectId(userId),
          usecase: {
            $in: recommendation_types
          }
        }
      },
      {
        $group: {
          _id: null,
          costsavings: {
            $sum: '$costsavings.min'
          },
          refunds: {
            $sum: '$refund_total'
          },
          possible_refund: {
            $sum: '$refunds.possible'
          },
          yearly_savings: {
            $sum: '$yearly_savings'
          },
          additional_fees: {
            $sum: '$additional_fees.yearly'
          }
        }
      },
      {
        $project: {
          savings: {
            $add: [
              '$costsavings',
              '$refunds',
              '$possible_refund',
              '$yearly_savings',
              '$additional_fees'
            ]
          }
        }
      }
    ];

    const totalCostSavings = await this.aggregate(query);

    return totalCostSavings[0]?.savings || 0;
  } catch (error) {
    return error;
  }
};

export const findUnresolvedWithNoStatus = async function (
  this: typeof RecommendationModel,
  params: IRecommendationQueryParams
) {
  try {
    const { amazon_account_id, usecases } = params;
    const recommendations = await this.find({
      amazon_account_id: new Types.ObjectId(amazon_account_id),
      usecase: { $in: usecases },
      cta_id: { $exists: true },
      resolved: false
    });

    const recommendationsFiltered = filterForInboundReceived(recommendations);

    return recommendationsFiltered;
  } catch (error) {
    console.error('Error in findUnresolvedWithNoStatus:', error);
    throw error;
  }
};

export const findUnresolvedWithNotResolvedStatus = async function (
  this: typeof RecommendationModel,
  params: IRecommendationQueryParams
) {
  try {
    const { amazon_account_id, usecases } = params;
    const recommendations = await this.find({
      amazon_account_id: new Types.ObjectId(amazon_account_id),
      usecase: { $in: usecases },
      cta_id: { $exists: true }
    });

    const recommendationsFiltered = filterForInboundReceived(recommendations);

    return recommendationsFiltered;
  } catch (error) {
    console.error('Error in findUnresolvedWithNotResolvedStatus:', error);
    throw error;
  }
};

export const filterForInboundReceived = (
  recommendations: HydratedRecommendationDoc[]
) => {
  return recommendations.filter((reco: any) => {
    // return !reco.usecase === 'inbound_labels_low_fba_stock' || !reco.inbound_received
    return (
      reco.usecase !== 'inbound_labels_low_fba_stock' || !reco.inbound_received
    );
  });
};
