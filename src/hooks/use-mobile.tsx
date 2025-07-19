import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [deviceInfo, setDeviceInfo] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    isTouch: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
    devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
  })

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent
      const isTouch = 'ontouchstart' in window
      const devicePixelRatio = window.devicePixelRatio
      
      console.log('Mobile detection:', { width, height, userAgent, isTouch, devicePixelRatio })
      
      // Enhanced mobile detection with multiple checks
      const isMobileBySize = width <= MOBILE_BREAKPOINT
      const isMobileByUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isMobileByTouch = isTouch && width < 1024
      const isMobileByOrientation = window.orientation !== undefined
      const isMobileByMaxTouchPoints = navigator.maxTouchPoints > 0
      
      const isMobileDevice = isMobileBySize || isMobileByUserAgent || isMobileByTouch || isMobileByOrientation || isMobileByMaxTouchPoints
      
      console.log('Mobile checks:', { 
        isMobileBySize, 
        isMobileByUserAgent, 
        isMobileByTouch, 
        isMobileByOrientation,
        isMobileByMaxTouchPoints,
        final: isMobileDevice 
      })
      
      setIsMobile(isMobileDevice)
      setDeviceInfo({
        width,
        height,
        userAgent,
        isTouch,
        devicePixelRatio
      })
      
      // Auto-adjust viewport and apply mobile optimizations
      if (isMobileDevice) {
        // Set proper viewport meta tag
        let metaViewport = document.querySelector('meta[name="viewport"]')
        if (!metaViewport) {
          metaViewport = document.createElement('meta')
          metaViewport.setAttribute('name', 'viewport')
          document.head.appendChild(metaViewport)
        }
        metaViewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        )
        
        // Add mobile-specific classes
        document.documentElement.classList.add('mobile-device')
        document.body.classList.add('mobile-device', 'mobile-app-layout')
        
        // Apply mobile-specific styles immediately
        document.body.style.width = '100vw'
        document.body.style.overflowX = 'hidden'
        ;(document.body.style as any).webkitOverflowScrolling = 'touch'
        ;(document.body.style as any).webkitTextSizeAdjust = '100%'
        
        // Force layout recalculation
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'))
          window.dispatchEvent(new Event('orientationchange'))
        }, 100)
      } else {
        document.documentElement.classList.remove('mobile-device')
        document.body.classList.remove('mobile-device', 'mobile-app-layout')
        
        // Reset desktop styles
        document.body.style.width = ''
        document.body.style.overflowX = ''
        ;(document.body.style as any).webkitOverflowScrolling = ''
        ;(document.body.style as any).webkitTextSizeAdjust = ''
      }
    }
    
    // Check immediately
    checkMobile()
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile, deviceInfo }
}
