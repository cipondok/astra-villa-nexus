import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

// Debounce function for performance
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Cache user agent check results
const userAgentCache = new Map<string, { isMobile: boolean; isTablet: boolean }>();

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false
  )
  const [isTablet, setIsTablet] = React.useState<boolean>(
    typeof window !== 'undefined'
      ? window.innerWidth > MOBILE_BREAKPOINT && window.innerWidth <= TABLET_BREAKPOINT
      : false
  )
  const [deviceInfo, setDeviceInfo] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    isTouch: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    screenOrientation: typeof window !== 'undefined' && 'screen' in window && 'orientation' in screen ? screen.orientation?.type : 'unknown'
  })

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent
      const isTouch = 'ontouchstart' in window
      const devicePixelRatio = window.devicePixelRatio
      
      // Check cache first
      let userAgentResult = userAgentCache.get(userAgent);
      if (!userAgentResult) {
        const isMobileByUserAgent = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
        const isTabletByUserAgent = /iPad|Android.*Tablet|PlayBook|Silk/i.test(userAgent)
        userAgentResult = { isMobile: isMobileByUserAgent, isTablet: isTabletByUserAgent };
        userAgentCache.set(userAgent, userAgentResult);
      }
      
      // Simplified and optimized detection
      const isMobileBySize = width <= MOBILE_BREAKPOINT
      const isTabletBySize = width > MOBILE_BREAKPOINT && width <= TABLET_BREAKPOINT
      const hasTouch = isTouch || navigator.maxTouchPoints > 0
      
      const isMobileDevice = isMobileBySize || (userAgentResult.isMobile && hasTouch)
      const isTabletDevice = isTabletBySize || (userAgentResult.isTablet && hasTouch)
      
      // Only update if values changed
      const newIsMobile = isMobileDevice && !isTabletDevice
      const newIsTablet = isTabletDevice && !isMobileDevice
      
      if (newIsMobile !== isMobile || newIsTablet !== isTablet) {
        setIsMobile(newIsMobile)
        setIsTablet(newIsTablet)
        setDeviceInfo({
          width,
          height,
          userAgent,
          isTouch,
          devicePixelRatio,
          screenOrientation: 'screen' in window && 'orientation' in screen ? screen.orientation?.type : 'unknown'
        })
        
        // Optimize DOM manipulation - only when needed
        if (newIsMobile || newIsTablet) {
          // Skip modifying viewport dynamically to prevent layout jumps on mobile Safari
          // (We rely on the static meta tag in index.html)
          // let metaViewport = document.querySelector('meta[name="viewport"]')
          // if (!metaViewport) {
          //   metaViewport = document.createElement('meta')
          //   metaViewport.setAttribute('name', 'viewport')
          //   document.head.appendChild(metaViewport)
          // }
          // const viewportContent = 'width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover'
          // if (metaViewport.getAttribute('content') !== viewportContent) {
          //   metaViewport.setAttribute('content', viewportContent)
          // }
          
          // Apply classes efficiently
          const htmlEl = document.documentElement
          const bodyEl = document.body
          
          if (newIsMobile) {
            htmlEl.classList.add('mobile-device')
            htmlEl.classList.remove('tablet-device')
            bodyEl.classList.add('mobile-device', 'mobile-app-layout')
            bodyEl.classList.remove('tablet-device', 'tablet-app-layout')
          } else {
            htmlEl.classList.add('tablet-device')
            htmlEl.classList.remove('mobile-device')  
            bodyEl.classList.add('tablet-device', 'tablet-app-layout')
            bodyEl.classList.remove('mobile-device', 'mobile-app-layout')
          }
          
          // Apply styles only once
          if (!bodyEl.style.width) {
            bodyEl.style.width = '100%'
            bodyEl.style.overflowX = 'hidden'
            ;(bodyEl.style as any).minHeight = '100svh'
            ;(bodyEl.style as any).webkitOverflowScrolling = 'touch'
            ;(bodyEl.style as any).webkitTextSizeAdjust = '100%'
            ;(bodyEl.style as any).webkitTapHighlightColor = 'transparent'
          }
        } else {
          // Desktop cleanup - only when transitioning from mobile/tablet
          document.documentElement.classList.remove('mobile-device', 'tablet-device')
          document.body.classList.remove('mobile-device', 'mobile-app-layout', 'tablet-device', 'tablet-app-layout')
          
          const bodyEl = document.body
          bodyEl.style.width = ''
          bodyEl.style.overflowX = ''
          bodyEl.style.minHeight = ''
          ;(bodyEl.style as any).webkitOverflowScrolling = ''
          ;(bodyEl.style as any).webkitTextSizeAdjust = ''
          ;(bodyEl.style as any).webkitTapHighlightColor = ''
        }
      }
    }
    
    // Check immediately
    checkMobile()
    
    // Debounced resize listener for performance
    const debouncedCheckMobile = debounce(checkMobile, 150)
    
    window.addEventListener('resize', debouncedCheckMobile)
    window.addEventListener('orientationchange', debouncedCheckMobile)
    
    return () => {
      window.removeEventListener('resize', debouncedCheckMobile)
      window.removeEventListener('orientationchange', debouncedCheckMobile)
    }
  }, [])

  return { isMobile, isTablet, deviceInfo }
}
