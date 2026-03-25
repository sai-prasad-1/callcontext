/**
 * Seed script — populates the database with realistic test data.
 *
 * Run:  npx tsx scripts/seed.ts
 * Env:  reads from .env.local automatically
 */

import "dotenv/config";
import { resolve } from "path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

// Load .env.local explicitly (dotenv/config only reads .env)
config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY in env"
  );
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function daysAgo(d: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt;
}
function daysFromNow(d: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt;
}
function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}
function randPhone() {
  return `+1${rand(200, 999)}${rand(200, 999)}${rand(1000, 9999)}`;
}

// ---------------------------------------------------------------------------
// Static data pools
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  "Maria", "James", "Sarah", "David", "Lisa", "Michael", "Jennifer", "Robert",
  "Emily", "Daniel", "Rachel", "Kevin", "Amanda", "Thomas", "Nicole",
  "Brian", "Stephanie", "Andrew", "Christina", "Mark", "Laura", "Steven",
  "Angela", "Jason", "Michelle", "Eric", "Rebecca", "William", "Diana",
  "Patrick", "Samantha", "Ryan", "Hannah", "Christopher", "Ashley",
  "Jonathan", "Catherine", "Brandon", "Heather", "Justin", "Natalie",
  "Tyler", "Megan", "Benjamin", "Sofia", "Nathan", "Olivia", "Gregory",
  "Priya", "Carlos",
];

const LAST_NAMES = [
  "Chen", "Rodriguez", "Kim", "Park", "Thompson", "Brown", "Garcia",
  "Wilson", "Davis", "Martinez", "Anderson", "Taylor", "Thomas", "Jackson",
  "White", "Harris", "Martin", "Clark", "Lewis", "Young", "Walker",
  "Hall", "Allen", "King", "Wright", "Scott", "Green", "Adams",
  "Baker", "Patel", "Nguyen", "Campbell", "Mitchell", "Roberts", "Turner",
  "Phillips", "Evans", "Moore", "Sanchez", "Rivera", "Reed", "Cooper",
  "Morgan", "Bell", "Murphy", "Bailey", "Sullivan", "Ross", "Kapoor",
  "Santos",
];

const CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
  "San Antonio", "San Diego", "Dallas", "Austin", "Portland", "Denver",
  "Seattle", "Boston", "Nashville", "Atlanta", "Miami", "Minneapolis",
];

const STATES = [
  "NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "TX",
  "OR", "CO", "WA", "MA", "TN", "GA", "FL", "MN",
];

const ALL_TAGS = [
  "VIP", "Wedding Client", "Corporate", "Sympathy", "Regular", "New",
  "Valentine's Day", "Mother's Day", "Event Planner",
];

const PREFERENCE_POOLS = {
  primary: [
    ["roses", "peonies"],
    ["sunflowers", "daisies"],
    ["orchids"],
    ["tulips", "lilies"],
    ["hydrangeas", "ranunculus"],
    ["lavender", "eucalyptus"],
    ["roses"],
    ["mixed wildflowers"],
    ["carnations", "chrysanthemums"],
  ],
  secondary: [
    ["warm", "pink"],
    ["bright", "yellow"],
    ["white", "purple"],
    ["red", "burgundy"],
    ["pastel", "blush"],
    ["cool", "blue"],
    ["earthy", "green"],
  ],
  restrictions: [
    ["lilies"],
    ["carnations"],
    [],
    [],
    [],
    ["baby's breath"],
    [],
  ],
};

const OCCASIONS = [
  "Birthday", "Anniversary", "Wedding", "Sympathy", "Thank You",
  "Get Well", "Congratulations", "Valentine's Day", "Mother's Day",
  "Just Because", "Corporate Event", "Holiday",
];

const PRODUCTS = [
  { name: "Classic Rose Bouquet", base: 55 },
  { name: "Mixed Garden Arrangement", base: 45 },
  { name: "Peony Luxe Bundle", base: 85 },
  { name: "Wedding Centerpiece", base: 150 },
  { name: "Sympathy Wreath", base: 95 },
  { name: "Sunflower Sunshine", base: 40 },
  { name: "Orchid Elegance", base: 120 },
  { name: "Seasonal Wildflower Mix", base: 35 },
  { name: "Premium Anniversary Set", base: 175 },
  { name: "Corporate Reception Arrangement", base: 200 },
  { name: "Single Stem Rose", base: 12 },
  { name: "Tulip Spring Collection", base: 50 },
];

