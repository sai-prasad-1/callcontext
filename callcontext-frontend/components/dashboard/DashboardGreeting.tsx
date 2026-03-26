"use client";

import { TestCallButton } from "@/components/debug/TestCallButton";

interface Props {
  userName: string;
}

export function DashboardGreeting({ userName }: Props) {
  const now = new Date();
  const hour = now.getHours();
  
  let greeting = "Good evening";
  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  }
  
  const firstName = userName.split(" ")[0] || userName;
  
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-800">
          {greeting}, {firstName}!
        </h1>
        <p className="text-warm-500 mt-1">{dateStr}</p>
      </div>
      <TestCallButton />
    </div>
  );
}
