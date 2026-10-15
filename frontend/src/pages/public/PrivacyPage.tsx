import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-xs text-gray-400 mb-8">Last Updated: October 2026</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Information We Collect</h2>
            <p>
              D.S SHINDE GAS AGENCY collects essential personal details required to process LPG cylinder bookings and fulfill doorstep deliveries. This includes your name, mobile number, email address, delivery address, landmark, and GPS coordinates.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <p>
              Your contact details are used strictly for order confirmation, delivery route assignment, SMS notifications containing delivery OTPs, payment invoice generation, and customer assistance during emergencies. We do not sell or rent your contact details to third-party telemarketers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Payment Information Security</h2>
            <p>
              All digital online transactions are processed through encrypted PCI-DSS compliant payment gateways (such as Razorpay). D.S SHINDE GAS AGENCY does not store credit card numbers, CVVs, or online banking passwords on our local servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Sharing with Delivery Partners</h2>
            <p>
              Assigned delivery riders receive your delivery address, landmark, and phone number only for the active duration of the delivery errand to navigate to your doorstep and verify the one-time delivery password (OTP).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Data Retention & Contact</h2>
            <p>
              If you wish to update or delete your customer account records, please reach out to our agency helpline at 9511760208 or email support@dsshindegas.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