const TRANSCRIPTS = [
  `Customer: Hi, I'd like to order a bouquet for my wife's birthday tomorrow. She loves peonies and anything in pink tones.\nFlorist: Happy to help! We have a beautiful peony arrangement with blush roses and ranunculus. It's one of our most popular birthday picks.\nCustomer: That sounds perfect. Can you add a card that says "Happy Birthday, love always"?\nFlorist: Absolutely. Would you like standard delivery or before noon? The morning slot is an extra $10.\nCustomer: Before noon would be great. She'll be home in the morning.`,

  `Customer: I'm calling about flowers for a corporate event next Friday. We need about 10 centerpieces for round tables.\nFlorist: Of course! What's the color scheme or theme for the event?\nCustomer: It's a company anniversary celebration. Our brand colors are navy and gold, so something elegant in those tones.\nFlorist: I'd suggest white hydrangeas with navy ribbon and gold-painted eucalyptus accents. Very sophisticated. For 10 centerpieces, I can offer a package rate.\nCustomer: That sounds wonderful. What would the cost be per arrangement?`,

  `Customer: Hello, I need to send sympathy flowers to a funeral home. The service is on Wednesday.\nFlorist: I'm sorry for your loss. We have several sympathy options — standing sprays, casket pieces, and smaller arrangements. Do you have a preference?\nCustomer: A standing spray would be appropriate. Something with white lilies and roses.\nFlorist: Our "Peaceful Memories" standing spray is exactly that — white Oriental lilies, white roses, and greenery. It's $95. Shall I include a ribbon with a message?\nCustomer: Yes, please. "With deepest sympathy, The Johnson Family."`,

  `Customer: Hi! I'm getting married in June and I'm looking for a florist for the ceremony and reception. Do you do weddings?\nFlorist: Congratulations! Yes, we do full wedding florals — bridal bouquet, bridesmaids, boutonnieres, ceremony arch, and reception centerpieces. Would you like to schedule a consultation?\nCustomer: That would be great. I'm thinking a garden romantic theme with lots of greenery, blush, and cream.\nFlorist: Beautiful choice. We have availability for June. Our wedding packages start at $2,000 for intimate ceremonies and go up from there. What's your guest count?`,

  `Customer: I'd like to set up a weekly flower delivery for my restaurant. Can you do that?\nFlorist: Absolutely! We work with several restaurants in the area. What kind of arrangements are you looking for?\nCustomer: Something simple and elegant. We have 8 tables and a front entrance that needs a larger piece. Mostly whites and greens to match our décor.\nFlorist: For 8 small table arrangements and one statement piece, I'd estimate around $200-250 per week. We deliver every Monday morning before you open. Want to start a trial week?`,

  `Customer: My mom's birthday is next week and she's hard to shop for. What do you recommend?\nFlorist: Moms are our specialty! Does she have a favorite flower or color?\nCustomer: She really likes purple. And she mentioned she thinks orchids are beautiful.\nFlorist: We have a stunning purple orchid in a ceramic pot — it's long-lasting and looks gorgeous. $65 including the decorative pot. We can also pair it with a small box of chocolates.\nCustomer: Oh she'd love that! Let's do the orchid with chocolates.`,

  `Customer: I'm calling to check on my order. I placed it yesterday — last name Chen, delivery to 45 Oak Street?\nFlorist: Let me pull that up... Yes, I see your order. The anniversary arrangement with red roses and peonies. It's scheduled for delivery tomorrow between 2-4 PM.\nCustomer: Perfect. Actually, can I change the delivery window to the morning? My wife works from home in the morning but has appointments in the afternoon.\nFlorist: Sure, I can adjust that to our 9 AM - 12 PM window. No extra charge since we're still a day out. Anything else?\nCustomer: No, that's great. Thank you so much!`,

  `Customer: Do you have any same-day delivery options? I completely forgot about our anniversary and I'm in trouble!\nFlorist: Don't worry, it happens more than you'd think! We can do same-day delivery if you order before 2 PM. What are you thinking?\nCustomer: Something really nice. Money isn't an issue — I need to make up for forgetting!\nFlorist: In that case, I'd suggest our "Grand Romance" package — two dozen premium long-stem roses with baby's breath and a keepsake vase. It's $150. We can have it there by 5 PM.\nCustomer: Yes, absolutely. Please add a card: "To my forever love. Happy Anniversary!"`,

  `Customer: Hi, I received an arrangement yesterday and some of the flowers already look wilted. I'm disappointed.\nFlorist: I'm really sorry to hear that. That's definitely not up to our standard. Can you tell me your order number or the name on the order?\nCustomer: It was under Thompson, delivered to 220 Main Street.\nFlorist: I found it. I sincerely apologize — we'll send a fresh replacement arrangement today at no charge. I'll personally select the freshest stems. Would the same delivery address work?\nCustomer: Yes, same address. I appreciate you making it right.`,

  `Customer: I need flowers for a Valentine's Day dinner. Can I pick them up instead of delivery?\nFlorist: Of course! We'll have extended hours on Valentine's Day — open from 7 AM to 7 PM. What arrangement are you interested in?\nCustomer: A dozen red roses, classic style. And do you have any add-ons? Like a teddy bear or chocolates?\nFlorist: We have premium chocolate boxes from a local chocolatier for $25, and stuffed bears for $15. Both are very popular. The dozen roses are $75 for long-stem.\nCustomer: Let's do the roses with the chocolates. I'll pick up around 5 PM.`,

  `Customer: Hello, I'm an event planner and I'm looking for a floral vendor for a series of events this spring. Would you be open to a partnership?\nFlorist: We'd love that! We work with several event planners in the area. What kind of events are we talking about?\nCustomer: A mix — two corporate galas, a charity auction, and three private parties. Total of about 80-100 arrangements across all events.\nFlorist: That's a great volume. We can definitely offer partnership pricing for that kind of commitment. I'd suggest we meet in person to go over details and I can show you some portfolio work.\nCustomer: Perfect. Are you available Thursday afternoon?`,

  `Customer: I want to send flowers to my daughter at college. She's been having a rough week with exams.\nFlorist: That's so thoughtful! We can ship nationwide. What's her style — something bright and cheerful or more elegant?\nCustomer: Bright and cheerful. She loves sunflowers and daisies. Something to make her smile.\nFlorist: Our "Sunshine Smile" bouquet is perfect — sunflowers, yellow daisies, and orange spray roses in a mason jar. $45 plus $15 shipping. Want to include a card?\nCustomer: Yes! "You've got this, sweetheart. Love, Mom and Dad."`,

  `Customer: We need funeral flowers delivered to St. Mary's Church by Thursday at 10 AM. It's for my grandfather.\nFlorist: I'm very sorry for your loss. We can certainly have them there on time. What type of arrangement were you thinking?\nCustomer: A large casket spray, all white if possible. My grandmother specifically asked for white roses and lilies.\nFlorist: Our "Eternal Peace" casket spray is all white — roses, lilies, and carnations with cascading greenery. It's $195. We'll deliver directly to the church before the service.\nCustomer: That's exactly what we need. Thank you for being so helpful during this time.`,

  `Customer: Hi, I saw on your website you do flower subscriptions? How does that work?\nFlorist: Yes! We have three tiers. Our weekly is $35 per delivery, bi-weekly is $40, and monthly is $50 — the monthly ones are larger arrangements. You choose the style and we pick the freshest seasonal blooms each time.\nCustomer: I love that idea. Can I start with bi-weekly and switch later if I want?\nFlorist: Absolutely, there's no commitment. You can pause, switch, or cancel anytime. Most customers love the surprise element of letting us pick the flowers.\nCustomer: Let's start bi-weekly. I prefer soft pastels. My address is 789 Elm Street.`,

  `Customer: Hello, I'm looking for something for Mother's Day. But not the typical roses — my mom is more of a gardener type.\nFlorist: We have some lovely options for garden-loving moms! Our potted herb garden gift set is very popular — it comes with lavender, rosemary, and mint in a decorative planter. $55.\nCustomer: Oh, that's unique! She would love that. Do you also have any potted flowers?\nFlorist: Yes! We have potted peonies, hydrangeas, and miniature rose bushes. They range from $35 to $65. They can go right into her garden.\nCustomer: Let's do the herb garden set and a potted hydrangea. Can they be delivered Saturday before Mother's Day?`,

  `Customer: I'm calling to cancel my order. The wedding has been postponed.\nFlorist: I'm sorry to hear that. I hope everything is okay. Let me pull up your order... Under what name?\nCustomer: Park. We had the full wedding package scheduled for April 15th.\nFlorist: Found it. Since we haven't started sourcing yet, I can issue a full refund. When you reschedule, we'll honor the same pricing. Would you like me to put a note in our system?\nCustomer: Yes, please. We're looking at September now. I'll call back once we have a firm date. Thank you for being so understanding.`,

  `Customer: Do you deliver to hospitals? I want to send something to my friend who just had a baby.\nFlorist: Congratulations to your friend! Yes, we deliver to all major hospitals in the area. Just a note — some maternity wards prefer no strong fragrances, so we recommend our "New Beginnings" arrangement with soft gerbera daisies and pastel roses.\nCustomer: That sounds perfect. It's at Memorial Hospital, room 412. Can you deliver tomorrow morning?\nFlorist: Absolutely. The "New Beginnings" is $55 and includes a small plush toy. Want to add a congratulations card?`,

  `Customer: I have a question about the arrangement I ordered. Will it have the exact flowers in the picture?\nFlorist: Great question. Our arrangements are made with the freshest available flowers, so sometimes we may substitute similar flowers if a specific variety isn't available. The overall look, color scheme, and size will match what you see on the website.\nCustomer: Okay, that makes sense. I specifically want peonies though — can you guarantee those?\nFlorist: Peonies are in season right now, so yes, I can guarantee them for your order. If for any reason we couldn't get them, we'd call you first before making any substitutions.`,

  `Customer: Hi, I'd like to know your prices for boutonnieres and corsages for prom. My son's prom is in three weeks.\nFlorist: How exciting! Boutonnieres start at $15 for a single rose or $20 for premium — orchid or ranunculus. Wrist corsages range from $25 to $40 depending on the flowers.\nCustomer: He needs a boutonniere and his date needs a wrist corsage. What colors go well together?\nFlorist: If you tell me the dress color, I can match everything perfectly. We do a lot of prom flowers and we make sure the boutonniere and corsage complement each other.\nCustomer: Her dress is burgundy. Can I come in next Saturday to finalize everything?`,

  `Customer: Good morning! I'm interested in your dried flower arrangements. I saw some on your Instagram page.\nFlorist: Thank you for following us! Yes, our dried and preserved arrangements are very popular. They last for months with no maintenance. We have bouquets starting at $45, wreaths at $65, and large arrangements at $95.\nCustomer: I love the boho-style bouquets with pampas grass. Do you have those available?\nFlorist: We do! Our "Desert Bloom" collection features pampas grass, dried roses, bunny tails, and eucalyptus. The medium bouquet is $65. Would you like to order one or see them in person?\nCustomer: I'll come by this weekend. Can you hold one for me?`,
];

