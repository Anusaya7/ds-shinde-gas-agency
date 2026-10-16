import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-xs text-gray-400 mb-8">Effective Date: October 2026</p>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Booking Eligibility & Authentication</h2>
            <p>
              By booking an LPG cylinder with DS Shinde Gas, you confirm that the mobile phone number and delivery location provided belong to you and correspond to an authorized connection or approved Free Trade LPG (FTL) cylinder purchase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Empty Cylinder Exchange</h2>
            <p>
              Standard refill delivery requires the customer to provide an empty LPG cylinder in acceptable physical condition (free of heavy structural dents or valve damage) to the delivery rider in exchange for the full cylinder. Failure to provide an empty cylinder will result in refusal of handover.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Weight Inspection & Seal Integrity</h2>
            <p>
              Customers should inspect the cylinder and safety seal before sharing the 6-digit delivery OTP. The order may be marked complete after the OTP is validated.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Price Adjustments</h2>
            <p>
              LPG cylinder prices are subject to periodic state and central government revisions. The billing amount displayed at the time of final confirmation will be the applicable price for your booking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Safety Compliance</h2>
            <p>
              Customers must adhere to statutory LPG safety standards, including vertical storage, approved rubber tubing, and avoiding unauthorized repairs. DS Shinde Gas may report illegal decanting or black-market reselling.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
