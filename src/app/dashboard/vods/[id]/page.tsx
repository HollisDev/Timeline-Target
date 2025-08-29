'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Film, Search, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Mock Data
const vodDetail = {
  id: '1',
  title: 'The Future of Gaming with NVIDIA CEO',
  summary:
    'In this VOD, the CEO of NVIDIA discusses the future of gaming, including advancements in AI, ray tracing, and cloud gaming. Key announcements include the new RTX 50-series GPUs and updates to the GeForce NOW platform.',
  chapters: [
    { time: '00:00:00', title: 'Introduction' },
    { time: '00:05:23', title: 'The Vision for AI in Games' },
    { time: '00:15:45', title: 'RTX 50-Series Unveil' },
    { time: '00:35:10', title: 'GeForce NOW Updates' },
    { time: '01:05:00', title: 'Developer Q&A' },
  ],
  viralMoments: [
    {
      time: '00:18:30',
      description:
        'CEO pulls a "one more thing" moment, revealing a new handheld gaming device.',
      potential: 'Very High',
    },
    {
      time: '00:42:18',
      description:
        'A live demo of next-gen ray tracing results in a stunning visual showcase.',
      potential: 'High',
    },
  ],
};

export default function VodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [vodId, setVodId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setVodId(id);
    };
    getParams();
  }, [params]);
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/dashboard/my-vods" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My VODs
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4">
              <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
                <p className="text-zinc-400">Video player placeholder</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Tabs */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4">
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-4 bg-zinc-800 mb-4">
                  <TabsTrigger value="search">Search</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="chapters">Chapters</TabsTrigger>
                  <TabsTrigger value="viral">Viral Moments</TabsTrigger>
                </TabsList>

                <TabsContent value="search">
                  <div className="space-y-2">
                    <Input
                      placeholder="Search transcript..."
                      className="bg-zinc-800 border-zinc-700"
                    />
                    <Button size="sm" className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="summary">
                  <div className="text-zinc-300 space-y-2">
                    <h3 className="text-white font-semibold flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                      AI Summary
                    </h3>
                    <p>{vodDetail.summary}</p>
                  </div>
                </TabsContent>

                <TabsContent value="chapters">
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold flex items-center">
                      <Film className="w-4 h-4 mr-2 text-blue-400" />
                      AI Chapters
                    </h3>
                    <ul className="space-y-1 text-zinc-400">
                      {vodDetail.chapters.map((chapter) => (
                        <li
                          key={chapter.time}
                          className="cursor-pointer hover:text-white p-2 rounded-md hover:bg-zinc-800"
                        >
                          <span className="font-mono text-xs bg-zinc-700 px-1.5 py-0.5 rounded-sm mr-2">
                            {chapter.time}
                          </span>
                          {chapter.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="viral">
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                      Potential Viral Moments
                    </h3>
                    <ul className="space-y-3 text-zinc-400">
                      {vodDetail.viralMoments.map((moment) => (
                        <li
                          key={moment.time}
                          className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                        >
                          <p className="font-semibold text-white">
                            <span className="font-mono text-xs bg-zinc-700 px-1.5 py-0.5 rounded-sm mr-2">
                              {moment.time}
                            </span>
                            {moment.description}
                          </p>
                          <p className="text-xs mt-1">
                            Potential:{' '}
                            <span className="font-medium text-yellow-300">
                              {moment.potential}
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* VOD Info Panel */}
        <div className="space-y-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">VOD Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-300 space-y-2">
              <p>
                <strong>Title:</strong> {vodDetail.title}
              </p>
              <p>
                <strong>ID:</strong> {vodId}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
