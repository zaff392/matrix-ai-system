import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/memory/search - Rechercher dans la mémoire
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, agentId, userId, type, tags, limit = 20, offset = 0 } = body

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'La requête de recherche est requise' },
        { status: 400 }
      )
    }

    // Construire la clause where
    const where: any = {}

    if (agentId) {
      where.agentId = agentId
    }

    if (userId) {
      where.userId = userId
    }

    if (type) {
      where.type = type
    }

    // Pour l'instant, on fait une recherche textuelle simple
    // Dans une version future, on pourrait utiliser des embeddings pour la recherche sémantique
    const OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } }
    ]

    // Si des tags sont fournis, les ajouter à la recherche
    if (tags && Array.isArray(tags) && tags.length > 0) {
      OR.push(
        ...tags.map(tag => ({
          tags: { contains: tag, mode: 'insensitive' }
        }))
      )
    }

    where.OR = OR

    // Récupérer les mémoires correspondantes
    const memories = await db.memory.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true, emoji: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { importance: 'desc' },
        { accessCount: 'desc' },
        { lastAccessed: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    // Compter le total
    const total = await db.memory.count({ where })

    // Mettre à jour le compteur d'accès pour les mémoires trouvées
    if (memories.length > 0) {
      await db.memory.updateMany({
        where: {
          id: { in: memories.map(m => m.id) }
        },
        data: {
          accessCount: { increment: 1 },
          lastAccessed: new Date()
        }
      })
    }

    console.log(`🔍 Memory search for "${query}": found ${memories.length} results`)

    return NextResponse.json({
      success: true,
      data: memories,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      searchInfo: {
        query,
        agentId,
        userId,
        type,
        tags,
        resultCount: memories.length
      }
    })

  } catch (error) {
    console.error('Erreur lors de la recherche dans la mémoire:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recherche dans la mémoire' },
      { status: 500 }
    )
  }
}

// GET /api/memory/search - Recherche simple via paramètres GET
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const agentId = searchParams.get('agentId')
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Le paramètre de recherche "q" est requis' },
        { status: 400 }
      )
    }

    // Construire la clause where
    const where: any = {}

    if (agentId) {
      where.agentId = agentId
    }

    if (userId) {
      where.userId = userId
    }

    if (type) {
      where.type = type
    }

    // Pour l'instant, on fait une recherche textuelle simple
    const OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } }
    ]

    // Si des tags sont fournis, les ajouter à la recherche
    if (tags && tags.length > 0) {
      OR.push(
        ...tags.map(tag => ({
          tags: { contains: tag, mode: 'insensitive' }
        }))
      )
    }

    where.OR = OR

    // Récupérer les mémoires correspondantes
    const memories = await db.memory.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true, emoji: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { importance: 'desc' },
        { accessCount: 'desc' },
        { lastAccessed: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    // Compter le total
    const total = await db.memory.count({ where })

    // Mettre à jour le compteur d'accès pour les mémoires trouvées
    if (memories.length > 0) {
      await db.memory.updateMany({
        where: {
          id: { in: memories.map(m => m.id) }
        },
        data: {
          accessCount: { increment: 1 },
          lastAccessed: new Date()
        }
      })
    }

    console.log(`🔍 Memory search for "${query}": found ${memories.length} results`)

    return NextResponse.json({
      success: true,
      data: memories,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      searchInfo: {
        query,
        agentId,
        userId,
        type,
        tags,
        resultCount: memories.length
      }
    })

  } catch (error) {
    console.error('Erreur lors de la recherche dans la mémoire:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recherche dans la mémoire' },
      { status: 500 }
    )
  }
}