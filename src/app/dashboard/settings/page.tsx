'use client'

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-white">Settings</h1>
      <Tabs defaultValue="profile" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Profile</CardTitle>
              <CardDescription>Update your personal information here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input id="name" defaultValue="Your Name" className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input id="email" type="email" defaultValue="your.email@example.com" className="bg-zinc-800 border-zinc-700 text-white" disabled />
                <p className="text-xs text-zinc-400">Email cannot be changed.</p>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-zinc-700 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode" className="text-white">Dark Mode</Label>
                  <CardDescription>Toggle between light and dark themes.</CardDescription>
                </div>
                <Switch id="dark-mode" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Notifications</CardTitle>
              <CardDescription>Manage your email notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-zinc-700 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="vod-completed" className="text-white">VOD Processing Completed</Label>
                  <CardDescription>Receive an email when your VOD is ready.</CardDescription>
                </div>
                <Switch id="vod-completed" defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-700 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="promotions" className="text-white">Promotions & Updates</Label>
                  <CardDescription>Receive emails about new features and promotions.</CardDescription>
                </div>
                <Switch id="promotions" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}