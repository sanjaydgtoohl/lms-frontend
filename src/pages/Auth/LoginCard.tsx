import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../store/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginCard() {
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
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
        <p className="text-zinc-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-center">
          BUILT BY MOBIYOUNG
        </p>

         {/* Form - Clean & Simple */}
         <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm sm:max-w-md space-y-4 sm:space-y-5">
           {/* Email */}
           <Input
             type="email"
             placeholder="you@example.com"
             label="Email Address"
             {...register('email')}
             error={errors.email?.message}
             required
           />

           {/* Password */}
           <div>
             <Input
               type="password"
               placeholder="••••••••"
               label="Password"
               {...register('password')}
               error={errors.password?.message}
               required
             />
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