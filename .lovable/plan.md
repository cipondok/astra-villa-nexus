
# Fix forwardRef Warning in ChatButton

## Problem

`ChatButton` is used inside `TooltipTrigger asChild` which tries to pass a `ref` to it. Since `ChatButton` is a plain function component, React logs a forwardRef warning.

## Change

**File:** `src/components/ai/ChatButton.tsx`

- Wrap the component with `React.forwardRef`
- Add `ref` parameter and attach it to the outermost DOM element (the `ContextMenu` wrapper or its first rendered element)
- Update the `ChatButtonProps` interface accordingly
- Keep the default export

Specifically:
- Line 30: Change `const ChatButton = ({ ... }: ChatButtonProps) => {` to `const ChatButton = forwardRef<HTMLDivElement, ChatButtonProps>(({ ... }, ref) => {`
- Attach `ref` to the outermost rendered element (likely the `ContextMenu` or a wrapping `div`)
- Line 357: Close with `});` and add `ChatButton.displayName = "ChatButton";`

Single file change, no new dependencies.
