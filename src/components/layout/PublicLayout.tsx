'use client'

import { GradientBars } from '@/components/ui/GradientBars'
import React from 'react'
import { RootLayout } from './RootLayout'

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <RootLayout>
      {children}
    </RootLayout>
  )
}

// Hero section component for landing pages
export function HeroSection({
  title,
  subtitle,
  children
}: {
  title: string
  subtitle?: string
  children?: React.ReactNode
}) {
  return (
    <div className="relative bg-black overflow-hidden">
      <GradientBars bars={25} colors={['#ffffff', 'transparent']} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-32 min-h-[80vh] flex items-center">
        <div className="text-center w-full">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

// Content section component
export function ContentSection({
  children,
  className = '',
  background = 'white'
}: {
  children: React.ReactNode
  className?: string
  background?: 'white' | 'gray'
}) {
  return (
    <div className={`${background === 'gray' ? 'bg-gray-50' : 'bg-white'} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {children}
      </div>
    </div>
  )
}

// Feature grid component
export function FeatureGrid({
  features
}: {
  features: Array<{
    title: string
    description: string
    icon: React.ReactNode
  }>
}) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <div key={index} className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              {feature.icon}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {feature.title}
          </h3>
          <p className="text-gray-600">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  )
}