

## Mortgage & Financing Assistance Module — Enhancement Plan

### Current State
The `/mortgage-financing` page already has a working calculator (property price, DP%, interest rate, loan term, monthly payment), partner bank directory, application submission dialog, and DTI indicator. However it uses plain `<Input>` fields instead of sliders, lacks a dedicated "Need Financing Help" inquiry flow, and has no ROI/investment projection after financing cost.

### What Will Change

**1. Replace plain inputs with interactive Slider controls**
- Property price: slider with preset range (500M–10B IDR) + manual input fallback
- Down payment %: slider 10–50% (already exists as input, convert to Slider)
- Interest rate: slider 3–15% with 0.1 step
- Loan term: slider 5–30 years with 5-year steps
- All sliders show live value labels

**2. Add "Need Financing Help?" inquiry section**
- New card below calculator results with a CTA button
- Opens a simplified inquiry dialog (not the full mortgage application):
  - Income range (dropdown: <10M, 10–25M, 25–50M, 50M+)
  - Employment type
  - Preferred bank (optional, from partner banks list)
  - Contact details (name, phone, email)
- Submits to `mortgage_inquiries` table via existing `submitInquiry` from `useMortgageCalculator`

**3. Add Investor Insight panel**
- New card in the results column showing:
  - **Affordability indicator**: color-coded gauge (Comfortable / Moderate / Stretched) based on DTI
  - **Projected ROI after financing**: assuming a configurable rental yield (e.g. 5–8%), show net annual return = (annual rent − annual mortgage payments) / total investment × 100
  - **Break-even timeline**: years until cumulative rental income covers down payment + fees

### Files Modified
- `src/pages/MortgageFinancingPage.tsx` — Replace inputs with Sliders, add financing help CTA + dialog, add investor insight card

### No database changes needed
The existing `mortgage_inquiries` table and `useMortgageCalculator.submitInquiry` already handle the inquiry flow.

