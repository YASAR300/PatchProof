import { prisma } from "../db.js";
import { computeSha256, canonicalJsonStringify } from "../report.js";
import { redactEvidence } from "./redact.js";
import { AiExplanationSchema, filterValidCitations } from "./schema.js";
import { generateTemplateExplanation } from "./template.js";
import { callAnthropicMessages } from "./anthropic.js";

export const AI_RATE_LIMIT_PER_HOUR = 20;

/**
 * Extracts all valid IDs and artifact names from structured evidence to prevent hallucinated citations.
 *
 * @param {object} evidence
 * @returns {Set<string>}
 */
export function extractValidEvidenceIds(evidence = {}) {
  const validIds = new Set();

  if (evidence.finding?.id) validIds.add(String(evidence.finding.id));
  if (evidence.finding?.ruleId) validIds.add(String(evidence.finding.ruleId));
  if (evidence.run?.id) validIds.add(String(evidence.run.id));
  if (evidence.report?.id) validIds.add(String(evidence.report.id));
  if (evidence.baselineRun?.id) validIds.add(String(evidence.baselineRun.id));
  if (evidence.candidateRun?.id) validIds.add(String(evidence.candidateRun.id));

  // Extract artifact names and IDs
  for (const art of evidence.artifacts || []) {
    if (art.id) validIds.add(String(art.id));
    if (art.name) validIds.add(String(art.name));
  }
  for (const art of evidence.baselineRun?.artifacts || []) {
    if (art.id) validIds.add(String(art.id));
    if (art.name) validIds.add(String(art.name));
  }
  for (const art of evidence.candidateRun?.artifacts || []) {
    if (art.id) validIds.add(String(art.id));
    if (art.name) validIds.add(String(art.name));
  }

  return validIds;
}

/**
 * Strict System Prompt for AI Grounding and Safety
 */
const SYSTEM_PROMPT = `You are an AI Security Assistant for PatchProof.
Rules:
1. Use only the provided evidence. Do not assume or invent facts outside the evidence.
2. Clearly state what was not tested.
3. Never claim the software is secure.
4. Never present a suggestion as verified.
5. Return JSON only, with no surrounding prose or markdown ticks.

The JSON response must match this schema:
{
  "summary": string,
  "rootCause": string,
  "remediationOptions": [
    {
      "title": string,
      "description": string,
      "codeSnippet": string or null
    }
  ],
  "additionalTests": [
    {
      "name": string,
      "description": string,
      "testCode": string or null
    }
  ],
  "nextSteps": [string],
  "limitations": [string],
  "citedEvidence": [
    {
      "type": "run" | "report" | "artifact" | "finding",
      "id": string,
      "name": string or null
    }
  ]
}`;

/**
 * Main AI generation interface.
 * Implements deterministic template fallback when ANTHROPIC_API_KEY is not set,
 * inputHash-based caching, per-user rate limiting (20/hour), and strict Zod validation.
 *
 * @param {object} params
 * @param {string} params.task - One of 'explain-finding', 'summarize-run', 'explain-report', 'suggest-tests', 'suggest-remediation'
 * @param {object} params.evidence - Structured evidence JSON
 * @param {string} [params.entityType='General'] - Target entity type (e.g. 'Finding', 'VerificationRun', 'PatchReport')
 * @param {string} [params.entityId='none'] - Target entity ID
 * @param {string} [params.userId=null] - Authenticated user ID for rate limiting and audit events
 * @returns {Promise<{ ok: boolean, cached: boolean, provider: string, model: string, explanation: object }>}
 */
