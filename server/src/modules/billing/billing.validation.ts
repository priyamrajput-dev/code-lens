import { z } from "zod";

export const createSubscriptionSchema = z.object({
  planId: z.string().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
