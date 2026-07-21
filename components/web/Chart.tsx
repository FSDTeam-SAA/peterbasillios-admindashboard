'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  x: number;
  month: string;
  inquiries: number;
}

interface TooltipPayload {
  value: number | string;
  payload: ChartData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const monthTicks = [
  { x: 0, label: 'Jan' },
  { x: 1, label: 'Feb' },
  { x: 2, label: 'Mar' },
  { x: 3, label: 'Apr' },
  { x: 4, label: 'May' },
  { x: 5, label: 'Jun' },
  { x: 6, label: 'Jul' },
  { x: 7, label: 'Aug' },
  { x: 8, label: 'Sep' },
  { x: 9, label: 'Oct' },
  { x: 10, label: 'Nov' },
  { x: 11, label: 'Dec' },
];

const yTicks = [10, 20, 50, 100, 200, 500];

const inquiryValues = [
  38, 38, 39, 39, 41, 43, 44, 45, 47, 47, 48, 49,
  49, 54, 54, 50, 49, 51, 52, 51, 53, 52, 58, 60,
  57, 61, 61, 66, 61, 61, 63, 59, 65, 66, 69, 72,
  75, 70, 72, 69, 75, 73, 80, 77, 77, 78, 72, 76,
  70, 70, 67, 72, 74, 81, 84, 84, 83, 86, 85, 88,
  91, 96, 99, 100, 96, 102, 98, 108, 116, 112, 117, 117,
  118, 122, 121, 128, 127, 138, 137, 131, 128, 136, 130, 129,
];

const chartData: ChartData[] = inquiryValues.map((inquiries, index) => {
  const x = (index / (inquiryValues.length - 1)) * 11.75;
  const monthIndex = Math.min(11, Math.floor(x));

  return {
    x,
    month: monthTicks[monthIndex].label,
    inquiries,
  };
});

export function InquiriesChart() {
  const [timePeriod, setTimePeriod] = useState('1Y');

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded border border-[#D6E4E2] bg-white px-2 py-1 shadow-sm">
          <p className="text-[10px] font-medium text-[#3D4A4A]">
            {payload[0].payload.month}
          </p>
          <p className="text-[10px] font-semibold text-[#007066]">
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="overflow-hidden  rounded-lg bg-[#0070660D] px-5 pb-2 pt-6">
      <div className="mb-6 flex items-start justify-between">
        <h3 className="text-2xl font-semibold leading-none text-[#000000]">
          Inquiries
        </h3>
        <div className="flex items-center gap-1.5">
          {['1M', '3M', '6M', '1Y'].map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`h-[22px] min-w-[43px] rounded-full border px-2 text-[12px] font-medium leading-none transition-colors ${
                timePeriod === period
                  ? 'border-[#007066] bg-[#007066] text-white'
                  : 'border-[#7B8B8A] bg-transparent text-[#374847] hover:bg-white/40'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[475px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 14, right: 0, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient id="inquiriesFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8CCAC9" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#8CCAC9" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#D5E4E2"
              vertical={false}
              strokeWidth={1}
            />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 11.75]}
              ticks={monthTicks.map((tick) => tick.x)}
              tickFormatter={(value) =>
                monthTicks.find((tick) => tick.x === value)?.label ?? ''
              }
              tick={{ fill: '#4F6261', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              minTickGap={0}
              tickMargin={6}
            />
            <YAxis
              type="number"
              scale="log"
              domain={[10, 500]}
              ticks={yTicks}
              tickFormatter={(value) => `${value}`}
              tick={{ fill: '#4F6261', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={36}
              tickMargin={6}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#86BDBA', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="inquiries"
              stroke="#0A8D8E"
              strokeWidth={1.15}
              fill="url(#inquiriesFill)"
              fillOpacity={1}
              baseValue={10}
              dot={false}
              activeDot={{ r: 2.5, fill: '#007066', strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
