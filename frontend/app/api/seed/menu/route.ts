// Seed sample menu data for testing
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dishes } from '@/lib/db/schema';
import { syncMenuToRAG } from '@/lib/rag/auto-ingest';

const SAMPLE_DISHES = [
  {
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice cooked with tender chicken pieces, Pakistani spices, and saffron. Served with raita and salad.',
    price: '350',
    category: 'biryani',
    isAvailable: true,
    isFeatured: true,
  },
  {
    name: 'Beef Biryani',
    description: 'Rich and flavorful beef biryani made with premium basmati rice, tender beef chunks, and traditional spices.',
    price: '400',
    category: 'biryani',
    isAvailable: true,
    isFeatured: true,
  },
  {
    name: 'Sindhi Biryani',
    description: 'Traditional Sindhi-style spicy biryani with potatoes, aromatic spices, and tender meat. A must-try specialty!',
    price: '450',
    category: 'biryani',
    isAvailable: true,
    isFeatured: true,
  },
  {
    name: 'Chicken Karahi',
    description: 'Fresh chicken cooked in a wok with tomatoes, green chilies, ginger, and special Pakistani masala.',
    price: '800',
    category: 'karahi',
    isAvailable: true,
    isFeatured: false,
  },
  {
    name: 'Mutton Karahi',
    description: 'Tender mutton pieces cooked in traditional karahi style with tomatoes and aromatic spices.',
    price: '1200',
    category: 'karahi',
    isAvailable: true,
    isFeatured: false,
  },
  {
    name: 'Seekh Kebab',
    description: 'Minced meat skewers grilled to perfection with herbs and spices. Served with naan and chutney.',
    price: '250',
    category: 'starters',
    isAvailable: true,
    isFeatured: false,
  },
  {
    name: 'Chicken Tikka',
    description: 'Marinated chicken pieces grilled in tandoor with special tikka masala. Served with mint chutney.',
    price: '300',
    category: 'starters',
    isAvailable: true,
    isFeatured: false,
  },
  {
    name: 'Nihari',
    description: 'Slow-cooked beef stew with rich gravy and traditional spices. Best enjoyed with naan.',
    price: '350',
    category: 'traditional',
    isAvailable: true,
    isFeatured: true,
  },
  {
    name: 'Haleem',
    description: 'Rich lentil and meat stew slow-cooked for hours. A comforting traditional dish.',
    price: '300',
    category: 'traditional',
    isAvailable: true,
    isFeatured: false,
  },
  {
    name: 'Naan',
    description: 'Fresh tandoor-baked bread, soft and fluffy. Perfect with any curry or karahi.',
    price: '30',
    category: 'bread',
    isAvailable: true,
    isFeatured: false,
  },
  {
    name: 'Garlic Naan',
    description: 'Naan topped with fresh garlic and butter. Aromatic and delicious.',
    price: '50',
    category: 'bread',
    isAvailable: true,
    isFeatured: false,
  },
  {
    name: 'Kheer',
    description: 'Traditional rice pudding made with milk, sugar, and cardamom. Garnished with nuts.',
    price: '150',
    category: 'dessert',
    isAvailable: true,
    isFeatured: false,
  },
  {
    name: 'Gulab Jamun',
    description: 'Sweet fried dough balls soaked in sugar syrup. A classic Pakistani dessert.',
    price: '120',
    category: 'dessert',
    isAvailable: true,
    isFeatured: false,
  },
  {
    name: 'Mango Lassi',
    description: 'Creamy yogurt drink blended with sweet mangoes. Refreshing and delicious.',
    price: '150',
    category: 'beverages',
    isAvailable: true,
    isFeatured: false,
  },
  {
    name: 'Doodh Patti Chai',
    description: 'Traditional Pakistani milk tea, strong and aromatic. Perfect with any meal.',
    price: '50',
    category: 'beverages',
    isAvailable: true,
    isFeatured: false,
  },
];

export async function POST() {
  try {
    // Check if dishes already exist
    const existingDishes = await db.query.dishes.findMany();

    if (existingDishes.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Database already has dishes. Skipping seed.',
        existingCount: existingDishes.length,
      });
    }

    // Insert sample dishes
    const inserted = await db.insert(dishes).values(SAMPLE_DISHES).returning();

    // Sync to RAG
    const ragSync = await syncMenuToRAG();

    return NextResponse.json({
      success: true,
      message: 'Sample menu data seeded successfully',
      data: {
        dishesCreated: inserted.length,
        ragSync: ragSync,
      },
    });
  } catch (error: any) {
    console.error('Seed failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack,
    }, { status: 500 });
  }
}

export async function GET() {
  // Same as POST for convenience
  return POST();
}
