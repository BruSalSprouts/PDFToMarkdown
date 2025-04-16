import type { AppProps } from 'next/app'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Clean up Grammarly or other extensions' attributes
    const body = document.querySelector('body')
    if (body) {
      body.removeAttribute('data-new-gr-c-s-check-loaded')
      body.removeAttribute('data-gr-ext-installed')
    }
  }, [])

  return <Component {...pageProps} />
}

export default MyApp