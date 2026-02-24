import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Package, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, name);
        toast.success('Llogaria u krijua me sukses!');
      } else {
        await login(email, password);
        toast.success('Mirë se erdhe!');
      }
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Ka ndodhur një gabim';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1729952620303-4dc47fb5d93a?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-zinc-900/40" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-['Outfit']">OrderFlow</span>
          </div>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Menaxhoni klientët dhe porositë tuaja në një vend të vetëm. E thjeshtë, e shpejtë, efikase.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAFA]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-['Outfit'] text-zinc-900">OrderFlow</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 font-['Outfit'] mb-2" data-testid="login-title">
            {isRegister ? 'Krijo Llogari' : 'Hyr në Llogari'}
          </h1>
          <p className="text-zinc-500 mb-8">
            {isRegister ? 'Plotësoni të dhënat për të krijuar llogarinë tuaj' : 'Vendosni kredencialet tuaja për të hyrë'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-700 font-medium">Emri i Plotë</Label>
                <Input
                  id="name"
                  data-testid="register-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Emri juaj"
                  className="h-11 border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 font-medium">Email</Label>
              <Input
                id="email"
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@shembull.com"
                className="h-11 border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-700 font-medium">Fjalëkalimi</Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Fjalëkalimi juaj"
                  className="h-11 border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              data-testid="login-submit-button"
              disabled={loading}
              className="w-full h-11 bg-orange-600 text-white hover:bg-orange-700 rounded-lg font-medium transition-transform active:scale-[0.98]"
            >
              {loading ? 'Duke u ngarkuar...' : (isRegister ? 'Regjistrohu' : 'Hyr')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-zinc-500 hover:text-orange-600 transition-colors"
              data-testid="toggle-auth-mode"
            >
              {isRegister ? 'Ke llogari? Hyr këtu' : 'Nuk ke llogari? Regjistrohu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
