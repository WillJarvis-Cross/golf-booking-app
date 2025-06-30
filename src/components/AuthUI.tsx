'use client'

import { useState, ChangeEvent } from 'react';
import { signIn, signOut, signUp, confirmSignUp } from 'aws-amplify/auth';
import { useAuth } from '../app/context/AuthContext';
import { useRouter } from 'next/navigation'
import { Button, TextField, Heading } from '@aws-amplify/ui-react';

interface FormState {
  email: string; // Use email as the username
  password: string;
  code?: string; // Add a field for the confirmation code
}

export default function AuthUI() {
  const { user, setUser } = useAuth();
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>({ email: '', password: '' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false); // Track if we're in the confirmation step
  const [error, setError] = useState('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  async function handleSignIn() {
    try {
      const user = await signIn({ username: formState.email, password: formState.password }); // Use email as username
      console.log('Sign in successful:', user);
      setUser(user);
      setError('');
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSignUp() {
    try {
      await signUp({
        username: formState.email, // Use email as username
        password: formState.password,
      });
      setIsSignUp(false);
      setIsConfirming(true); // Move to the confirmation step
      setError('Check your email for the verification code.');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleConfirmSignUp() {
    try {
      await confirmSignUp({ username: formState.email, confirmationCode: formState.code || '' }); // Use email as username
      setIsConfirming(false); // Move back to sign-in step
      setError('Account confirmed! You can now sign in.');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (user) {
    return (
      <div>
        <Heading level={4}>Welcome, {user.attributes?.email || 'User'}</Heading>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div>
        <Heading level={3}>Confirm Sign Up</Heading>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <TextField
          label="Confirmation Code"
          name="code"
          onChange={onChange}
          value={formState.code || ''}
        />
        <Button onClick={handleConfirmSignUp}>Confirm</Button>
      </div>
    );
  }

  return (
    <div>
      <Heading level={3}>{isSignUp ? 'Sign Up' : 'Sign In'}</Heading>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <TextField
        label="Email"
        name="email"
        type="email"
        onChange={onChange}
        value={formState.email}
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
  );
}