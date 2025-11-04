# Chatbot Widget - Advanced Features

## Overview
A production-ready, always-visible floating chatbot widget with **drag-and-drop repositioning**, **sound notifications**, **chat persistence**, and **typing indicators** for real estate applications.

## Features

### 🎯 Drag-and-Drop Repositioning (Framer Motion)
- **Long press to activate** (300ms hold)
- **Smooth dragging** with cursor feedback (`grab` → `grabbing`)
- **Position persists** across sessions (saved in localStorage)
- **Viewport constraints**: Button stays within screen bounds (20px padding)
- **Touch support**: Works on mobile devices
- **Visual feedback**: GripVertical icon shows on hover and during drag

### 🔔 Sound Notifications (Web Audio API)
- **Soft chime** plays when AI responds (chat closed)
- **No external files**: Generated using Web Audio API
- **Volume**: 0.3 (gentle, non-intrusive)
- **Mute toggle**: Volume icon in chat header
- **Persistent preference**: Mute state saved to localStorage

### 💾 Chat Persistence
- **Auto-save**: Messages and conversation ID to localStorage
- **Per-user storage**: `chat_history_${userId || 'guest'}`
- **Auto-load**: Restores chat history on mount
- **Auto-expire**: Clears after 7 days
- **Welcome message**: Only shows if no persisted history

### ⌨️ Typing Indicators
- **Animated dots**: 3 bouncing dots show "AI is typing..."
- **Framer Motion**: Smooth fade in/out with AnimatePresence
- **Loading state**: Shows when `isLoading === true`
- **Auto-hide**: Disappears when AI message arrives

### ✨ Always Visible
- Fixed position (customizable via drag)
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

### 🖱️ Mouse Interactions
- **Short click** - Open/close chat
- **Long press** (300ms) - Activate drag mode
- **Drag** - Reposition button anywhere on screen
- **Hover** - Scale up + show grip icon

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

### ChatButton (with Framer Motion Drag)
The floating trigger button with drag-and-drop, unread badge, and 3 variants.

```tsx
import ChatButton from "@/components/ai/ChatButton";

<ChatButton 
  onClick={() => setIsOpen(true)}
  unreadCount={3}
  variant="glow"
/>
```

**Features:**
- Long press (300ms) to activate drag
- Position saved to `localStorage` key: `chat_button_pos`
- Framer Motion `drag` with momentum disabled
- Constrained to viewport (20px padding)

### UnreadBadge
Notification badge showing unread count.

```tsx
import UnreadBadge from "@/components/ai/UnreadBadge";

<UnreadBadge count={5} />
```

### TypingIndicator
Animated "AI is typing..." indicator with bouncing dots.

```tsx
import TypingIndicator from "@/components/ai/TypingIndicator";
import { AnimatePresence } from "framer-motion";

<AnimatePresence>
  {isLoading && <TypingIndicator />}
</AnimatePresence>
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

### useSoundNotification
Plays notification sounds using Web Audio API.

```tsx
import { useSoundNotification } from "@/hooks/useSoundNotification";

const { playNotification, isMuted, toggleMute } = useSoundNotification();

// Play chime
playNotification();

// Toggle mute
<button onClick={toggleMute}>
  {isMuted ? "Unmute" : "Mute"}
</button>
```

**Sound Details:**
- Two-note chime: E5 (659.25 Hz) → A5 (880 Hz)
- Duration: 0.4 seconds
- Volume: 0.3 (fade in/out envelope)
- Wave: Sine (soft tone)

### useChatPersistence
Saves chat messages and conversation ID to localStorage with 7-day expiry.

```tsx
import { useChatPersistence } from "@/hooks/useChatPersistence";

const { 
  persistedMessages, 
  persistedConversationId, 
  saveChat, 
  clearChat 
} = useChatPersistence(user?.id);

// Save chat
saveChat(messages, conversationId);

// Clear chat
clearChat();
```

**Storage Details:**
- Key format: `chat_history_${userId || 'guest'}`
- Stores: `{ messages, conversationId, timestamp }`
- Auto-expires: 7 days from last save
- Loads on mount, saves on every message change

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

src/components/ai/
├── ResponsiveAIChatWidget.tsx    # Main widget component
├── ChatButton.tsx                 # Floating button with drag (Framer Motion)
├── UnreadBadge.tsx               # Notification badge
├── TypingIndicator.tsx           # Animated typing dots
├── AIChatMessages.tsx            # Message display
├── AIChatInput.tsx               # Input field
├── AIChatQuickActions.tsx        # Quick action buttons
└── types.ts                      # TypeScript types

src/hooks/
├── useChatKeyboardShortcuts.ts   # Keyboard shortcut logic
├── useSoundNotification.ts       # Web Audio API sound
└── useChatPersistence.ts         # localStorage chat history
```

