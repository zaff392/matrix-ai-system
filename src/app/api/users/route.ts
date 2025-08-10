import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/user-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || undefined
    const role = searchParams.get('role') || undefined
    const isActive = searchParams.get('isActive') || undefined

    const result = await UserService.getAllUsers({
      page,
      limit,
      search,
      role: role as any,
      isActive: isActive === 'active' ? true : isActive === 'inactive' ? false : undefined
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role, isActive } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'L\'email est requis'
      }, { status: 400 })
    }

    const user = await UserService.createUser({
      email,
      name,
      role,
      isActive
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: user
    })

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}