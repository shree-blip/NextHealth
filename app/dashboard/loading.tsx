import LoadingScreen from '@/components/LoadingScreen';

// This file is automatically rendered by Next.js App Router
// while the dashboard page (and its data) is loading.
// It prevents the blank screen between login and the dashboard being ready.
export default function DashboardLoading() {
  return <LoadingScreen durationMs={8000} />;
}
