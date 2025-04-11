import { lazy } from 'react'

// use lazy for better code splitting, a.k.a. load faster
const MiqaatHome = lazy(() => import('../pages/MiqaatHome'))
const MenuList = lazy(() => import('../pages/MenuList'))
const EditMiqaatForm = lazy(() => import('../pages/EditMiqaatForm'))
const Member = lazy(() => import('../pages/Member'))
const Units = lazy(() => import('../pages/Units'))
const Zones = lazy(() => import('../pages/Zone'))
const Buttons = lazy(() => import('../pages/Buttons'))
const Modals = lazy(() => import('../pages/Modals'))
const Tables = lazy(() => import('../pages/Tables'))

const Page404 = lazy(() => import('../pages/404'))
const Blank = lazy(() => import('../pages/Blank'))

/**
 * ⚠ These are internal routes!
 * They will be rendered inside the app, using the default `containers/Layout`.
 * If you want to add a route to, let's say, a landing page, you should add
 * it to the `App`'s router, exactly like `Login`, `CreateAccount` and other pages
 * are routed.
 *
 * If you're looking for the links rendered in the SidebarContent, go to
 * `routes/sidebar.js`
 */
const routes = [
  {
    path: '/event/miqaat-home',
    component: MiqaatHome,
  },
  {
    path: '/menu',
    component: MenuList,
  },
  {
    path: '/members',
    component: Member,
  },
  {
    path: '/units',
    component: Units,
  },
  {
    path: '/zones',
    component: Zones,
  },
  {
    path: '/modals',
    component: Modals,
  },
  {
    path: '/tables',
    component: Tables,
  },
  {
    path: '/404',
    component: Page404,
  },
  {
    path: '/blank',
    component: Blank,
  },

]

export default routes
