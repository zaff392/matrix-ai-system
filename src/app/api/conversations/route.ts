import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/conversations - Récupérer les conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const agentId = searchParams.get('agentId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const isActive = searchParams.get('isActive')

    // Construire la clause where
    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (agentId) {
      where.agentId = agentId
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    // Récupérer les conversations
    const conversations = await db.conversation.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        agent: {
          select: { id: true, name: true, emoji: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 5 // Limiter aux 5 derniers messages pour la prévisualisation
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Compter le total
    const total = await db.conversation.count({ where })

    return NextResponse.json({
      success: true,
      data: conversations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des conversations' },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Créer une nouvelle conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Valider les données requises
    const { userId, agentId, title } = body

    if (!userId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'Les champs userId et agentId sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur et l'agent existent
    const [user, agent] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.agent.findUnique({ where: { id: agentId } })
    ])

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent non trouvé' },
        { status: 404 }
      )
    }

    // Créer la conversation
    const conversation = await db.conversation.create({
      data: {
        userId,
        agentId,
        title: title || `Conversation avec ${agent.name}`
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        agent: {
          select: { id: true, name: true, emoji: true }
        }
      }
    })

    console.log(`💬 Conversation created: ${conversation.id} between user ${userId} and agent ${agentId}`)

    return NextResponse.json({
      success: true,
      data: conversation,
      message: 'Conversation créée avec succès'
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la conversation' },
      { status: 500 }
    )
  }
}