### State Management
- **Position**: Saved in `localStorage` (`chat_button_pos`), managed by Framer Motion drag
- **Unread Count**: Increments when AI responds while chat is closed
- **Messages**: Full conversation history (persisted to localStorage)
- **Conversation ID**: Persists across session (persisted to localStorage)
- **Loading States**: UI feedback + typing indicator
- **Drag State**: Long press (300ms) to activate, Framer Motion drag
- **Sound Muted**: Toggle persisted to localStorage

## How Features Work

### 1. Drag-and-Drop (Framer Motion)
**User Flow:**
1. **Long press** (300ms) on button → Activates drag mode
2. **Cursor changes** to `grabbing`, button scales up
3. **Drag** button anywhere on screen (Framer Motion drag)
4. **Release** → Position saved to `localStorage` (`chat_button_pos`)
5. **Constraints**: 20px padding from viewport edges

**Technical:**
```tsx
<motion.button
  drag={isDragging}
  dragMomentum={false}
  dragElastic={0}
  onDragEnd={(_, info) => {
    const newX = Math.max(20, Math.min(window.innerWidth - 76, info.point.x - 28));
    const newY = Math.max(20, Math.min(window.innerHeight - 76, info.point.y - 28));
    setPosition({ x: newX, y: newY });
    localStorage.setItem('chat_button_pos', JSON.stringify({ x: newX, y: newY }));
  }}
/>
```

### 2. Sound Notifications (Web Audio API)
**User Flow:**
1. AI sends message while chat is closed
2. Soft chime plays (E5 → A5, 0.4s)
3. Volume icon in header toggles mute

**Technical:**
```tsx
const oscillator = audioContext.createOscillator();
oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1); // A5
gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
```

### 3. Chat Persistence
**User Flow:**
1. User sends messages → Auto-saved to localStorage
2. Refresh page → Chat history restored
3. After 7 days → History auto-expires and clears

**Technical:**
```tsx
const history: ChatHistory = {
  messages,
  conversationId,
  timestamp: Date.now(),
};
localStorage.setItem(`chat_history_${userId || 'guest'}`, JSON.stringify(history));
```

### 4. Typing Indicators
**User Flow:**
1. User sends message → `isLoading = true`
2. "AI is typing..." with 3 bouncing dots appears
3. AI responds → Indicator fades out (AnimatePresence)

**Technical:**
```tsx
<AnimatePresence>
  {isLoading && <TypingIndicator />}
</AnimatePresence>

// In TypingIndicator:
{[0, 1, 2].map((index) => (
  <motion.div
    animate={{ y: -8 }}
    transition={{ delay: index * 0.15, repeat: Infinity }}
  />
))}
```

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

### Custom Drag Bounds
Constrain dragging to specific area:

```tsx
const { position, handleDragStart } = useDraggablePosition({
  defaultPosition: { x: 24, y: 24 },
  bounds: {
    minX: 100,
    maxX: 500,
    minY: 100,
    maxY: 400,
  }
});
```

### Reset Position Programmatically
```tsx
const { resetPosition } = useDraggablePosition();

// Reset to default position
<button onClick={resetPosition}>Reset Chatbot Position</button>
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
- Clear localStorage if position is saved off-screen: `localStorage.removeItem('chatbot-button-position')`

### Dragging not working
- Ensure `onDragStart` handler is passed to `ChatButton`
- Check console for errors during drag events
- Verify touch events work on mobile devices
- Test with different browsers (some may block mouse events)

### Position resets on refresh
- Check if localStorage is enabled
- Verify storage key is consistent
- Look for localStorage clear in app code
- Test in incognito mode (localStorage persists separately)

### Chat window appears off-screen
- Window auto-constrains to viewport bounds
- Reset position: `localStorage.removeItem('chatbot-button-position')`
- Check `getChatWindowPosition()` logic

### Keyboard shortcuts not working
- Check for conflicting browser shortcuts
- Verify focus is not trapped in input field
- Test with `disabled={false}` prop

## Best Practices

1. **Single Instance**: Only render one `ResponsiveAIChatWidget` per page
2. **Lazy Loading**: Use React.lazy() for better performance
3. **Error Handling**: Implement error boundaries around the widget
4. **Testing**: Mock keyboard/drag events, sound API, and localStorage
5. **Accessibility**: Test with keyboard-only navigation and screen readers
6. **Position Limits**: Framer Motion constrains to viewport automatically
7. **Sound UX**: Provide mute toggle, save preference
8. **Storage Management**: Clear expired chats, handle localStorage quota

## Future Enhancements
- [x] ~~Drag to reposition button~~ ✅ Implemented with Framer Motion!
- [x] ~~Sound notifications~~ ✅ Implemented with Web Audio API!
- [x] ~~Chat persistence~~ ✅ Implemented with localStorage!
- [x] ~~Typing indicators~~ ✅ Implemented with Framer Motion!
- [ ] Export chat history (JSON/PDF)
- [ ] Voice input/output (Web Speech API)
- [ ] Message search and filtering
- [ ] Multi-language support
- [ ] Custom notification sounds
