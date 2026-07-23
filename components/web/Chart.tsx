'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ChartData {
  month: string;
  inquiries: number;
}

interface InquiryChartResponse {
  statusCode?: number;
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: unknown;
}

interface TooltipPayload {
  value: number | string;
  payload: ChartData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const fullMonthLabels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const emptyChartData: ChartData[] = monthLabels.map((month) => ({
  month,
  inquiries: 0,
}));

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('API base URL is not configured.');
  }

  return baseUrl.replace(/\/+$/, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function parseMonthIndex(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const month = Math.trunc(value);

    if (month >= 1 && month <= 12) {
      return month - 1;
    }

    if (month >= 0 && month <= 11) {
      return month;
    }
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  const numericMonth = Number(normalized);

  if (Number.isFinite(numericMonth)) {
    return parseMonthIndex(numericMonth);
  }

  const isoMonth = normalized.match(/^\d{4}[-/](\d{1,2})/);

  if (isoMonth?.[1]) {
    return parseMonthIndex(Number(isoMonth[1]));
  }

  const monthYear = normalized.match(/^(\d{1,2})[-/]\d{4}$/);

  if (monthYear?.[1]) {
    return parseMonthIndex(Number(monthYear[1]));
  }

  const shortMonthIndex = monthLabels.findIndex(
    (month) => month.toLowerCase() === normalized.slice(0, 3),
  );

  if (shortMonthIndex >= 0) {
    return shortMonthIndex;
  }

  return fullMonthLabels.findIndex((month) =>
    normalized.startsWith(month.toLowerCase()),
  );
}

function getRecordMonthIndex(record: Record<string, unknown>) {
  const monthKeys = [
    'month',
    'monthName',
    'month_name',
    'name',
    'label',
    'date',
    'createdAt',
    'created_at',
  ];

  for (const key of monthKeys) {
    const monthIndex = parseMonthIndex(record[key]);

    if (monthIndex !== null && monthIndex >= 0) {
      return monthIndex;
    }
  }

  if (isRecord(record._id)) {
    for (const key of monthKeys) {
      const monthIndex = parseMonthIndex(record._id[key]);

      if (monthIndex !== null && monthIndex >= 0) {
        return monthIndex;
      }
    }
  }

  return parseMonthIndex(record._id);
}

function getRecordInquiryCount(record: Record<string, unknown>) {
  const valueKeys = [
    'inquiries',
    'inquiry',
    'contactInquiries',
    'totalInquiries',
    'totalInquiry',
    'count',
    'total',
    'value',
  ];

  for (const key of valueKeys) {
    const count = toFiniteNumber(record[key]);

    if (count !== null) {
      return count;
    }
  }

  for (const [key, value] of Object.entries(record)) {
    if (
      [
        'year',
        'month',
        'monthName',
        'month_name',
        'name',
        'label',
        'date',
        'createdAt',
        'created_at',
        '_id',
      ].includes(key)
    ) {
      continue;
    }

    const count = toFiniteNumber(value);

    if (count !== null) {
      return count;
    }
  }

  return 0;
}

function extractChartSource(source: unknown): unknown {
  if (Array.isArray(source)) {
    return source;
  }

  if (!isRecord(source)) {
    return source;
  }

  const sourceKeys = [
    'data',
    'chartData',
    'chart',
    'charts',
    'inquiries',
    'inquiryChart',
    'inquiryData',
    'monthlyInquiries',
    'monthlyInquiry',
    'monthly',
    'months',
    'items',
    'records',
    'result',
  ];

  for (const key of sourceKeys) {
    if (Array.isArray(source[key])) {
      return source[key];
    }
  }

  for (const key of sourceKeys) {
    if (isRecord(source[key])) {
      return source[key];
    }
  }

  return source;
}

function normalizeChartData(source: unknown): ChartData[] {
  const monthTotals = Array.from({ length: 12 }, () => 0);
  const chartSource = extractChartSource(source);

  if (Array.isArray(chartSource)) {
    chartSource.forEach((item, index) => {
      const indexedCount = toFiniteNumber(item);

      if (indexedCount !== null) {
        if (index < monthTotals.length) {
          monthTotals[index] = Math.max(0, indexedCount);
        }

        return;
      }

      if (!isRecord(item)) {
        return;
      }

      const monthIndex = getRecordMonthIndex(item);

      if (monthIndex === null || monthIndex < 0 || monthIndex > 11) {
        return;
      }

      monthTotals[monthIndex] += Math.max(0, getRecordInquiryCount(item));
    });
  } else if (isRecord(chartSource)) {
    Object.entries(chartSource).forEach(([key, value]) => {
      const monthIndex = parseMonthIndex(key);

      if (monthIndex === null || monthIndex < 0 || monthIndex > 11) {
        return;
      }

      const count = isRecord(value)
        ? getRecordInquiryCount(value)
        : toFiniteNumber(value);

      monthTotals[monthIndex] = Math.max(0, count ?? 0);
    });
  }

  return monthLabels.map((month, index) => ({
    month,
    inquiries: monthTotals[index],
  }));
}

async function fetchInquiryChart(accessToken: string, year: number) {
  const response = await fetch(
    `${getApiBaseUrl()}/dashboard/inquiry-chart?year=${year}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  const payload: InquiryChartResponse | null = await response
    .json()
    .catch(() => null);
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false;

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        'Inquiry chart data could not be loaded. Please try again.',
    );
  }

  return normalizeChartData(payload?.data ?? payload);
}

function getYearOptions(currentYear: number) {
  return Array.from({ length: 4 }, (_, index) => currentYear - 3 + index);
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function getNiceStep(maxValue: number) {
  if (maxValue <= 5) {
    return 1;
  }

  if (maxValue <= 10) {
    return 2;
  }

  if (maxValue <= 25) {
    return 5;
  }

  if (maxValue <= 50) {
    return 10;
  }

  if (maxValue <= 100) {
    return 20;
  }

  if (maxValue <= 250) {
    return 50;
  }

  if (maxValue <= 500) {
    return 100;
  }

  return Math.ceil(maxValue / 500) * 100;
}

function getYAxisTicks(maxValue: number) {
  const step = getNiceStep(maxValue);
  const maxTick = step * 5;

  return {
    maxTick,
    ticks: Array.from({ length: 6 }, (_, index) => index * step),
  };
}

function InquiriesChartSkeleton() {
  return (
    <div className="h-[475px] w-full animate-pulse rounded-lg">
      <div className="flex h-full">
        <div className="flex w-9 shrink-0 flex-col justify-between pb-9 pt-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-2 w-5 rounded bg-[#C6DEDB]"
            />
          ))}
        </div>

        <div className="relative h-full flex-1 pb-9 pt-3">
          <div className="absolute inset-x-0 bottom-9 top-3 flex flex-col justify-between">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-px bg-[#D5E4E2]" />
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-9 top-3">
            <svg
              viewBox="0 0 1000 360"
              preserveAspectRatio="none"
              className="h-full w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="inquiriesSkeletonFill"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#8CCAC9" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#8CCAC9" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <path
                d="M0 275 C80 250 135 260 210 220 C285 180 360 210 440 160 C520 110 600 120 675 150 C750 180 835 130 1000 95 L1000 360 L0 360 Z"
                fill="url(#inquiriesSkeletonFill)"
              />
              <path
                d="M0 275 C80 250 135 260 210 220 C285 180 360 210 440 160 C520 110 600 120 675 150 C750 180 835 130 1000 95"
                fill="none"
                stroke="#8CCAC9"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="absolute bottom-0 left-0 right-0 grid grid-cols-12 gap-1.5">
            {monthLabels.map((month) => (
              <div key={month} className="mx-auto h-2 w-5 rounded bg-[#C6DEDB]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[475px] items-center justify-center rounded-lg border border-[#D8E6E4] bg-white/45 p-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-[#D9EAE8] text-[#007066]">
          <AlertCircle className="size-5" />
        </div>
        <h4 className="text-lg font-semibold text-[#000000]">{title}</h4>
        <p className="mt-2 text-sm leading-6 text-[#637574]">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

export function InquiriesChart() {
  const [currentYear, setCurrentYear] = useState(getCurrentYear);
  const [selectedYear, setSelectedYear] = useState(getCurrentYear);
  const yearOptions = useMemo(() => getYearOptions(currentYear), [currentYear]);
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;

  useEffect(() => {
    const syncCurrentYear = () => {
      const nextYear = getCurrentYear();

      setCurrentYear((previousYear) => {
        if (previousYear === nextYear) {
          return previousYear;
        }

        setSelectedYear((previousSelectedYear) =>
          previousSelectedYear === previousYear ? nextYear : previousSelectedYear,
        );

        return nextYear;
      });
    };

    syncCurrentYear();
    const intervalId = window.setInterval(syncCurrentYear, 60 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const chartQuery = useQuery({
    queryKey: ['dashboard-inquiry-chart', selectedYear],
    queryFn: () => fetchInquiryChart(accessToken as string, selectedYear),
    enabled: status === 'authenticated' && Boolean(accessToken),
    retry: 1,
    staleTime: 60_000,
  });

  const chartData = chartQuery.data ?? emptyChartData;
  const maxInquiries = chartData.reduce(
    (maxValue, item) => Math.max(maxValue, item.inquiries),
    0,
  );
  const { maxTick, ticks } = getYAxisTicks(Math.max(5, maxInquiries));
  const hasChartData = chartData.some((item) => item.inquiries > 0);
  const isTokenMissing = status === 'authenticated' && !accessToken;
  const isChartLoading =
    status === 'loading' ||
    (status === 'authenticated' &&
      Boolean(accessToken) &&
      (chartQuery.isLoading || chartQuery.isFetching));

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded border border-[#D6E4E2] bg-white px-2 py-1 shadow-sm">
          <p className="text-[10px] font-medium text-[#3D4A4A]">
            {payload[0].payload.month} {selectedYear}
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
    <div className="overflow-hidden rounded-lg bg-[#0070660D] px-5 pb-5 pt-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-2xl font-semibold leading-none text-[#000000]">
          Inquiries
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {yearOptions.map((year) => (
            <button
              key={year}
              type="button"
              aria-pressed={selectedYear === year}
              onClick={() => setSelectedYear(year)}
              className={`h-[28px] min-w-[58px] rounded-full border px-3 text-[12px] font-medium leading-none transition-colors ${
                selectedYear === year
                  ? 'border-[#007066] bg-[#007066] text-white'
                  : 'border-[#7B8B8A] bg-transparent text-[#374847] hover:bg-white/40'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {isChartLoading ? (
        <InquiriesChartSkeleton />
      ) : isTokenMissing ? (
        <ChartState
          title="Chart data unavailable"
          description="Your session token was not found. Please log in again to load inquiry chart data."
        />
      ) : chartQuery.isError ? (
        <ChartState
          title="Chart data unavailable"
          description={
            chartQuery.error instanceof Error
              ? chartQuery.error.message
              : 'Inquiry chart data could not be loaded. Please try again.'
          }
          action={
            <button
              type="button"
              onClick={() => chartQuery.refetch()}
              className="h-10 rounded-lg bg-[#007066] px-5 text-sm font-semibold text-white transition hover:bg-[#006059]"
            >
              Try again
            </button>
          }
        />
      ) : !hasChartData ? (
        <ChartState
          title={`No inquiry data for ${selectedYear}`}
          description="Inquiry totals will appear here once data is available for the selected year."
        />
      ) : (
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
                dataKey="month"
                tick={{ fill: '#4F6261', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                minTickGap={0}
                tickMargin={6}
              />
              <YAxis
                type="number"
                domain={[0, maxTick]}
                ticks={ticks}
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
                baseValue={0}
                dot={false}
                activeDot={{ r: 2.5, fill: '#007066', strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
