/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
// units , zone, miqaat, menu, khidmat
const routes = [
  {
    path: '/app/event/miqaat-home', // the url
    icon: 'HomeIcon', // the component being exported from icons/index.js
    name: 'Miqaats', // name that appear in Sidebar
  },
  {
    path: '/app/menu',
    icon: 'FormsIcon',
    name: 'Menu',
  },
  {
    path: '/app/members',
    icon: 'HandShake',
    name: 'Khidmat Guzer',
  },
  {
    path: '/app/units',
    icon: 'Scale',
    name: 'Units',
  },
  {
    path: '/app/zones',
    icon: 'ZoneLocation',
    name: 'Zones',
  },
  {
    path: '/app/containers',
    icon: 'Container1',
    name: 'Containers',
  },
  {
    path: '/app/counters',
    icon: 'CardsIcon',
    name: 'Counters',
  },

]

export default routes
