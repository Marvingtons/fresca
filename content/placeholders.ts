/**
 * Every slot on the site that needs content we do not have yet.
 *
 * Each value renders literally as `[PLACEHOLDER: ...]` in terracotta (see
 * components/Placeholder.tsx) so it cannot be mistaken for final copy. This file
 * is the list of questions still owed to Karen. When an answer arrives, replace
 * the placeholder at its use site with the real copy and delete the entry here.
 */

const ph = (what: string) => `[PLACEHOLDER: ${what}]`;

export const placeholders = {
  phone: ph("studio phone number"),
  email: ph("studio email address"),
  instagram: ph("Instagram handle, if any"),
  aboutBio: ph("a few sentences from Karen about her background and how she works"),
  responseTime: ph("how quickly Karen replies to inquiries"),
  faqPricing: ph("how design work is priced"),
  faqTimeline: ph("typical design and construction timelines for a kitchen or bath"),
  faqContractors: ph("whether Karen recommends contractors, and how"),
} as const;
