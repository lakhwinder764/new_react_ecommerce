import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/auth_context';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    email: '',
    password: '',
    password_confirm: '',
  });
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

    if (form.password !== form.password_confirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await register({
        first_name: form.first_name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirm: form.password_confirm,
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <div className="auth-card">
        <div className="auth-header">
          <span className="badge">Get started</span>
          <h1>Create your account</h1>
          <p>Join us and keep your cart synced everywhere.</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full name
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
              required
            />
          </label>

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
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              name="password_confirm"
              value={form.password_confirm}
              onChange={handleChange}
              placeholder="Repeat your password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="switch-text">
          Already have an account? <Link to="/login">Sign in</Link>
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

export default Register;
