'use client'

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoicesDataTable } from "@/components/invoices-data-table";

// Mock Data
const currentPlan = {
  name: "Pro Plan",
  price: "$29/month",
  renewalDate: "September 20, 2024",
};

const paymentMethod = {
  brand: "Visa",
  last4: "4242",
};

const invoices = [
  {
    id: "INV-001",
    date: "2024-08-20",
    amount: "$29.00",
  },
  {
    id: "INV-002",
    date: "2024-07-20",
    amount: "$29.00",
  },
  {
    id: "INV-003",
    date: "2024-06-20",
    amount: "$29.00",
  },
];

export default function BillingPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-white">Billing</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-semibold text-white">{currentPlan.name}</p>
                  <p className="text-zinc-400">{currentPlan.price}</p>
                  <p className="text-sm text-zinc-500">Renews on {currentPlan.renewalDate}</p>
                </div>
                <Button>Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Invoice History</CardTitle>
              <CardDescription>View and download your past invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoicesDataTable data={invoices} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-2xl">💳</div>
                <div>
                  <p className="font-semibold text-white">{paymentMethod.brand} ending in {paymentMethod.last4}</p>
                  <p className="text-sm text-zinc-400">Expires 12/2025</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full">Update Payment Method</Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
