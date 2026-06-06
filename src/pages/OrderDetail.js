import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import { useAuth } from '../context/auth_context';
import FormatPrice from '../Helpers/FormatPrice';
import { orderApi } from '../api/orderApi';
import { Button } from '../styles/Button';

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const emailSent = location.state?.emailSent;
  const { isAuthenticated, isLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      setError('Please log in to view this order.');
      return;
    }

    const loadOrder = async () => {
      try {
        const data = await orderApi.detail(id);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to load order.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, isAuthenticated, isLoading]);

  if (loading) {
    return <StateWrap>Loading order...</StateWrap>;
  }

  if (error || !order) {
    return (
      <StateWrap>
        <p>{error || 'Order not found.'}</p>
        <Link to="/orders"><Button>View all orders</Button></Link>
      </StateWrap>
    );
  }

  return (
    <Wrapper>
      <div className="success-banner">
        <FiCheckCircle />
        <div>
          <h1>Order confirmed!</h1>
          <p>Thank you, {order.full_name}. Your order #{order.id} has been placed.</p>
          {emailSent && (
            <p className="email-note">
              A confirmation email has been sent to your registered email address.
            </p>
          )}
        </div>
      </div>

      <div className="order-grid">
        <section className="card">
          <h2><FiPackage /> Items ordered</h2>
          <ul className="items">
            {order.items.map((item) => {
              const image =
                typeof item.product.image === 'string'
                  ? item.product.image
                  : item.product.image?.[0]?.url ?? '';
              return (
                <li key={item.id}>
                  <img src={image} alt={item.product.name} />
                  <div>
                    <p className="name">{item.product.name}</p>
                    <p className="meta">
                      Qty {item.quantity}
                      {item.color ? ` · ${item.color}` : ''}
                    </p>
                  </div>
                  <span><FormatPrice price={item.price * item.quantity} /></span>
                </li>
              );
            })}
          </ul>
          <div className="totals">
            <div><span>Subtotal</span><span><FormatPrice price={order.subtotal} /></span></div>
            <div><span>Shipping</span><span><FormatPrice price={order.shipping_fee} /></span></div>
            <div className="grand"><span>Total paid</span><span><FormatPrice price={order.total_amount} /></span></div>
          </div>
        </section>

        <aside className="card">
          <h2>Delivery details</h2>
          <div className="detail-block">
            <p>{order.full_name}</p>
            <p>{order.address}</p>
            <p>{order.city}, {order.state} - {order.pincode}</p>
            <p>{order.phone}</p>
            <p>{order.email}</p>
          </div>
          <div className="detail-block">
            <h3>Status</h3>
            <span className="status">{order.status}</span>
          </div>
          <div className="detail-block">
            <h3>Payment</h3>
            <p className="capitalize">
              {order.payment_method === 'cod'
                ? 'Cash on Delivery'
                : order.payment_method.toUpperCase()}
            </p>
          </div>
          <div className="actions">
            <Link to="/orders"><Button>All orders</Button></Link>
            <Link to="/products"><Button>Continue shopping</Button></Link>
          </div>
        </aside>
      </div>
    </Wrapper>
  );
};

const StateWrap = styled.section`
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  font-size: 1.8rem;
`;

const Wrapper = styled.section`
  padding: 4rem 2rem 8rem;
  background: ${({ theme }) => theme.colors.bg};
  min-height: calc(100vh - 10rem);

  .success-banner {
    max-width: 110rem;
    margin: 0 auto 3rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    background: linear-gradient(135deg, #ecfdf5, #f0edff);
    border: 1px solid #bbf7d0;
    border-radius: 1.6rem;
    padding: 2.4rem 3rem;

    svg {
      font-size: 5rem;
      color: #16a34a;
      flex-shrink: 0;
    }

    h1 {
      font-size: 2.8rem;
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 0.4rem;
    }

    p {
      font-size: 1.6rem;
      color: ${({ theme }) => theme.colors.text};
    }

    .email-note {
      margin-top: 0.6rem;
      font-size: 1.4rem;
      color: #15803d;
    }
  }

  .order-grid {
    max-width: 110rem;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.3fr 0.7fr;
    gap: 2.4rem;
  }

  .card {
    background: ${({ theme }) => theme.colors.white};
    border-radius: 1.6rem;
    padding: 2.4rem;
    box-shadow: ${({ theme }) => theme.colors.shadow};

    h2 {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      font-size: 2rem;
      margin-bottom: 2rem;
      color: ${({ theme }) => theme.colors.heading};
    }
  }

  .items {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;

    li {
      display: grid;
      grid-template-columns: 5.5rem 1fr auto;
      gap: 1.2rem;
      align-items: center;

      img {
        width: 5.5rem;
        height: 5.5rem;
        object-fit: contain;
        background: #f8fafc;
        border-radius: 0.8rem;
      }

      .name {
        font-size: 1.5rem;
        font-weight: 600;
      }

      .meta {
        font-size: 1.3rem;
        color: ${({ theme }) => theme.colors.text};
      }
    }
  }

  .totals {
    margin-top: 2rem;
    padding-top: 1.6rem;
    border-top: 1px solid #edf2f7;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    div {
      display: flex;
      justify-content: space-between;
      font-size: 1.5rem;
    }

    .grand {
      font-size: 1.8rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading};
      padding-top: 1rem;
      border-top: 1px dashed #e2e8f0;
    }
  }

  .detail-block {
    margin-bottom: 2rem;

    h3 {
      font-size: 1.3rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${({ theme }) => theme.colors.helper};
      margin-bottom: 0.8rem;
    }

    p {
      font-size: 1.5rem;
      line-height: 1.6;
      color: ${({ theme }) => theme.colors.heading};
    }

    .capitalize {
      text-transform: capitalize;
    }
  }

  .status {
    display: inline-block;
    padding: 0.6rem 1.2rem;
    border-radius: 999px;
    background: #ecfdf5;
    color: #15803d;
    font-size: 1.3rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;

    a {
      text-decoration: none;
    }
  }

  @media (max-width: ${({ theme }) => theme.media.tab}) {
    .order-grid {
      grid-template-columns: 1fr;
    }

    .success-banner {
      flex-direction: column;
      text-align: center;
    }
  }
`;

export default OrderDetail;
