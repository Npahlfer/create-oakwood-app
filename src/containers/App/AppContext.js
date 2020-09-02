import * as React from 'react'
import PropTypes from 'prop-types'
import { nest } from 'recompose'
import Router from 'next/router'
import mediaLoaded from '@maeertin/medialoaded'
import { debounce } from '@oakwood/oui-utils'
import { CLOSE_MENUS_ON_RESIZE } from 'src/site.config'

const AppHandlersContext = React.createContext({})
const AppContext = React.createContext({})

if (process.env.NODE_ENV !== 'production') {
  AppHandlersContext.displayName = 'AppHandlersContext'
  AppContext.displayName = 'AppContext'
}

export function useAppHandlers() {
  return React.useContext(AppHandlersContext)
}

export function useApp() {
  return React.useContext(AppContext)
}

export function AppContextProvider(props) {
  const [appBarColor, setAppBarColor] = React.useState('default')
  const [hideFooter, setHideFooter] = React.useState(false)
  const [hideHeader, setHideHeader] = React.useState(false)
  const [isCartMenuOpen, setIsCartMenuOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isMediaReady, setIsMediaReady] = React.useState(false)
  const [isNavMenuOpen, setIsNavMenuOpen] = React.useState(false)
  const [isSearchMenuOpen, setIsSearchMenuOpen] = React.useState(false)

  // Helpers

  const closeAllMenus = () => {
    setIsCartMenuOpen(false)
    setIsNavMenuOpen(false)
    setIsSearchMenuOpen(false)
  }

  // Private handlers

  const handleMediaReady = React.useCallback(() => {
    setIsMediaReady(true)
  }, [])

  const handleRouteChangeStart = React.useCallback(() => {
    setIsLoading(true)
    closeAllMenus()
  }, [])

  const handleRouteChangeComplete = React.useCallback(() => {
    setIsLoading(false)
  }, [])

  // Mount hook

  React.useEffect(() => {
    const handleResize = debounce(() => {
      if (CLOSE_MENUS_ON_RESIZE) {
        closeAllMenus()
      }
    })

    mediaLoaded('.coa-preload', handleMediaReady)
    window.addEventListener('resize', handleResize)
    Router.events.on('routeChangeStart', handleRouteChangeStart)
    Router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      handleResize.clear()
      window.removeEventListener('resize', handleResize)
      Router.events.off('routeChangeStart', handleRouteChangeStart)
      Router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [handleMediaReady, handleRouteChangeStart, handleRouteChangeComplete])

  // Public handlers

  const onAppBarBurgerClick = React.useCallback(() => {
    setIsNavMenuOpen((prev) => !prev)
    setIsCartMenuOpen(false)
    setIsSearchMenuOpen(false)
  }, [])

  const onAppBarCartClick = React.useCallback(() => {
    setIsCartMenuOpen((prev) => !prev)
    setIsNavMenuOpen(false)
    setIsSearchMenuOpen(false)
  }, [])

  const onAppBarSearchClick = React.useCallback(() => {
    setIsSearchMenuOpen((prev) => !prev)
    setIsCartMenuOpen(false)
    setIsNavMenuOpen(false)
  }, [])

  const onCartMenuClose = React.useCallback(() => {
    setIsCartMenuOpen(false)
  }, [])

  const onNavMenuClose = React.useCallback(() => {
    setIsNavMenuOpen(false)
  }, [])

  const onSearchMenuClose = React.useCallback(() => {
    setIsSearchMenuOpen(false)
  }, [])

  // Memoize handlers context separately so that one can subscribe
  // to them without re-rendering on state updates.
  const prevAppHandlersContextRef = React.useRef()
  const appHandlersContext = React.useMemo(() => {
    const nextAppHandlersContext = {
      onAppBarBurgerClick,
      onAppBarCartClick,
      onAppBarSearchClick,
      onCartMenuClose,
      onNavMenuClose,
      onSearchMenuClose,
      // Expose setters for custom hooks
      setAppBarColor,
      setHideFooter,
      setHideHeader,
    }

    if (process.env.NODE_ENV !== 'production') {
      if (prevAppHandlersContextRef.current) {
        console.warn(
          `Warning: ${AppHandlersContext.displayName} received new values, was this intentional?`,
        )
        console.log('Before:', prevAppHandlersContextRef.current) // eslint-disable-line no-console
        console.log('After:', nextAppHandlersContext) // eslint-disable-line no-console
      }
      prevAppHandlersContextRef.current = nextAppHandlersContext
    }

    return nextAppHandlersContext
  }, [
    onAppBarBurgerClick,
    onAppBarCartClick,
    onAppBarSearchClick,
    onCartMenuClose,
    onNavMenuClose,
    onSearchMenuClose,
  ])

  // Memoize context so that no re-renders occur despite props changing
  // higher up the tree.
  const appContext = React.useMemo(
    () => ({
      appBarColor,
      hideFooter,
      hideHeader,
      isCartMenuOpen,
      isLoading,
      isMediaReady,
      isNavMenuOpen,
      isSearchMenuOpen,
      // Computed props
      isBackdropOpen: isLoading,
      isSomeMenuOpen: isCartMenuOpen || isNavMenuOpen || isSearchMenuOpen,
      // Merge in handlers for easy access
      ...appHandlersContext,
    }),
    [
      appBarColor,
      hideFooter,
      hideHeader,
      appHandlersContext,
      isCartMenuOpen,
      isLoading,
      isMediaReady,
      isNavMenuOpen,
      isSearchMenuOpen,
    ],
  )

  return (
    <AppHandlersContext.Provider value={appHandlersContext}>
      <AppContext.Provider value={appContext}>{props.children}</AppContext.Provider>
    </AppHandlersContext.Provider>
  )
}

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function withAppContextProvider(Component) {
  return nest(AppContextProvider, Component)
}

export default AppContext
