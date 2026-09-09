import { z } from "zod";

export const saveInstallationSchema = z.object({
  installationId: z.coerce.number().int().positive(),
});

export const getReposQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

export type SaveInstallationInput = z.infer<typeof saveInstallationSchema>;
export type GetReposQueryInput = z.infer<typeof getReposQuerySchema>;
