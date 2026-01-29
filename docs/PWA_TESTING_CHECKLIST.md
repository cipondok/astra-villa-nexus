# PWA Testing Checklist for ASTRA Villa

## 🔧 Prerequisites
- [ ] Chrome DevTools installed
- [ ] Lighthouse CLI: `npm install -g lighthouse`
- [ ] LHCI installed: `npm install -g @lhci/cli`

---

## 📱 PWA Core Requirements

### Manifest Validation
- [ ] `manifest.json` is accessible at `/manifest.json`
- [ ] Contains required fields: `name`, `short_name`, `start_url`, `display`, `icons`
- [ ] Icons include 192x192 and 512x512 sizes
- [ ] Icons have `purpose: "maskable any"`
- [ ] Theme color matches `<meta name="theme-color">`
- [ ] Background color is set

### Service Worker
- [ ] Service worker registers successfully
- [ ] Responds with 200 when offline
- [ ] Caches static assets on install
- [ ] Handles fetch events appropriately

### HTTPS
- [ ] All resources served over HTTPS (in production)
- [ ] HTTP redirects to HTTPS

---

## 📴 Offline Testing

### Basic Offline Functionality
1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Verify:
   - [ ] Offline page displays at `/offline.html`
   - [ ] Previously cached pages still load
   - [ ] App doesn't crash with "No internet" errors
   - [ ] Network error messages are user-friendly

### Property-Specific Offline
- [ ] Favorited properties available offline
- [ ] Property images load from cache
- [ ] Search history accessible offline
- [ ] User profile data persists

### Background Sync
1. Go offline
2. Perform actions (favorite a property, submit form)
3. Verify:
   - [ ] Actions queued (toast notification appears)
   - [ ] Queue count shown in UI
   - [ ] Going online triggers sync
   - [ ] Actions complete successfully

---

## 🐌 Slow Network Testing (3G Simulation)

### Setup
1. DevTools → Network → Throttle → Slow 3G
2. Or use Lighthouse with throttling enabled

### Verify
- [ ] First Contentful Paint < 3s
- [ ] Largest Contentful Paint < 5s
- [ ] Time to Interactive < 7s
- [ ] Images load progressively
- [ ] Critical CSS loads first
- [ ] JavaScript doesn't block rendering

---

## 📲 Installation Testing

### Desktop (Chrome/Edge)
1. Visit the site
2. Look for install icon in address bar
3. Verify:
   - [ ] Install prompt appears
   - [ ] App installs successfully
   - [ ] Opens in standalone window
   - [ ] App icon appears in dock/taskbar

### Mobile (Android Chrome)
1. Visit site in Chrome
2. Wait for install banner or use menu → "Add to Home Screen"
3. Verify:
   - [ ] Add to Home Screen prompt appears
   - [ ] Splash screen displays correctly
   - [ ] App opens in standalone mode
   - [ ] Status bar color matches theme

### iOS Safari
1. Visit site in Safari
2. Tap Share → Add to Home Screen
3. Verify:
   - [ ] Apple touch icon displays
   - [ ] App name correct
   - [ ] Opens in standalone mode

---

## 🔄 Update Flow Testing

1. Make a code change
2. Deploy new version
3. Visit app
4. Verify:
   - [ ] Update notification appears
   - [ ] "Update" button works
   - [ ] App reloads with new content
   - [ ] Old caches cleared

---

## 💾 Storage Testing

### Cache Management
- [ ] Cache size shown correctly
- [ ] "Clear Cache" removes all cached data
- [ ] "Cleanup" removes expired entries only
- [ ] Persistent storage request works

### Storage Quota
- [ ] App doesn't exceed storage quota
- [ ] Graceful handling when quota exceeded
- [ ] Old cache entries evicted (LRU)

---

## 🔔 Push Notifications (if implemented)

- [ ] Permission request appears
- [ ] Notifications display when app closed
- [ ] Clicking notification opens correct page
- [ ] Notification actions work

---

## 🧪 Lighthouse PWA Audit

### Run Audit
```bash
# Local development
npx lhci autorun

# Or manual
lighthouse http://localhost:8080 --view --preset=desktop
```

### Required Scores
| Category | Minimum Score |
|----------|---------------|
| Performance | 70% |
| Accessibility | 80% |
| Best Practices | 80% |
| SEO | 80% |
| PWA | 90% |

### PWA-Specific Checks
- [ ] ✅ Installable
- [ ] ✅ PWA Optimized
- [ ] ✅ Service worker installed
- [ ] ✅ Works offline
- [ ] ✅ Has valid manifest
- [ ] ✅ Uses HTTPS
- [ ] ✅ Redirects HTTP → HTTPS
- [ ] ✅ Has meta viewport tag
- [ ] ✅ Contains content when offline
- [ ] ✅ Provides custom offline page

---

## 🎯 Performance Metrics

### Core Web Vitals
| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤2.5s | ≤4s | >4s |
| FID | ≤100ms | ≤300ms | >300ms |
| CLS | ≤0.1 | ≤0.25 | >0.25 |

### PWA Performance
- [ ] First paint under 2 seconds
- [ ] TTI (Time to Interactive) under 5 seconds
- [ ] Cached pages load instantly (<500ms)

---

## 🐛 Common Issues & Fixes

### Service Worker Not Registering
- Check console for errors
- Ensure SW is at root scope `/sw.js`
- Verify HTTPS (or localhost)

### Cache Not Working
- Check Cache Storage in DevTools
- Verify fetch event handler
- Check for cache version mismatches

### Offline Page Not Showing
- Ensure `/offline.html` is cached on install
- Check navigation fetch handler
- Verify fallback logic

### Install Prompt Not Appearing
- Must be served over HTTPS
- Valid manifest required
- Service worker must be registered
- Some browsers require user engagement

---

## 📋 Final Checklist

Before deploying:
- [ ] All Lighthouse PWA audits pass
- [ ] Offline functionality tested
- [ ] Slow network tested (3G)
- [ ] Installation tested on desktop and mobile
- [ ] Update flow tested
- [ ] Storage management works
- [ ] No console errors related to SW or cache
