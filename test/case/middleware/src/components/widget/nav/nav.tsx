import React from 'react'
import { routes } from '~/routes/index'
import { NavLink } from 'react-router-dom'
import './nav.scss'

export const Nav: React.FC = () => {
  return (
    <div className='nav'>
      {routes.map((item, key) => (
        <NavLink to={item.path} activeClassName='current' key={key}>
          {item.title}
        </NavLink>
      ))}
    </div>
  )
}
