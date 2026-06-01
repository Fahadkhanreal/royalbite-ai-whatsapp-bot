
---

### **3. process-restaurant-order**

```markdown
---
name: "process-restaurant-order"
description: "Handle complete order booking flow from chatbot."
version: "1.0.0"
---

# Process Restaurant Order Skill

## When to Use This Skill
- User says "order kar do", "biryani book kar", "delivery karo"

## How This Skill Works
1. Extract items from conversation
2. Calculate total
3. Ask for name, address, phone (if missing)
4. Confirm order
5. Save to Neon `orders` + `order_items` table
6. Return order ID + estimated time

## Output Format
```json
{
  "status": "confirmed",
  "order_id": "ORD-784512",
  "total_amount": 1250,
  "estimated_time": "30-40 minutes",
  "items": [...]
}