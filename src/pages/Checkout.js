import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiCreditCard, FiMapPin, FiPackage, FiSmartphone } from 'react-icons/fi';
import { useAuth } from '../context/auth_context';
import { useCartContext } from '../context/cart_context';
import FormatPrice from '../Helpers/FormatPrice';
import { orderApi } from '../api/orderApi';

const STEPS = ['Shipping', 'Payment', 'Review'];

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { cart, total_price, shipping_fee, clearCart } = useCartContext();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [shipping, setShipping] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [payment, setPayment] = useState({
    method: 'card',
    card_name: '',
    card_number: '',
    expiry: '',
    cvv: '',
    upi_id: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      setShipping((prev) => ({
        ...prev,
        full_name: prev.full_name || user.first_name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && cart.length === 0) {
      navigate('/cart');
    }
  }, [cart.length, isAuthenticated, isLoading, navigate]);

  const orderTotal = total_price + shipping_fee;

  const handleShippingChange = (event) => {
    setShipping((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setError('');
  };

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;
    setPayment((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const formatCardNumber = (value) =>
    value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const validateShipping = () => {
    const required = ['full_name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shipping[field]?.trim()) {
        setError('Please fill in all shipping details.');
        return false;
      }
    }
    if (!/^\d{6}$/.test(shipping.pincode.trim())) {
      setError('Please enter a valid 6-digit pincode.');
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (payment.method === 'cod') return true;
    if (payment.method === 'upi') {
      if (!payment.upi_id.trim()) {
        setError('Please enter your UPI ID.');
        return false;
      }
      return true;
    }
    if (!payment.card_name.trim() || payment.card_number.replace(/\s/g, '').length < 16) {
      setError('Please enter valid card details.');
      return false;
    }
    if (payment.expiry.length < 5 || payment.cvv.length < 3) {
      setError('Please enter valid expiry and CVV.');
      return false;
    }
    return true;
  };

  const goNext = () => {
    setError('');
    if (step === 0 && !validateShipping()) return;
    if (step === 1 && !validatePayment()) return;
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping() || !validatePayment()) {
      setStep(validateShipping() ? 1 : 0);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const result = await orderApi.checkout({
        ...shipping,
        payment_method: payment.method,
      });
      await clearCart();
      navigate(`/orders/${result.order.id}`, {
        replace: true,
        state: { emailSent: result.email_sent },
      });
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <LoadingWrap>
        <p>Loading checkout...</p>
      </LoadingWrap>
    );
  }

  return (
    <Wrapper>
      <div className="checkout-header">
        <span className="badge">Secure checkout</span>
        <h1>Complete your order</h1>
        <p>Review your items and enter delivery details.</p>
      </div>

      <div className="steps">
        {STEPS.map((label, index) => (
          <div
            key={label}
            className={`step ${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`}
          >
            <span className="step-icon">
              {index < step ? <FiCheck /> : index + 1}
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="checkout-grid">
        <div className="checkout-main">
          {error && <div className="error-banner">{error}</div>}

          {step === 0 && (
            <section className="panel">
              <div className="panel-title">
                <FiMapPin />
                <h2>Shipping address</h2>
              </div>
              <div className="form-grid">
                <label className="full">
                  Full name
                  <input name="full_name" value={shipping.full_name} onChange={handleShippingChange} placeholder="John Doe" required />
                </label>
                <label>
                  Email
                  <input type="email" name="email" value={shipping.email} onChange={handleShippingChange} placeholder="you@example.com" required />
                </label>
                <label>
                  Phone
                  <input name="phone" value={shipping.phone} onChange={handleShippingChange} placeholder="+91 9876543210" required />
                </label>
                <label className="full">
                  Street address
                  <input name="address" value={shipping.address} onChange={handleShippingChange} placeholder="House no, street, area" required />
                </label>
                <label>
                  City
                  <input name="city" value={shipping.city} onChange={handleShippingChange} placeholder="Mumbai" required />
                </label>
                <label>
                  State
                  <input name="state" value={shipping.state} onChange={handleShippingChange} placeholder="Maharashtra" required />
                </label>
                <label>
                  Pincode
                  <input name="pincode" value={shipping.pincode} onChange={handleShippingChange} placeholder="400001" maxLength={6} required />
                </label>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="panel">
              <div className="panel-title">
                <FiCreditCard />
                <h2>Payment method</h2>
              </div>

              <div className="payment-options">
                {[
                  { id: 'card', label: 'Credit / Debit Card', icon: <FiCreditCard /> },
                  { id: 'upi', label: 'UPI', icon: <FiSmartphone /> },
                  { id: 'cod', label: 'Cash on Delivery', icon: <FiPackage /> },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`payment-option ${payment.method === option.id ? 'selected' : ''}`}
                    onClick={() => setPayment((prev) => ({ ...prev, method: option.id }))}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>

              {payment.method === 'card' && (
                <div className="card-preview">
                  <div className="card-chip" />
                  <p className="card-number">{payment.card_number || '•••• •••• •••• ••••'}</p>
                  <div className="card-footer">
                    <span>{payment.card_name || 'YOUR NAME'}</span>
                    <span>{payment.expiry || 'MM/YY'}</span>
                  </div>
                </div>
              )}

              {payment.method === 'card' && (
                <div className="form-grid">
                  <label className="full">
                    Name on card
                    <input name="card_name" value={payment.card_name} onChange={handlePaymentChange} placeholder="As printed on card" />
                  </label>
                  <label className="full">
                    Card number
                    <input
                      name="card_number"
                      value={payment.card_number}
                      onChange={(e) =>
                        setPayment((prev) => ({
                          ...prev,
                          card_number: formatCardNumber(e.target.value),
                        }))
                      }
                      placeholder="1234 5678 9012 3456"
                    />
                  </label>
                  <label>
                    Expiry
                    <input
                      name="expiry"
                      value={payment.expiry}
                      onChange={(e) =>
                        setPayment((prev) => ({
                          ...prev,
                          expiry: formatExpiry(e.target.value),
                        }))
                      }
                      placeholder="MM/YY"
                    />
                  </label>
                  <label>
                    CVV
                    <input
                      name="cvv"
                      value={payment.cvv}
                      onChange={(e) =>
                        setPayment((prev) => ({
                          ...prev,
                          cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                        }))
                      }
                      placeholder="123"
                      type="password"
                    />
                  </label>
                </div>
              )}

              {payment.method === 'upi' && (
                <div className="form-grid">
                  <label className="full">
                    UPI ID
                    <input name="upi_id" value={payment.upi_id} onChange={handlePaymentChange} placeholder="yourname@upi" />
                  </label>
                </div>
              )}

              {payment.method === 'cod' && (
                <p className="cod-note">Pay with cash when your order is delivered at your doorstep.</p>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="panel">
              <div className="panel-title">
                <FiPackage />
                <h2>Review order</h2>
              </div>
              <div className="review-block">
                <h3>Delivery to</h3>
                <p>{shipping.full_name}</p>
                <p>{shipping.address}, {shipping.city}, {shipping.state} - {shipping.pincode}</p>
                <p>{shipping.phone} · {shipping.email}</p>
              </div>
              <div className="review-block">
                <h3>Payment</h3>
                <p className="capitalize">{payment.method === 'cod' ? 'Cash on Delivery' : payment.method.toUpperCase()}</p>
              </div>
            </section>
          )}

          <div className="actions">
            {step > 0 && (
              <button type="button" className="btn-secondary" onClick={goBack}>
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn-primary" onClick={goNext}>
                Continue
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={handlePlaceOrder} disabled={submitting}>
                {submitting ? 'Placing order...' : 'Place Order'}
              </button>
            )}
          </div>
        </div>

        <aside className="summary">
          <h2>Order summary</h2>
          <ul className="summary-items">
            {cart.map((item) => (
              <li key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <p className="item-name">{item.name}</p>
                  <p className="item-meta">Qty {item.amount}{item.color ? ` · ${item.color}` : ''}</p>
                </div>
                <span><FormatPrice price={item.price * item.amount} /></span>
              </li>
            ))}
          </ul>
          <div className="summary-rows">
            <div><span>Subtotal</span><span><FormatPrice price={total_price} /></span></div>
            <div><span>Shipping</span><span><FormatPrice price={shipping_fee} /></span></div>
            <div className="total"><span>Total</span><span><FormatPrice price={orderTotal} /></span></div>
          </div>
          <Link to="/cart" className="edit-cart">Edit cart</Link>
        </aside>
      </div>
    </Wrapper>
  );
};

const LoadingWrap = styled.section`
  min-height: 60vh;
  display: grid;
  place-items: center;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Wrapper = styled.section`
  padding: 4rem 2rem 8rem;
  background: ${({ theme }) => theme.colors.bg};
  min-height: calc(100vh - 10rem);

  .checkout-header {
    max-width: 120rem;
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
      font-size: clamp(2.8rem, 4vw, 4rem);
      color: ${({ theme }) => theme.colors.heading};
      margin-bottom: 0.8rem;
    }

    p {
      font-size: 1.6rem;
      color: ${({ theme }) => theme.colors.text};
    }
  }

  .steps {
    max-width: 60rem;
    margin: 0 auto 4rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;

    .step {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
      font-size: 1.3rem;
      color: ${({ theme }) => theme.colors.text};
      opacity: 0.6;

      &.active,
      &.done {
        opacity: 1;
        color: ${({ theme }) => theme.colors.heading};
        font-weight: 600;
      }

      .step-icon {
        width: 3.6rem;
        height: 3.6rem;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: #e8ebff;
        color: ${({ theme }) => theme.colors.btn};
        font-size: 1.4rem;
      }

      &.active .step-icon,
      &.done .step-icon {
        background: ${({ theme }) => theme.colors.btn};
        color: #fff;
      }
    }
  }

  .checkout-grid {
    max-width: 120rem;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.4fr 0.8fr;
    gap: 3rem;
    align-items: start;
  }

  .panel {
    background: ${({ theme }) => theme.colors.white};
    border-radius: 1.6rem;
    padding: 3rem;
    box-shadow: ${({ theme }) => theme.colors.shadow};
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2.4rem;
    color: ${({ theme }) => theme.colors.btn};

    h2 {
      font-size: 2rem;
      color: ${({ theme }) => theme.colors.heading};
    }

    svg {
      font-size: 2.2rem;
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.6rem;

    label {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      font-size: 1.3rem;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.heading};
    }

    label.full {
      grid-column: 1 / -1;
    }

    input {
      font-size: 1.5rem;
      padding: 1.2rem 1.4rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.8rem;
      outline: none;

      &:focus {
        border-color: ${({ theme }) => theme.colors.helper};
      }
    }
  }

  .payment-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .payment-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    padding: 1.6rem 1rem;
    border: 2px solid #e8ebff;
    border-radius: 1rem;
    background: #fafbff;
    cursor: pointer;
    font-size: 1.3rem;
    color: ${({ theme }) => theme.colors.heading};
    transition: all 0.2s ease;

    svg {
      font-size: 2rem;
      color: ${({ theme }) => theme.colors.btn};
    }

    &.selected {
      border-color: ${({ theme }) => theme.colors.btn};
      background: #f0edff;
      box-shadow: ${({ theme }) => theme.colors.shadowSupport};
    }
  }

  .card-preview {
    background: ${({ theme }) => theme.colors.gradient};
    border-radius: 1.2rem;
    padding: 2.4rem;
    color: #fff;
    margin-bottom: 2rem;
    min-height: 16rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .card-chip {
      width: 4rem;
      height: 3rem;
      border-radius: 0.4rem;
      background: rgba(255, 255, 255, 0.35);
    }

    .card-number {
      font-size: 2rem;
      letter-spacing: 0.15em;
      font-family: monospace;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      font-size: 1.3rem;
      text-transform: uppercase;
    }
  }

  .cod-note {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text};
    background: #f8fafc;
    padding: 1.6rem;
    border-radius: 0.8rem;
    border-left: 4px solid ${({ theme }) => theme.colors.btn};
  }

  .review-block {
    background: #f8fafc;
    border-radius: 1rem;
    padding: 1.6rem;
    margin-bottom: 1.6rem;

    h3 {
      font-size: 1.4rem;
      color: ${({ theme }) => theme.colors.helper};
      margin-bottom: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    p {
      font-size: 1.5rem;
      color: ${({ theme }) => theme.colors.heading};
      line-height: 1.6;
    }

    .capitalize {
      text-transform: capitalize;
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

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
    margin-top: 2rem;

    button {
      border: none;
      border-radius: 0.8rem;
      padding: 1.4rem 2.4rem;
      font-size: 1.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .btn-primary {
      background: ${({ theme }) => theme.colors.btn};
      color: #fff;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      background: #fff;
      color: ${({ theme }) => theme.colors.heading};
      border: 1px solid #e2e8f0;
    }
  }

  .summary {
    position: sticky;
    top: 2rem;
    background: ${({ theme }) => theme.colors.white};
    border-radius: 1.6rem;
    padding: 2.4rem;
    box-shadow: ${({ theme }) => theme.colors.shadow};

    h2 {
      font-size: 2rem;
      margin-bottom: 2rem;
      color: ${({ theme }) => theme.colors.heading};
    }
  }

  .summary-items {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
    margin-bottom: 2rem;
    max-height: 32rem;
    overflow-y: auto;

    li {
      display: grid;
      grid-template-columns: 5rem 1fr auto;
      gap: 1.2rem;
      align-items: center;

      img {
        width: 5rem;
        height: 5rem;
        object-fit: contain;
        border-radius: 0.8rem;
        background: #f8fafc;
      }

      .item-name {
        font-size: 1.4rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.heading};
      }

      .item-meta {
        font-size: 1.2rem;
        color: ${({ theme }) => theme.colors.text};
      }

      span {
        font-size: 1.4rem;
        font-weight: 600;
        white-space: nowrap;
      }
    }
  }

  .summary-rows {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1.6rem;
    border-top: 1px solid #edf2f7;

    div {
      display: flex;
      justify-content: space-between;
      font-size: 1.5rem;
      color: ${({ theme }) => theme.colors.text};
    }

    .total {
      font-size: 1.8rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.heading};
      padding-top: 1rem;
      border-top: 1px dashed #e2e8f0;
    }
  }

  .edit-cart {
    display: block;
    text-align: center;
    margin-top: 2rem;
    font-size: 1.4rem;
    color: ${({ theme }) => theme.colors.helper};
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: ${({ theme }) => theme.media.tab}) {
    .checkout-grid {
      grid-template-columns: 1fr;
    }

    .summary {
      position: static;
    }

    .payment-options {
      grid-template-columns: 1fr;
    }

    .form-grid {
      grid-template-columns: 1fr;

      label.full {
        grid-column: auto;
      }
    }
  }
`;

export default Checkout;
