'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Star, Upload, Video } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Lazy load the chart component
const DashboardChart = dynamic(
  () => import('@/components/dashboard/DashboardChart'),
  {
    loading: () => (
      <div className="h-64 w-full bg-zinc-800/50 rounded-lg animate-pulse" />
    ),
    ssr: false,
  }
);

// Mock Data
const stats = {
  totalVods: 24,
  totalViews: '12.8k',
  watchlistItems: 9,
};

const recentVods = [
  {
    id: '1',
    title: 'The Future of Gaming with NVIDIA CEO',
    uploadDate: '2024-08-18',
  },
  {
    id: '2',
    title: 'Exploring the New Features of the RTX 4090',
    uploadDate: '2024-08-15',
  },
  {
    id: '3',
    title: 'GeForce NOW Thursday - New Games, New Wins',
    uploadDate: '2024-08-20',
  },
  {
    id: '4',
    title: 'How to Optimize Your Stream for Low Latency',
    uploadDate: '2024-08-12',
  },
  { id: '5', title: 'Top 5 Plays of the Week', uploadDate: '2024-08-10' },
];

const chartData = [
  { month: 'Jan', views: 1200, uploads: 3 },
  { month: 'Feb', views: 1800, uploads: 5 },
  { month: 'Mar', views: 2200, uploads: 4 },
  { month: 'Apr', views: 2800, uploads: 6 },
  { month: 'May', views: 3200, uploads: 7 },
  { month: 'Jun', views: 3800, uploads: 8 },
  { month: 'Jul', views: 4200, uploads: 9 },
  { month: 'Aug', views: 4800, uploads: 10 },
];

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-zinc-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-white">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard title="Total VODs" value={stats.totalVods} icon={Video} />
        <StatCard title="Total Views" value={stats.totalViews} icon={Eye} />
        <StatCard
          title="Watchlist Items"
          value={stats.watchlistItems}
          icon={Star}
        />
      </div>

      {/* Analytics Chart */}
      <div className="mb-6">
        <DashboardChart data={chartData} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent VODs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-white">Title</TableHead>
                  <TableHead className="text-white">Upload Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVods.map((vod) => (
                  <TableRow key={vod.id} className="border-zinc-800">
                    <TableCell className="font-medium text-white">
                      {vod.title}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {vod.uploadDate}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Link href="/dashboard/my-vods" passHref>
              <Button className="w-full bg-white text-black hover:bg-gray-200">
                <Upload className="mr-2 h-4 w-4" />
                Upload New VOD
              </Button>
            </Link>
            <p className="text-sm text-zinc-400 text-center">
              Start a new project by uploading your first VOD.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
