import { NextRequest, NextResponse } from 'next/server'
import { AGENT_STYLES, STYLE_CATEGORIES, getStylesByCategory } from '@/data/styles-ia'

// GET /api/styles - Récupérer tous les styles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    let styles = AGENT_STYLES
    
    // Filtrer par catégorie si spécifiée
    if (category && category in STYLE_CATEGORIES) {
      styles = getStylesByCategory(category)
    }
    
    // Filtrer par recherche si spécifiée
    if (search) {
      const searchLower = search.toLowerCase()
      styles = styles.filter(style => 
        style.name.toLowerCase().includes(searchLower) ||
        style.description.toLowerCase().includes(searchLower)
      )
    }
    
    return NextResponse.json({
      success: true,
      data: styles,
      categories: STYLE_CATEGORIES,
      total: styles.length
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des styles:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des styles' },
      { status: 500 }
    )
  }
}