const AI_SUMMARIES = [
  "Customer ordered a birthday bouquet with peonies and pink roses. Morning delivery requested. Card message included.",
  "Inquiry about corporate event centerpieces for 10 tables. Navy and gold theme discussed. Customer interested in package pricing.",
  "Sympathy standing spray ordered for Wednesday funeral service. White lilies and roses. Ribbon message: 'With deepest sympathy, The Johnson Family.'",
  "Wedding consultation requested for June ceremony. Garden romantic theme with greenery, blush, and cream. Guest count TBD.",
  "Restaurant weekly flower delivery inquiry. 8 table arrangements + entrance piece. $200-250/week estimate. Trial week offered.",
  "Birthday orchid order for customer's mother. Purple orchid in ceramic pot with chocolate pairing. $65 + add-on.",
  "Order status check for anniversary arrangement. Delivery time changed from afternoon to morning window. No extra charge.",
  "Emergency same-day anniversary order. Grand Romance package ($150) with two dozen long-stem roses. Delivery by 5 PM.",
  "Customer complaint about wilted flowers. Replacement arrangement offered at no charge. Same-day redelivery confirmed.",
  "Valentine's Day pickup order. Dozen long-stem red roses ($75) with premium chocolate box ($25). Pickup at 5 PM.",
  "Event planner partnership inquiry. 6 spring events, 80-100 arrangements total. In-person meeting scheduled for Thursday.",
  "Nationwide delivery request — sunflower bouquet to college student. Sunshine Smile bouquet $45 + $15 shipping.",
  "Funeral casket spray for Thursday at St. Mary's Church. All-white Eternal Peace spray $195. Morning delivery before service.",
  "Flower subscription inquiry. Customer chose bi-weekly delivery, soft pastel preference. No commitment plan.",
  "Mother's Day order: herb garden gift set ($55) + potted hydrangea. Saturday delivery before Mother's Day.",
  "Wedding cancellation — Park wedding (April 15). Full refund issued. September reschedule noted. Same pricing honored.",
  "Hospital delivery for new baby. New Beginnings arrangement ($55) with plush toy. Memorial Hospital room 412.",
  "Customer asked about flower substitution policy. Peonies guaranteed for current order (in season). Would call before any subs.",
  "Prom flowers inquiry — boutonniere + wrist corsage for burgundy dress. Customer visiting Saturday to finalize.",
  "Dried flower arrangement interest from Instagram follower. Desert Bloom pampas bouquet ($65) recommended. Weekend visit planned.",
  "Repeat customer requesting same arrangement as last month. White roses with eucalyptus. Anniversary tradition.",
  "Customer called to add delivery instructions — leave at side door, ring doorbell. Gate code 4521.",
  "Large order for charity gala — 15 low centerpieces and 3 tall statement pieces. Budget around $2,500.",
  "Customer wants to upgrade weekly subscription from standard to premium tier. Loves the surprise flower selection.",
  "Follow-up call from satisfied corporate client. Wants to book quarterly office arrangements for all 4 floors.",
  "Customer inquiring about allergy-safe arrangements. No lilies, no baby's breath. Suggested hypoallergenic options.",
  "Consultation for memorial garden planting. Customer wants perennial flowers that bloom in spring and summer.",
  "Rush order for retirement party tomorrow. Mixed bright arrangement with sunflowers. Budget $75. Office delivery.",
  "Customer thanked us for the beautiful arrangement. Wants to be added to VIP notification list for seasonal specials.",
  "Bridal shower decoration inquiry. Boho theme with dried and fresh mixed arrangements. 20 guests. Venue is outdoor.",
];

