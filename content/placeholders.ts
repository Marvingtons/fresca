/**
 * Everything still owed by Karen: the checklist for the next round of client
 * questions. Markers written into copy as [PLACEHOLDER: ...] render in terracotta
 * (components/Copy.tsx). Remove an entry once it is answered.
 */
export const placeholders = [
  // Round 1 photos
  { where: "Studio wall Pl. 05, Kitchen with Lantern Pendant (lantern-pendant-kitchen-wide)", field: "city", value: "[PLACEHOLDER: location]" },
  // Pending Karen's answers
  { where: "Studio wall Pl. 03, Coastal Secondary Bath (subway-tile-secondary-bath)", field: "photo: same shot now on Pl. 06", value: "[PLACEHOLDER: pending Karen]" },
  { where: "mosaic-fireplace-family-room (Coastal Blue Family Room)", field: "title, photo", value: "[PLACEHOLDER: pending Karen]" },
  { where: "navy-chair-great-room (Approach, Plan panel)", field: "photo", value: "[PLACEHOLDER: pending Karen]" },
  // Older DEMO values in content/site.ts that Karen has not confirmed
  { where: "NEXT_PUBLIC_SITE_URL (.env.example assumes frescainteriordesign.com)", field: "production domain", value: "[PLACEHOLDER: domain]" },
  { where: "app/api/contact", field: "inbox for inquiries (CONTACT_TO_EMAIL) and sending domain", value: "[PLACEHOLDER: inbox]" },
  { where: "Studio wall Pl. 07, Bay Window Dining (bay-window-dining)", field: "city", value: "[PLACEHOLDER: location]" },
] as const;
