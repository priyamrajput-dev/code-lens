import GithubRepository from "../github/github.repository.js";
import BillingRepository from "../billing/billing.repository.js";
import BillingService from "../billing/billing.service.js";
import GithubService from "../github/github.service.js";
import { cache, cacheKey } from "../../lib/cache.js";

class SettingsService {
  constructor(
    private readonly githubService: GithubService,
    private readonly billingService: BillingService,
    private readonly billingRepository: BillingRepository,
  ) {}

  async getSettings(userId: string) {
    const key = cacheKey("settings", userId);
    return await cache.getOrSet(
      key,
      async () => {
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
      },
      60, // 60s TTL
    );
  }
}

export default SettingsService;
