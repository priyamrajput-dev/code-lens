import { z } from "zod";

export const triggerRepoSyncSchema = z.object({
  repoFullName: z.string().trim().min(1, "Repository full name is required"),
  branch: z.string().trim().default("main"),
  installationId: z.coerce.number().int().positive().optional(),
});

export const getRepoSyncStatusSchema = z.object({
  repos: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (typeof val === "string") return [val];
    return val;
  }),
});

export type TriggerRepoSyncInput = z.infer<typeof triggerRepoSyncSchema>;
export type GetRepoSyncStatusInput = z.infer<typeof getRepoSyncStatusSchema>;
