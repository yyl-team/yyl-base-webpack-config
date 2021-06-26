import React, { FC, useState, useEffect } from 'react'

import './demo.scss'

interface DemoProps {
  title?: string
}

let interKey: any

export const Demo: FC<DemoProps> = props => {
  const [type, setType] = useState(0)

  useEffect(() => {
    let padding = 0
    const runner = () => {
      setType(++padding % 4)
    }
    interKey = setInterval(runner, 1000)
    runner()
    return () => {
      clearInterval(interKey)
    }
  }, [])

  return (
    <div className='demo-circlebox'>
      <img
        className={`demo-circlebox__img demo-circlebox__img--type${type}`}
        alt=''
        src={require('./images/logo.png')}
      />
      <div className='page-home__tl'>
        {props.title}
        {type}
      </div>
    </div>
  )
}
