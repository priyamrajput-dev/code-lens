import { z } from "zod";

export const triggerReviewSchema = z.object({
  repoFullName: z.string().min(1),
  prNumber: z.coerce.number().int().positive(),
  installationId: z.coerce.number().int().positive().optional(),
});

export type TriggerReviewInput = z.infer<typeof triggerReviewSchema>;
