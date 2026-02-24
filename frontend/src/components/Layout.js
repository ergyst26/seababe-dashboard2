import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { LayoutDashboard, Users, ShoppingBag, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_sales-hub-145/artifacts/29cym9d5_f8fb30e8-6bc2-4ccc-a18a-29acc7151e67.jpeg";

const navItems = [
  { path: '/', label: 'Pasqyra', icon: LayoutDashboard },
  { path: '/clients', label: 'Klientët', icon: Users },
  { path: '/orders', label: 'Porositë', icon: ShoppingBag },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="app-layout">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-50" data-testid="app-header">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 hover:bg-zinc-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2.5">
              <img src={LOGO_URL} alt="Seababe" className="w-9 h-9 rounded-lg object-contain" />
              <span className="text-lg font-bold font-['Outfit'] text-zinc-900">Seababe</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" data-testid="desktop-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`
                }
                data-testid={`nav-${item.path === '/' ? 'dashboard' : item.path.slice(1)}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 hidden sm:block" data-testid="user-name">{user?.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-600 hover:bg-red-50"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Dil</span>
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-zinc-100 p-2 bg-white" data-testid="mobile-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`
                }
                data-testid={`mobile-nav-${item.path === '/' ? 'dashboard' : item.path.slice(1)}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
