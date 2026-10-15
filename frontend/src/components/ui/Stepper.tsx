import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  title: string;
  subtitle?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 1-indexed
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="w-full py-4">
      {/* Mobile step indicator */}
      <div className="md:hidden flex items-center justify-between mb-4 px-2">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-sm font-bold text-gray-900">
          {steps[currentStep - 1]?.title}
        </span>
      </div>
      <div className="md:hidden w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      {/* Desktop stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Background connecting line */}
        <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200 -z-0" />

        {/* Active progress line */}
        <div
          className="absolute top-5 left-10 h-0.5 bg-primary transition-all duration-300 -z-0"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={step.title}
              onClick={() => isCompleted && onStepClick?.(stepNumber)}
              className={`flex flex-col items-center relative z-10 ${
                isCompleted ? 'cursor-pointer group' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 shadow-sm ${
                  isCompleted
                    ? 'bg-primary text-white ring-4 ring-blue-50'
                    : isCurrent
                    ? 'bg-accent text-white ring-4 ring-red-50 scale-105'
                    : 'bg-white text-gray-400 border-2 border-gray-300'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : stepNumber}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-bold transition-colors ${
                    isCurrent
                      ? 'text-gray-900'
                      : isCompleted
                      ? 'text-primary'
                      : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </p>
                {step.subtitle && (
                  <p className="text-[11px] text-gray-500 mt-0.5 hidden lg:block">
                    {step.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
