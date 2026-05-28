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
    <div className="min-h-screen bg-caliber-black flex items-center justify-center px-4 bg-topo-pattern">
      <div className="text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-2xl font-black text-caliber-gold uppercase tracking-widest mb-2">Operator Registered</h2>
        <p className="text-caliber-dim mb-2">Check your email to confirm your account.</p>
        <Link to="/login" className="text-caliber-gold hover:text-caliber-gold-light font-semibold">
          Enter Range →
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-caliber-black flex items-center justify-center px-4 bg-topo-pattern">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-caliber-gold tracking-widest uppercase">CALIBER</h1>
          <p className="text-caliber-dim text-xs uppercase tracking-[0.3em] mt-1">New Operator Registration</p>
        </div>
        <div className="bg-caliber-surface border border-caliber-border rounded-xl overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div className="h-1 bg-caliber-gold" />
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-caliber-dim uppercase tracking-widest mb-1.5">Full Name</label>
                <input {...register('fullName', { required: true })} className="input-caliber" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-caliber-dim uppercase tracking-widest mb-1.5">Email Address</label>
                <input {...register('email', { required: true })} type="email" className="input-caliber" placeholder="operator@caliber.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-caliber-dim uppercase tracking-widest mb-1.5">Password</label>
                <input {...register('password', { required: true, minLength: 6 })} type="password" className="input-caliber" placeholder="Min. 6 characters" />
              </div>
              {error && <div className="bg-red-900/20 border border-red-800/50 text-red-400 rounded-lg px-3 py-2 text-sm">{error}</div>}
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2 disabled:opacity-50">
                {isSubmitting ? 'Registering...' : 'Join Caliber'}
              </button>
            </form>
            <div className="border-t border-caliber-border mt-6 pt-5 text-center">
              <p className="text-caliber-dim text-sm">
                Already registered?{' '}
                <Link to="/login" className="text-caliber-gold hover:text-caliber-gold-light font-semibold">Sign In →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
