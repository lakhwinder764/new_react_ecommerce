import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiShoppingCart } from 'react-icons/fi';
import { CgMenu, CgClose } from 'react-icons/cg';
import { Avatar, Button, Tooltip, Typography } from '@mui/material';
import { useAuth } from '../context/auth_context';
import { useCartContext } from '../context/cart_context';

const Nav = ({ menu, setMenu }) => {
  const [menuIcon, setMenuIcon] = useState();
  const { user, logout, isAuthenticated } = useAuth();
  const { total_item } = useCartContext();
  const navigate = useNavigate();

  const closeMobileMenu = () => {
    setMenuIcon(false);
    setMenu(true);
  };

  const getInitials = () => {
    const name = user?.first_name || user?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  const Nav = styled.nav`
    .navbar-lists {
      display: flex;
      gap: 4.8rem;
      align-items: center;

      .navbar-link {
        &:link,
        &:visited {
          display: inline-block;
          text-decoration: none;
          font-size: 1.8rem;
          font-weight: 500;
          text-transform: uppercase;
          color: ${({ theme }) => theme.colors.black};
          transition: color 0.3s linear;
        }

        &:hover,
        &:active {
          color: ${({ theme }) => theme.colors.helper};
        }
      }
    }

    .mobile-navbar-btn {
      display: none;
      background-color: transparent;
      cursor: pointer;
      border: none;
    }

    .mobile-nav-icon[name='close-outline'] {
      display: none;
    }

    .close-outline {
      display: none;
    }

    .cart-trolley--link {
      position: relative;

      .cart-trolley {
        position: relative;
        font-size: 3.2rem;
      }

      .cart-total--item {
        width: 2.4rem;
        height: 2.4rem;
        position: absolute;
        background-color: #000;
        color: #000;
        border-radius: 50%;
        display: grid;
        place-items: center;
        top: -20%;
        left: 70%;
        background-color: ${({ theme }) => theme.colors.helper};
      }
    }

    .auth-actions {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }

    @media (max-width: ${({ theme }) => theme.media.mobile}) {
      .mobile-navbar-btn {
        display: inline-block;
        z-index: 9999;
        border: ${({ theme }) => theme.colors.black};

        .mobile-nav-icon {
          font-size: 4.2rem;
          color: ${({ theme }) => theme.colors.black};
        }
      }

      .active .mobile-nav-icon {
        display: none;
        font-size: 4.2rem;
        position: absolute;
        top: 5%;
        right: 5%;
        color: ${({ theme }) => theme.colors.black};
        z-index: 9999;
      }

      .active .close-outline {
        display: inline-block;
      }

      .navbar-lists {
        width: 100vw;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #fff;

        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        visibility: hidden;
        opacity: 0;
        transform: translateX(100%);
        transition: all 3s linear;
      }

      .active .navbar-lists {
        visibility: visible;
        opacity: 1;
        transform: translateX(0);
        z-index: 999;
        transform-origin: right;
        transition: all 3s linear;

        .navbar-link {
          font-size: 2.2rem;
        }
      }

      .cart-trolley--link {
        position: relative;

        .cart-trolley {
          position: relative;
          font-size: 3.2rem;
        }

        .cart-total--item {
          width: 2.5rem;
          height: 2.5rem;
          font-size: 2rem;
        }
      }

      .auth-actions {
        flex-direction: column;
      }
    }
  `;

  return (
    <Nav>
      <div className={menuIcon ? 'navbar active' : 'navbar'}>
        <ul className="navbar-lists">
          <li>
            <NavLink to="/" className="navbar-link" onClick={closeMobileMenu}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className="navbar-link" onClick={closeMobileMenu}>
              Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className="navbar-link" onClick={closeMobileMenu}>
              Contact
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/cart"
              className="navbar-link cart-trolley--link"
              onClick={closeMobileMenu}
            >
              <FiShoppingCart className="cart-trolley" />
              <span className="cart-total--item">{total_item}</span>
            </NavLink>
          </li>

          {isAuthenticated ? (
            <>
              <li>
                <NavLink to="/orders" className="navbar-link" onClick={closeMobileMenu}>
                  Orders
                </NavLink>
              </li>
              <li className="auth-actions">
              <Tooltip
                title={
                  <Typography variant="h6">
                    {user?.first_name || user?.email}
                  </Typography>
                }
              >
                <Avatar sx={{ bgcolor: '#6254f3' }}>{getInitials()}</Avatar>
              </Tooltip>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#6254f3' }}
                onClick={() => {
                  logout();
                  closeMobileMenu();
                  navigate('/');
                }}
              >
                Log Out
              </Button>
              </li>
            </>
          ) : (
            <li className="auth-actions">
              <Button
                variant="outlined"
                sx={{ borderColor: '#6254f3', color: '#6254f3' }}
                onClick={() => {
                  closeMobileMenu();
                  navigate('/login');
                }}
              >
                Log In
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#6254f3' }}
                onClick={() => {
                  closeMobileMenu();
                  navigate('/register');
                }}
              >
                Sign Up
              </Button>
            </li>
          )}
        </ul>

        <div className="mobile-navbar-btn">
          <CgMenu
            name="menu-outline"
            className="mobile-nav-icon"
            onClick={() => {
              setMenuIcon(true);
              setMenu(false);
            }}
          />
          <CgClose
            name="close-outline"
            className="mobile-nav-icon close-outline"
            onClick={closeMobileMenu}
          />
        </div>
      </div>
    </Nav>
  );
};

export default Nav;
