import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_sales-hub-145/artifacts/29cym9d5_f8fb30e8-6bc2-4ccc-a18a-29acc7151e67.jpeg";

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
      {/* Left side - Logo & Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#4AB8E0]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4AB8E0] to-[#3A9BC7]" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <img
            src={LOGO_URL}
            alt="Seababe Logo"
            className="w-64 h-64 object-contain rounded-2xl mb-8"
          />
          <p className="text-lg text-white/90 max-w-md leading-relaxed text-center">
            Menaxhoni klientët dhe porositë tuaja në një vend të vetëm. E thjeshtë, e shpejtë, efikase.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAFAFA]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-10">
            <img src={LOGO_URL} alt="Seababe" className="w-20 h-20 object-contain rounded-xl" />
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
                  className="h-11 border-zinc-200 focus:border-sky-500 focus:ring-sky-500/20 rounded-lg bg-white"
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
                className="h-11 border-zinc-200 focus:border-sky-500 focus:ring-sky-500/20 rounded-lg bg-white"
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
                  className="h-11 border-zinc-200 focus:border-sky-500 focus:ring-sky-500/20 rounded-lg bg-white pr-10"
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
              className="w-full h-11 bg-sky-500 text-white hover:bg-sky-600 rounded-lg font-medium transition-transform active:scale-[0.98]"
            >
              {loading ? 'Duke u ngarkuar...' : (isRegister ? 'Regjistrohu' : 'Hyr')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-zinc-500 hover:text-sky-600 transition-colors"
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
