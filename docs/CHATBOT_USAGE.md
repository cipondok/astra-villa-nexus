# Chatbot Widget - Usage Guide

## Overview
A minimal, elegant, always-visible floating chatbot widget for real estate applications.

## Features

### ✨ Always Visible
- Fixed position at `bottom-6 right-6`
- Never hides on scroll
- Expandable popup interface

### 🔔 Unread Badge
- Automatic unread message counter
- Badge appears when chat is closed and AI responds
- Clears automatically when chat opens
- Red notification badge with count (shows "99+" for 100+ messages)

### 🎨 Button Variants
Three beautiful button styles to choose from:

1. **`pulse`** (default) - Blue-purple gradient with subtle pulse animation
2. **`glow`** - Purple-pink gradient with glowing shadow effect
3. **`subtle`** - Minimal dark theme with subtle hover effects

### ⌨️ Keyboard Shortcuts
- **`Ctrl+K`** (or `Cmd+K` on Mac) - Open chat
- **`Esc`** - Close chat
- **`Enter`** - Send message (in input field)

### 📱 Mobile Responsive
- Fullscreen on mobile (90vh)
- Fixed width on desktop (420px)
- Smooth slide-in animations
- No layout shift on iPhone

### ♿ Accessible
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Role and status attributes

## Usage

### Basic Implementation
```tsx
import ResponsiveAIChatWidget from "@/components/ai/ResponsiveAIChatWidget";

function App() {
  return (
    <div>
      {/* Your app content */}
      <ResponsiveAIChatWidget />
    </div>
  );
}
```

### With Button Variant
```tsx
<ResponsiveAIChatWidget buttonVariant="glow" />
```

### With Property Context
```tsx
<ResponsiveAIChatWidget 
  propertyId="123"
  onTourControl={(action, target) => {
    console.log(`Tour control: ${action} -> ${target}`);
  }}
  buttonVariant="pulse"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `propertyId` | `string` | `undefined` | Optional property ID for context-aware responses |
| `onTourControl` | `(action: string, target: string) => void` | `undefined` | Callback for 3D tour control actions |
| `buttonVariant` | `"pulse" \| "glow" \| "subtle"` | `"pulse"` | Visual style of the floating button |

## Components

### ChatButton
The floating trigger button with unread badge.

```tsx
import ChatButton from "@/components/ai/ChatButton";

<ChatButton 
  onClick={() => setIsOpen(true)}
  unreadCount={3}
  variant="glow"
/>
```

### UnreadBadge
Notification badge showing unread count.

```tsx
import UnreadBadge from "@/components/ai/UnreadBadge";

<UnreadBadge count={5} />
```

## Hooks

### useChatKeyboardShortcuts
Manages keyboard shortcuts for the chat widget.

```tsx
import { useChatKeyboardShortcuts } from "@/hooks/useChatKeyboardShortcuts";

useChatKeyboardShortcuts({
  isOpen: chatOpen,
  onOpen: () => setChatOpen(true),
  onClose: () => setChatOpen(false),
});
```

## Animations

### Desktop
- **Open**: Slide in from right with fade
- **Close**: Slide out to right with fade
- **Button**: Subtle pulse animation (for "pulse" variant)

### Mobile
- **Open**: Slide up from bottom
- **Close**: Slide down to bottom
- **Button**: Reduced motion for better mobile performance

## Architecture

### File Structure
```
src/components/ai/
├── ResponsiveAIChatWidget.tsx    # Main widget component
├── ChatButton.tsx                 # Floating button with variants
├── UnreadBadge.tsx               # Notification badge
├── AIChatMessages.tsx            # Message display
├── AIChatInput.tsx               # Input field
├── AIChatQuickActions.tsx        # Quick action buttons
└── types.ts                      # TypeScript types

src/hooks/
└── useChatKeyboardShortcuts.ts   # Keyboard shortcut logic
```

### State Management
- **Unread Count**: Increments when AI responds while chat is closed
- **Messages**: Full conversation history
- **Conversation ID**: Persists across session
- **Loading States**: UI feedback for async operations

## Customization

### Custom Button Colors
Edit `ChatButton.tsx` to add more variants:

```tsx
const variantStyles: Record<ChatButtonVariant, string> = {
  pulse: "...",
  glow: "...",
  subtle: "...",
  custom: "bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-xl"
};
```

### Custom Keyboard Shortcuts
Edit `useChatKeyboardShortcuts.ts`:

```tsx
// Add Ctrl+Shift+C to toggle
if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'c') {
  e.preventDefault();
  isOpen ? onClose() : onOpen();
}
```

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 10+)

## Performance
- Lazy loading for chat UI
- Debounced scroll handlers removed (always visible)
- GPU-accelerated animations
- Minimal re-renders with memoization

## Troubleshooting

### Button not appearing
- Check z-index conflicts (button uses `z-[9999]`)
- Verify component is rendered in DOM
- Check for CSS conflicts with `fixed` positioning

### Unread badge not showing
- Ensure `isOpen` state is correct
- Verify AI messages have `role: 'assistant'`
- Check badge visibility in dark/light mode

### Keyboard shortcuts not working
- Check for conflicting browser shortcuts
- Verify focus is not trapped in input field
- Test with `disabled={false}` prop

## Best Practices

1. **Single Instance**: Only render one `ResponsiveAIChatWidget` per page
2. **Lazy Loading**: Use React.lazy() for better performance
3. **Error Handling**: Implement error boundaries around the widget
4. **Testing**: Mock keyboard events and test all variants
5. **Accessibility**: Test with keyboard-only navigation and screen readers

## Future Enhancements
- [ ] Drag to reposition button
- [ ] Sound notifications for new messages
- [ ] Minimize to compact mode
- [ ] Chat history persistence
- [ ] Multi-language support
