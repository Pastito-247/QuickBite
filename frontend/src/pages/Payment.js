import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import apiURL from '../utils/api';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, amount, backendId } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '4111 1111 1111 1111',
    expiry: '12/28',
    cvv: '123',
    name: 'JUAN PEREZ'
  });

  if (!orderId || !amount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">No hay pago pendiente</h2>
        <button 
          onClick={() => navigate('/menu')}
          className="bg-primary text-white px-6 py-2 rounded-lg"
        >
          Volver al Menú
        </button>
      </div>
    );
  }

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      // 1. Process payment in payment-service
      const paymentResponse = await fetch(apiURL('/api/payments/process'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          orderId: orderId, // Or backendId depending on payment service expectations
          amount: amount,
          currency: 'CLP',
          paymentMethod: 'WEBPAY',
          paymentDetails: {
            cardNumber: formData.cardNumber.replace(/\s/g, ''),
            userId: userId
          }
        })
      });

      if (!paymentResponse.ok) {
        toast.error('Error al procesar el pago.');
        setLoading(false);
        return;
      }

      // 2. The payment service should ideally trigger order confirmation via openfeign, 
      // but let's confirm the order status manually just in case
      await fetch(apiURL(`/api/v1/pedidos/${backendId}/estado`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ estado: 'CONFIRMADO' })
      });

      toast.success('¡Pago completado con éxito!');
      navigate('/orders');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Ocurrió un error en la conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Pasarela de Pago Segura</h2>
          <p className="mt-2 text-sm text-gray-600">
            Total a pagar: <span className="font-bold text-lg text-primary">${amount.toLocaleString('es-CL')}</span>
          </p>
          <p className="text-xs text-gray-500">Orden: {orderId}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleProcessPayment}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre en la tarjeta</label>
              <input
                type="text" required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Tarjeta (Demo)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text" required
                  className="appearance-none rounded-md relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  value={formData.cardNumber}
                  onChange={e => setFormData({...formData, cardNumber: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vencimiento</label>
                <input
                  type="text" required placeholder="MM/YY"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  value={formData.expiry}
                  onChange={e => setFormData({...formData, expiry: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CVV</label>
                <input
                  type="text" required maxLength="4"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                  value={formData.cvv}
                  onChange={e => setFormData({...formData, cvv: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Pagar ${amount.toLocaleString('es-CL')}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment;

