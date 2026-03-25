"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

interface BusiestHoursHeatmapProps {
  data: number[][];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

export function BusiestHoursHeatmap({ data }: BusiestHoursHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    day: number;
    hour: number;
    count: number;
  } | null>(null);

  const maxValue = Math.max(...data.flat());

  const getColor = (count: number) => {
    if (count === 0) return "bg-warm-50";
    const intensity = Math.min((count / maxValue) * 100, 100);
    if (intensity < 20) return "bg-brand-100";
    if (intensity < 40) return "bg-brand-200";
    if (intensity < 60) return "bg-brand-300";
    if (intensity < 80) return "bg-brand-400";
    return "bg-brand-500";
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-warm-900">
          Busiest Hours Heatmap
        </h3>
        <p className="text-sm text-warm-600 mt-1">
          Call volume by day and hour
        </p>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex gap-1">
              <div className="flex flex-col gap-1">
                <div className="h-6" />
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="h-10 w-12 flex items-center justify-end pr-2 text-xs font-medium text-warm-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="flex-1">
                <div className="flex gap-1 mb-1">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 h-6 flex items-center justify-center text-xs font-medium text-warm-600"
                    >
                      {hour === 12 ? "12pm" : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-1">
                  {data.map((dayData, dayIndex) => (
                    <div key={dayIndex} className="flex gap-1">
                      {HOURS.map((hour) => {
                        const count = dayData[hour] || 0;
                        return (
                          <div
                            key={hour}
                            className={`flex-1 h-10 rounded border border-warm-200 transition-all duration-150 cursor-pointer hover:ring-2 hover:ring-brand-400 hover:scale-105 ${getColor(
                              count
                            )}`}
                            onMouseEnter={() =>
                              setHoveredCell({ day: dayIndex, hour, count })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {hoveredCell && (
              <div className="mt-4 p-3 bg-warm-50 rounded-lg text-sm">
                <span className="font-medium text-warm-900">
                  {DAYS[hoveredCell.day]},{" "}
                  {hoveredCell.hour === 12
                    ? "12pm"
                    : hoveredCell.hour > 12
                    ? `${hoveredCell.hour - 12}pm`
                    : `${hoveredCell.hour}am`}
                </span>
                <span className="text-warm-600 ml-2">
                  {hoveredCell.count} {hoveredCell.count === 1 ? "call" : "calls"}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
