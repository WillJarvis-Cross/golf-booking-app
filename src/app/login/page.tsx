import AuthUI from '../../components/AuthUI'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        <AuthUI />
      </div>
    </main>
  )
}
