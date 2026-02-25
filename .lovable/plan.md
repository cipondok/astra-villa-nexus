

## Plan: Move Hero Slider Text to Top

Currently the branding overlay uses `items-center justify-center` which centers everything vertically. The user wants the text at the top instead.

### Change in `src/pages/Index.tsx`

**Line 586**: Change `flex items-center justify-center` to `flex items-start justify-center pt-[8%] sm:pt-[6%]`

This moves the entire branding block (Premium Real Estate badge, ASTRA Villa Property title, separator, tagline) to the top of the slider with appropriate padding.

