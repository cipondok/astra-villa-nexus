import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isTablet, setIsTablet] = React.useState<boolean>(false)
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
      
      console.log('Mobile detection:', { width, height, userAgent, isTouch, devicePixelRatio })
      
      // Enhanced mobile and tablet detection with multiple checks
      const isMobileBySize = width <= MOBILE_BREAKPOINT
      const isTabletBySize = width > MOBILE_BREAKPOINT && width <= TABLET_BREAKPOINT
      const isMobileByUserAgent = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isTabletByUserAgent = /iPad|Android.*Tablet|PlayBook|Silk/i.test(userAgent)
      const isMobileByTouch = isTouch && width <= MOBILE_BREAKPOINT
      const isTabletByTouch = isTouch && width > MOBILE_BREAKPOINT && width <= TABLET_BREAKPOINT
      const isMobileByOrientation = window.orientation !== undefined && width <= MOBILE_BREAKPOINT
      const isTabletByOrientation = window.orientation !== undefined && width > MOBILE_BREAKPOINT && width <= TABLET_BREAKPOINT
      const isMobileByMaxTouchPoints = navigator.maxTouchPoints > 0 && width <= MOBILE_BREAKPOINT
      const isTabletByMaxTouchPoints = navigator.maxTouchPoints > 0 && width > MOBILE_BREAKPOINT && width <= TABLET_BREAKPOINT
      
      const isMobileDevice = isMobileBySize || isMobileByUserAgent || isMobileByTouch || isMobileByOrientation || isMobileByMaxTouchPoints
      const isTabletDevice = isTabletBySize || isTabletByUserAgent || isTabletByTouch || isTabletByOrientation || isTabletByMaxTouchPoints
      
      console.log('Device checks:', { 
        isMobileBySize, 
        isTabletBySize,
        isMobileByUserAgent, 
        isTabletByUserAgent,
        isMobileByTouch, 
        isTabletByTouch,
        isMobileByOrientation,
        isTabletByOrientation,
        isMobileByMaxTouchPoints,
        isTabletByMaxTouchPoints,
        finalMobile: isMobileDevice,
        finalTablet: isTabletDevice
      })
      
      setIsMobile(isMobileDevice)
      setIsTablet(isTabletDevice)
      setDeviceInfo({
        width,
        height,
        userAgent,
        isTouch,
        devicePixelRatio,
        screenOrientation: 'screen' in window && 'orientation' in screen ? screen.orientation?.type : 'unknown'
      })
      
      // Auto-adjust viewport and apply device-specific optimizations
      if (isMobileDevice || isTabletDevice) {
        // Set proper viewport meta tag for mobile and tablet
        let metaViewport = document.querySelector('meta[name="viewport"]')
        if (!metaViewport) {
          metaViewport = document.createElement('meta')
          metaViewport.setAttribute('name', 'viewport')
          document.head.appendChild(metaViewport)
        }
        
        // Different viewport settings for mobile vs tablet
        if (isMobileDevice) {
          metaViewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
          )
          document.documentElement.classList.add('mobile-device')
          document.body.classList.add('mobile-device', 'mobile-app-layout')
        } else if (isTabletDevice) {
          metaViewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes, viewport-fit=cover'
          )
          document.documentElement.classList.add('tablet-device')
          document.body.classList.add('tablet-device', 'tablet-app-layout')
        }
        
        // Apply responsive styles immediately
        document.body.style.width = '100vw'
        document.body.style.overflowX = 'hidden'
        document.body.style.minHeight = '100vh'
        ;(document.body.style as any).webkitOverflowScrolling = 'touch'
        ;(document.body.style as any).webkitTextSizeAdjust = '100%'
        ;(document.body.style as any).webkitTapHighlightColor = 'transparent'
        
        // Force layout recalculation for orientation changes
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'))
          window.dispatchEvent(new Event('orientationchange'))
        }, 100)
      } else {
        // Desktop cleanup
        document.documentElement.classList.remove('mobile-device', 'tablet-device')
        document.body.classList.remove('mobile-device', 'mobile-app-layout', 'tablet-device', 'tablet-app-layout')
        
        // Reset desktop styles
        document.body.style.width = ''
        document.body.style.overflowX = ''
        document.body.style.minHeight = ''
        ;(document.body.style as any).webkitOverflowScrolling = ''
        ;(document.body.style as any).webkitTextSizeAdjust = ''
        ;(document.body.style as any).webkitTapHighlightColor = ''
      }
    }
    
    // Check immediately
    checkMobile()
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile, isTablet, deviceInfo }
}
