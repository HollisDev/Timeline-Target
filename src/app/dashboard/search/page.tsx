'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Film, Search as SearchIcon } from 'lucide-react';

// Mock Data for Search Results
const searchResults = [
  {
    id: '1',
    thumbnail: '/assets/images/navbar-image-example.png',
    title: 'GeForce NOW Thursday - New Games, New Wins',
  },
];

export default function SearchPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">
          Search Your VODs
        </h1>

        <div className="relative mb-6 max-w-xl mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Search by keyword, topic, or quote..."
            className="w-full pl-12 pr-4 py-6 text-lg bg-zinc-800 border-zinc-700 text-white rounded-full focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Label htmlFor="date-range" className="text-white">
                Date Range
              </Label>
              <Select>
                <SelectTrigger
                  id="date-range"
                  className="w-[180px] bg-zinc-800 border-zinc-700 text-white"
                >
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="past-week">Past Week</SelectItem>
                  <SelectItem value="past-month">Past Month</SelectItem>
                  <SelectItem value="past-year">Past Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
              >
                Search in summaries
              </label>
            </div>
          </CardContent>
        </Card>

        <div>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {searchResults.map((vod) => (
                <Card
                  key={vod.id}
                  className="bg-zinc-900/50 border-zinc-800 overflow-hidden"
                >
                  <CardHeader className="p-0">
                    <div className="relative h-40 w-full bg-zinc-800 flex items-center justify-center">
                      <Film className="h-16 w-16 text-zinc-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-white text-base font-semibold truncate">
                      {vod.title}
                    </CardTitle>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold text-white mb-2">
                No Results Found
              </h2>
              <p className="text-zinc-400">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
