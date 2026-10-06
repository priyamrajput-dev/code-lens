export type ExplainMode =
  | "overview"
  | "beginner"
  | "line-by-line"
  | "advanced"
  | "security"
  | "refactor";

export interface ExplainRequest {
  code: string;
  mode: ExplainMode;
  language?: string;
}

export interface ExplainChunk {
  type: "text" | "done";
  text?: string;
}

export interface ExplainCallbacks {
  onChunk?: (chunk: ExplainChunk) => void;
  onComplete?: () => void;
}

const modePrompts: Record<ExplainMode, string> = {
  overview:
    "Provide a high-level overview of what this code does, its purpose, and its main components in 3-4 sentences.",
  beginner:
    "Explain this code step by step for a beginner. Define any technical terms, describe what each section does, and keep the tone encouraging and clear.",
  "line-by-line":
    "Walk through this code line by line, explaining what each line or block does.",
  advanced:
    "Provide a deep, technical analysis of this code: design patterns, complexity, trade-offs, edge cases, and potential improvements.",
  security:
    "Audit this code for security issues: injection risks, unsafe APIs, missing validation, hardcoded secrets, and recommend fixes.",
  refactor:
    "Identify code smells, duplication, and readability issues. Suggest concrete refactors with before/after examples.",
};

function generateMockExplanation(code: string, mode: ExplainMode): string {
  const lines = code.trim().split("\n").filter((l) => l.trim());
  const lineCount = Math.max(lines.length, 1);

  const responses: Record<ExplainMode, string> = {
    overview: `This implementation contains ${lineCount} line(s) and provides a clean, modular solution with well-isolated responsibilities. The logic processes input arguments efficiently, handles standard execution paths, and avoids unnecessary state mutation. Key advantages include predictable runtime behavior, clear control flow, and straightforward integration with surrounding modules.`,
    beginner: `Let's break this down simply! Think of this code like a recipe in ${lineCount} step(s):\n\n1. **Getting things ready**: It first declares input parameters and initial state.\n2. **Doing the work**: It processes values step by step, ensuring nothing goes wrong.\n3. **Returning the result**: Finally, it hands back the computed answer to whichever part of your app requested it.\n\nEverything is written with clear naming, so you can easily modify it without breaking anything!`,
    "line-by-line": lines
      .map(
        (line, i) =>
          `Line ${i + 1}: \`${line.trim() || "(empty line)"}\`\n→ ${
            i === 0
              ? "Declares the main entry point and defines argument signature."
              : i === lines.length - 1
                ? "Concludes execution and returns the final value to the caller."
                : "Executes intermediate data transformation and updates state."
          }`
      )
      .join("\n\n"),
    advanced: `Technical Deep-Dive (${lineCount} lines):\n- **Algorithmic Complexity**: O(n) linear execution time with bounded O(1) auxiliary space overhead.\n- **Memory Layout**: Objects are allocated contiguously with minimal GC pressure or hidden closures.\n- **Control Flow**: Pure execution path with single exit point, facilitating deterministic testing.\n- **Design Patterns**: Encapsulates behavior into discrete functions; suitable for concurrent callers.\n- **Recommended Evolution**: Consider adding discriminated union result types for explicit error telemetry.`,
    security: `Security Audit & Hardening Report (${lineCount} lines):\n- ✓ No SQL injection, shell command execution, or dynamic code evaluation detected.\n- ✓ Zero hardcoded API keys, JWT secrets, or sensitive credentials present.\n- ⚠️ Input Boundary Check: Validate that payload lengths and types are bounded before processing.\n- ⚠️ Concurrency: Ensure rate limiting protects this handler if exposed to public clients.\n- ✓ Memory Safety: No buffer overruns or unhandled promise rejection vectors found.`,
    refactor: `Refactoring & Clean Architecture Opportunities:\n- Extract repeated conditional checks into guard clauses to flatten nesting.\n- Replace magic constants with strongly-typed enumerations or module-scoped constants.\n- Declare variables as \`const\` rather than mutable bindings to guarantee immutability.\n- Decompose the ${lineCount}-line block into two specialized helper utilities for improved cohesion.`,
  };

  return responses[mode] || responses.overview;
}

export async function explainCode(
  code: string,
  mode: ExplainMode,
  options?: ExplainCallbacks | ((chunk: ExplainChunk) => void)
): Promise<void> {
  const explanation = generateMockExplanation(code, mode);
  const words = explanation.split(" ");
  
  const onChunk = typeof options === "function" ? options : options?.onChunk;
  const onComplete = typeof options === "object" ? options?.onComplete : undefined;

  // Stream word by word with natural rhythm
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 25));
    onChunk?.({ type: "text", text: (i === 0 ? "" : " ") + word });
  }

  onChunk?.({ type: "done" });
  onComplete?.();
}
