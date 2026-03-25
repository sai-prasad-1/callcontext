import type { IndustryType, ShopIndustryConfig } from "@/lib/types/shop-config";

export const INDUSTRY_TEMPLATES: Record<IndustryType, ShopIndustryConfig> = {
  florist: {
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
  },

  bakery: {
    industry: "bakery",
    product_vocabulary: {
      categories: ["Cakes", "Cupcakes", "Pastries", "Bread", "Custom orders"],
      items: [
        "cake", "cupcake", "cookie", "pie", "pastry", "bread",
        "croissant", "muffin", "donut", "fondant", "buttercream",
        "tiered", "sheet cake", "custom cake",
      ],
    },
    occasion_vocabulary: [
      "birthday", "wedding", "baby_shower", "graduation",
      "corporate", "holiday", "anniversary", "retirement",
    ],
    preference_labels: { primary: "Flavors", secondary: "Frostings & styles", restrictions: "Dietary restrictions" },
    service_labels: { order: "Order", delivery: "Pickup/Delivery", item: "Product" },
  },

  salon: {
    industry: "salon",
    product_vocabulary: {
      categories: ["Haircuts", "Color", "Styling", "Treatments", "Nails"],
      items: [
        "haircut", "trim", "blowout", "highlights", "balayage",
        "color", "keratin", "perm", "extensions", "manicure",
        "pedicure", "facial", "waxing", "updo",
      ],
    },
    occasion_vocabulary: ["wedding", "prom", "special_event", "regular_maintenance"],
    preference_labels: { primary: "Services", secondary: "Products & brands", restrictions: "Sensitivities" },
    service_labels: { order: "Appointment", delivery: "Appointment date", item: "Service" },
  },

  auto_shop: {
    industry: "auto_shop",
    product_vocabulary: {
      categories: ["Maintenance", "Repairs", "Diagnostics", "Tires", "Body work"],
      items: [
        "oil change", "brake pads", "transmission", "alignment",
        "tire rotation", "battery", "alternator", "timing belt",
        "spark plugs", "coolant flush", "inspection", "diagnostic",
      ],
    },
    occasion_vocabulary: ["scheduled_maintenance", "emergency_repair", "inspection"],
    preference_labels: { primary: "Vehicle", secondary: "Preferred parts", restrictions: "Notes" },
    service_labels: { order: "Job", delivery: "Service date", item: "Service" },
  },

  vet_clinic: {
    industry: "vet_clinic",
    product_vocabulary: {
      categories: ["Wellness", "Surgery", "Dental", "Grooming", "Boarding"],
      items: [
        "checkup", "vaccination", "spay", "neuter", "dental cleaning",
        "x-ray", "blood work", "microchip", "flea treatment",
        "heartworm", "grooming", "boarding",
      ],
    },
    occasion_vocabulary: ["annual_checkup", "vaccination_due", "surgery", "emergency"],
    preference_labels: { primary: "Pet info", secondary: "Medications", restrictions: "Allergies & conditions" },
    service_labels: { order: "Appointment", delivery: "Visit date", item: "Service" },
  },

  restaurant: {
    industry: "restaurant",
    product_vocabulary: {
      categories: ["Catering", "Reservations", "Takeout", "Events"],
      items: [
        "catering", "reservation", "takeout", "delivery",
        "private dining", "event space", "party platter", "buffet",
      ],
    },
    occasion_vocabulary: [
      "birthday", "anniversary", "corporate", "holiday",
      "rehearsal_dinner", "graduation",
    ],
    preference_labels: { primary: "Preferences", secondary: "Favorites", restrictions: "Dietary restrictions" },
    service_labels: { order: "Order", delivery: "Date", item: "Item" },
  },

  general: {
    industry: "general",
    product_vocabulary: { categories: ["Products", "Services"], items: [] },
    occasion_vocabulary: ["birthday", "anniversary", "holiday", "special_event"],
    preference_labels: { primary: "Preferences", secondary: "Favorites", restrictions: "Restrictions" },
    service_labels: { order: "Order", delivery: "Date", item: "Item" },
  },
};
