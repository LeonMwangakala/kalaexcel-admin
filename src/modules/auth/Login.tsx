import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { FormField, Input } from '../../components/common/Form'
import { Button } from '../../components/common/Button'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import backgroundImage from '../../assets/images/background_1.jpg'
import logo from '../../assets/round_logo.png'
import { login, clearError } from './authSlice'
import { AppDispatch, RootState } from '../../store'

interface LoginFormData {
  email: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    // Clear error when component mounts
    dispatch(clearError())
  }, [dispatch])

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(login({ email: data.email, password: data.password })).unwrap()
      // Navigation will happen automatically via useEffect when isAuthenticated becomes true
    } catch (error) {
      // Error is already handled by the authSlice and displayed in the form
      console.error('Login error:', error)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Logo in top left corner */}
      <div className="absolute top-6 left-6 z-20">
        <img 
          src={logo} 
          alt="Kala Excel Logo" 
          className="h-16 w-16 object-contain" 
        />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        {/* <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-5 rounded-2xl shadow-xl ring-1 ring-gray-100">
              <img src={logo} alt="Kala Excel Logo" className="h-20 w-20 object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kala Excel Co. Ltd</h1>
          <p className="text-gray-600 text-lg">Real Estate Management System</p>
        </div> */}

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-10 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField 
              label="Email" 
              name="email" 
              required 
              error={errors.email?.message}
            >
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  className="w-full pl-12 pr-4 py-3 text-base border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                />
              </div>
            </FormField>

            <FormField 
              label="Password" 
              name="password" 
              required 
              error={errors.password?.message}
            >
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-3 text-base border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer transition-colors"
                />
                <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                loading={loading}
                icon={<LogIn className="h-5 w-5" />}
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200">
                Contact Administrator
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Kala Excel. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

