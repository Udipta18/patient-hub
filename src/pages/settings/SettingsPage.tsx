import { ArrowLeft, Wrench, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gradient">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Work In Progress Container */}
      <div className="space-y-6">
        {/* Main WIP Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-dashed border-amber-300 dark:border-amber-600 p-8 md:p-12">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-amber-200/20 blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-orange-200/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            {/* Animated Icon */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 border-2 border-amber-300 dark:border-amber-600 animate-bounce">
                <Wrench className="h-10 w-10 text-amber-600 dark:text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Settings Coming Soon
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md">
                We're actively building an amazing settings experience for you.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-amber-200 dark:border-amber-700">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Settings</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-amber-200 dark:border-amber-700">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferences</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-amber-200 dark:border-amber-700">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Security</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-2 rounded-lg font-semibold shadow-lg shadow-amber-500/30 transition-all duration-300 hover:shadow-amber-500/50"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-semibold">Note:</span> This page is currently under development. Check back soon for exciting new features!
            </p>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Features</h3>
          <div className="space-y-3">
            {[
              { label: 'Profile Management', progress: 45 },
              { label: 'Security & Privacy', progress: 30 },
              { label: 'Notification Preferences', progress: 20 },
            ].map((feature, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{feature.label}</span>
                  <span className="text-xs text-muted-foreground">{feature.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000 animate-pulse"
                    style={{ width: `${feature.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
