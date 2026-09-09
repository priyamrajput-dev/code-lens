import GithubRepository from "../github/github.repository.js";
import BillingRepository from "../billing/billing.repository.js";
import BillingService from "../billing/billing.service.js";
import GithubService from "../github/github.service.js";

class SettingsService {
  constructor(
    private readonly githubService: GithubService,
    private readonly billingService: BillingService,
    private readonly billingRepository: BillingRepository,
  ) {}

  async getSettings(userId: string) {
    const user = await this.billingRepository.findUserById(userId);
    const subscription = await this.billingService.getUserSubscription(userId);
    const usage = await this.billingService.getUsageSummary(userId);
    const githubStatus = await this.githubService.getInstallationStatus(userId);

    return {
      user: {
        id: user?.id,
        plan: user?.plan ?? "free",
        subscriptionStatus: user?.subscriptionStatus,
        subscriptionRenewsAt: user?.subscriptionRenewsAt,
      },
      subscription,
      usage,
      githubStatus,
    };
  }
}

export default SettingsService;
