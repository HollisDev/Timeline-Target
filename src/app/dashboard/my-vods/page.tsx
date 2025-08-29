'use client'

import { VodsDataTable } from "@/components/vods-data-table";

// Mock Data for VODs
const vods = [
  {
    id: "1",
    thumbnail: "/assets/images/navbar-image-example.png",
    title: "GeForce NOW Thursday - New Games, New Wins",
    uploadDate: "2024-08-20",
    views: 1204,
  },
  {
    id: "2",
    thumbnail: "/assets/images/navbar-image-example.png",
    title: "The Future of Gaming with NVIDIA CEO",
    uploadDate: "2024-08-18",
    views: 5832,
  },
  {
    id: "3",
    thumbnail: "/assets/images/navbar-image-example.png",
    title: "Exploring the New Features of the RTX 4090",
    uploadDate: "2024-08-15",
    views: 987,
  },
];

export default function MyVodsPage() {
  return (
    <div className="container mx-auto py-10">
      <VodsDataTable data={vods} />
    </div>
  );
}
