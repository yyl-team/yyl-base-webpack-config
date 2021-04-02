import React from 'react'
import './sub.scss'
import { Demo } from '~@/widget/demo/demo'
import { Nav } from '~@/widget/nav/nav'

export const Sub: React.FC = () => {
  return (
    <div className='page-sub'>
      <Nav />
      <div className='page-sub-circlebox'>
        <Demo title='hello YY' />
      </div>
      <div className='page-sub__tl' />
    </div>
  )
}
