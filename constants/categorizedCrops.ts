export interface CategorizedCrop {
  id: string;
  name: string;
  hindiName?: string;
  category: string;
  popular?: boolean;
}

export interface CropCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  crops: CategorizedCrop[];
}

export const CATEGORIZED_CROPS: CropCategory[] = [
  {
    id: "cereals",
    name: "Cereals & Millets",
    iconName: "Wheat",
    description: "Staple grains, millets, and cereal crops",
    crops: [
      { id: "rice", name: "Rice (Paddy)", hindiName: "चावल / धान", category: "Cereals & Millets", popular: true },
      { id: "wheat", name: "Wheat", hindiName: "गेहूं", category: "Cereals & Millets", popular: true },
      { id: "maize", name: "Maize (Corn)", hindiName: "मक्का", category: "Cereals & Millets", popular: true },
      { id: "pearlmillet", name: "Pearl Millet (Bajra)", hindiName: "बाजरा", category: "Cereals & Millets", popular: true },
      { id: "sorghum", name: "Sorghum (Jowar)", hindiName: "ज्वार", category: "Cereals & Millets", popular: true },
      { id: "fingermillet", name: "Finger Millet (Ragi)", hindiName: "रागी / मडुआ", category: "Cereals & Millets", popular: true },
      { id: "barley", name: "Barley (Jau)", hindiName: "जौ", category: "Cereals & Millets" },
      { id: "foxtail_millet", name: "Foxtail Millet (Kangni)", hindiName: "कंगनी", category: "Cereals & Millets" },
      { id: "proso_millet", name: "Proso Millet (Cheena)", hindiName: "चीना", category: "Cereals & Millets" },
      { id: "barnyard_millet", name: "Barnyard Millet (Sanwa)", hindiName: "सांवा", category: "Cereals & Millets" },
      { id: "little_millet", name: "Little Millet (Kutki)", hindiName: "कुटकी", category: "Cereals & Millets" },
      { id: "kodo_millet", name: "Kodo Millet (Kodon)", hindiName: "कोदो", category: "Cereals & Millets" },
      { id: "oats", name: "Oats (Jaye)", hindiName: "जई", category: "Cereals & Millets" },
      { id: "rye", name: "Rye", hindiName: "राई अनाज", category: "Cereals & Millets" },
      { id: "quinoa", name: "Quinoa", hindiName: "क्विनोआ", category: "Cereals & Millets" },
    ],
  },
  {
    id: "pulses",
    name: "Pulses & Legumes",
    iconName: "Layers",
    description: "Protein-rich lentils, beans, and pulse crops",
    crops: [
      { id: "chickpea", name: "Chickpea (Gram / Chana)", hindiName: "चना", category: "Pulses & Legumes", popular: true },
      { id: "pigeonpea", name: "Pigeonpea (Arhar / Tur)", hindiName: "अरहर / तुअर", category: "Pulses & Legumes", popular: true },
      { id: "greengram", name: "Green Gram (Moong)", hindiName: "मूंग", category: "Pulses & Legumes", popular: true },
      { id: "blackgram", name: "Black Gram (Urad)", hindiName: "उड़द", category: "Pulses & Legumes", popular: true },
      { id: "lentil", name: "Lentil (Masoor)", hindiName: "मसूर", category: "Pulses & Legumes", popular: true },
      { id: "fieldpea", name: "Field Pea (Matar)", hindiName: "मटर", category: "Pulses & Legumes" },
      { id: "cowpea", name: "Cowpea (Lobia)", hindiName: "लोबिया / चौलाई", category: "Pulses & Legumes" },
      { id: "kidneybeans", name: "Kidney Beans (Rajma)", hindiName: "राजमा", category: "Pulses & Legumes", popular: true },
      { id: "mothbean", name: "Moth Bean (Matki)", hindiName: "मोठ", category: "Pulses & Legumes" },
      { id: "horsegram", name: "Horse Gram (Kulthi)", hindiName: "कुलथी", category: "Pulses & Legumes" },
      { id: "clusterbean", name: "Cluster Bean (Guar)", hindiName: "ग्वार", category: "Pulses & Legumes" },
    ],
  },
  {
    id: "oilseeds",
    name: "Oilseeds",
    iconName: "Droplets",
    description: "Edible and industrial oil producing crops",
    crops: [
      { id: "mustard", name: "Mustard & Rapeseed (Sarson)", hindiName: "सरसों / राई", category: "Oilseeds", popular: true },
      { id: "groundnut", name: "Groundnut (Peanut)", hindiName: "मूंगफली", category: "Oilseeds", popular: true },
      { id: "soybean", name: "Soybean", hindiName: "सोयाबीन", category: "Oilseeds", popular: true },
      { id: "sunflower", name: "Sunflower", hindiName: "सूरजमुखी", category: "Oilseeds", popular: true },
      { id: "sesame", name: "Sesame (Til)", hindiName: "तिल", category: "Oilseeds", popular: true },
      { id: "castor", name: "Castor (Arandi)", hindiName: "अरंडी", category: "Oilseeds", popular: true },
      { id: "safflower", name: "Safflower (Kusum)", hindiName: "कुसुम", category: "Oilseeds" },
      { id: "linseed", name: "Linseed (Flaxseed / Alsi)", hindiName: "अलसी", category: "Oilseeds" },
      { id: "nigerseed", name: "Niger Seed (Ramtil)", hindiName: "रामतिल", category: "Oilseeds" },
      { id: "palmoil", name: "Oil Palm", hindiName: "ऑयल पाम", category: "Oilseeds" },
    ],
  },
  {
    id: "cash_crops",
    name: "Cash & Fiber Crops",
    iconName: "Sparkles",
    description: "High-value industrial, fiber, and commercial crops",
    crops: [
      { id: "cotton", name: "Cotton (Kapas)", hindiName: "कपास", category: "Cash & Fiber Crops", popular: true },
      { id: "sugarcane", name: "Sugarcane (Ganna)", hindiName: "गन्ना", category: "Cash & Fiber Crops", popular: true },
      { id: "jute", name: "Jute (Patson)", hindiName: "जूट / पटसन", category: "Cash & Fiber Crops" },
      { id: "tobacco", name: "Tobacco (Tambaku)", hindiName: "तंबाकू", category: "Cash & Fiber Crops" },
      { id: "betelvine", name: "Betelvine (Paan)", hindiName: "पान", category: "Cash & Fiber Crops" },
      { id: "sunnhemp", name: "Sunn Hemp (Sanai)", hindiName: "सनई", category: "Cash & Fiber Crops" },
      { id: "mesta", name: "Mesta (Kenaf)", hindiName: "मेस्टा", category: "Cash & Fiber Crops" },
    ],
  },
  {
    id: "vegetables",
    name: "Vegetables",
    iconName: "Carrot",
    description: "Solanaceous, gourds, root crops, and green vegetables",
    crops: [
      { id: "tomato", name: "Tomato", hindiName: "टमाटर", category: "Vegetables", popular: true },
      { id: "potato", name: "Potato", hindiName: "आलू", category: "Vegetables", popular: true },
      { id: "onion", name: "Onion", hindiName: "प्याज", category: "Vegetables", popular: true },
      { id: "garlic", name: "Garlic", hindiName: "लहसुन", category: "Vegetables", popular: true },
      { id: "brinjal", name: "Brinjal (Eggplant / Baingan)", hindiName: "बैंगन", category: "Vegetables", popular: true },
      { id: "chilli", name: "Green Chilli (Mirchi)", hindiName: "हरी मिर्च", category: "Vegetables", popular: true },
      { id: "capsicum", name: "Capsicum (Bell Pepper / Shimla Mirch)", hindiName: "शिमला मिर्च", category: "Vegetables", popular: true },
      { id: "okra", name: "Okra (Lady Finger / Bhindi)", hindiName: "भिंडी", category: "Vegetables", popular: true },
      { id: "cauliflower", name: "Cauliflower (Phool Gobhi)", hindiName: "फूलगोभी", category: "Vegetables", popular: true },
      { id: "cabbage", name: "Cabbage (Patta Gobhi)", hindiName: "पत्तागोभी", category: "Vegetables", popular: true },
      { id: "broccoli", name: "Broccoli", hindiName: "ब्रोकली", category: "Vegetables" },
      { id: "bottlegourd", name: "Bottle Gourd (Lauki / Ghiya)", hindiName: "लौकी", category: "Vegetables", popular: true },
      { id: "bittergourd", name: "Bitter Gourd (Karela)", hindiName: "करेला", category: "Vegetables", popular: true },
      { id: "ridgegourd", name: "Ridge Gourd (Turai)", hindiName: "तुरई", category: "Vegetables" },
      { id: "spongegourd", name: "Sponge Gourd (Galka / Nenua)", hindiName: "नेनुआ / गिलकी", category: "Vegetables" },
      { id: "snakegourd", name: "Snake Gourd (Chichinda)", hindiName: "चिचिंडा", category: "Vegetables" },
      { id: "ashgourd", name: "Ash Gourd (Petha / White Gourd)", hindiName: "पेठा कद्दू", category: "Vegetables" },
      { id: "pumpkin", name: "Pumpkin (Kaddu / Sitaphal)", hindiName: "कद्दू", category: "Vegetables" },
      { id: "cucumber", name: "Cucumber (Kheera)", hindiName: "खीरा / ककड़ी", category: "Vegetables", popular: true },
      { id: "spinach", name: "Spinach (Palak)", hindiName: "पालक", category: "Vegetables", popular: true },
      { id: "fenugreek_veg", name: "Fenugreek Leaves (Methi)", hindiName: "मेथी पत्ता", category: "Vegetables" },
      { id: "coriander_veg", name: "Coriander Leaves (Dhania)", hindiName: "धनिया पत्ता", category: "Vegetables" },
      { id: "radish", name: "Radish (Mooli)", hindiName: "मूली", category: "Vegetables" },
      { id: "carrot", name: "Carrot (Gajar)", hindiName: "गाजर", category: "Vegetables", popular: true },
      { id: "beetroot", name: "Beetroot (Chukandar)", hindiName: "चुकंदर", category: "Vegetables" },
      { id: "sweetpotato", name: "Sweet Potato (Shakarkand)", hindiName: "शकरकंद", category: "Vegetables" },
      { id: "colocasia", name: "Colocasia (Arbi / Taro)", hindiName: "अरबी", category: "Vegetables" },
      { id: "elephantfootyam", name: "Elephant Foot Yam (Suran / Jimikand)", hindiName: "जिमीकंद / सूरन", category: "Vegetables" },
      { id: "drumstick", name: "Drumstick (Moringa / Sahjan)", hindiName: "सहजन / मोरिंगा", category: "Vegetables" },
      { id: "greenpeas", name: "Green Peas (Matar)", hindiName: "हरी मटर", category: "Vegetables", popular: true },
      { id: "frenchbeans", name: "French Beans", hindiName: "फ्रेंच बीन्स", category: "Vegetables" },
      { id: "pointedgourd", name: "Pointed Gourd (Parwal)", hindiName: "परवल", category: "Vegetables" },
      { id: "ivygourd", name: "Ivy Gourd (Kundru / Tindora)", hindiName: "कुंदरू / टिंडोरा", category: "Vegetables" },
    ],
  },
  {
    id: "fruits",
    name: "Fruits & Orchards",
    iconName: "Apple",
    description: "Tropical, subtropical, temperate, and arid fruit crops",
    crops: [
      { id: "mango", name: "Mango (Aam)", hindiName: "आम", category: "Fruits & Orchards", popular: true },
      { id: "banana", name: "Banana (Kela)", hindiName: "केला", category: "Fruits & Orchards", popular: true },
      { id: "papaya", name: "Papaya (Papita)", hindiName: "पपीता", category: "Fruits & Orchards", popular: true },
      { id: "guava", name: "Guava (Amrood)", hindiName: "अमरूद", category: "Fruits & Orchards", popular: true },
      { id: "pomegranate", name: "Pomegranate (Anar)", hindiName: "अनार", category: "Fruits & Orchards", popular: true },
      { id: "apple", name: "Apple (Seb)", hindiName: "सेब", category: "Fruits & Orchards", popular: true },
      { id: "sweetorange", name: "Sweet Orange (Mosambi)", hindiName: "मोसमी", category: "Fruits & Orchards", popular: true },
      { id: "mandarin", name: "Mandarin Orange (Santra)", hindiName: "संतरा", category: "Fruits & Orchards", popular: true },
      { id: "lemon", name: "Lemon / Acid Lime (Nimbu)", hindiName: "नींबू", category: "Fruits & Orchards", popular: true },
      { id: "grapes", name: "Grapes (Angoor)", hindiName: "अंगूर", category: "Fruits & Orchards", popular: true },
      { id: "sapota", name: "Sapota (Chiku)", hindiName: "चीकू", category: "Fruits & Orchards" },
      { id: "custardapple", name: "Custard Apple (Sitaphal / Sharifa)", hindiName: "सीताफल / शरीफा", category: "Fruits & Orchards" },
      { id: "pineapple", name: "Pineapple (Ananas)", hindiName: "अनानास", category: "Fruits & Orchards" },
      { id: "jackfruit", name: "Jackfruit (Kathal)", hindiName: "कटहल", category: "Fruits & Orchards" },
      { id: "litchi", name: "Litchi (Lychee)", hindiName: "लीची", category: "Fruits & Orchards" },
      { id: "dragonfruit", name: "Dragon Fruit (Kamalam)", hindiName: "ड्रैगन फ्रूट / कमलम", category: "Fruits & Orchards", popular: true },
      { id: "strawberry", name: "Strawberry", hindiName: "स्ट्रॉबेरी", category: "Fruits & Orchards" },
      { id: "watermelon", name: "Watermelon (Tarbooj)", hindiName: "तरबूज", category: "Fruits & Orchards", popular: true },
      { id: "muskmelon", name: "Muskmelon (Kharbooja)", hindiName: "खरबूजा", category: "Fruits & Orchards" },
      { id: "fig", name: "Fig (Anjeer)", hindiName: "अंजीर", category: "Fruits & Orchards" },
      { id: "datepalm", name: "Date Palm (Khajoor)", hindiName: "खजूर", category: "Fruits & Orchards" },
      { id: "ber", name: "Ber (Indian Jujube)", hindiName: "बेर", category: "Fruits & Orchards" },
      { id: "amla", name: "Amla (Indian Gooseberry)", hindiName: "आंवला", category: "Fruits & Orchards" },
      { id: "avocado", name: "Avocado", hindiName: "एवोकाडो", category: "Fruits & Orchards" },
      { id: "kiwi", name: "Kiwi", hindiName: "कीवी", category: "Fruits & Orchards" },
    ],
  },
  {
    id: "spices",
    name: "Spices & Condiments",
    iconName: "Flame",
    description: "Aromatic seed spices, rhizomes, and culinary condiments",
    crops: [
      { id: "turmeric", name: "Turmeric (Haldi)", hindiName: "हल्दी", category: "Spices & Condiments", popular: true },
      { id: "ginger", name: "Ginger (Adrak)", hindiName: "अदरक", category: "Spices & Condiments", popular: true },
      { id: "cumin", name: "Cumin (Jeera)", hindiName: "जीरा", category: "Spices & Condiments", popular: true },
      { id: "coriander_seed", name: "Coriander Seed (Dhania)", hindiName: "धनिया बीज", category: "Spices & Condiments", popular: true },
      { id: "fennel", name: "Fennel (Saunf)", hindiName: "सौंफ", category: "Spices & Condiments", popular: true },
      { id: "blackpepper", name: "Black Pepper (Kali Mirch)", hindiName: "काली मिर्च", category: "Spices & Condiments", popular: true },
      { id: "cardamom", name: "Small Cardamom (Chhoti Elaichi)", hindiName: "इलायची", category: "Spices & Condiments" },
      { id: "largecardamom", name: "Large Cardamom (Badi Elaichi)", hindiName: "बड़ी इलायची", category: "Spices & Condiments" },
      { id: "fenugreek_seed", name: "Fenugreek Seed (Methi Dana)", hindiName: "मेथी दाना", category: "Spices & Condiments" },
      { id: "ajwain", name: "Ajwain (Carom Seed)", hindiName: "अजवायन", category: "Spices & Condiments" },
      { id: "redchilli_dry", name: "Red Chilli Dry (Sukhi Mirch)", hindiName: "लाल मिर्च सूखी", category: "Spices & Condiments", popular: true },
      { id: "clove", name: "Clove (Laung)", hindiName: "लौंग", category: "Spices & Condiments" },
      { id: "cinnamon", name: "Cinnamon (Dalchini)", hindiName: "दालचीनी", category: "Spices & Condiments" },
      { id: "nutmeg", name: "Nutmeg & Mace (Jaiphal)", hindiName: "जायफल", category: "Spices & Condiments" },
      { id: "saffron", name: "Saffron (Kesar)", hindiName: "केसर", category: "Spices & Condiments" },
    ],
  },
  {
    id: "plantation",
    name: "Plantation & Beverages",
    iconName: "Coffee",
    description: "Perennial plantation, nut, and beverage crops",
    crops: [
      { id: "tea", name: "Tea (Chai)", hindiName: "चाय", category: "Plantation & Beverages", popular: true },
      { id: "coffee", name: "Coffee", hindiName: "कॉफ़ी", category: "Plantation & Beverages", popular: true },
      { id: "coconut", name: "Coconut (Nariyal)", hindiName: "नारियल", category: "Plantation & Beverages", popular: true },
      { id: "arecanut", name: "Arecanut (Betel Nut / Supari)", hindiName: "सुपारी", category: "Plantation & Beverages", popular: true },
      { id: "cashewnut", name: "Cashew Nut (Kaju)", hindiName: "काजू", category: "Plantation & Beverages", popular: true },
      { id: "cocoa", name: "Cocoa", hindiName: "कोको", category: "Plantation & Beverages" },
      { id: "rubber", name: "Rubber", hindiName: "रबर", category: "Plantation & Beverages" },
    ],
  },
  {
    id: "medicinal_flowers",
    name: "Medicinal, Aromatic & Flowers",
    iconName: "Flower2",
    description: "Herbal medicines, essential oils, and commercial floriculture",
    crops: [
      { id: "ashwagandha", name: "Ashwagandha", hindiName: "अश्वगंधा", category: "Medicinal, Aromatic & Flowers", popular: true },
      { id: "tulsi", name: "Tulsi (Holy Basil)", hindiName: "तुलसी", category: "Medicinal, Aromatic & Flowers", popular: true },
      { id: "aloevera", name: "Aloe Vera (Ghritkumari)", hindiName: "एलोवेरा / घृतकुमारी", category: "Medicinal, Aromatic & Flowers", popular: true },
      { id: "stevia", name: "Stevia (Meethi Tulsi)", hindiName: "स्टीविया / मीठी पत्ती", category: "Medicinal, Aromatic & Flowers" },
      { id: "lemongrass", name: "Lemongrass", hindiName: "लेमनग्रास", category: "Medicinal, Aromatic & Flowers" },
      { id: "mentha", name: "Mentha / Mint (Pudina)", hindiName: "मेंथा / पिपरमिंट", category: "Medicinal, Aromatic & Flowers", popular: true },
      { id: "isabgol", name: "Isabgol (Psyllium Husk)", hindiName: "इसबगोल", category: "Medicinal, Aromatic & Flowers" },
      { id: "marigold", name: "Marigold (Genda)", hindiName: "गेंदा", category: "Medicinal, Aromatic & Flowers", popular: true },
      { id: "rose", name: "Rose (Gulab)", hindiName: "गुलाब", category: "Medicinal, Aromatic & Flowers", popular: true },
      { id: "jasmine", name: "Jasmine (Mogra)", hindiName: "मोगरा / चमेली", category: "Medicinal, Aromatic & Flowers" },
      { id: "tuberose", name: "Tuberose (Rajnigandha)", hindiName: "रजनीगंधा", category: "Medicinal, Aromatic & Flowers" },
      { id: "chrysanthemum", name: "Chrysanthemum (Guldaudi / Sevanti)", hindiName: "गुलदाउदी", category: "Medicinal, Aromatic & Flowers" },
    ],
  },
  {
    id: "fodder",
    name: "Fodder & Forage",
    iconName: "Tractor",
    description: "Nutritious animal feed, green fodder, and pasture grasses",
    crops: [
      { id: "berseem", name: "Berseem (Egyptian Clover)", hindiName: "बरसीम", category: "Fodder & Forage", popular: true },
      { id: "lucerne", name: "Lucerne (Alfalfa / Rijka)", hindiName: "रिजका / अल्फाल्फा", category: "Fodder & Forage", popular: true },
      { id: "fodder_sorghum", name: "Fodder Sorghum (Chari)", hindiName: "चरी ज्वार", category: "Fodder & Forage", popular: true },
      { id: "napier_grass", name: "Hybrid Napier Grass (Hathi Ghas)", hindiName: "हाथी घास / नेपियर", category: "Fodder & Forage" },
      { id: "fodder_maize", name: "Fodder Maize", hindiName: "चारा मक्का", category: "Fodder & Forage" },
      { id: "fodder_oat", name: "Fodder Oat", hindiName: "चारा जई", category: "Fodder & Forage" },
      { id: "guinea_grass", name: "Guinea Grass", hindiName: "गिनी घास", category: "Fodder & Forage" },
    ],
  },
];

