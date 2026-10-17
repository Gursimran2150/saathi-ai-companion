/** Shared class recipes so every feature screen has the same rhythm, radii and tap targets. */

/** Centred column under the page intro; bottom padding clears the mobile sticky action + SOS button. */
export const FEATURE_CONTAINER = "mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pb-28 sm:gap-8 sm:px-6 lg:pb-16";

/** 48px pill CTA (Rausch). */
export const PRIMARY_BUTTON =
  "h-12 gap-2 rounded-full px-6 text-base font-semibold shadow-[0_6px_16px_rgba(224,11,65,0.22)] hover:bg-primary/90 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg:not([class*='size-'])]:size-5";

/** 48px outlined pill. */
export const SECONDARY_BUTTON =
  "h-12 gap-2 rounded-full border-foreground/80 px-6 text-base font-semibold [&_svg:not([class*='size-'])]:size-5";

/** 48px text input. */
export const INPUT = "h-12 rounded-xl px-4 text-base md:text-base";

/** Small round icon badge used beside headings and in lists. */
