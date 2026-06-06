import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { useAuth } from '../context/auth_context';
import FormatPrice from '../Helpers/FormatPrice';
import { orderApi } from '../api/orderApi';
import { Button } from '../styles/Button';

const Orders = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await orderApi.list();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, isLoading, navigate]);

  if (loading || isLoading) {
    return <Wrap>Loading your orders...</Wrap>;
  }

  return (
    <Wrap>
      <header>
        <span className="badge">Order history</span>
        <h1>My Orders</h1>
        <p>All your past purchases, synced to your account.</p>
      </header>

      {error && <div className="error">{error}</div>}

      {!orders.length ? (
        <Empty>
          <FiPackage />
          <h2>No orders yet</h2>
          <p>When you checkout, your orders will appear here.</p>
          <Link to="/products"><Button>Start shopping</Button></Link>
        </Empty>
      ) : (
        <List>
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="order-card">
              <div className="order-top">
                <div>
                  <p className="order-id">Order #{order.id}</p>
                  <p className="order-date">
                    {new Date(order.created).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`status ${order.status}`}>{order.status}</span>
              </div>
              <div className="order-bottom">
                <p>{order.item_count} item{order.item_count !== 1 ? 's' : ''}</p>
                <p className="total"><FormatPrice price={order.total_amount} /></p>
              </div>
            </Link>
          ))}
        </List>
      )}
    </Wrap>
  );
};

const Wrap = styled.section`
  padding: 4rem 2rem 8rem;
  background: ${({ theme }) => theme.colors.bg};
  min-height: calc(100vh - 10rem);

  header {
    max-width: 90rem;
    margin: 0 auto 3rem;
    text-align: center;

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
      font-size: 3.2rem;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 0.8rem;
    }

    p {
      font-size: 1.6rem;
      color: ${({ theme }) => theme.colors.text};
    }
  }

  .error {
    max-width: 90rem;
    margin: 0 auto 2rem;
    background: #fff5f5;
    color: #c53030;
    padding: 1.2rem 1.6rem;
    border-radius: 0.8rem;
    text-align: center;
  }
`;

const Empty = styled.div`
  max-width: 50rem;
  margin: 4rem auto;
  text-align: center;
  background: #fff;
  padding: 4rem;
  border-radius: 1.6rem;
  box-shadow: ${({ theme }) => theme.colors.shadow};

  svg {
    font-size: 5rem;
    color: ${({ theme }) => theme.colors.helper};
    margin-bottom: 1.6rem;
  }

  h2 {
    font-size: 2.4rem;
    margin-bottom: 0.8rem;
  }

  p {
    font-size: 1.6rem;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 2rem;
  }

  a {
    text-decoration: none;
  }
`;

const List = styled.div`
  max-width: 90rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;

  .order-card {
    display: block;
    text-decoration: none;
    background: ${({ theme }) => theme.colors.white};
    border-radius: 1.2rem;
    padding: 2rem 2.4rem;
    box-shadow: ${({ theme }) => theme.colors.shadow};
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.colors.shadowSupport};
    }
  }

  .order-top,
  .order-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .order-top {
    margin-bottom: 1.2rem;
    padding-bottom: 1.2rem;
    border-bottom: 1px solid #edf2f7;
  }

  .order-id {
    font-size: 1.8rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.heading};
  }

  .order-date {
    font-size: 1.4rem;
    color: ${({ theme }) => theme.colors.text};
    margin-top: 0.4rem;
  }

  .status {
    padding: 0.5rem 1.2rem;
    border-radius: 999px;
    font-size: 1.2rem;
    font-weight: 600;
    text-transform: capitalize;
    background: #ecfdf5;
    color: #15803d;
  }

  .order-bottom {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text};

    .total {
      font-size: 1.8rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading};
    }
  }
`;

export default Orders;
