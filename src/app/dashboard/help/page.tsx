'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

const faqs = [
  {
    question: "How does the credit system work?",
    answer: "Our platform operates on a credit-based system. You receive free credits upon signing up. One credit allows you to process one hour of video content. You can purchase more credits from the Billing page."
  },
  {
    question: "What video formats and platforms are supported?",
    answer: "We support direct video uploads in MP4, MOV, and AVI formats. You can also submit video URLs from platforms like YouTube and Vimeo."
  },
  {
    question: "How long does it take to process a VOD?",
    answer: "Processing time depends on the length of the video and current server load. Typically, a one-hour video is processed within 15-30 minutes. You will receive a notification once it's complete."
  },
  {
    question: "Can I search for exact phrases?",
    answer: "Yes, our search functionality supports keyword and exact phrase matching. Simply enclose your phrase in double quotes (e.g., \"the future of gaming\") to search for that exact sequence."
  },
];

export default function HelpPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-white">Get Help</h1>
      <div className="grid gap-8 md:grid-cols-3">
        
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-zinc-800">
                <AccordionTrigger className="text-white hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-zinc-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Contact Support</CardTitle>
              <CardDescription>Can't find the answer you're looking for?</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-300">Our support team is here to help. Reach out to us via email for any questions or issues.</p>
              <a href="mailto:support@example.com" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-4 bg-white text-black hover:bg-gray-200">
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </a>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}