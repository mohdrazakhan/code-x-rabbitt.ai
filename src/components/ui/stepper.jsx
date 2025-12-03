"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const StepperContext = React.createContext({
  value: 1,
  orientation: "horizontal",
});

export function Stepper({ 
  defaultValue = 1, 
  orientation = "horizontal",
  children,
  className 
}) {
  return (
    <StepperContext.Provider value={{ value: defaultValue, orientation }}>
      <div 
        className={cn(
          "flex gap-2",
          orientation === "vertical" ? "flex-col" : "items-center",
          className
        )}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

export function StepperItem({ step, children, className }) {
  const { orientation } = React.useContext(StepperContext);
  
  return (
    <div 
      className={cn(
        "flex items-center gap-2",
        orientation === "vertical" && "flex-col items-start",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StepperTrigger({ children, className }) {
  return (
    <div className={cn("flex items-center", className)}>
      {children}
    </div>
  );
}

export function StepperIndicator({ className }) {
  const context = React.useContext(StepperContext);
  const step = React.useContext(StepperItemContext);
  const isActive = step <= context.value;
  
  return (
    <div 
      className={cn(
        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors",
        isActive 
          ? "bg-blue-600 border-blue-600 text-white" 
          : "bg-neutral-900 border-neutral-700 text-neutral-400",
        className
      )}
    >
      {isActive && step < context.value ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        step
      )}
    </div>
  );
}

export function StepperSeparator({ className }) {
  const { orientation } = React.useContext(StepperContext);
  
  return (
    <div 
      className={cn(
        "bg-neutral-700",
        orientation === "vertical" ? "w-0.5 h-8 ml-4" : "h-0.5 flex-1",
        className
      )}
    />
  );
}

const StepperItemContext = React.createContext(1);

export function StepperItemProvider({ step, children }) {
  return (
    <StepperItemContext.Provider value={step}>
      {children}
    </StepperItemContext.Provider>
  );
}