const ENTITIES_POOL = [
  { flowers: ["roses", "peonies"], colors: ["pink", "blush"], delivery: "tomorrow morning" },
  { flowers: ["hydrangeas"], colors: ["navy", "gold", "white"], event_type: "corporate anniversary" },
  { flowers: ["white lilies", "white roses"], occasion: "sympathy", recipient: "Johnson Family" },
  { flowers: ["mixed greenery", "blush", "cream"], occasion: "wedding", month: "June" },
  { flowers: ["whites", "greens"], frequency: "weekly", venue: "restaurant" },
  { flowers: ["purple orchid"], add_ons: ["chocolates"], occasion: "birthday" },
  { flowers: ["red roses", "peonies"], order_type: "anniversary", delivery_change: true },
  { flowers: ["two dozen roses"], urgency: "same-day", occasion: "anniversary" },
  { issue: "wilted flowers", resolution: "replacement", priority: "high" },
  { flowers: ["red roses"], add_ons: ["chocolate box"], occasion: "Valentine's Day", pickup: true },
  { event_type: "multiple events", count: 6, total_arrangements: "80-100" },
  { flowers: ["sunflowers", "daisies", "spray roses"], shipping: true, recipient: "college student" },
  { flowers: ["white roses", "lilies", "carnations"], occasion: "funeral", delivery_location: "church" },
  { subscription: "bi-weekly", style: "soft pastels" },
  { flowers: ["herb garden", "hydrangea"], occasion: "Mother's Day", items: 2 },
  { event_type: "wedding cancellation", refund: true, reschedule: "September" },
  { flowers: ["gerbera daisies", "pastel roses"], delivery_location: "hospital", add_ons: ["plush toy"] },
  { flowers: ["peonies"], question: "substitution policy", guarantee: true },
  { items: ["boutonniere", "wrist corsage"], occasion: "prom", dress_color: "burgundy" },
  { flowers: ["pampas grass", "dried roses", "bunny tails"], style: "boho", type: "dried arrangement" },
];

const NOTE_CONTENTS_PINNED = [
  "ALLERGY ALERT: Severe lily allergy. Never include lilies or stargazers in arrangements.",
  "VIP Customer — Always call 24hrs before delivery to confirm. Prefers morning deliveries only.",
  "Wedding client — contract signed for June 15. Deposit paid. Consultation notes in shared drive.",
  "Corporate account — Net 30 payment terms approved. Invoice to accounts@company.com.",
  "PREFERENCE: Only wants locally-sourced, seasonal flowers. No imported stems.",
  "Customer's mother has dementia — always confirm delivery with daughter first at (555) 123-4567.",
  "Recurring weekly order every Monday. If closed for holiday, deliver Tuesday instead.",
  "Do NOT deliver to front door — use side entrance. Dog is aggressive at front gate.",
  "Platinum loyalty member since 2022. 15% standing discount on all orders.",
  "Event planner — prefers email communication. Response needed within 2 hours during event season.",
];

const NOTE_CONTENTS_REGULAR = [
  "Called to check on order status. Everything on track for Saturday delivery.",
  "Mentioned she might want to start a monthly subscription after the holidays.",
  "Husband called asking about surprise anniversary setup. Wife's favorite: white peonies.",
  "Customer loved the last arrangement. Wants the exact same thing for her sister's birthday.",
  "Price-conscious — always ask about budget first. Usually spends $40-60 range.",
  "Prefers texting over phone calls. Send order confirmations via SMS.",
  "Has been a customer for 3 years. Always orders for Mother's Day and Christmas.",
  "New customer referred by Maria Chen. Gave Maria a referral credit.",
  "Asked about delivery to a gated community. Need gate code: 7834#",
  "Wants to schedule a store visit to see dried flower options in person.",
  "Requested we keep her card on file for future orders. Updated in Stripe.",
  "Customer's daughter is getting married next year. Potential large wedding order.",
  "Mentioned interest in our flower arranging workshop. Added to workshop mailing list.",
  "Called to compliment the delivery driver. Said he was very professional and on time.",
  "Changed preferred delivery address to office. Updated contact record.",
  "Wants eco-friendly packaging only. No plastic wrapping or foam.",
  "Customer travels frequently. Best to confirm delivery 48hrs in advance.",
  "Interested in bulk pricing for office reception area. Needs 4 arrangements weekly.",
  "Birthday club member. Auto-reminder set for March 15.",
  "Sent a thank-you card after the funeral flowers. Very appreciative of our service.",
  "Discussed seasonal availability of peonies. Best time: April through June.",
  "Customer mentioned relocating soon. Will update address once settled.",
  "Tried our subscription for 3 months, paused for summer travel. Will resume in September.",
  "Left a 5-star Google review. Sent a thank-you discount code (THANKS10).",
  "Hosting a garden party in July. Needs 6 small table arrangements. Budget: $300 total.",
  "Customer is a food blogger. Offered a small arrangement for a photo shoot in exchange for social media post.",
  "Prefers unscented flowers when possible — gets headaches from strong fragrances.",
  "Mentioned anniversary is coming up on October 12. Set reminder.",
  "New corporate client from downtown law firm. First order was very well received.",
  "Customer asked about custom terrariums. Referred to our sister shop for succulents.",
  "Follow-up on complaint from last week. Replacement was well received. Customer satisfied.",
  "Asked about holiday pre-orders. Added to early-bird notification list for Thanksgiving and Christmas.",
  "Wedding vendor referral — works with Elegant Events catering. Good partnership opportunity.",
  "Requested a standing weekly order of single-stem roses for restaurant tables. 12 stems/week.",
  "Customer teaches at the local school. Interested in a class field trip to the shop.",
  "Inquired about pet-safe flower options. Sent our pet-safe arrangement brochure via email.",
  "Celebrating 50th wedding anniversary. Wants gold-themed arrangement. Budget up to $200.",
  "Regular customer moving to bi-weekly from weekly subscription. Budget adjustment.",
  "Called to report delivery left in the rain. Filed for replacement. Updated driver instructions.",
  "Expressed interest in volunteering for our community flower planting day.",
];

