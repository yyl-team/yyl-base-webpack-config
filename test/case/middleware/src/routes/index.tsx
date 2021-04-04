import React from 'react'
import { Home } from '~@/page/home/home'
import { Sub } from '~@/page/sub/sub'

export interface RoutesItem {
  title: string
  component: typeof React.Component | React.FC
  path: string
}

export const routes: RoutesItem[] = [
  {
    title: 'home',
    component: Home,
    path: '/home'
  },
  {
    title: 'sub',
    component: Sub,
    path: '/sub'
  }
]
