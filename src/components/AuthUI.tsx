'use client'

import { useState, ChangeEvent } from 'react'
import { signIn, signOut, signUp } from 'aws-amplify/auth'
import { useAuth } from '../app/context/AuthContext'
import { Button, TextField, Heading } from '@aws-amplify/ui-react'

interface FormState {
  username: string
  password: string
  email: string
}

export default function AuthUI() {
  const { user, setUser } = useAuth()
  const [formState, setFormState] = useState<FormState>({ username: '', password: '', email: '' })
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value })
  }

  async function handleSignIn() {
    try {
      const user = await signIn({ username: formState.username, password: formState.password })
      setUser(user)
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleSignUp() {
    try {
      await signUp({
        username: formState.username,
        password: formState.password,
        attributes: { email: formState.email },
      })
      setIsSignUp(false)
      setError('Check your email to verify your account.')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      setUser(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (user) {
    return (
      <div>
        <Heading level={4}>Welcome, {user.getUsername()}</Heading>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    )
  }

  return (
    <div>
      <Heading level={3}>{isSignUp ? 'Sign Up' : 'Sign In'}</Heading>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {isSignUp && (
        <TextField
          label="Email"
          name="email"
          type="email"
          onChange={onChange}
          value={formState.email}
        />
      )}
      <TextField
        label="Username"
        name="username"
        onChange={onChange}
        value={formState.username}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        onChange={onChange}
        value={formState.password}
      />
      <Button onClick={isSignUp ? handleSignUp : handleSignIn}>
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </Button>
      <p
        onClick={() => setIsSignUp(!isSignUp)}
        style={{ cursor: 'pointer', color: 'blue' }}
      >
        {isSignUp ? 'Have an account? Sign In' : "Don't have an account? Sign Up"}
      </p>
    </div>
  )
}