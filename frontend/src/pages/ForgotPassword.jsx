import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.forgotPassword(email);
      if (response.success) {
        toast.success('Password reset link sent to your email!');
        setEmailSent(true);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="divyashree-forgot-password-page">
      <div className="divyashree-forgot-password-container">
        {!emailSent ? (
          <>
            <div className="divyashree-forgot-password-header">
              <h1 className="divyashree-forgot-password-title">Forgot Password?</h1>
              <p className="divyashree-forgot-password-subtitle">
                Enter your email and we'll send you a link to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="divyashree-forgot-password-form">
              <div className="divyashree-form-group">
                <label className="divyashree-form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="divyashree-form-input"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="divyashree-submit-btn"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="divyashree-forgot-password-footer">
              <Link to="/login" className="divyashree-back-link">
                ← Back to Login
              </Link>
            </div>
          </>
        ) : (
          <div className="divyashree-success-message">
            <div className="divyashree-success-icon">✓</div>
            <h2 className="divyashree-success-title">Check Your Email</h2>
            <p className="divyashree-success-text">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="divyashree-success-subtext">
              Please check your inbox and click the link to reset your password.
            </p>
            <Link to="/login" className="divyashree-back-btn">
              Back to Login
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .divyashree-forgot-password-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #6B1E1E 0%, #8B2929 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .divyashree-forgot-password-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 450px;
          width: 100%;
          padding: 3rem 2.5rem;
        }

        .divyashree-forgot-password-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .divyashree-forgot-password-title {
          font-size: 2rem;
          font-weight: 700;
          color: #6B1E1E;
          margin-bottom: 0.75rem;
        }

        .divyashree-forgot-password-subtitle {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .divyashree-forgot-password-form {
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

        .divyashree-forgot-password-footer {
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

        .divyashree-success-message {
          text-align: center;
        }

        .divyashree-success-icon {
          width: 80px;
          height: 80px;
          background: #4CAF50;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          margin: 0 auto 1.5rem;
          font-weight: bold;
        }

        .divyashree-success-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #6B1E1E;
          margin-bottom: 1rem;
        }

        .divyashree-success-text {
          color: #333;
          font-size: 1rem;
          margin-bottom: 0.75rem;
        }

        .divyashree-success-subtext {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .divyashree-back-btn {
          display: inline-block;
          background: #6B1E1E;
          color: white;
          text-decoration: none;
          padding: 0.875rem 2.5rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .divyashree-back-btn:hover {
          background: #8B2929;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(107, 30, 30, 0.3);
        }

        @media (max-width: 640px) {
          .divyashree-forgot-password-container {
            padding: 2rem 1.5rem;
          }

          .divyashree-forgot-password-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
