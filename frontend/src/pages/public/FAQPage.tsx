import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      category: 'Ordering & Booking',
      question: 'How do I book an LPG cylinder online through DS Shinde Gas?',
      answer:
        'Sign in with an OTP, choose an available cylinder, provide your delivery details, and select a booking period from 1 to 31 days. The agency reviews the booking before online payment is enabled. You can follow its status from your account.',
    },
    {
      category: 'Ordering & Booking',
      question: 'What is the delivery turnaround time after booking?',
      answer:
        'Delivery timing depends on your location, cylinder availability, and agency scheduling. Check your booking dashboard for status updates or contact the agency for an estimate.',
    },
    {
      category: 'Ordering & Booking',
      question: 'Can I book a cylinder without an existing consumer number or proof?',
      answer:
        'Requirements depend on the selected cylinder and applicable eligibility rules. Submit the requested booking details and the agency will review your application before payment.',
    },
    {
      category: 'Safety & Quality',
      question: 'How do I verify that my cylinder has the exact net weight of gas?',
      answer:
        'You can ask the delivery partner about a weight check at handover. The cylinder tare weight is stamped on its body; contact the agency if you have questions about the delivered cylinder.',
    },
    {
      category: 'Safety & Quality',
      question: 'What should I do if the cylinder safety seal is broken or tampered?',
      answer:
        'Never accept a cylinder with a broken white shrink wrap or damaged plastic safety cap. Instruct the rider to return the cylinder immediately and contact our helpline at 9511760208 for a replacement dispatch.',
    },
    {
      category: 'Payments & Refunds',
      question: 'What payment modes are accepted?',
      answer:
        'We support all popular payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, Net Banking through secure Razorpay gateway, as well as Cash on Delivery (COD) upon physical handover.',
    },
    {
      category: 'Payments & Refunds',
      question: 'What happens if an online payment was deducted but my order failed?',
      answer:
        'Our payment reconciliation runs continuously. If an amount was deducted for an incomplete order, your bank will automatically reverse the transaction within 24 to 48 hours. If it takes longer, contact our support team with your transaction reference number.',
    },
    {
      category: 'Delivery & Handover',
      question: 'Why do I receive a 6-digit OTP for delivery?',
      answer:
        'The delivery OTP is used to confirm handover. Share it with the delivery partner only after you have received the cylinder.',
    },
    {
      category: 'Delivery & Handover',
      question: 'Do I need to return an empty cylinder when receiving a refill?',
      answer:
        'Yes, for standard refill orders you must return an empty cylinder of the corresponding capacity. If you need an additional cylinder connection, please apply for a Double Bottle Cylinder (DBC) via our customer portal or agency desk.',
    },
    {
      category: 'Emergency & Technical',
      question: 'What immediate steps should I take if I smell gas leakage?',
      answer:
        'Do not operate electrical switches or use flames. If it is safe, turn off the regulator, ventilate the area, and move people away. Call the national LPG emergency number 1906 and follow the operator’s instructions.',
    },
    {
      category: 'Commercial',
      question: 'Do you supply 19 kg and 47.5 kg cylinders for commercial restaurants and hotels?',
      answer:
        'Yes. We maintain a dedicated commercial supply division for hotels, cloud kitchens, bakeries, and industrial units with bulk invoicing, tax credits, and scheduled daily delivery runs.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent bg-red-50 px-3 py-1 rounded-full">
            Help & Knowledgebase
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Find answers to common questions about gas cylinder booking, safety guidelines, and delivery tracking.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4 text-left font-bold text-gray-900 flex items-center justify-between gap-4 hover:bg-gray-50 focus:outline-none"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-accent shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                    <span className="inline-block text-[10px] font-bold text-primary uppercase tracking-wider mb-2">
                      {faq.category}
                    </span>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still need help banner */}
        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-3xl p-8 text-center">
          <HelpCircle className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900">Still have questions?</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto mt-1 mb-6">
            Our agency team is available every day to assist you with gas connection inquiries, delivery updates, and technical guidance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:9511760208"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow hover:bg-primaryDark"
            >
              <Phone className="w-4 h-4" /> Call 9511760208
            </a>
            <Link to="/contact">
              <Button variant="outline" size="md">
                Send a Message
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
