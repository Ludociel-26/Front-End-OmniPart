import React, { useContext, useEffect } from 'react'
import axios from 'axios'
import { AppContent } from '@/context/AppContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

import logo from "@/assets/icons/logo_del_monte.png"

const EmailVerify = () => {

  axios.defaults.withCredentials = true;
  const context = useContext(AppContent);

  if (!context) {
    throw new Error("AppContent debe estar dentro de AppContextProvider");
  }
  
  const { backendUrl, isLoggedin, userData, getUserData } = context;

  const navigate = useNavigate()

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) =>{
    if (e.key === 'Backspace' && e.currentTarget.value === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index)=>{
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    })
  }

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) =>{
    try{
      e.preventDefault();
      const otpArray = inputRefs.current.map(e => e ?  e.value : "")
      const otp = otpArray.join('')

      const {data} = await axios.post(backendUrl + '/api/auth/verify-account', {otp})

      if (data.success) {
        toast.success(data.message)
        getUserData()
        navigate('/')
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Ocurrió un error inesperado")
      }
    }
  }

  useEffect(()=>{
    isLoggedin && userData && userData.isAccountVerified && navigate('/')
  },[isLoggedin, userData])

  return (
    <div className='flex items-center justify-center min-h-screen px-6
    sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img onClick={()=>navigate('/')} src={`url(${logo})`} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
      <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email id.</p>
        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index)=>(
            <input type="text" maxLength={1} key={index} required
            className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
            ref={e => inputRefs.current[index] = e}
            onChange={(e) => handleInput(e, index)}
            onKeyDown={(e)=> handleKeyDown(e, index)}
            />
          ))}
        </div>
        <button className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>
          Verify Email
        </button>
      </form>
    </div>
  )
}

export default EmailVerify