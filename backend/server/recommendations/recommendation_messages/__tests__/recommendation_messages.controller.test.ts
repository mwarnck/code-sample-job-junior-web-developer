const { user: userMock } = require('../../../../test/db');
const { buildReq, buildRes } = require('../../../../test/utils');
const {
  recommendationMessagesControllerInstance
} = require('../../../config/initializer');

describe('RecommendationMessagesController', () => {
  let user: any = null;

  beforeEach(async () => {
    user = await userMock.minimal();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should fail to create a message and return 422', async () => {
      const req = await buildReq({
        recommendation: null,
        user,
        body: { text: 'test', files: [] }
      });
      const res = buildRes();

      jest
        .spyOn(
          recommendationMessagesControllerInstance.recommendationMessagesService,
          'createMessage'
        )
        .mockRejectedValue(new Error('Some Error'));

      await recommendationMessagesControllerInstance.createMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ msg: 'recommendations.Some Error' }]
      });
    });

    it('should create a message and return the whole recommendation with the new message populated', async () => {
      const req = await buildReq({
        recommendation: null,
        user,
        body: { text: 'test', files: [] }
      });
      const res = buildRes();

      const mockData = {
        _id: 'fakeId'
      };

      jest
        .spyOn(
          recommendationMessagesControllerInstance.recommendationMessagesService,
          'createMessage'
        )
        .mockResolvedValue(mockData);

      await recommendationMessagesControllerInstance.createMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: mockData });
    });
  });

  describe('markAllMessagesAsRead', () => {
    it('should fail to mark all messages as read and return 422', async () => {
      const req = await buildReq({
        recommendation: null,
        user,
        body: { text: 'test', files: [] }
      });
      const res = buildRes();

      jest
        .spyOn(
          recommendationMessagesControllerInstance.recommendationMessagesService,
          'markAllMessagesAsRead'
        )
        .mockRejectedValue(new Error('Some Error'));

      await recommendationMessagesControllerInstance.markAllMessagesAsRead(
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ msg: 'recommendations.Some Error' }]
      });
    });

    it('should mark all messages as read and return the whole recommendation with the new message populated', async () => {
      const req = await buildReq({
        recommendation: null,
        user,
        body: { text: 'test', files: [] }
      });
      const res = buildRes();

      const mockData = {
        _id: 'fakeId'
      };

      jest
        .spyOn(
          recommendationMessagesControllerInstance.recommendationMessagesService,
          'markAllMessagesAsRead'
        )
        .mockResolvedValue(mockData);

      await recommendationMessagesControllerInstance.markAllMessagesAsRead(
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: mockData });
    });
  });
});
