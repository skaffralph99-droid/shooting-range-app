import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

interface FormData { email: string; password: string }

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setError('')
    const { error } = await signIn(data.email, data.password)
    if (error) setError(error.message)
    else navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-caliber-black flex items-center justify-center px-4 bg-topo-pattern">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-caliber-gold rounded-xl mb-4" style={{ boxShadow: '0 0 40px rgba(155,147,93,0.3)' }}>
            <svg viewBox="0 0 32 32" className="w-12 h-12 fill-caliber-dark">
              <rect x="4" y="4" width="24" height="4" rx="1"/>
              <rect x="4" y="10" width="10" height="3" rx="1"/>
              <rect x="18" y="10" width="10" height="3" rx="1"/>
              <rect x="6" y="15" width="8" height="8" rx="1"/>
              <rect x="18" y="15" width="8" height="8" rx="1"/>
              <rect x="12" y="18" width="8" height="5" rx="1"/>
              <rect x="9" y="24" width="4" height="4" rx="0.5"/>
              <rect x="19" y="24" width="4" height="4" rx="0.5"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-caliber-gold tracking-widest uppercase">CALIBER</h1>
          <p className="text-caliber-dim text-xs uppercase tracking-[0.3em] mt-1">Shooting Range</p>
        </div>

        <div className="bg-caliber-surface border border-caliber-border rounded-xl overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div className="h-1 bg-caliber-gold" />
          <div className="p-8">
            <h2 className="text-caliber-steel text-lg font-bold uppercase tracking-widest mb-6">Operator Login</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-caliber-dim uppercase tracking-widest mb-1.5">Email Address</label>
                <input {...register('email', { required: true })} type="email"
                  className="input-caliber" placeholder="operator@caliber.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-caliber-dim uppercase tracking-widest mb-1.5">Password</label>
                <input {...register('password', { required: true })} type="password"
                  className="input-caliber" placeholder="••••••••" />
              </div>
              {error && (
                <div className="bg-red-900/20 border border-red-800/50 text-red-400 rounded-lg px-3 py-2 text-sm">
                  {error}
                </div>
              )}
              <button type="submit" disabled={isSubmitting}
                className="btn-primary w-full mt-2 disabled:opacity-50">
                {isSubmitting ? 'Authenticating...' : 'Enter Range'}
              </button>
            </form>
            <div className="border-t border-caliber-border mt-6 pt-5 text-center">
              <p className="text-caliber-dim text-sm">
                New shooter?{' '}
                <Link to="/register" className="text-caliber-gold hover:text-caliber-gold-light font-semibold transition-colors">
                  Create Account →
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-caliber-muted text-xs mt-6 uppercase tracking-widest">
          Lock · Aim · Fire
        </p>
      </div>
    </div>
  )
}
