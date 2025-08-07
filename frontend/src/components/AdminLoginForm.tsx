import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { login, isAuthenticated } from '../utils/auth'
import LoadingSpinner from './LoadingSpinner'

const AdminLoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const emailRef = useRef<HTMLInputElement>(null)

  // Autofocus
  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  // ✅ Verificar sesión activa (solo si ya estás logueado previamente)
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const sesionActiva = await isAuthenticated()
        if (sesionActiva) {
          console.log('🔐 Sesión activa detectada')
          navigate('/admin/dashboard')
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.warn('❌ Error al verificar sesión:', err)
        setLoading(false)
      }
    }

    verificarSesion()
  }, [navigate])

  // ✅ Manejar login con redirección real
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const success = await login(email, password)

      if (success) {
        // ⛳ Redirección real para que Safari almacene la cookie
        window.location.href = '/admin/dashboard'
      } else {
        setError('❌ Credenciales inválidas o error de conexión')
      }
    } catch (err) {
      console.error('❌ Error en login:', err)
      setError('❌ Error al intentar iniciar sesión')
    }
  }

  // ⏳ Mostrar spinner mientras verifica sesión
  if (loading) {
    return <LoadingSpinner message="Verificando sesión activa..." />
  }

  return (
    <section
      className="relative h-screen w-full flex items-center justify-center text-center overflow-hidden"
      style={{
        backgroundImage: "url('/hero.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Fondo oscuro + blur */}
      <motion.div
        className="absolute inset-0 bg-black z-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.4 }}
      />
      <motion.div
        className="absolute inset-0 z-10 backdrop-blur-xl bg-white bg-opacity-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.8, delay: 0.6 }}
      />

      {/* Contenedor del formulario */}
      <motion.div
        className="relative z-20 px-6 text-white flex flex-col items-center space-y-8 w-full max-w-sm font-sans"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.25 } } }}
      >
        <motion.img
          src="/Logo.png"
          alt="Logo"
          className="w-24 h-24 object-contain pointer-events-none select-none"
          initial={{ scale: 0 }}
          animate={{ scale: 2, y: -20 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />

        <form onSubmit={handleSubmit} className="w-full space-y-4" aria-label="Formulario de inicio de sesión">
          {/* Email */}
          <input
            ref={emailRef}
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-full bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm font-sans"
            aria-label="Correo electrónico"
          />

          {/* Contraseña */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-full bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white backdrop-blur-sm pr-12 font-sans"
              aria-label="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white hover:text-white/80"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm text-center" role="alert">
              {error}
            </div>
          )}

          {/* Botón de login */}
          <button
            type="submit"
            className="w-full py-3 border border-white text-white text-lg uppercase tracking-wider hover:bg-white hover:text-black transition rounded-full shadow-md backdrop-blur-sm font-sans"
          >
            Iniciar sesión
          </button>

          {/* Volver */}
          <a
            href="/"
            className="block text-sm text-white/70 text-center hover:text-white mt-2 font-sans"
          >
            ← Volver al inicio
          </a>
        </form>
      </motion.div>
    </section>
  )
}

export default AdminLoginForm
