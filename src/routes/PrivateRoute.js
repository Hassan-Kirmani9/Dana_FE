import React from 'react';
import { Route, Redirect } from 'react-router-dom';

// This route is for protected pages - redirects to login if not logged in
const PrivateRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = () => {
    // Check if user is logged in by verifying token existence
    return !!localStorage.getItem('accessToken');
  };

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated() ? (
          // If logged in, show the requested component
          <Component {...props} />
        ) : (
          // Otherwise, redirect to login page
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;