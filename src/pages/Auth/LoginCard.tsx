import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '../../components/ui';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth';
import { ROUTES } from '../../constants';

const loginSchema = z.object({
  email: z
    .string()
    .nonempty('Please enter a valid email address')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .nonempty('Please enter your password')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginCard() {
  const { login, isLoading } = useAuthStore();
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },

  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  useEffect(() => {
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 80 },
        color: { value: "#ffffff" },
        size: { value: 3 },
        move: { speed: 2 },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#ffffff"
        }
      }
    });
  }, []);


  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      setLoginError(null);
      window.location.href = ROUTES.DASHBOARD;
    } catch (error: any) {
      // Try to extract API error message if present
      let apiErrorMsg = '';
      if (error?.response?.data?.errors) {
        // Try to extract the first error message from errors object
        const errors = error.response.data.errors;
        if (typeof errors === 'object') {
          const firstKey = Object.keys(errors)[0];
          if (firstKey && Array.isArray(errors[firstKey]) && errors[firstKey][0]) {
            apiErrorMsg = errors[firstKey][0];
          }
        }
      }
      setLoginError(apiErrorMsg || error?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <>
      <div className="relative min-h-dvh inset-0 w-full h-full flex items-center justify-center overflow-hidden login-page">
        <div id="particles-js"></div>

        <div className="bottom-wave">
          <img src="/bottom.svg" alt="wabe abs 1" />
        </div>

        {/* Compact Login Card - Desktop Optimized */}
        <div className="relative login-card-wrapper z-10">
          {/* Header - Compact & Elegant */}
          <img src="/logo.png" alt="my logo" />

          <p className="text-gray-300 text-base text-center pt-5 pb-10">
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
                className="input-item"
                type="email"
                placeholder="Please enter your email address"
                label="Email Address"
                {...register('email')}
                error={errors.email?.message}
              />
              {/* Only show a single error message below input, Input component already shows it */}
            </div>

            {/* Password */}
            <div>
              <Input
                className="input-item"
                type="password"
                placeholder="Please enter your password"
                label="Password"
                {...register('password')}
                error={errors.password?.message}
              />
              {/* Validation message below input */}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="login-btn
              "
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}