import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

interface FormData { fullName: string; email: string; password: string }

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setError('')
    const { error } = await signUp(data.email, data.password, data.fullName)
    if (error) setError(error.message)
    else setSuccess(true)
  }

  if (success) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-white mb-2">Account created!</h2>
        <p className="text-gray-400 mb-6">Check your email to confirm your account, then sign in.</p>
        <Link to="/login" className="text-orange-400 hover:text-orange-300">Go to Login →</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎯</div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-1">Join the shooting range</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                {...register('fullName', { required: true })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                {...register('email', { required: true })}
                type="email"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                {...register('password', { required: true, minLength: 6 })}
                type="password"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Min. 6 characters"
              />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
