/**
 * Everything still owed by Karen: the checklist for the next round of client
 * questions. Markers written into copy as [PLACEHOLDER: ...] render in terracotta
 * (components/Copy.tsx). Remove an entry once it is answered.
 */
export const placeholders = [
  // Round 1 photos
  { where: "Studio wall Pl. 05, Kitchen with Lantern Pendant (lantern-pendant-kitchen)", field: "city", value: "[PLACEHOLDER: location]" },
  // Pending Karen's answers, left untouched in round 1
  { where: "cognac-living-room (Cognac and Linen Living Room)", field: "photo: does hers replace ours?", value: "[PLACEHOLDER: pending Karen]" },
  { where: "mosaic-fireplace-family-room (Coastal Blue Family Room)", field: "title, photo", value: "[PLACEHOLDER: pending Karen]" },
  { where: "navy-chair-great-room (Approach, Plan panel)", field: "photo", value: "[PLACEHOLDER: pending Karen]" },
  // Older DEMO values in content/site.ts that Karen has not confirmed
  { where: "site.url", field: "production domain", value: "[PLACEHOLDER: domain]" },
  { where: "about.stats", field: "years, rooms, neighborhoods, repeat clients", value: "[PLACEHOLDER: years] etc., rendered on the About cards" },
  { where: "about.text", field: "service area", value: "[PLACEHOLDER: service area]" },
  { where: "contact.text", field: "response time for inquiries", value: "[PLACEHOLDER: response time]" },
  { where: "/privacy", field: "Karen (or counsel) to review the privacy page wording", value: "[PLACEHOLDER: review]" },
  { where: "app/api/contact", field: "inbox for inquiries (CONTACT_TO_EMAIL) and sending domain", value: "[PLACEHOLDER: inbox]" },
  { where: "Studio wall Pl. 07, Bay Window Dining (bay-window-dining)", field: "city", value: "[PLACEHOLDER: location]" },
] as const;
