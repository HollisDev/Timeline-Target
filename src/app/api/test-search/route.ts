import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement test search functionality
    // This route is for testing search functionality

    return NextResponse.json({
      success: true,
      message: 'Test search endpoint - not yet implemented',
      results: []
    })

  } catch (error) {
    console.error('Unexpected error in test search:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
