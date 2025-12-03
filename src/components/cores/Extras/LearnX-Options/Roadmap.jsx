"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/apiService";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";

export default function Roadmap({ language }) {
  const [roadmap, setRoadmap] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!language) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiService.getRoadmap({
          language,
          skillLevel: "beginner"
        });
        setRoadmap(result.roadmap || []);
      } catch (err) {
        console.error("Failed to fetch roadmap:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmap();
  }, [language]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-400 text-sm">Loading roadmap...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400 text-sm">Error: {error}</div>
      </div>
    );
  }

  if (!roadmap || roadmap.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-500 text-sm">No roadmap available</div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-zinc-100 mb-2">
          Learning Roadmap
        </h3>
        <p className="text-sm text-zinc-400">
          Your personalized path to mastering {language}
        </p>
      </div>

      <Stepper 
        defaultValue={currentStep} 
        orientation="vertical"
        className="space-y-4"
      >
        {roadmap.map((step, index) => (
          <StepperItem 
            className="not-last:flex-1" 
            key={index} 
            step={index + 1}
          >
            <StepperTrigger 
              className="flex items-start gap-4 cursor-pointer hover:bg-zinc-800/50 p-2 rounded-lg transition-colors"
              onClick={() => setCurrentStep(index + 1)}
            >
              <StepperIndicator className="h-8 w-8 flex items-center justify-center rounded-full border-2 bg-zinc-900 border-zinc-600 data-[state=active]:bg-blue-600 data-[state=active]:border-blue-600 data-[state=completed]:bg-green-600 data-[state=completed]:border-green-600">
                <span className="text-xs font-medium text-zinc-300 data-[state=active]:text-white data-[state=completed]:text-white">
                  {index + 1}
                </span>
              </StepperIndicator>
              
              <div className="flex-1 text-left">
                <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <h4 className="font-medium text-zinc-100 mb-2">
                    Day {step.day || index + 1}: {step.title || step.task || "Learning Task"}
                  </h4>
                  
                  <p className="text-sm text-zinc-400 mb-3">
                    {step.description || step.details || "Complete this learning milestone"}
                  </p>
                  
                  {step.topics && step.topics.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-zinc-500 mb-1">Topics:</div>
                      <div className="flex flex-wrap gap-1">
                        {step.topics.map((topic, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {step.est_hours && (
                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Estimated time: {step.est_hours} hour{step.est_hours !== 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </StepperTrigger>
            {index < roadmap.length - 1 && (
              <StepperSeparator className="h-8 w-0.5 bg-zinc-700 mx-6" />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  );
}