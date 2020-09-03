import * as React from 'react'
import PropTypes from 'prop-types'
import Rwiper from '@oakwood/oui/Rwiper'
import SwiperCore, { A11y } from 'swiper'

const Slideshow = React.forwardRef(function Slideshow(props, ref) {
  const { modules: modulesProp = [] } = props

  const modules = modulesProp
  if (!modules.includes(A11y)) {
    modules.push(A11y)
  }

  return <Rwiper Swiper={SwiperCore} modules={modules} ref={ref} {...props} />
})

Slideshow.propTypes = {
  modules: PropTypes.array,
}

Slideshow.uiName = 'Slideshow'

export default Slideshow
