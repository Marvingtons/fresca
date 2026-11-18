/**
 * Everything still owed by Karen. Nothing here is rendered; it is the checklist
 * for the next round of client questions. Remove an entry once it is answered.
 */
export const placeholders = [
  // Round 1 photos
  { where: "Kitchen with Lantern Pendant (lantern-pendant-kitchen)", field: "city", value: "[PLACEHOLDER: location]" },
  // Pending Karen's answers, left untouched in round 1
  { where: "cognac-living-room (Cognac & Linen Living Room)", field: "title, city, photo", value: "[PLACEHOLDER: pending Karen]" },
  { where: "mosaic-fireplace-family-room (Coastal Blue Family Room)", field: "title, city, photo", value: "[PLACEHOLDER: pending Karen]" },
  { where: "navy-chair-great-room (Approach, Plan panel)", field: "photo", value: "[PLACEHOLDER: pending Karen]" },
  // Older DEMO values in content/site.ts that Karen has not confirmed
  { where: "site.url", field: "production domain", value: "[PLACEHOLDER: domain]" },
  { where: "about.stats", field: "years, rooms, neighborhoods, repeat clients", value: "[PLACEHOLDER: stats]" },
  { where: "studio wall plates 01, 02, 03, 05, 07", field: "city", value: "[PLACEHOLDER: location]" },
] as const;
