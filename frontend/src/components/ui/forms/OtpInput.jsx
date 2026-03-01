import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/utils/utils';

const OtpInput = ({ length = 6, value = "", onChange, className, error }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value) {
      const valueArray = value.split('').slice(0, length);
      // Fill the rest with empty strings if value is shorter than length
      const newOtp = [...valueArray, ...new Array(length - valueArray.length).fill("")];
      setOtp(newOtp);
    }
  }, [value, length]);

  const handleChange = (index, e) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    // Take the last character if user types in a filled field
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Move to next input if value is entered
    if (val && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on Backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length).split("");
    if (pastedData.every(char => !isNaN(char))) {
      const newOtp = [...pastedData, ...new Array(length - pastedData.length).fill("")];
      setOtp(newOtp);
      onChange(newOtp.join(""));
      // Focus the last filled input or the first empty one
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "h-12 w-12 text-center text-lg font-semibold border rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-background",
            error 
              ? "border-danger text-danger focus:border-danger focus:ring-danger" 
              : "border-border focus:border-primary",
             digit ? "border-primary" : "border-border"
          )}
        />
      ))}
    </div>
  );
};

export default OtpInput;