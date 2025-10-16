import React, { useState } from "react";

export default function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);

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
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-white mb-2 sm:mb-3">
          <span className="text-orange-500">L</span> M S
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-center">
          BUILT BY MOBIYOUNG
        </p>

         {/* Form - Clean & Simple */}
         <form className="w-full max-w-sm sm:max-w-md space-y-4 sm:space-y-5">
           {/* Email */}
           <div>
             <label className="block text-sm text-zinc-300 mb-2 font-medium text-left">
               Email Address
             </label>
             <input
               type="email"
               placeholder="you@example.com"
               className="w-full p-3 sm:p-4 rounded-lg sm:rounded-xl bg-zinc-800/90 text-white placeholder-zinc-500 
                          focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-zinc-800 transition 
                          text-sm sm:text-base border border-transparent hover:border-orange-900/50"
               autoComplete="email"
             />
           </div>

           {/* Password */}
           <div>
             <label className="block text-sm text-zinc-300 mb-2 font-medium text-left">
               Password
             </label>
             <div className="relative">
               <input
                 type={showPassword ? "text" : "password"}
                 placeholder="••••••••"
                 className="w-full p-3 sm:p-4 pr-10 sm:pr-12 rounded-lg sm:rounded-xl bg-zinc-800/90 text-white placeholder-zinc-500 
                            focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:bg-zinc-800 transition 
                            text-sm sm:text-base border border-transparent hover:border-orange-900/50"
                 autoComplete="current-password"
               />
               <button
                 type="button"
                 onClick={() => setShowPassword((v) => !v)}
                 aria-label={showPassword ? "Hide password" : "Show password"}
                 className="absolute inset-y-0 right-3 sm:right-4 flex items-center justify-center text-zinc-400 hover:text-orange-400 
                            transition-all duration-200 bg-transparent border-none outline-none 
                            hover:bg-orange-500/10 rounded-md p-1 group"
               >
                 {showPassword ? (
                   <svg 
                     className="w-5 h-5 transition-transform group-hover:scale-110" 
                     fill="none" 
                     stroke="currentColor" 
                     viewBox="0 0 24 24"
                   >
                     <path 
                       strokeLinecap="round" 
                       strokeLinejoin="round" 
                       strokeWidth={2} 
                       d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" 
                     />
                   </svg>
                 ) : (
                   <svg 
                     className="w-5 h-5 transition-transform group-hover:scale-110" 
                     fill="none" 
                     stroke="currentColor" 
                     viewBox="0 0 24 24"
                   >
                     <path 
                       strokeLinecap="round" 
                       strokeLinejoin="round" 
                       strokeWidth={2} 
                       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                     />
                     <path 
                       strokeLinecap="round" 
                       strokeLinejoin="round" 
                       strokeWidth={2} 
                       d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                     />
                   </svg>
                 )}
               </button>
             </div>
           </div>

           {/* Login Button - Light Orange with Black Text */}
           <button
             type="submit"
             className="w-full bg-orange-200 hover:bg-orange-300 text-black font-semibold py-3 sm:py-4 rounded-lg sm:rounded-xl 
                        transition-all duration-300 active:scale-[0.98] 
                        shadow-[0_0_25px_rgba(255,165,0,0.3)] hover:shadow-[0_0_35px_rgba(255,165,0,0.5)] 
                        text-sm sm:text-base tracking-wide mt-3"
           >
             Login
           </button>
         </form>
      </div>
    </div>
  );
}