
I will rename the `/foreign-investment` page to `/investment`. This involves updating the route in the application configuration, renaming the source file and component for better code organization, and updating all internal links, navigation menu items, and redirects to ensure a seamless transition without broken links.

### Proposed Changes

#### 1. Page & Route Updates
- Rename `src/pages/ForeignInvestment.tsx` to `src/pages/Investment.tsx`.
- Update `src/App.tsx` to point the `/investment` path to the renamed component.
- Add a redirect from `/foreign-investment` to `/investment` to prevent broken links for users who have the old URL bookmarked.
- Update existing redirects (like `/investor/wna` and `/investor/wni`) to point to the new `/investment` URL.

#### 2. Component Refactoring
- Rename the component from `ForeignInvestment` to `Investment` inside the file.
- Update the page title and internal labels from "Foreign Investment Guide" to "Investment Guide" and similar simplifications where appropriate.
- Update SEO metadata (title, description) to reflect the new page name.

#### 3. Navigation & Links
- Update `src/components/Navigation.tsx` to use the new `/investment` path for the "Investment" menu items.
- Update `src/components/home/InvestorPathSelector.tsx` to point the WNA/WNI path cards to `/investment?section=wna` and `/investment?section=wni`.
- Update any `navigate()` calls or `Link` components throughout the app that previously pointed to `/foreign-investment`.

#### 4. Communication & Templates
- Update the default email templates in `src/components/admin/settings/EmailManagementSettings.tsx` to use the new `/investment` URL.
- Update the `send-email` edge function metadata to reflect the new URL and naming.

### Technical Details
- **Route persistence**: I'll ensure that query parameters (like `?section=wna`) are preserved during navigation and in the new structure.
- **Redirects**: I will use React Router's `Navigate` component to handle the legacy `/foreign-investment` path.
- **Consistency**: I'll perform a global search to ensure no hidden references to the old URL remain in the user-facing interface.

