import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import ImageLight from '../assets/img/login-office.jpeg'
import ImageDark from '../assets/img/login-office-dark.jpeg'
import { GithubIcon, TwitterIcon } from '../icons'
import { Label, Input, Button, HelperText } from '@windmill/react-ui'
import { post } from '../api/axios'
import Footer from "../components/Footer";


function Login() {
  const history = useHistory();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
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
    <>
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
                  <div className="relative">
                    <Input
                      className="mt-1 pr-10"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="***************"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none focus:ring-0"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 focus:outline-none focus:ring-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.79m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 focus:outline-none focus:ring-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </Label>

                <Button
                  className="mt-4"
                  block
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log in'}
                </Button>

              </form>
            </main>
          </div>
          <hr/>
      <Footer />
        </div>

      </div>
      </>
  )
}

export default Login