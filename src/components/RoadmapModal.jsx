"use client";
import { useState } from "react";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
  StepperItemProvider,
} from "@/components/ui/stepper";

export default function RoadmapModal({ roadmap, onClose, onAccept }) {
  const [currentStep, setCurrentStep] = useState(1);

  if (!roadmap?.length) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            📅 Your Learning Roadmap
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6 text-sm text-neutral-400">
            Your personalized 7-day learning path to master this topic
          </div>

          <Stepper defaultValue={currentStep} orientation="vertical" className="space-y-0">
            {roadmap.map((item, index) => (
              <StepperItemProvider key={index} step={item.day}>
                <StepperItem 
                  step={item.day} 
                  className="not-last:pb-6"
                >
                  <div className="flex items-start gap-4 w-full">
                    <StepperTrigger>
                      <StepperIndicator />
                    </StepperTrigger>
                    
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">Day {item.day}</h3>
                        {item.est_hours && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-900/30 text-blue-400">
                            {item.est_hours}h
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-300 leading-relaxed">
                        {item.task}
                      </p>
                    </div>
                  </div>
                  {index < roadmap.length - 1 && (
                    <StepperSeparator className="ml-4" />
                  )}
                </StepperItem>
              </StepperItemProvider>
            ))}
          </Stepper>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-sm text-neutral-400">
            Total: {roadmap.reduce((acc, item) => acc + (item.est_hours || 0), 0)} hours over {roadmap.length} days
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-medium transition"
            >
              ✓ Accept Roadmap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
