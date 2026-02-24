

## Property Visit Calendar — Enhanced Calendar View

### What Already Exists
The project has a complete visit scheduling system:
- **3 database tables**: `property_visits`, `agent_availability`, `agent_blocked_dates`
- **Hooks**: `useMyVisits`, `useAgentVisits`, `useBookVisit`, `useAgentAvailability`, `useAgentBlockedDates` with real-time subscriptions
- **Scheduling UI**: `ScheduleVisitDialog` (date picker + time slots + booking form) and `ScheduleVisitButton`
- **Dashboard tab**: `PropertyVisitsTab` — a simple list of upcoming/past visits with cancel functionality
- **No calendar view** — visits are displayed as cards in a flat list, not on a calendar

### What We Will Build

#### 1. Visit Calendar Component
Create `src/components/visits/VisitCalendar.tsx` — a month calendar view that:
- Highlights dates with scheduled visits using colored dots (green = confirmed, amber = pending, red = cancelled)
- Clicking a date reveals the visits for that day in a detail panel below
- Shows a mini-summary count on each date cell
- Uses the existing `react-day-picker` (already installed via shadcn Calendar) with custom `modifiers` and `modifiersStyles`

#### 2. Day Detail Panel
Create `src/components/visits/VisitDayDetail.tsx` — shown below the calendar when a date is selected:
- Lists all visits for that day with time, property info, status badge, and actions
- Reschedule button opens the `ScheduleVisitDialog` pre-filled with the property/agent
- Cancel button with confirmation
- "Add to Calendar" button that generates an `.ics` file download for the visit

#### 3. Visit Reminders
Create `src/components/visits/VisitReminders.tsx` — a small alert card shown above the calendar:
- Shows visits happening today or tomorrow
- Uses a countdown format ("In 3 hours", "Tomorrow at 10:00")
- Color-coded urgency (today = primary, tomorrow = muted)

#### 4. Rescheduling Flow
Add reschedule capability to the existing `ScheduleVisitDialog`:
- Accept an optional `existingVisitId` prop
- When rescheduling, cancel the old visit and create a new one in a single flow
- Show the original date/time for reference

#### 5. Enhanced PropertyVisitsTab
Replace the current flat list in `PropertyVisitsTab` with:
- A toggle between "Calendar View" and "List View"
- Calendar view uses the new `VisitCalendar` + `VisitDayDetail`
- List view preserves the existing card-based layout
- Visit reminders shown at the top in both views

### Technical Details

**Calendar date highlighting** uses react-day-picker's `modifiers` API:
```typescript
const modifiers = {
  hasVisit: visitDates,
  confirmed: confirmedDates,
  pending: pendingDates,
};
```

**ICS file generation** for "Add to Calendar":
```typescript
const generateICS = (visit) => {
  const ics = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:${formatICS(visit)}\nSUMMARY:Property Visit\nEND:VEVENT\nEND:VCALENDAR`;
  // Trigger download as .ics file
};
```

**Rescheduling** cancels the existing visit and books a new one in sequence using the existing `useBookVisit` and status update mutations.

**No database changes needed** — the existing `property_visits`, `agent_availability`, and `agent_blocked_dates` tables support all required functionality.

### Files to Create
- `src/components/visits/VisitCalendar.tsx` — month calendar with visit indicators
- `src/components/visits/VisitDayDetail.tsx` — day detail panel with actions
- `src/components/visits/VisitReminders.tsx` — upcoming visit alerts

### Files to Edit
- `src/components/dashboard/tabs/PropertyVisitsTab.tsx` — add calendar/list toggle, integrate new components
- `src/components/visits/ScheduleVisitDialog.tsx` — add reschedule support (optional `existingVisitId` prop)

