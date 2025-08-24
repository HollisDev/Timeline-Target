// Database testing utilities for development
import { DatabaseService } from './database'

export class DatabaseTester {
  private db = new DatabaseService()

  async testConnection() {
    try {
      const user = await this.db.getUser()
      console.log('✅ Database connection successful')
      console.log('User:', user?.id, user?.email)
      return true
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      return false
    }
  }

  async testUserProfile() {
    try {
      const user = await this.db.getUser()
      if (!user) {
        console.log('❌ No authenticated user found')
        return false
      }

      // Try to get user profile
      const profile = await this.db.getUserProfile(user.id)
      console.log('✅ User profile retrieved:', profile)
      return true
    } catch (error) {
      console.error('❌ User profile test failed:', error)
      return false
    }
  }

  async testVODOperations() {
    try {
      const user = await this.db.getUser()
      if (!user) {
        console.log('❌ No authenticated user found')
        return false
      }

      // Test creating a VOD
      const testVOD = await this.db.createVOD(user.id, 'https://example.com/test-video.mp4')
      console.log('✅ VOD created:', testVOD)

      // Test getting user VODs
      const userVODs = await this.db.getUserVODs(user.id)
      console.log('✅ User VODs retrieved:', userVODs.length, 'VODs found')

      // Test updating VOD status
      const updatedVOD = await this.db.updateVODStatus(testVOD.id, 'processing')
      console.log('✅ VOD status updated:', updatedVOD)

      return true
    } catch (error) {
      console.error('❌ VOD operations test failed:', error)
      return false
    }
  }

  async testTranscriptOperations() {
    try {
      const user = await this.db.getUser()
      if (!user) {
        console.log('❌ No authenticated user found')
        return false
      }

      // Get a VOD to test with
      const userVODs = await this.db.getUserVODs(user.id)
      if (userVODs.length === 0) {
        console.log('❌ No VODs found for transcript testing')
        return false
      }

      const testVOD = userVODs[0]

      // Test creating transcripts
      const sampleTranscripts = [
        { content: 'Hello and welcome to this test video', timestamp: 0.0 },
        { content: 'This is a sample transcript for testing', timestamp: 5.5 },
        { content: 'We are testing the database functionality', timestamp: 12.3 }
      ]

      const createdTranscripts = await this.db.createTranscripts(
        testVOD.id,
        user.id,
        sampleTranscripts
      )
      console.log('✅ Transcripts created:', createdTranscripts.length, 'transcripts')

      // Test searching transcripts
      const searchResults = await this.db.searchTranscripts(testVOD.id, user.id, 'test')
      console.log('✅ Transcript search results:', searchResults.length, 'results found')

      return true
    } catch (error) {
      console.error('❌ Transcript operations test failed:', error)
      return false
    }
  }

  async runAllTests() {
    console.log('🧪 Starting database tests...\n')

    const results = {
      connection: await this.testConnection(),
      userProfile: await this.testUserProfile(),
      vodOperations: await this.testVODOperations(),
      transcriptOperations: await this.testTranscriptOperations()
    }

    console.log('\n📊 Test Results:')
    console.log('Connection:', results.connection ? '✅' : '❌')
    console.log('User Profile:', results.userProfile ? '✅' : '❌')
    console.log('VOD Operations:', results.vodOperations ? '✅' : '❌')
    console.log('Transcript Operations:', results.transcriptOperations ? '✅' : '❌')

    const allPassed = Object.values(results).every(result => result)
    console.log('\n🎯 Overall Result:', allPassed ? '✅ All tests passed' : '❌ Some tests failed')

    return results
  }
}

// Export a convenience function for quick testing
export async function testDatabase() {
  const tester = new DatabaseTester()
  return await tester.runAllTests()
}