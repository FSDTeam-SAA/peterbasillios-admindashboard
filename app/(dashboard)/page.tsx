'use client';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { InquiriesChart } from '@/components/web/Chart';
import { StatCard } from '@/components/web/StatCard';
import { StatCardSkeleton } from '@/components/web/StatCardSkeleton';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  FolderOpen,
  Image as ImageIcon,
  Package,
  MessageCircle,
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

type DashboardOverview = {
  totalProjects: number;
  totalImages: number;
  totalService: number;
  contactInquiries: number;
};

type DashboardOverviewResponse = {
  statusCode?: number;
  success?: boolean;
  status?: boolean;
  message?: string;
  data?: Partial<DashboardOverview> | null;
};

const statConfig = [
  {
    key: 'totalProjects',
    icon: <FolderOpen size={32} />,
    label: 'Total Projects',
  },
  {
    key: 'totalImages',
    icon: <ImageIcon size={32} />,
    label: 'Total Images',
  },
  {
    key: 'totalService',
    icon: <Package size={32} />,
    label: 'Total Service',
  },
  {
    key: 'contactInquiries',
    icon: <MessageCircle size={32} />,
    label: 'Contact Inquiries',
  },
] as const;

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('API base URL is not configured.');
  }

  return baseUrl.replace(/\/+$/, '');
}

function normalizeCount(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizeOverview(data?: Partial<DashboardOverview> | null) {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return {
    totalProjects: normalizeCount(data.totalProjects),
    totalImages: normalizeCount(data.totalImages),
    totalService: normalizeCount(data.totalService),
    contactInquiries: normalizeCount(data.contactInquiries),
  };
}

async function fetchDashboardOverview(accessToken: string) {
  const response = await fetch(`${getApiBaseUrl()}/dashboard/overview`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  const payload: DashboardOverviewResponse | null = await response
    .json()
    .catch(() => null);
  const hasExplicitFailure =
    payload?.success === false || payload?.status === false;

  if (!response.ok || hasExplicitFailure) {
    throw new Error(
      payload?.message?.trim() ||
        'Dashboard overview could not be loaded. Please try again.',
    );
  }

  return normalizeOverview(payload?.data);
}

function OverviewState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="col-span-1 rounded-lg border border-[#D8E6E4] bg-[#0070660D] p-6 md:col-span-2 lg:col-span-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#D9EAE8] text-[#007066]">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#000000]">{title}</h2>
            <p className="mt-1 text-base leading-6 text-[#7D7D7D]">
              {description}
            </p>
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}

export default function Page() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;

  const overviewQuery = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => fetchDashboardOverview(accessToken as string),
    enabled: status === 'authenticated' && Boolean(accessToken),
    retry: 1,
    staleTime: 60_000,
  });

  const isTokenMissing = status === 'authenticated' && !accessToken;
  const isOverviewLoading =
    status === 'loading' ||
    (status === 'authenticated' && Boolean(accessToken) && overviewQuery.isLoading);
  const overviewStats = useMemo(
    () => {
      const overview = overviewQuery.data;

      if (!overview) {
        return [];
      }

      return statConfig.map((item) => ({
        ...item,
        value: overview[item.key],
      }));
    },
    [overviewQuery.data],
  );

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      <div className="w-full">
        <motion.div
          variants={containerVariants}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {isOverviewLoading &&
            statConfig.map((item) => (
              <motion.div key={item.key} variants={itemVariants}>
                <StatCardSkeleton />
              </motion.div>
            ))}

          {!isOverviewLoading && (overviewQuery.isError || isTokenMissing) && (
            <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-4">
              <OverviewState
                title="Overview data unavailable"
                description={
                  isTokenMissing
                    ? 'Your session token was not found. Please log in again to load dashboard metrics.'
                    : overviewQuery.error instanceof Error
                      ? overviewQuery.error.message
                      : 'Dashboard overview could not be loaded. Please try again.'
                }
                action={
                  !isTokenMissing ? (
                    <Button
                      type="button"
                      onClick={() => overviewQuery.refetch()}
                      className="h-11 rounded-lg bg-[#007066] px-6 text-base font-semibold text-white hover:bg-[#006059]"
                    >
                      Try again
                    </Button>
                  ) : undefined
                }
              />
            </motion.div>
          )}

          {!isOverviewLoading &&
            !overviewQuery.isError &&
            !isTokenMissing &&
            !overviewQuery.data && (
              <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-4">
                <OverviewState
                  title="No overview data yet"
                  description="Your dashboard metrics will appear here once projects, images, services, or inquiries are added."
                />
              </motion.div>
            )}

          {!isOverviewLoading &&
            !overviewQuery.isError &&
            !isTokenMissing &&
            overviewStats.map((item) => (
              <motion.div key={item.key} variants={itemVariants}>
                <StatCard
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  backgroundColor="bg-[#0070660D]"
                  iconColor="text-[#007066]"
                />
              </motion.div>
            ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <InquiriesChart />
        </motion.div>
      </div>
    </motion.main>
  );
}