const REMINDER_TITLES = [
  "Birthday — send arrangement",
  "Wedding anniversary flowers",
  "Mother's Day reminder",
  "Valentine's Day pre-order",
  "Follow up on wedding consultation",
  "Reorder weekly subscription check-in",
  "Anniversary — special arrangement",
  "Corporate quarterly order renewal",
  "Holiday arrangement pre-order reminder",
  "Thank you follow-up call",
  "Birthday — daughter's graduation",
  "Check in on event planner partnership",
  "Memorial anniversary flowers",
  "Customer satisfaction follow-up",
  "Subscription renewal reminder",
  "Seasonal menu update notification",
  "Wedding deposit due date",
  "Prom corsage order deadline",
  "Easter arrangement pre-orders open",
  "Year-end corporate gift orders",
];

// ---------------------------------------------------------------------------
// Main seed logic
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Finding shop and owner...");

  const { data: shops, error: shopErr } = await sb
    .from("shops")
    .select("id, owner_id")
    .limit(1)
    .single();

  if (shopErr || !shops) {
    console.error("No shop found. Please create a shop first.", shopErr);
    process.exit(1);
  }

  const SHOP_ID = shops.id as string;
  const OWNER_ID = shops.owner_id as string;
  console.log(`Using shop ${SHOP_ID}, owner ${OWNER_ID}`);

  // ------ Set industry config on shop ------
  console.log("Setting florist industry config on shop...");
  const industryConfig = {
    industry: "florist",
    product_vocabulary: {
      categories: ["Arrangements", "Single stems", "Plants", "Add-ons"],
      items: [
        "roses", "peonies", "lilies", "sunflowers", "orchids", "tulips",
        "carnations", "hydrangeas", "bouquet", "centerpiece", "corsage",
        "wreath", "arrangement", "vase",
      ],
    },
    occasion_vocabulary: [
      "birthday", "anniversary", "wedding", "sympathy", "graduation",
      "valentines", "mothers_day", "get_well", "congratulations",
      "thank_you", "new_baby", "prom",
    ],
    preference_labels: { primary: "Flowers", secondary: "Colors", restrictions: "Allergies" },
    service_labels: { order: "Order", delivery: "Delivery", item: "Product" },
  };

  const { data: currentShop } = await sb.from("shops").select("settings").eq("id", SHOP_ID).single();
  const mergedSettings = { ...((currentShop?.settings as Record<string, unknown>) ?? {}), ...industryConfig };
  await sb.from("shops").update({ settings: mergedSettings } as never).eq("id", SHOP_ID);
  console.log("  ✓ Industry config set");

  // ------ Clean existing seed data (optional, idempotent) ------
  console.log("Cleaning existing data...");
  await sb.from("reminders").delete().eq("shop_id", SHOP_ID);
  await sb.from("notes").delete().eq("shop_id", SHOP_ID);
  await sb.from("orders").delete().eq("shop_id", SHOP_ID);
  await sb.from("calls").delete().eq("shop_id", SHOP_ID);
  await sb.from("customers").delete().eq("shop_id", SHOP_ID);
  console.log("Cleaned.");

  // =====================================================================
  // 1. CUSTOMERS (50)
  // =====================================================================
  console.log("Creating 50 customers...");

  type CustRow = {
    id: string;
    shop_id: string;
    phone: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    preferences: Record<string, unknown>;
    tags: string[];
    loyalty_tier: string;
    loyalty_points: number;
    lifetime_value: number;
    total_orders: number;
    communication_preference: string;
    first_contact_date: string | null;
    last_contact_date: string | null;
  };

  const customers: CustRow[] = [];
  const usedPhones = new Set<string>();

  function uniquePhone() {
    let p: string;
    do { p = randPhone(); } while (usedPhones.has(p));
    usedPhones.add(p);
    return p;
  }

  for (let i = 0; i < 50; i++) {
    const fn = FIRST_NAMES[i];
    const ln = LAST_NAMES[i];
    const cityIdx = rand(0, CITIES.length - 1);
    const phone = uniquePhone();
    const id = randomUUID();

    let tier: string;
    let lv: number;
    let totalOrd: number;
    let tags: string[];
    let prefs: Record<string, unknown>;
    let email: string | null;
    let address: string | null;
    let city: string | null;
    let state: string | null;
    let zip: string | null;
    let firstName: string | null;
    let lastName: string | null;
    let commPref: string;
    let firstContact: string | null;
    let lastContact: string | null;

    if (i < 10) {
      // Full profiles (rich data)
      firstName = fn;
      lastName = ln;
      email = `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`;
      address = `${rand(100, 9999)} ${pick(["Oak", "Maple", "Main", "Elm", "Cedar", "Pine", "Birch"])} ${pick(["St", "Ave", "Blvd", "Dr", "Ln"])}`;
      city = CITIES[cityIdx];
      state = STATES[cityIdx];
      zip = `${rand(10000, 99999)}`;
      prefs = {
        primary: pick(PREFERENCE_POOLS.primary),
        secondary: pick(PREFERENCE_POOLS.secondary),
        restrictions: pick(PREFERENCE_POOLS.restrictions),
        notes: "",
      };
      tags = pickN(ALL_TAGS, rand(1, 3));
      tier = pick(["silver", "gold"]);
      lv = rand(500, 2000);
      totalOrd = rand(5, 15);
      commPref = pick(["phone", "email", "sms"]);
      firstContact = daysAgo(rand(180, 365)).toISOString();
      lastContact = daysAgo(rand(1, 14)).toISOString();
    } else if (i < 25) {
      // Partial profiles (name + phone)
      firstName = fn;
      lastName = ln;
      email = null;
      address = null;
      city = null;
      state = null;
      zip = null;
      prefs = {};
      tags = rand(0, 1) ? [pick(ALL_TAGS)] : [];
      tier = "bronze";
      lv = rand(50, 400);
      totalOrd = rand(1, 5);
      commPref = "phone";
      firstContact = daysAgo(rand(60, 180)).toISOString();
      lastContact = daysAgo(rand(5, 30)).toISOString();
    } else if (i < 40) {
      // Phone-only (auto-created from calls)
      firstName = null;
      lastName = null;
      email = null;
      address = null;
      city = null;
      state = null;
      zip = null;
      prefs = {};
      tags = [];
      tier = "bronze";
      lv = rand(0, 100);
      totalOrd = rand(0, 1);
      commPref = "phone";
      firstContact = daysAgo(rand(10, 60)).toISOString();
      lastContact = daysAgo(rand(1, 10)).toISOString();
    } else {
      // Rich / VIP (high value, lots of calls)
      firstName = fn;
      lastName = ln;
      email = `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`;
      address = `${rand(100, 9999)} ${pick(["Park", "Sunset", "Highland", "Willow"])} ${pick(["Ave", "Pl", "Ct"])}`;
      city = CITIES[cityIdx];
      state = STATES[cityIdx];
      zip = `${rand(10000, 99999)}`;
      prefs = {
        primary: pick(PREFERENCE_POOLS.primary),
        secondary: pick(PREFERENCE_POOLS.secondary),
        restrictions: pick(PREFERENCE_POOLS.restrictions),
        notes: "",
      };
      tags = ["VIP", ...pickN(ALL_TAGS.filter((t) => t !== "VIP"), rand(1, 2))];
      tier = pick(["gold", "platinum"]);
      lv = rand(1500, 3500);
      totalOrd = rand(10, 25);
      commPref = pick(["phone", "email"]);
      firstContact = daysAgo(rand(300, 700)).toISOString();
      lastContact = daysAgo(rand(0, 7)).toISOString();
    }

    customers.push({
      id,
      shop_id: SHOP_ID,
      phone,
      email,
      first_name: firstName,
      last_name: lastName,
      address,
      city,
      state,
      zip,
      preferences: prefs,
      tags,
      loyalty_tier: tier,
      loyalty_points: rand(0, lv),
      lifetime_value: lv,
      total_orders: totalOrd,
      communication_preference: commPref,
      first_contact_date: firstContact,
      last_contact_date: lastContact,
    });
  }

  const { error: custErr } = await sb.from("customers").insert(customers as any);
  if (custErr) {
    console.error("Customer insert failed:", custErr);
    process.exit(1);
  }
  console.log(`  ✓ 50 customers inserted`);

  // =====================================================================
  // 2. CALLS (200)
  // =====================================================================
  console.log("Creating 200 calls...");

  // Distribute calls: rich customers (last 10) get 5-8 each, full profile get 3-5,
  // partial get 2-3, phone-only get 1
  type CallRow = {
    id: string;
    shop_id: string;
    customer_id: string;
    direction: string;
    status: string;
    started_at: string;
    ended_at: string | null;
    duration_seconds: number | null;
    recording_url: null;
    recording_storage_path: null;
    transcript: string | null;
    ai_summary: string | null;
    sentiment: string | null;
    entities_extracted: Record<string, unknown> | null;
    follow_up_needed: boolean;
    tags: string[];
  };

  const calls: CallRow[] = [];
  let callIdx = 0;
  let transcriptIdx = 0;
  let summaryIdx = 0;
  let entitiesIdx = 0;

  const callsPerCustomer: number[] = [];
  // i < 10: full profile → 3-5 calls
  for (let i = 0; i < 10; i++) callsPerCustomer.push(rand(3, 5));
  // i 10-24: partial → 2-3 calls
  for (let i = 10; i < 25; i++) callsPerCustomer.push(rand(2, 3));
  // i 25-39: phone-only → 1 call
  for (let i = 25; i < 40; i++) callsPerCustomer.push(1);
  // i 40-49: rich → 5-8 calls
  for (let i = 40; i < 50; i++) callsPerCustomer.push(rand(5, 8));

  // Adjust to reach 200
  let totalCalls = callsPerCustomer.reduce((a, b) => a + b, 0);
  while (totalCalls < 200) {
    const idx = rand(0, 49);
    callsPerCustomer[idx]++;
    totalCalls++;
  }
  while (totalCalls > 200) {
    const idx = rand(0, 49);
    if (callsPerCustomer[idx] > 1) {
      callsPerCustomer[idx]--;
      totalCalls--;
    }
  }

  // Status distribution targets
  let missedLeft = 20;
  let voicemailLeft = 10;
  // Sentiment distribution
  let positiveLeft = 120;
  let neutralLeft = 50;
  let negativeLeft = 30;
  // Features
  let summariesLeft = 100;
  let entitiesLeft = 80;
  let followUpLeft = 30;
  let transcriptsLeft = 20;
  // Direction
  let outboundLeft = 10;

  for (let custI = 0; custI < 50; custI++) {
    const cust = customers[custI];
    const count = callsPerCustomer[custI];

    for (let c = 0; c < count; c++) {
      callIdx++;
      const dayOffset = rand(0, 89);
      const hourOffset = rand(8, 18);
      const minOffset = rand(0, 59);
      const startDate = daysAgo(dayOffset);
      startDate.setHours(hourOffset, minOffset, rand(0, 59));

      // Status
      let status: string;
      if (missedLeft > 0 && callIdx % 10 === 0) {
        status = "missed";
        missedLeft--;
      } else if (voicemailLeft > 0 && callIdx % 20 === 0) {
        status = "voicemail";
        voicemailLeft--;
      } else {
        status = "completed";
      }

      // Direction
      let direction: string;
      if (outboundLeft > 0 && callIdx % 20 === 0) {
        direction = "outbound";
        outboundLeft--;
      } else {
        direction = "inbound";
      }

      // Duration
      let duration: number | null = null;
      let endDate: string | null = null;
      if (status === "completed") {
        duration = rand(30, 480);
        const end = new Date(startDate.getTime() + duration * 1000);
        endDate = end.toISOString();
      } else if (status === "voicemail") {
        duration = rand(15, 60);
        const end = new Date(startDate.getTime() + duration * 1000);
        endDate = end.toISOString();
      }

      // Sentiment
      let sentiment: string | null = null;
      if (status === "completed") {
        if (positiveLeft > 0 && (negativeLeft === 0 || Math.random() < 0.6)) {
          sentiment = "positive";
          positiveLeft--;
        } else if (neutralLeft > 0 && (negativeLeft === 0 || Math.random() < 0.6)) {
          sentiment = "neutral";
          neutralLeft--;
        } else if (negativeLeft > 0) {
          sentiment = "negative";
          negativeLeft--;
        } else if (positiveLeft > 0) {
          sentiment = "positive";
          positiveLeft--;
        } else {
          sentiment = "neutral";
          neutralLeft--;
        }
      }

      // Features
      let transcript: string | null = null;
      if (transcriptsLeft > 0 && status === "completed" && Math.random() < 0.15) {
        transcript = TRANSCRIPTS[transcriptIdx % TRANSCRIPTS.length];
        transcriptIdx++;
        transcriptsLeft--;
      }

      let aiSummary: string | null = null;
      if (summariesLeft > 0 && status === "completed" && Math.random() < 0.65) {
        aiSummary = AI_SUMMARIES[summaryIdx % AI_SUMMARIES.length];
        summaryIdx++;
        summariesLeft--;
      }

      let entities: Record<string, unknown> | null = null;
      if (entitiesLeft > 0 && status === "completed" && Math.random() < 0.55) {
        entities = ENTITIES_POOL[entitiesIdx % ENTITIES_POOL.length];
        entitiesIdx++;
        entitiesLeft--;
      }

      let followUp = false;
      if (followUpLeft > 0 && status === "completed" && Math.random() < 0.2) {
        followUp = true;
        followUpLeft--;
      }

      const callTags: string[] = [];
      if (status === "completed" && Math.random() < 0.3) {
        callTags.push(pick(OCCASIONS));
      }

      calls.push({
        id: randomUUID(),
        shop_id: SHOP_ID,
        customer_id: cust.id,
        direction,
        status,
        started_at: startDate.toISOString(),
        ended_at: endDate,
        duration_seconds: duration,
        recording_url: null,
        recording_storage_path: null,
        transcript,
        ai_summary: aiSummary,
        sentiment,
        entities_extracted: entities,
        follow_up_needed: followUp,
        tags: callTags,
      });
    }
  }

  // Insert calls in batches of 50
  for (let b = 0; b < calls.length; b += 50) {
    const batch = calls.slice(b, b + 50);
    const { error: callErr } = await sb.from("calls").insert(batch as any);
    if (callErr) {
      console.error(`Call insert batch ${b} failed:`, callErr);
      process.exit(1);
    }
  }
  console.log(`  ✓ ${calls.length} calls inserted`);

  // =====================================================================
  // 3. NOTES (50)
  // =====================================================================
  console.log("Creating 50 notes...");

  type NoteRow = {
    shop_id: string;
    customer_id: string;
    call_id: string | null;
    content: string;
    pinned: boolean;
    created_by: string;
    created_at: string;
  };

  const notes: NoteRow[] = [];

  // 10 pinned notes across first 10 customers (full profile)
  for (let i = 0; i < 10; i++) {
    notes.push({
      shop_id: SHOP_ID,
      customer_id: customers[i].id,
      call_id: null,
      content: NOTE_CONTENTS_PINNED[i],
      pinned: true,
      created_by: OWNER_ID,
      created_at: daysAgo(rand(30, 180)).toISOString(),
    });
  }

  // 40 regular notes spread across various customers
  for (let i = 0; i < 40; i++) {
    const custI = rand(0, 44);
    const custCalls = calls.filter((c) => c.customer_id === customers[custI].id);
    const linkedCall =
      Math.random() < 0.3 && custCalls.length > 0 ? pick(custCalls).id : null;

    notes.push({
      shop_id: SHOP_ID,
      customer_id: customers[custI].id,
      call_id: linkedCall,
      content: NOTE_CONTENTS_REGULAR[i % NOTE_CONTENTS_REGULAR.length],
      pinned: false,
      created_by: OWNER_ID,
      created_at: daysAgo(rand(1, 90)).toISOString(),
    });
  }

  const { error: noteErr } = await sb.from("notes").insert(notes as any);
  if (noteErr) {
    console.error("Notes insert failed:", noteErr);
    process.exit(1);
  }
  console.log(`  ✓ 50 notes inserted`);

  // =====================================================================
  // 4. ORDERS (30)
  // =====================================================================
  console.log("Creating 30 orders...");

  type OrderRow = {
    shop_id: string;
    customer_id: string;
    call_id: string | null;
    products: Array<{ name: string; quantity: number; price: number }>;
    delivery_date: string | null;
    delivery_address: string | null;
    occasion: string | null;
    special_instructions: string | null;
    budget_mentioned: number | null;
    total_amount: number;
    status: string;
  };

  const orders: OrderRow[] = [];
  const statusDist = [
    ...Array(10).fill("pending"),
    ...Array(12).fill("confirmed"),
    ...Array(6).fill("delivered"),
    ...Array(2).fill("cancelled"),
  ];

  for (let i = 0; i < 30; i++) {
    const custI = rand(0, 49);
    const cust = customers[custI];
    const custCalls = calls.filter((c) => c.customer_id === cust.id && c.status === "completed");
    const linkedCall =
      custCalls.length > 0 ? pick(custCalls).id : null;

    const numProducts = rand(1, 3);
    const products: Array<{ name: string; quantity: number; price: number }> = [];
    let total = 0;
    for (let p = 0; p < numProducts; p++) {
      const prod = pick(PRODUCTS);
      const qty = rand(1, 3);
      const price = prod.base + rand(-5, 20);
      products.push({ name: prod.name, quantity: qty, price });
      total += price * qty;
    }
    total = Math.min(Math.max(total, 35), 350);

    const deliveryDaysOut = rand(0, 30);
    const occasion = Math.random() < 0.7 ? pick(OCCASIONS) : null;

    const instructions = Math.random() < 0.3
      ? pick([
          "Please include gift wrapping",
          "Leave at the front door if nobody answers",
          "Call before delivery",
          "Deliver to reception desk, 3rd floor",
          "Ring doorbell, gate code is 1234",
          "No card needed",
        ])
      : null;

    orders.push({
      shop_id: SHOP_ID,
      customer_id: cust.id,
      call_id: linkedCall,
      products,
      delivery_date: daysFromNow(deliveryDaysOut).toISOString(),
      delivery_address: cust.address
        ? `${cust.address}, ${cust.city}, ${cust.state} ${cust.zip}`
        : `${rand(100, 9999)} ${pick(["Oak", "Main", "Elm"])} St, ${pick(CITIES)}, ${pick(STATES)}`,
      occasion,
      special_instructions: instructions,
      budget_mentioned: Math.random() < 0.4 ? rand(30, 300) : null,
      total_amount: total,
      status: statusDist[i],
    });
  }

  const { error: orderErr } = await sb.from("orders").insert(orders as any);
  if (orderErr) {
    console.error("Orders insert failed:", orderErr);
    process.exit(1);
  }
  console.log(`  ✓ 30 orders inserted`);

  // =====================================================================
  // 5. REMINDERS (20)
  // =====================================================================
  console.log("Creating 20 reminders...");

  type ReminderRow = {
    shop_id: string;
    customer_id: string;
    title: string;
    description: string | null;
    reminder_date: string;
    advance_days: number;
    recurring: boolean;
    recurrence_pattern: string | null;
    status: string;
    source: string;
    call_id: string | null;
  };

  const reminders: ReminderRow[] = [];

  for (let i = 0; i < 20; i++) {
    const custI = rand(0, 44);
    const cust = customers[custI];
    const isAuto = i < 8;
    const isRecurring = i < 5;

    let linkedCallId: string | null = null;
    if (isAuto) {
      const custCalls = calls.filter(
        (c) => c.customer_id === cust.id && c.status === "completed"
      );
      linkedCallId = custCalls.length > 0 ? pick(custCalls).id : null;
    }

    const daysOut = rand(1, 60);

    reminders.push({
      shop_id: SHOP_ID,
      customer_id: cust.id,
      title: REMINDER_TITLES[i % REMINDER_TITLES.length],
      description: Math.random() < 0.6
        ? pick([
            "Customer mentioned this during last call. Confirm details closer to date.",
            "Detected from call transcript — anniversary coming up.",
            "Annual order — customer expects a call 1 week before.",
            "Follow up on pending consultation. Customer was very interested.",
            "Birthday auto-detected from conversation. Prefers peonies.",
            "Corporate client — quarterly review and reorder.",
            "Check if customer wants to renew subscription before it expires.",
            "Reminder to send thank-you arrangement after large event order.",
          ])
        : null,
      reminder_date: isoDate(daysFromNow(daysOut)),
      advance_days: pick([3, 5, 7, 14]),
      recurring: isRecurring,
      recurrence_pattern: isRecurring ? "yearly" : null,
      status: "pending",
      source: isAuto ? "auto_detected" : "manual",
      call_id: linkedCallId,
    });
  }

  const { error: remErr } = await sb.from("reminders").insert(reminders as any);
  if (remErr) {
    console.error("Reminders insert failed:", remErr);
    process.exit(1);
  }
  console.log(`  ✓ 20 reminders inserted`);

  // =====================================================================
  // Summary
  // =====================================================================
  console.log("\n========================================");
  console.log("  Seed complete!");
  console.log("========================================");
  console.log(`  Shop:       ${SHOP_ID}`);
  console.log(`  Customers:  ${customers.length}`);
  console.log(`  Calls:      ${calls.length}`);
  console.log(`  Notes:      ${notes.length}`);
  console.log(`  Orders:     ${orders.length}`);
  console.log(`  Reminders:  ${reminders.length}`);
  console.log("========================================\n");

  // Quick stats
  const completed = calls.filter((c) => c.status === "completed").length;
  const missed = calls.filter((c) => c.status === "missed").length;
  const voicemail = calls.filter((c) => c.status === "voicemail").length;
  const withSummary = calls.filter((c) => c.ai_summary).length;
  const withEntities = calls.filter((c) => c.entities_extracted).length;
  const withTranscript = calls.filter((c) => c.transcript).length;
  const withFollowUp = calls.filter((c) => c.follow_up_needed).length;
  const inbound = calls.filter((c) => c.direction === "inbound").length;
  const positive = calls.filter((c) => c.sentiment === "positive").length;
  const neutral = calls.filter((c) => c.sentiment === "neutral").length;
  const negative = calls.filter((c) => c.sentiment === "negative").length;

  console.log("Call breakdown:");
  console.log(`  Completed: ${completed} | Missed: ${missed} | Voicemail: ${voicemail}`);
  console.log(`  Inbound: ${inbound} | Outbound: ${calls.length - inbound}`);
  console.log(`  Positive: ${positive} | Neutral: ${neutral} | Negative: ${negative}`);
  console.log(`  With AI summary: ${withSummary}`);
  console.log(`  With entities: ${withEntities}`);
  console.log(`  With transcript: ${withTranscript}`);
  console.log(`  Follow-up needed: ${withFollowUp}`);
  console.log();

  const pinnedNotes = notes.filter((n) => n.pinned).length;
  console.log(`Notes: ${pinnedNotes} pinned, ${notes.length - pinnedNotes} regular`);

  const autoReminders = reminders.filter((r) => r.source === "auto_detected").length;
  const recurringReminders = reminders.filter((r) => r.recurring).length;
  console.log(`Reminders: ${autoReminders} auto-detected, ${reminders.length - autoReminders} manual, ${recurringReminders} recurring`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
