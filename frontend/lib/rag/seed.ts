// RAG seed data for testing
// Location: lib/rag/seed.ts
// Sample documents to populate the vector store for development/testing

import { ingestDocument } from './ingest';
import { syncAllToRAG } from './auto-ingest';

const SAMPLE_MENU_DATA = `
RoyalBite Restaurant Menu

BIRYANI ITEMS:
- Sindhi Biryani: Traditional Sindhi biryani with fragrant basmati rice, tender chicken, and aromatic spices. Price: Rs. 250
- Chicken Biryani: Classic chicken biryani with yogurt marinated chicken. Price: Rs. 220
- Beef Biryani: Rich beef biryani with slow-cooked meat and layered rice. Price: Rs. 280
- Vegetable Biryani: Mixed vegetable biryani with seasonal vegetables. Price: Rs. 180

CURRY ITEMS:
- Karachi Nihari: Slow-cooked lamb nihari with rich gravy and traditional spices. Price: Rs. 280
- Chicken Karahi: Fresh tomato-based chicken karahi with ginger and green chilies. Price: Rs. 320
- Dal Tadka: Yellow lentils tempered with garlic and cumin. Price: Rs. 150
- Palak Paneer: Spinach curry with homemade cottage cheese. Price: Rs. 200

APPETIZERS:
- Seekh Kebab: Spiced minced meat kebabs grilled to perfection. Price: Rs. 180
- Chicken Tikka: Yogurt-marinated chicken tikka cooked in tandoor. Price: Rs. 220
- Samosa: Crispy fried pastry filled with spiced potatoes. Price: Rs. 60

BREAD ITEMS:
- Paratha: Buttery, flaky paratha bread. Price: Rs. 50
- Naan: Soft tandoor-baked naan bread. Price: Rs. 40
- Garlic Naan: Naan bread topped with garlic and butter. Price: Rs. 60
- Roti: Whole wheat traditional flatbread. Price: Rs. 30

DESSERTS:
- Kheer: Traditional rice pudding with cardamom and nuts. Price: Rs. 80
- Gulab Jamun: Deep-fried milk dumplings in rose syrup. Price: Rs. 100
- Ice Cream: Vanilla, chocolate, or mango flavored ice cream. Price: Rs. 60

BEVERAGES:
- Mango Lassi: Creamy yogurt drink with fresh mango pulp. Price: Rs. 120
- Chai: Traditional Pakistani tea with cardamom. Price: Rs. 50
- Mineral Water: Bottled drinking water. Price: Rs. 30
`;

const SAMPLE_FAQ_DATA = `
RoyalBite Restaurant - Frequently Asked Questions

Q: What are your restaurant timings?
A: We are open from 11:00 AM to 10:00 PM on weekdays (Sunday to Thursday).
  Friday and Saturday we are open from 11:00 AM to 11:00 PM.
  We are closed on Eid holidays.

Q: Do you offer home delivery?
A: Yes, we offer home delivery through our WhatsApp ordering system.
  Simply send us a message on WhatsApp with your order and address.
  Delivery typically takes 30-45 minutes within the city.
  Minimum order amount for delivery is Rs. 300.

Q: What payment methods do you accept?
A: We accept cash on delivery, bank transfer, and JazzCash/EasyPaisa.
  Online payment options coming soon.

Q: Do you have vegetarian options?
A: Yes, we have a variety of vegetarian dishes including Vegetable Biryani,
  Dal Tadka, Palak Paneer, and mixed vegetable curries.

Q: Can I customize my order?
A: Absolutely! You can add special instructions to your order such as
  spice level preferences, dietary restrictions, or specific requests.

Q: Do you cater for events?
A: Yes, we offer catering services for events, parties, and corporate gatherings.
  Please contact us via WhatsApp for catering inquiries and pricing.

Q: What is your cancellation policy?
A: Orders can be cancelled within 5 minutes of placing. Once the order
  is confirmed and being prepared, cancellation may not be possible.
`;

const SAMPLE_POLICY_DATA = `
RoyalBite Restaurant - Policies

DELIVERY POLICY:
- Free delivery for orders above Rs. 500
- Delivery within 3-5 km radius from restaurant
- Standard delivery time: 30-45 minutes
- Contact our delivery partner through WhatsApp for real-time tracking

REFUND POLICY:
- Full refund if order is cancelled before preparation starts
- Partial refund (50%) if order is cancelled during preparation
- No refund after order has been dispatched
- Quality issues: Report within 15 minutes of delivery for replacement or refund

PRIVACY POLICY:
- Customer phone numbers are used only for order processing
- We do not share customer data with third parties
- WhatsApp conversations are logged for quality assurance

QUALITY GUARANTEE:
- All dishes prepared fresh with quality ingredients
- If unsatisfied, contact us for resolution within 30 minutes of delivery
`;

/**
 * Seed the RAG vector store with sample data for testing
 */
export async function seedRAGDatabase() {
  console.log('Seeding RAG database with sample data...');

  const results = {
    menu: await ingestDocument(SAMPLE_MENU_DATA, {
      source: 'seed_data',
      metadata: { type: 'menu', category: 'complete-menu' },
    }),

    faq: await ingestDocument(SAMPLE_FAQ_DATA, {
      source: 'seed_data',
      metadata: { type: 'faq', category: 'general-faq' },
    }),

    policy: await ingestDocument(SAMPLE_POLICY_DATA, {
      source: 'seed_data',
      metadata: { type: 'policy', category: 'restaurant-policies' },
    }),
  };

  console.log('RAG seed complete:', {
    menuChunks: results.menu.chunksCreated,
    faqChunks: results.faq.chunksCreated,
    policyChunks: results.policy.chunksCreated,
  });

  return results;
}
