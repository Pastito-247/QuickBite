import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './index.css';

// Context
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Kitchen from './pages/Kitchen';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import CartSidebar from './components/CartSidebar';

function App() {
  useEffect(() => {
    if (!sessionStorage.getItem('quickbite_initialized')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFirstName');
      localStorage.removeItem('userLastName');
      localStorage.removeItem('userProfileImage');
      sessionStorage.setItem('quickbite_initialized', 'true');
    }
  }, []);

  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Navbar />
          <CartSidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/restaurant/:id/menu" element={<Menu />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/kitchen" element={<Kitchen />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment" element={<Payment />} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
