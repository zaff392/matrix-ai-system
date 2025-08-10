import { NextResponse } from 'next/server'
import { UserService } from '@/lib/user-service'

export async function GET() {
  try {
    const stats = await UserService.getUserStats()

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}