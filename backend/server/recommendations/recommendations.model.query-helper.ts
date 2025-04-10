// // query helpers
// RecommendationSchema.query.byUserId = function byUserId(
//   this: QueryWithHelpers<
//     any,
//     HydratedDocument<IRecommendation>,
//     IRecommendationQueryHelpers
//   >,
//   user_id: Types.ObjectId | string
// ) {
//   return this.find({ user_id });
// };

// RecommendationSchema.query.byAmazonAccountId = function byAmazonAccountId(
//   this: QueryWithHelpers<
//     any,
//     HydratedDocument<IRecommendation>,
//     IRecommendationQueryHelpers
//   >,
//   amazon_account_id: Types.ObjectId
// ) {
//   return this.find({ amazon_account_id });
// };

// RecommendationSchema.query.byUsecase = function byUsecase(
//   this: QueryWithHelpers<
//     any,
//     HydratedDocument<IRecommendation>,
//     IRecommendationQueryHelpers
//   >,
//   usecase: string
// ) {
//   return this.find({ usecase });
// };

// RecommendationSchema.query.byUsecases = function (
//   this: QueryWithHelpers<
//     any,
//     HydratedDocument<IRecommendation>,
//     IRecommendationQueryHelpers
//   >,
//   usecases: string[]
// ) {
//   return this.find({ usecase: { $in: usecases } });
// };
