import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store token
      localStorage.setItem('divyashree_token', token);

      // Fetch user profile using refreshUser
      refreshUser()
        .then((userData) => {
          if (userData) {
            // Show success toast and navigate
            toast.success('Signed in with Google successfully!');
            setTimeout(() => {
              navigate('/');
            }, 500);
          } else {
            toast.error('Failed to fetch user profile');
            navigate('/login');
          }
        })
        .catch((error) => {
          console.error('Google auth error:', error);
          toast.error('Authentication failed');
          navigate('/login');
        });
    } else {
      const message = searchParams.get('message') || 'Authentication failed';
      toast.error(message);
      navigate('/login');
    }
  }, [searchParams, navigate, refreshUser]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #6B1E1E 0%, #8B2929 100%)',
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem',
        }}>
          ⏳
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
          Completing Sign In...
        </h2>
        <p style={{ marginTop: '0.5rem', opacity: 0.9 }}>
          Please wait while we authenticate your account
        </p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
