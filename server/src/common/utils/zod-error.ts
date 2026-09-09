import type { ZodError } from "zod";

export const getZodFieldErrors = (error: ZodError) => {
  const issues = error.issues || [];
  const fieldErrors: Record<string, string> = {};

  for (const issue of issues) {
    const fieldName = issue.path.join(".");
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }
  }

  return fieldErrors;
};
