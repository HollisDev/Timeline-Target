'use client'

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Video, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for Notifications
const notifications = [
  {
    id: 1,
    type: "vod-complete",
    message: "Your VOD 'The Future of Gaming' has finished processing.",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "new-feature",
    message: "Viral Moments detection is now available for Pro users.",
    timestamp: "1 day ago",
    read: false,
  },
  {
    id: 3,
    type: "credit-update",
    message: "You have 5 processing credits remaining.",
    timestamp: "3 days ago",
    read: true,
  },
  {
    id: 4,
    type: "vod-complete",
    message: "Your VOD 'GeForce NOW Thursday' has finished processing.",
    timestamp: "5 days ago",
    read: true,
  },
];

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "vod-complete":
      return <Video className="h-5 w-5 text-white" />;
    case "new-feature":
      return <Bell className="h-5 w-5 text-white" />;
    case "credit-update":
      return <Check className="h-5 w-5 text-white" />;
    default:
      return <Bell className="h-5 w-5 text-white" />;
  }
};

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <Button variant="outline">
          <Check className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-zinc-800 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-0">
            <TabsContent value="all" className="m-0">
              <div className="divide-y divide-zinc-800">
                {notifications.map(notification => (
                  <div key={notification.id} className={cn("flex items-start gap-4 p-4", !notification.read && "bg-zinc-800/50")}>
                    {!notification.read && <div className="h-2 w-2 rounded-full bg-white mt-2 flex-shrink-0"></div>}
                    <div className={cn("flex-shrink-0", notification.read && "ml-4")}>
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex-grow">
                      <p className="text-white">{notification.message}</p>
                      <p className="text-sm text-zinc-400 mt-1">{notification.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <div className="divide-y divide-zinc-800">
                {notifications.filter(n => !n.read).map(notification => (
                  <div key={notification.id} className="flex items-start gap-4 p-4 bg-zinc-800/50">
                    <div className="h-2 w-2 rounded-full bg-white mt-2 flex-shrink-0"></div>
                    <div className="flex-shrink-0">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex-grow">
                      <p className="text-white">{notification.message}</p>
                      <p className="text-sm text-zinc-400 mt-1">{notification.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
