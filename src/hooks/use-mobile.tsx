import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )
  const [isTablet, setIsTablet] = React.useState<boolean>(
    typeof window !== 'undefined'
      ? window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
      : false
  )

  React.useEffect(() => {
    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const tabletQuery = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`)

    const update = () => {
      const mobile = mobileQuery.matches
      const tablet = tabletQuery.matches

      setIsMobile(mobile)
      setIsTablet(tablet)

      // Toggle classes for CSS selectors — no inline styles
      const html = document.documentElement
      const body = document.body
      html.classList.toggle('mobile-device', mobile)
      body.classList.toggle('mobile-device', mobile)
      body.classList.toggle('mobile-app-layout', mobile)
      html.classList.toggle('tablet-device', tablet)
      body.classList.toggle('tablet-device', tablet)
      body.classList.toggle('tablet-app-layout', tablet)
    }

    update()

    mobileQuery.addEventListener('change', update)
    tabletQuery.addEventListener('change', update)

    return () => {
      mobileQuery.removeEventListener('change', update)
      tabletQuery.removeEventListener('change', update)
    }
  }, [])

  return { isMobile, isTablet }
}
