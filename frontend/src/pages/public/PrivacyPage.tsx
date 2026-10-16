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
              DS Shinde Gas uses your name, mobile number, email address (if provided), and delivery details to process LPG cylinder bookings. You may allow browser location access to add a suggested map location, or enter and edit your delivery address manually. A permitted location is kept in the current browser session until you submit a booking; the submitted map location is stored with that booking or saved address.
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
              All digital online transactions are processed through encrypted PCI-DSS compliant payment gateways (such as Razorpay). DS Shinde Gas does not store credit card numbers, CVVs, or online banking passwords on local servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Sharing with Delivery Partners</h2>
            <p>
              An assigned delivery partner can access the delivery details needed for orders assigned to them. Access is restricted by account role and order assignment. The delivery OTP is used to confirm handover.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Data Retention & Contact</h2>
            <p>
              To request a correction or deletion of your account information, contact the agency at 9511760208 or support@dsshindegas.com. Requests may be subject to legal, accounting, and operational retention requirements.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
