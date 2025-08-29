'use client'

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, X } from "lucide-react";
import Image from "next/image";

// Mock Data for Watchlist VODs
const watchlistVods = [
  {
    id: "2",
    thumbnail: "/assets/images/navbar-image-example.png",
    title: "The Future of Gaming with NVIDIA CEO",
  },
  {
    id: "3",
    thumbnail: "/assets/images/navbar-image-example.png",
    title: "Exploring the New Features of the RTX 4090",
  },
];

export default function WatchlistPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-white">My Watchlist</h1>
      
      {watchlistVods.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchlistVods.map((vod) => (
            <Card key={vod.id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative h-40 w-full bg-zinc-800 flex items-center justify-center">
                  <Film className="h-16 w-16 text-zinc-500" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-white text-base font-semibold truncate">{vod.title}</CardTitle>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                  <X className="mr-2 h-4 w-4" />
                  Remove from Watchlist
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-white mb-2">Your Watchlist is Empty</h2>
          <p className="text-zinc-400">Find VODs to save and watch later!</p>
        </div>
      )}
    </div>
  );
}
