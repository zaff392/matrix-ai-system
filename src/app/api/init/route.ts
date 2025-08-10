import { NextRequest, NextResponse } from 'next/server'
import { InitService } from '@/lib/init-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { force = false } = body

    // Vérifier si l'initialisation est nécessaire
    const needsInit = await InitService.needsInitialization()
    
    if (!needsInit && !force) {
      return NextResponse.json({
        success: false,
        message: 'L\'initialisation n\'est pas nécessaire. Les données existent déjà.',
        status: 'already_initialized'
      })
    }

    // Exécuter l'initialisation
    await InitService.initialize()

    // Récupérer le statut après initialisation
    const status = await InitService.getInitializationStatus()

    return NextResponse.json({
      success: true,
      message: 'Initialisation terminée avec succès',
      status
    })

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de l\'initialisation',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const status = await InitService.getInitializationStatus()
    
    return NextResponse.json({
      success: true,
      status
    })
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la vérification du statut',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}