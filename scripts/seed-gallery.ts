// Seed gallery images into database
// Run: npx ts-node --compiler-options {"module":"commonjs"} scripts/seed-gallery.ts

import { db } from '../lib/db';
import { galleryImages } from '../lib/db/schema';

const GALLERY_SEED = [
  { src: '/gallery/dish-1.jpg', alt: 'Biryani', sortOrder: 0 },
  { src: '/gallery/dish-2.jpg', alt: 'Karahi', sortOrder: 1 },
  { src: '/gallery/dish-3.jpg', alt: 'Kebab', sortOrder: 2 },
  { src: '/gallery/restaurant-1.jpg', alt: 'Restaurant Interior', sortOrder: 3 },
  { src: '/gallery/dish-4.jpg', alt: 'Nihari', sortOrder: 4 },
  { src: '/gallery/restaurant-2.jpg', alt: 'Dining Area', sortOrder: 5 },
  { src: '/gallery/dish-5.jpg', alt: 'Tikka Masala', sortOrder: 6 },
  { src: '/gallery/dish-6.jpg', alt: 'Haleem', sortOrder: 7 },
  { src: '/gallery/restaurant-3.jpg', alt: 'Kitchen', sortOrder: 8 },
];

async function seedGallery() {
  console.log('🌱 Seeding gallery images...');

  for (const img of GALLERY_SEED) {
    await db.insert(galleryImages).values(img).onConflictDoNothing();
    console.log(`  ✅ ${img.alt}`);
  }

  console.log('🎉 Gallery seed complete!');
  process.exit(0);
}

seedGallery().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
