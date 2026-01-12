import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.resetPassword(token, password);
      if (response.success) {
        toast.success('Password reset successfully!');
        setTimeout(() => {
          navigate('/login', { state: { message: 'Password reset successful. Please login.' } });
        }, 1500);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="divyashree-reset-password-page">
      <div className="divyashree-reset-password-container">
        <div className="divyashree-reset-password-header">
          <h1 className="divyashree-reset-password-title">Reset Password</h1>
          <p className="divyashree-reset-password-subtitle">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="divyashree-reset-password-form">
          <div className="divyashree-form-group">
            <label className="divyashree-form-label">New Password</label>
            <div className="divyashree-password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="divyashree-form-input"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="divyashree-toggle-password"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="divyashree-form-group">
            <label className="divyashree-form-label">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="divyashree-form-input"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="divyashree-submit-btn"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="divyashree-reset-password-footer">
          <Link to="/login" className="divyashree-back-link">
            ← Back to Login
          </Link>
        </div>
      </div>

      <style>{`
        .divyashree-reset-password-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #6B1E1E 0%, #8B2929 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .divyashree-reset-password-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 450px;
          width: 100%;
          padding: 3rem 2.5rem;
        }

        .divyashree-reset-password-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .divyashree-reset-password-title {
          font-size: 2rem;
          font-weight: 700;
          color: #6B1E1E;
          margin-bottom: 0.75rem;
        }

        .divyashree-reset-password-subtitle {
          color: #666;
          font-size: 0.95rem;
        }

        .divyashree-reset-password-form {
          margin-bottom: 2rem;
        }

        .divyashree-form-group {
          margin-bottom: 1.5rem;
        }

        .divyashree-form-label {
          display: block;
          font-weight: 600;
          color: #6B1E1E;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .divyashree-password-input-wrapper {
          position: relative;
        }

        .divyashree-form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #D4AF37;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .divyashree-form-input:focus {
          outline: none;
          border-color: #6B1E1E;
          box-shadow: 0 0 0 3px rgba(107, 30, 30, 0.1);
        }

        .divyashree-form-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .divyashree-toggle-password {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.25rem;
          padding: 0;
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }

        .divyashree-toggle-password:hover {
          opacity: 1;
        }

        .divyashree-submit-btn {
          width: 100%;
          background: #6B1E1E;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .divyashree-submit-btn:hover:not(:disabled) {
          background: #8B2929;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(107, 30, 30, 0.3);
        }

        .divyashree-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divyashree-reset-password-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #E5E5E5;
        }

        .divyashree-back-link {
          color: #6B1E1E;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .divyashree-back-link:hover {
          color: #D4AF37;
        }

        @media (max-width: 640px) {
          .divyashree-reset-password-container {
            padding: 2rem 1.5rem;
          }

          .divyashree-reset-password-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
