import { BaseService } from '../../../config/base/base.service';
import { RecommendationUseCases } from '../../recommendations.enums';
import { ISetupAutomationNotFinishedService } from './setup_automation_not_finished.interfaces';

class SetupAutomationNotFinishedService
  extends BaseService
  implements ISetupAutomationNotFinishedService
{
  private static instance: SetupAutomationNotFinishedService;
  private usecase = RecommendationUseCases.SETUP_AUTOMATION_NOT_FINISHED;

  private constructor() {
    super();
  }

  static getInstance(): SetupAutomationNotFinishedService {
    if (!this.instance) {
      this.instance = new SetupAutomationNotFinishedService();
    }
    return this.instance;
  }
}

const setupAutomationNotFinishedService =
  SetupAutomationNotFinishedService.getInstance();

export { setupAutomationNotFinishedService, SetupAutomationNotFinishedService };
