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
      
      // Enhanced mobile detection
      const isMobileBySize = width < MOBILE_BREAKPOINT
      const isMobileByUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isMobileByTouch = isTouch && width < 1024
      
      const isMobileDevice = isMobileBySize || isMobileByUserAgent || isMobileByTouch
      
      setIsMobile(isMobileDevice)
      setDeviceInfo({
        width,
        height,
        userAgent,
        isTouch,
        devicePixelRatio
      })
      
      // Auto-adjust viewport for mobile
      if (isMobileDevice) {
        const metaViewport = document.querySelector('meta[name="viewport"]')
        if (metaViewport) {
          metaViewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
          )
        }
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
