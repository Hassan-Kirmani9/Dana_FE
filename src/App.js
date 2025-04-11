import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import AccessibleNavigationAnnouncer from './components/AccessibleNavigationAnnouncer'
import PublicRoute from './routes/PublicRoute'
import PrivateRoute from './routes/PrivateRoute'
import { Toaster } from 'react-hot-toast';

// Loading spinner component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-screen">
    <div className="w-16 h-16 border-4 border-purple-600 border-solid rounded-full border-t-transparent animate-spin"></div>
  </div>
)

const Layout = lazy(() => import('./containers/Layout'))
const Login = lazy(() => import('./pages/Login'))
const CreateAccount = lazy(() => import('./pages/CreateAccount'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Tables = lazy(() => import('./pages/Tables'))

function App() {
  return (
    <>
      <Router>
        <AccessibleNavigationAnnouncer />
        <Suspense fallback={<LoadingSpinner />}>
          <Switch>
            {/* Public routes - redirect to app if already logged in */}
            <PublicRoute path="/login" component={Login} />
            <PublicRoute path="/create-account" component={CreateAccount} />
            <PublicRoute path="/forgot-password" component={ForgotPassword} />

            {/* Protected routes - require authentication */}
            <PrivateRoute path="/app" component={Layout} />
            
            {/* These routes should be handled by Layout's routing instead */}
            {/* <PrivateRoute path="/app/events" component={Tables} />
            <PrivateRoute path="/app/create" component={Forms} /> */}

            {/* Route for root path */}
            <Route exact path="/">
              {localStorage.getItem('accessToken') ? (
                <Redirect to="app/event/miqaat-home" />
              ) : (
                <Redirect to="/login" />
              )}
            </Route>
            
            {/* Catch all route - redirect to login or dashboard based on auth state */}
            <Route path="*">
              {localStorage.getItem('accessToken') ? (
                <Redirect to="/app" />
              ) : (
                <Redirect to="/login" />
              )}
            </Route>
          </Switch>
          <Toaster
  position="top-right"
  toastOptions={{
    success: {
      style: {
        background: 'linear-gradient(to right, #0D9488, #10B981)',
        color: 'white',
        borderRadius: '8px',
        fontWeight: 500,
        padding: '10px 16px', // Reduced vertical padding
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      iconTheme: {
        primary: 'white',
        secondary: '#0D9488',
      },
    },
    error: {
      style: {
        background: 'linear-gradient(to right, #DC2626, #EF4444)',
        color: 'white',
        borderRadius: '8px',
        fontWeight: 500,
        padding: '10px 16px', // Reduced vertical padding
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      iconTheme: {
        primary: 'white',
        secondary: '#DC2626',
      },
    },
    loading: {
      style: {
        background: 'linear-gradient(to right, #1F2937, #374151)',
        color: 'white',
        borderRadius: '8px',
        fontWeight: 500,
        padding: '10px 16px', // Reduced vertical padding
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
    duration: 4000,
  }}
/>
        </Suspense>
      </Router>
    </>
  )
}

export default App