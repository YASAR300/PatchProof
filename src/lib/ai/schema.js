import { z } from "zod";

export const RemediationOptionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  codeSnippet: z.string().optional().nullable(),
});

export const AdditionalTestSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  testCode: z.string().optional().nullable(),
});

export const CitedEvidenceSchema = z.object({
  type: z.string().min(1), // e.g. "run", "report", "artifact", "finding"
  id: z.string().min(1),
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const AiExplanationSchema = z.object({
  summary: z.string().min(1),
  rootCause: z.string().min(1),
  remediationOptions: z.array(
    z.union([
      z.string().transform((desc) => ({
        title: "Remediation Option",
        description: desc,
        codeSnippet: null,
      })),
      RemediationOptionSchema,
    ])
  ),
  additionalTests: z.array(
    z.union([
      z.string().transform((desc) => ({
        name: "Additional Test Case",
        description: desc,
        testCode: null,
      })),
      AdditionalTestSchema,
    ])
  ),
  nextSteps: z.array(z.string().min(1)),
  limitations: z.array(z.string().min(1)),
  citedEvidence: z.array(
    z.union([
      z.string().transform((id) => ({
        type: "reference",
        id,
        name: id,
        description: null,
      })),
      CitedEvidenceSchema,
    ])
  ),
});

/**
 * Filters out cited evidence items that do not exist in the known set of evidence IDs.
 *
 * @param {Array<object>} citations
 * @param {Set<string>} validEvidenceIds - Set of existing run IDs, report IDs, finding IDs, and artifact names
 * @returns {Array<object>} Filtered citations list
 */
export function filterValidCitations(citations, validEvidenceIds) {
  if (!Array.isArray(citations) || !(validEvidenceIds instanceof Set)) {
    return [];
  }

  return citations.filter((citation) => {
    if (!citation || typeof citation !== "object") return false;
    const id = citation.id?.trim();
    const name = citation.name?.trim();

    // Citation is valid if either its id or its name exists in the evidence set
    return (id && validEvidenceIds.has(id)) || (name && validEvidenceIds.has(name));
  });
}
