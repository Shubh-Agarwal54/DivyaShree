import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email, phone, requiresPhoneVerification } = location.state || {};

  const [emailOTP, setEmailOTP] = useState(['', '', '', '', '', '']);
  const [phoneOTP, setPhoneOTP] = useState(['', '', '', '', '', '']);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendingPhone, setResendingPhone] = useState(false);
  const [emailTimer, setEmailTimer] = useState(60);
  const [phoneTimer, setPhoneTimer] = useState(60);

  useEffect(() => {
    if (!userId) {
      navigate('/signup');
      return;
    }

    // Email timer
    const emailInterval = setInterval(() => {
      setEmailTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Phone timer
    const phoneInterval = setInterval(() => {
      setPhoneTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(emailInterval);
      clearInterval(phoneInterval);
    };
  }, [userId, navigate]);

  const handleOTPChange = (index, value, isPhone = false) => {
    if (!/^\d*$/.test(value)) return;

    const otpArray = isPhone ? [...phoneOTP] : [...emailOTP];
    otpArray[index] = value;

    if (isPhone) {
      setPhoneOTP(otpArray);
    } else {
      setEmailOTP(otpArray);
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(
        `input[name="${isPhone ? 'phone' : 'email'}-otp-${index + 1}"]`
      );
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index, isPhone = false) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const prevInput = document.querySelector(
        `input[name="${isPhone ? 'phone' : 'email'}-otp-${index - 1}"]`
      );
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e, isPhone = false) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pasteData)) return;

    const otpArray = pasteData.split('');
    if (isPhone) {
      setPhoneOTP([...otpArray, ...Array(6 - otpArray.length).fill('')]);
    } else {
      setEmailOTP([...otpArray, ...Array(6 - otpArray.length).fill('')]);
    }
  };

  const verifyEmailOTP = async () => {
    const otp = emailOTP.join('');

    if (otp.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await api.verifyEmailOTP(userId, otp);
      if (response.success) {
        toast.success('Email verified successfully!');
        setIsEmailVerified(true);

        if (!requiresPhoneVerification) {
          // No phone verification needed, redirect to login
          setTimeout(() => {
            navigate('/login', { state: { message: 'Account created successfully! Please login.' } });
          }, 1500);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyPhoneOTP = async () => {
    const otp = phoneOTP.join('');

    if (otp.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    if (!isEmailVerified) {
      toast.error('Please verify your email first');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await api.verifyPhoneOTP(userId, otp);
      if (response.success) {
        toast.success('Phone verified successfully! Account activated.');

        // Store token and user
        if (response.data?.token) {
          localStorage.setItem('divyashree_token', response.data.token);
          localStorage.setItem('divyashree_user', JSON.stringify(response.data.user));
        }

        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendEmailOTP = async () => {
    if (emailTimer > 0) return;

    setResendingEmail(true);

    try {
      const response = await api.resendEmailOTP(userId);
      if (response.success) {
        toast.success('OTP resent to your email');
        setEmailTimer(60);
        setEmailOTP(['', '', '', '', '', '']);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setResendingEmail(false);
    }
  };

  const resendPhoneOTP = async () => {
    if (phoneTimer > 0) return;

    setResendingPhone(true);

    try {
      const response = await api.resendPhoneOTP(userId);
      if (response.success) {
        toast.success('OTP resent to your phone');
        setPhoneTimer(60);
        setPhoneOTP(['', '', '', '', '', '']);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setResendingPhone(false);
    }
  };

  return (
    <div className="divyashree-otp-verification-page">
      <div className="divyashree-otp-container">
        <div className="divyashree-otp-header">
          <h1 className="divyashree-otp-title">Verify Your Account</h1>
          <p className="divyashree-otp-subtitle">
            We've sent verification codes to your email{requiresPhoneVerification && ' and phone'}
          </p>
        </div>

        {/* Email OTP Section */}
        <div className={`divyashree-otp-section ${isEmailVerified ? 'divyashree-verified' : ''}`}>
          <div className="divyashree-otp-section-header">
            <h3 className="divyashree-otp-section-title">
              {isEmailVerified ? '✓ Email Verified' : 'Email Verification'}
            </h3>
            <p className="divyashree-otp-section-subtitle">{email}</p>
          </div>

          {!isEmailVerified && (
            <>
              <div className="divyashree-otp-input-group">
                {emailOTP.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    name={`email-otp-${index}`}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(index, e.target.value, false)}
                    onKeyDown={(e) => handleKeyDown(e, index, false)}
                    onPaste={(e) => handlePaste(e, false)}
                    className="divyashree-otp-input"
                    disabled={isVerifying || isEmailVerified}
                  />
                ))}
              </div>

              <div className="divyashree-otp-actions">
                <button
                  onClick={verifyEmailOTP}
                  disabled={isVerifying || isEmailVerified}
                  className="divyashree-verify-btn"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Email'}
                </button>

                <button
                  onClick={resendEmailOTP}
                  disabled={emailTimer > 0 || resendingEmail}
                  className="divyashree-resend-btn"
                >
                  {resendingEmail ? 'Sending...' : emailTimer > 0 ? `Resend in ${emailTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Phone OTP Section */}
        {requiresPhoneVerification && (
          <div className={`divyashree-otp-section ${!isEmailVerified ? 'divyashree-disabled' : ''}`}>
            <div className="divyashree-otp-section-header">
              <h3 className="divyashree-otp-section-title">Phone Verification</h3>
              <p className="divyashree-otp-section-subtitle">{phone}</p>
            </div>

            {isEmailVerified && (
              <>
                <div className="divyashree-otp-input-group">
                  {phoneOTP.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      name={`phone-otp-${index}`}
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value, true)}
                      onKeyDown={(e) => handleKeyDown(e, index, true)}
                      onPaste={(e) => handlePaste(e, true)}
                      className="divyashree-otp-input"
                      disabled={isVerifying}
                    />
                  ))}
                </div>

                <div className="divyashree-otp-actions">
                  <button
                    onClick={verifyPhoneOTP}
                    disabled={isVerifying}
                    className="divyashree-verify-btn"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Phone'}
                  </button>

                  <button
                    onClick={resendPhoneOTP}
                    disabled={phoneTimer > 0 || resendingPhone}
                    className="divyashree-resend-btn"
                  >
                    {resendingPhone ? 'Sending...' : phoneTimer > 0 ? `Resend in ${phoneTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </>
            )}

            {!isEmailVerified && (
              <p className="divyashree-disabled-message">
                Please verify your email first
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        .divyashree-otp-verification-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #6B1E1E 0%, #8B2929 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .divyashree-otp-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 100%;
          padding: 3rem 2rem;
        }

        .divyashree-otp-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .divyashree-otp-title {
          font-size: 2rem;
          font-weight: 700;
          color: #6B1E1E;
          margin-bottom: 0.5rem;
        }

        .divyashree-otp-subtitle {
          color: #666;
          font-size: 0.95rem;
        }

        .divyashree-otp-section {
          background: #F5F5DC;
          border-radius: 12px;
          padding: 2rem 1.5rem;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }

        .divyashree-otp-section.divyashree-verified {
          background: #E8F5E9;
          border: 2px solid #4CAF50;
        }

        .divyashree-otp-section.divyashree-disabled {
          opacity: 0.6;
          pointer-events: none;
        }

        .divyashree-otp-section-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .divyashree-otp-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #6B1E1E;
          margin-bottom: 0.25rem;
        }

        .divyashree-otp-section-subtitle {
          color: #666;
          font-size: 0.9rem;
        }

        .divyashree-otp-input-group {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .divyashree-otp-input {
          width: 50px;
          height: 55px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
          border: 2px solid #D4AF37;
          border-radius: 8px;
          background: white;
          color: #6B1E1E;
          transition: all 0.2s ease;
        }

        .divyashree-otp-input:focus {
          outline: none;
          border-color: #6B1E1E;
          box-shadow: 0 0 0 3px rgba(107, 30, 30, 0.1);
          transform: scale(1.05);
        }

        .divyashree-otp-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .divyashree-otp-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .divyashree-verify-btn {
          background: #6B1E1E;
          color: white;
          border: none;
          padding: 0.875rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .divyashree-verify-btn:hover:not(:disabled) {
          background: #8B2929;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(107, 30, 30, 0.3);
        }

        .divyashree-verify-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divyashree-resend-btn {
          background: transparent;
          color: #6B1E1E;
          border: 2px solid #D4AF37;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .divyashree-resend-btn:hover:not(:disabled) {
          background: #D4AF37;
          color: white;
        }

        .divyashree-resend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .divyashree-disabled-message {
          text-align: center;
          color: #999;
          font-style: italic;
          margin-top: 1rem;
        }

        @media (max-width: 640px) {
          .divyashree-otp-container {
            padding: 2rem 1.5rem;
          }

          .divyashree-otp-title {
            font-size: 1.5rem;
          }

          .divyashree-otp-input {
            width: 42px;
            height: 48px;
            font-size: 1.25rem;
          }

          .divyashree-otp-input-group {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OTPVerification;
