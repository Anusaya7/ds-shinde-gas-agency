import React from 'react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Refund & Cancellation Policy</h1>
        <p className="text-xs text-gray-400 mb-8">Effective Date: October 2026</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Cancellation by Customer</h2>
            <p>
              You may cancel an order free of cost through your customer dashboard as long as the status is marked as <strong>PLACED</strong> or <strong>ACCEPTED</strong>. Once an order is assigned to a delivery rider and marked as <strong>OUT FOR DELIVERY</strong>, cancellation via portal is restricted, and you must contact the agency helpline.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Cancellation by Agency</h2>
            <p>
              D.S SHINDE GAS AGENCY reserves the right to cancel an order under exceptional circumstances, such as unreachable addresses, unverified contact numbers, severe weather blockages, or failure to produce an empty cylinder during exchange.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Online Payment Refunds</h2>
            <p>
              If an order paid online via UPI, debit card, or credit card is cancelled or rejected, our system initiates an immediate refund. The refunded funds will reflect in your original payment account within 3 to 5 banking days, depending on your bank's processing cycles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Cylinder Replacement for Defective Seals</h2>
            <p>
              If a delivered cylinder exhibits a defective valve or O-ring leakage upon immediate connection, our agency will dispatch a free emergency replacement cylinder within 2 hours of notification, without any additional delivery fees.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Contact Support for Refund Inquiries</h2>
            <p>
              For any payment or refund discrepancies, please keep your order reference number handy and dial <strong>9511760208</strong> or <strong>9975300929</strong>, or email us at <strong>support@dsshindegas.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
