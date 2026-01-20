import React, { useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail
} from "lucide-react";
import { AppContent } from '@/context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

import logo from "@/assets/icons/logo_del_monte.png"

function ResetPassword() {
  // 🔹 Corrección: Manejo seguro del contexto
  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent debe estar dentro de un AppContextProvider");
  }
  const { backendUrl } = appContext;

  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [isOtpSubmited, setIsOtpSubmited] = useState(false);

  // 🔹 Corrección: Definir correctamente `inputRefs`
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && e.currentTarget.value === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pasteArray = e.clipboardData.getData('text').split('');
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index]!.value = char;
      }
    });
  };

  const onSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      data.success ? toast.success(data.message) : toast.error(data.message);
      if (data.success) setIsEmailSent(true);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const onSubmitOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map(e => e!.value);
    setOtp(otpArray.join(''));
    setIsOtpSubmited(true);
  };

  // 🔹 Corrección: Agregar el tipo `React.FormEvent` a `e`
  const onSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, { email, otp, newPassword });
      data.success ? toast.success(data.message) : toast.error(data.message);
      if (data.success) navigate('/login');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      <img 
        onClick={() => navigate('/')} 
        src={`url(${logo})`} 
        alt="Logo" 
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      {/* Formulario de ingreso de email */}
      {!isEmailSent && 
        <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter your registered email address.</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="Mail Icon" className='w-3 h-3'/>
            <input 
              type="email" 
              placeholder='Email ID' 
              className='bg-transparent outline-none text-white'
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
          </div>
          <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>
            Submit
          </button>
        </form>
      }

      {/* Formulario de OTP */}
      {!isOtpSubmited && isEmailSent &&
        <form onSubmit={onSubmitOTP} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password OTP</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email.</p>
          <div className='flex justify-between mb-8' onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input 
                type="text" 
                maxLength={1} // 🔹 Corrección: `maxLength` debe ser número
                key={index} 
                required
                className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                ref={(e) => { inputRefs.current[index] = e; }} // 🔹 Corrección: Asegurar tipo correcto
                onChange={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>
          <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>
            Submit
          </button>
        </form>
      }

      {/* Formulario de nueva contraseña */}
      {isOtpSubmited && isEmailSent && 
        <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the new password below.</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="Lock Icon" className='w-3 h-3'/>
            <input 
              type="password" 
              placeholder='Password' 
              className='bg-transparent outline-none text-white'
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required
            />
          </div>
          <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>
        </form>
      }
    </div>
  );
}

export default ResetPassword;