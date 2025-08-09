import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/agents/[id]/memory - Récupérer la mémoire d'un agent
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = searchParams.get('userId')

    const agentId = params.id

    // Vérifier si l'agent existe
    const agent = await db.agent.findUnique({
      where: { id: agentId }
    })

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent non trouvé' },
        { status: 404 }
      )
    }

    // Construire la clause where
    const where: any = {
      agentId
    }

    if (type) {
      where.type = type
    }

    if (userId) {
      where.userId = userId
    }

    // Récupérer les mémoires
    const memories = await db.memory.findMany({
      where,
      orderBy: [
        { importance: 'desc' },
        { lastAccessed: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    // Compter le total
    const total = await db.memory.count({ where })

    return NextResponse.json({
      success: true,
      data: memories,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la mémoire:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la mémoire' },
      { status: 500 }
    )
  }
}

// POST /api/agents/[id]/memory - Créer une nouvelle mémoire
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const agentId = params.id

    // Vérifier si l'agent existe
    const agent = await db.agent.findUnique({
      where: { id: agentId }
    })

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent non trouvé' },
        { status: 404 }
      )
    }

    // Valider les données requises
    const { type, title, content, userId, tags, importance } = body

    if (!type || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Les champs type, title et content sont requis' },
        { status: 400 }
      )
    }

    // Créer la mémoire
    const memory = await db.memory.create({
      data: {
        agentId,
        userId: userId || null,
        type,
        title,
        content,
        tags: tags ? JSON.stringify(tags) : null,
        importance: importance || 1,
        lastAccessed: new Date()
      }
    })

    console.log(`💾 Memory created for agent ${agentId}:`, {
      type,
      title,
      importance
    })

    return NextResponse.json({
      success: true,
      data: memory,
      message: 'Mémoire créée avec succès'
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la mémoire:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la mémoire' },
      { status: 500 }
    )
  }
}

// PUT /api/agents/[id]/memory - Mettre à jour des mémoires
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const agentId = params.id

    // Vérifier si l'agent existe
    const agent = await db.agent.findUnique({
      where: { id: agentId }
    })

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent non trouvé' },
        { status: 404 }
      )
    }

    const { memoryIds, updates } = body

    if (!memoryIds || !Array.isArray(memoryIds) || memoryIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'memoryIds est requis et doit être un tableau' },
        { status: 400 }
      )
    }

    // Mettre à jour les mémoires
    const updatedMemories = await db.memory.updateMany({
      where: {
        id: { in: memoryIds },
        agentId
      },
      data: {
        ...updates,
        updatedAt: new Date(),
        // Si on accède à la mémoire, incrémenter le compteur
        ...(updates.lastAccessed && { accessCount: { increment: 1 } })
      }
    })

    console.log(`🔄 Updated ${updatedMemories.count} memories for agent ${agentId}`)

    return NextResponse.json({
      success: true,
      data: { updatedCount: updatedMemories.count },
      message: `${updatedMemories.count} mémoires mises à jour avec succès`
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour des mémoires:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des mémoires' },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id]/memory - Supprimer des mémoires
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const memoryIds = searchParams.get('memoryIds')?.split(',').filter(Boolean)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    const agentId = params.id

    // Vérifier si l'agent existe
    const agent = await db.agent.findUnique({
      where: { id: agentId }
    })

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent non trouvé' },
        { status: 404 }
      )
    }

    // Construire la clause where
    const where: any = { agentId }

    if (memoryIds && memoryIds.length > 0) {
      where.id = { in: memoryIds }
    }

    if (type) {
      where.type = type
    }

    if (userId) {
      where.userId = userId
    }

    // Supprimer les mémoires
    const deletedMemories = await db.memory.deleteMany({ where })

    console.log(`🗑️ Deleted ${deletedMemories.count} memories for agent ${agentId}`)

    return NextResponse.json({
      success: true,
      data: { deletedCount: deletedMemories.count },
      message: `${deletedMemories.count} mémoires supprimées avec succès`
    })

  } catch (error) {
    console.error('Erreur lors de la suppression des mémoires:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression des mémoires' },
      { status: 500 }
    )
  }
}