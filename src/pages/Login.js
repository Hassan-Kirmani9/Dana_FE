import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

import ImageLight from '../assets/img/login-office.jpeg'
import ImageDark from '../assets/img/login-office-dark.jpeg'
import { GithubIcon, TwitterIcon } from '../icons'
import { Label, Input, Button, HelperText } from '@windmill/react-ui'
import { post } from '../api/axios'

function Login() {
  const history = useHistory();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!credentials.email || !credentials.password) {
      setError('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      
      const response = await post('/login/', {
        email: credentials.email,
        password: credentials.password
      });
      
  
      
      if (response) {
        
        if (response.access) {
          localStorage.setItem("accessToken", response.access);
          console.log('Access token stored:', response.access);
        }
        
        
        if (response.refresh) {
          localStorage.setItem("refreshToken", response.refresh);
          console.log('Refresh token stored:', response.refresh);
        }
        
        
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
          console.log('User info stored:', response.user);
        }
      }
      
      history.push('/app/event/miqaat-home');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 h-full max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="overflow-y-auto">
          <main className="flex items-center justify-center p-6 sm:p-12 md:w-full">
            <form className="w-full" onSubmit={handleSubmit}>
              <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">Login</h1>
              
              {error && (
                <HelperText className="mb-4" valid={false}>
                  {error}
                </HelperText>
              )}
              
              <Label>
                <span>Email</span>
                <Input 
                  className="mt-1" 
                  type="email" 
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="john@doe.com" 
                />
              </Label>

              <Label className="mt-4">
                <span>Password</span>
                <Input 
                  className="mt-1" 
                  type="password" 
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="***************" 
                />
              </Label>

              <Button 
                className="mt-4" 
                block 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>

              <hr className="my-8" />

              {/* <p className="mt-1">
                <Link
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  to="/create-account"
                >
                  Don't have an account? Create one here
                </Link>
              </p> */}
            </form>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Login