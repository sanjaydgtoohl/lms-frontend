import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, NotificationPopup } from '../../components/ui';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { useUiStore } from '../../store/ui';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginCard() {
  const { login, isLoading } = useAuthStore();
  const notification = useUiStore((s) => s.notification);
  const [loginError, setLoginError] = useState<string | null>(null);


  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  // Track if user has attempted to submit
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setSubmitted(true);
    let hasError = false;
    if (!data.email) {
      setError('email', { type: 'manual', message: 'Email Address is required' });
      hasError = true;
    }
    if (!data.password) {
      setError('password', { type: 'manual', message: 'Password is required' });
      hasError = true;
    }
    if (hasError) return;
    try {
      await login(data.email, data.password);
      setLoginError(null);
    } catch (error: any) {
      useUiStore.getState().hideNotification();
      setLoginError(error?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
      {/* Error Popup */}
      <NotificationPopup
        isOpen={notification.isOpen}
        onClose={() => useUiStore.getState().hideNotification()}
        message={notification.message}
        type={notification.type}
        title={notification.title}
      />
      
      {/* ✨ Full-screen animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-600/10" />
      <div className="absolute w-[800px] h-[800px] bg-orange-500/20 rounded-full blur-[300px] top-[-200px] left-[-200px] animate-pulse" />
      <div className="absolute w-[600px] h-[600px] bg-orange-600/15 rounded-full blur-[250px] bottom-[-150px] right-[-150px] animate-pulse delay-1000" />
      <div className="absolute w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-[200px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500" />

      {/* Compact Login Card - Desktop Optimized */}
      <div className="relative flex flex-col items-center w-full max-w-sm sm:max-w-md lg:max-w-lg 
                      bg-zinc-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl 
                      p-6 sm:p-8 lg:p-10 
                      shadow-[0_0_60px_-10px_rgba(255,115,0,0.3)] lg:shadow-[0_0_80px_-15px_rgba(255,115,0,0.4)] 
                      ring-1 ring-zinc-800/50 hover:ring-orange-500/30 
                      hover:shadow-[0_0_70px_-5px_rgba(255,115,0,0.5)] lg:hover:shadow-[0_0_90px_-5px_rgba(255,115,0,0.6)] 
                      transition-all duration-300 ease-out">
        
        {/* Header - Compact & Elegant */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-center text-white mb-3 sm:mb-4 whitespace-nowrap">
          <span className="inline-flex items-center justify-center gap-1 sm:gap-3">
            <span className="relative inline-flex items-center text-white tracking-wide after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1 after:h-[3px] sm:after:h-1 after:w-2/3 after:rounded-full after:bg-orange-500">
              DGT
              <span className="inline-block align-middle leading-none scale-y-125 text-[1.40em] relative -top-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">∞</span>
              HL
            </span>
            <span className="align-middle leading-none relative -top-0.6 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent font-extrabold tracking-wide drop-shadow-[0_0_14px_rgba(255,255,255,0.35)]">LMS</span>
          </span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 text-center">
          BUILT BY MOBIYOUNG
        </p>

        {/* Inline server error (shown instead of popup for login failures) */}
        {loginError && (
          <div className="w-full text-center mb-4">
            <div className="inline-block bg-red-900/60 text-red-100 px-3 py-2 rounded-md text-sm sm:text-base">
              <span>{loginError.replace(/^Login validation failed:\s*/, '')}</span>
            </div>
          </div>
        )}

         {/* Form - Clean & Simple */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm sm:max-w-md space-y-4 sm:space-y-5">
          {/* Email */}
          <div>
            <Input
              type="email"
              placeholder="Please enter your email address"
              label="Email Address"
              {...register('email')}
              error={errors.email?.message}
            />
            {/* Validation message below input */}
            {submitted && errors.email?.message && (
              <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email.message}
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <Input
              type="password"
              placeholder="Please enter your password"
              label="Password"
              {...register('password')}
              error={errors.password?.message}
            />
            {/* Validation message below input */}
            {submitted && errors.password?.message && (
              <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password.message}
              </div>
            )}
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full hover:!bg-orange-300 !bg-orange-400 !text-black font-semibold py-3 sm:py-4 rounded-lg sm:rounded-xl 
                      transition-all duration-300 active:scale-[0.98] 
                      shadow-[0_0_25px_rgba(255,165,0,0.3)] hover:shadow-[0_0_35px_rgba(255,165,0,0.5)] 
                      text-sm sm:text-base tracking-wide mt-3"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}