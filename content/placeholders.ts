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
  { where: "navy-chair-great-room (no longer shown: the Approach Plan card uses Pl. 04)", field: "photo", value: "[PLACEHOLDER: pending Karen]" },
  { where: "Working with us, row 2 plan drawing (components/PlanIllustration.tsx)", field: "schedule labels (Island, white oak / Sofa, linen, 84\" / Bed, upholstered), 24'-0\" dimension, \"Signed before ordering\"", value: "[PLACEHOLDER: plan schedule labels, ask Karen for three real selections]" },
  { where: "About (05), facts strip, Founded row (hidden until filled)", field: "year founded", value: "[PLACEHOLDER: year founded]" },
  { where: "About (05), portrait slot. Stand-in: the Pl. 06 guest bath (stenciled-ceiling-guest-bath)", field: "photo", value: "[PLACEHOLDER: About portrait of Karen, 4:5]" },
  // Older DEMO values in content/site.ts that Karen has not confirmed
  { where: "Studio wall Pl. 07, Bay Window Dining (bay-window-dining)", field: "city", value: "[PLACEHOLDER: location]" },
] as const;