export async function generate({
  task,
  evidence = {},
  entityType = "General",
  entityId = "none",
  userId = null,
}) {
  const validEvidenceIds = extractValidEvidenceIds(evidence);

  // 1. Sanitize & Redact sensitive secrets and truncate raw logs in evidence
  const sanitizedEvidence = redactEvidence(evidence);

  // 2. Compute canonical deterministic inputHash over task and sanitized evidence
  const inputHash = computeSha256(canonicalJsonStringify({ task, evidence: sanitizedEvidence }));

  // 3. Cache lookup: If matching inputHash exists in AiExplanation, return cached result immediately
  try {
    const cachedExplanation = await prisma.aiExplanation.findFirst({
      where: { inputHash },
      orderBy: { createdAt: "desc" },
    });

    if (cachedExplanation && cachedExplanation.content) {
      return {
        ok: true,
        cached: true,
        id: cachedExplanation.id,
        provider: cachedExplanation.provider,
        model: cachedExplanation.model,
        explanation: cachedExplanation.content,
      };
    }
  } catch (err) {
    console.warn("[src/lib/ai] Cache lookup warning:", err.message);
  }

  // 4. Rate Limiting: 20 requests per hour per user
  if (userId) {
    try {
      const oneHourAgo = new Date(Date.now() - 3600 * 1000);
      const recentRequestsCount = await prisma.auditEvent.count({
        where: {
          actorId: userId,
          action: "AI_EXPLANATION_CREATED",
          createdAt: { gte: oneHourAgo },
        },
      });

      if (recentRequestsCount >= AI_RATE_LIMIT_PER_HOUR) {
        const rateLimitError = new Error(
          `Rate limit exceeded: Maximum ${AI_RATE_LIMIT_PER_HOUR} AI requests per hour allowed. Please try again later.`
        );
        rateLimitError.statusCode = 429;
        throw rateLimitError;
      }
    } catch (err) {
      if (err.statusCode === 429) throw err;
      console.warn("[src/lib/ai] Rate limit check warning:", err.message);
    }
  }

  // 5. Select Provider: Anthropic Messages API or deterministic template generator
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  let provider = "template";
  let model = "template";
  let validatedOutput = null;

  if (!apiKey) {
    // Template generator (no AI key configured)
    const templateResult = generateTemplateExplanation({
      task,
      evidence: sanitizedEvidence,
      validEvidenceIds,
    });
    validatedOutput = AiExplanationSchema.parse(templateResult);
    provider = "template";
    model = "template";
  } else {
    // Anthropic Messages API
    provider = "anthropic";
    model = process.env.AI_MODEL?.trim() || "claude-3-5-sonnet-20241022";

    const userMessage = `Task: ${task}\n\nEvidence JSON:\n${JSON.stringify(sanitizedEvidence, null, 2)}`;

    const rawText = await callAnthropicMessages({
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
      apiKey,
      model,
    });

    // Parse JSON response (handling optional ```json code fence wrapper)
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/```$/, "").trim();
    }

    let parsedJson = {};
    try {
      parsedJson = JSON.parse(cleanedText);
    } catch {
      throw new Error(`Failed to parse AI response as valid JSON: ${rawText.slice(0, 100)}...`);
    }

    // Validate with Zod schema
    const parsed = AiExplanationSchema.parse(parsedJson);

    // Drop citations that do not exist in the evidence
    parsed.citedEvidence = filterValidCitations(parsed.citedEvidence, validEvidenceIds);
    validatedOutput = parsed;
  }

  // 6. Persist results in AiExplanation and record AuditEvent
  let createdRecordId = null;
  try {
    const saved = await prisma.aiExplanation.create({
      data: {
        entityType,
        entityId: String(entityId),
        provider,
        model,
        inputHash,
        content: validatedOutput,
      },
    });
    createdRecordId = saved.id;

    if (userId) {
      await prisma.auditEvent.create({
        data: {
          actorId: userId,
          action: "AI_EXPLANATION_CREATED",
          entityType: "AiExplanation",
          entityId: saved.id,
          metadata: {
            task,
            targetEntityType: entityType,
            targetEntityId: String(entityId),
            provider,
            model,
            inputHash,
          },
        },
      });
    }
  } catch (err) {
    console.warn("[src/lib/ai] Persistence warning:", err.message);
  }

  return {
    ok: true,
    cached: false,
    id: createdRecordId,
    provider,
    model,
    explanation: validatedOutput,
  };
}