/** Flat array of all crops across all categories */
export const ALL_CATEGORIZED_CROPS: CategorizedCrop[] = CATEGORIZED_CROPS.flatMap(
  (cat) => cat.crops,
);

/**
 * Find matching crop by search term across English name, Hindi name, and category
 */
export function searchCategorizedCrops(query: string): CategorizedCrop[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_CATEGORIZED_CROPS;
  return ALL_CATEGORIZED_CROPS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.hindiName && c.hindiName.toLowerCase().includes(q)) ||
      c.category.toLowerCase().includes(q),
  );
}

/**
 * Get clean canonical English crop name suitable for AI/RAG models (e.g., "Tomato", "Ashwagandha", "Cotton")
 */
export function getCleanCropName(cropIdOrName?: string): string {
  if (!cropIdOrName || cropIdOrName === "general") return "General";

  const rawId = cropIdOrName.startsWith("custom_")
    ? cropIdOrName.replace(/^custom_/, "")
    : cropIdOrName.toLowerCase();

  const match = ALL_CATEGORIZED_CROPS.find(
    (c) => c.id.toLowerCase() === rawId || c.name.toLowerCase().startsWith(rawId),
  );

  if (match) {
    return match.name.split(" (")[0].trim();
  }

  // If starts with custom_ and not matched, format cleanly
  if (cropIdOrName.startsWith("custom_")) {
    return cropIdOrName
      .replace(/^custom_/, "")
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  return cropIdOrName.charAt(0).toUpperCase() + cropIdOrName.slice(1);
}

/**
 * Check if the selected crop is a custom/catalog crop
 */
export function isCustomCrop(cropIdOrName?: string): boolean {
  if (!cropIdOrName) return false;
  return cropIdOrName.startsWith("custom_");
}

