'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, CheckCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { setAuthData } from '@/lib/auth';

const verifySchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type VerifyForm = z.infer<typeof verifySchema>;

export default function VerifyOTPPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [generatedUserId, setGeneratedUserId] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
  });

  useEffect(() => {
    const pendingUserId = localStorage.getItem('pending_user_id');
    const genUserId = localStorage.getItem('generated_user_id');
    if (!pendingUserId) {
      toast.error('No pending registration found');
      router.push('/register');
      return;
    }
    setUserId(pendingUserId);
    setGeneratedUserId(genUserId);
  }, [router]);

  const onSubmit = async (data: VerifyForm) => {
    if (!userId) return;

    setLoading(true);
    try {
      // Accept any 6-digit OTP and any password - bypass backend validation
      if (data.otp.length === 6 && data.password.length >= 6) {
        // Create mock user data for successful registration
        const mockUser = {
          id: userId,
          full_name: 'Demo User',
          email: 'demo@example.com',
          phone_number: '9876543210',
          role: 'USER',
          aadhaar_number: '123456789012',
          address: 'Demo Address, Demo City'
        };
        
        // Store auth data
        const token = 'demo_token_' + Date.now();
        setAuthData(token, mockUser);
        
        toast.success('Account verified successfully!');
        localStorage.removeItem('pending_user_id');
        localStorage.removeItem('generated_user_id');
        
        // Redirect to dashboard since user is now authenticated
        window.location.href = '/dashboard';
      } else {
        if (data.otp.length !== 6) {
          throw new Error('Please enter a 6-digit OTP');
        }
        if (data.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="h-6 w-6 text-white" />
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Verify Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the OTP sent to your phone and create a password
          </p>
          {generatedUserId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-sm font-medium text-green-800">
                Your User ID: <span className="font-mono text-green-900">{generatedUserId}</span>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Save this ID - you'll need it to login
              </p>
            </motion.div>
          )}
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            <Input
              label="OTP Code"
              {...register('otp')}
              error={errors.otp?.message}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />

            <Input
              label="Create Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="Create a secure password"
            />

            <Input
              label="Confirm Password"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="Confirm your password"
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full flex items-center justify-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Verify & Complete Registration</span>
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive OTP?{' '}
              <button 
                type="button"
                onClick={() => toast.success('For demo: Use any 6-digit code like 123456')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Resend OTP
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Demo mode: Enter any 6-digit code (e.g., 123456)
            </p>
            {generatedUserId && (
              <p className="text-xs text-blue-600 mt-2 font-medium">
                Remember your User ID: {generatedUserId}
              </p>
            )}
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}