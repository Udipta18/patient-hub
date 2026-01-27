import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Lock, Stethoscope, Heart, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';

const emailPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const magicLinkSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type EmailPasswordForm = z.infer<typeof emailPasswordSchema>;
type MagicLinkForm = z.infer<typeof magicLinkSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const emailPasswordForm = useForm<EmailPasswordForm>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { email: '', password: '' },
  });

  const magicLinkForm = useForm<MagicLinkForm>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: '' },
  });

  const handleEmailPasswordLogin = async (data: EmailPasswordForm) => {
    setIsLoading(true);
    try {
      await authService.loginWithEmail(data.email, data.password);
      toast({ title: 'Welcome back!', description: 'Successfully logged in.', variant: 'success' });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkRequest = async (data: MagicLinkForm) => {
    setIsLoading(true);
    try {
      await authService.sendMagicLink(data.email);
      setMagicLinkEmail(data.email);
      setMagicLinkSent(true);
      toast({ title: 'Check your email', description: 'We sent you a verification code.', variant: 'success' });
    } catch (error) {
      toast({
        title: 'Failed to send code',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    if (otpValue.length !== 6) return;

    setIsLoading(true);
    try {
      await authService.verifyOTP(magicLinkEmail, otpValue);
      toast({ title: 'Welcome!', description: 'Successfully verified.', variant: 'success' });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Invalid code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-2xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                <Stethoscope className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Patient Hub</h1>
                <p className="text-sm text-white/70">Medical Practice Management</p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Streamline Your<br />
              <span className="text-white/90">Medical Practice</span>
            </h2>

            <p className="text-lg text-white/80 leading-relaxed max-w-md">
              Manage patients, prescriptions, and medical records with our intuitive healthcare platform designed for modern doctors.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 animate-slide-in-right" style={{ animationDelay: '200ms' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Patient-Centric Care</p>
                <p className="text-sm text-white/70">Complete medical history at your fingertips</p>
              </div>
            </div>

            <div className="flex items-center gap-3 animate-slide-in-right" style={{ animationDelay: '400ms' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">AI-Powered Insights</p>
                <p className="text-sm text-white/70">Smart mind maps & prescription tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-3 animate-slide-in-right" style={{ animationDelay: '600ms' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Secure & Compliant</p>
                <p className="text-sm text-white/70">Enterprise-grade security for patient data</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-background to-muted/30">
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold">Patient Hub</h1>
                <p className="text-xs text-muted-foreground">Medical Practice Management</p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-2xl glass-card">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription className="text-base">Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="password" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                  <TabsTrigger value="password" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Password
                  </TabsTrigger>
                  <TabsTrigger value="magic-link" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Magic Link
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="password" className="mt-0">
                  <Form {...emailPasswordForm}>
                    <form onSubmit={emailPasswordForm.handleSubmit(handleEmailPasswordLogin)} className="space-y-5">
                      <FormField
                        control={emailPasswordForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  placeholder="doctor@clinic.com"
                                  className="pl-10 h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailPasswordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="pl-10 h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full h-12 text-base bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="magic-link" className="mt-0">
                  {!magicLinkSent ? (
                    <Form {...magicLinkForm}>
                      <form onSubmit={magicLinkForm.handleSubmit(handleMagicLinkRequest)} className="space-y-5">
                        <FormField
                          control={magicLinkForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    placeholder="doctor@clinic.com"
                                    className="pl-10 h-12 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full h-12 text-base bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Magic Link'
                          )}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-6 animate-scale-in">
                      <div className="text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Enter the 6-digit code sent to
                        </p>
                        <p className="font-semibold text-primary">{magicLinkEmail}</p>
                      </div>

                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                          <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={0} className="rounded-lg border-muted bg-muted/50" />
                            <InputOTPSlot index={1} className="rounded-lg border-muted bg-muted/50" />
                            <InputOTPSlot index={2} className="rounded-lg border-muted bg-muted/50" />
                            <InputOTPSlot index={3} className="rounded-lg border-muted bg-muted/50" />
                            <InputOTPSlot index={4} className="rounded-lg border-muted bg-muted/50" />
                            <InputOTPSlot index={5} className="rounded-lg border-muted bg-muted/50" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      <Button
                        onClick={handleOTPVerify}
                        className="w-full h-12 text-base bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg"
                        disabled={isLoading || otpValue.length !== 6}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify Code'
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setMagicLinkSent(false);
                          setOtpValue('');
                        }}
                      >
                        Use different email
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
