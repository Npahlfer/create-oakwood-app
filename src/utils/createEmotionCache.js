// Based on https://github.com/mui-org/material-ui/blob/next/examples/nextjs/src/createEmotionCache.js

import createCache from '@emotion/cache'

export default function createEmotionCache() {
  return createCache({ key: 'css' })
}
