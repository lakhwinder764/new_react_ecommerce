import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/auth_context';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <div className="auth-card">
        <div className="auth-header">
          <span className="badge">Welcome back</span>
          <h1>Sign in to your account</h1>
          <p>Access your saved cart from any device.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="switch-text">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  min-height: calc(100vh - 10rem);
  display: grid;
  place-items: center;
  padding: 4rem 2rem;
  background: ${({ theme }) => theme.colors.bg};

  .auth-card {
    width: 100%;
    max-width: 46rem;
    background: ${({ theme }) => theme.colors.white};
    border-radius: 1.6rem;
    padding: 4rem;
    box-shadow: ${({ theme }) => theme.colors.shadow};
  }

  .auth-header {
    margin-bottom: 3rem;

    .badge {
      display: inline-block;
      font-size: 1.2rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${({ theme }) => theme.colors.helper};
      margin-bottom: 1rem;
    }

    h1 {
      font-size: 3rem;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 0.8rem;
    }

    p {
      font-size: 1.6rem;
      color: ${({ theme }) => theme.colors.text};
    }
  }

  .error-banner {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #feb2b2;
    border-radius: 0.8rem;
    padding: 1.2rem 1.6rem;
    font-size: 1.4rem;
    margin-bottom: 2rem;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    label {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      font-size: 1.4rem;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.heading};
    }

    input {
      font-size: 1.6rem;
      padding: 1.2rem 1.4rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.8rem;
      outline: none;
      transition: border-color 0.2s ease;

      &:focus {
        border-color: ${({ theme }) => theme.colors.helper};
      }
    }

    button {
      margin-top: 0.5rem;
      border: none;
      border-radius: 0.8rem;
      padding: 1.4rem;
      font-size: 1.6rem;
      font-weight: 600;
      text-transform: uppercase;
      color: ${({ theme }) => theme.colors.white};
      background: ${({ theme }) => theme.colors.btn};
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: ${({ theme }) => theme.colors.shadowSupport};
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }

  .switch-text {
    margin-top: 2.4rem;
    text-align: center;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text};

    a {
      color: ${({ theme }) => theme.colors.helper};
      font-weight: 600;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

export default Login;
