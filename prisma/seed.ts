import { PrismaClient, UserRole, PriceSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// All 64 Districts of Bangladesh with coordinates & division
const bangladeshDistricts = [
  // Dhaka Division
  { nameEn: 'Dhaka', nameBn: 'ঢাকা', division: 'Dhaka', latitude: 23.8103, longitude: 90.4125 },
  { nameEn: 'Gazipur', nameBn: 'গাজীপুর', division: 'Dhaka', latitude: 24.0023, longitude: 90.4264 },
  { nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', division: 'Dhaka', latitude: 23.6238, longitude: 90.5000 },
  { nameEn: 'Tangail', nameBn: 'টাঙ্গাইল', division: 'Dhaka', latitude: 24.2513, longitude: 89.9167 },
  { nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', division: 'Dhaka', latitude: 24.4449, longitude: 90.7766 },
  { nameEn: 'Narsingdi', nameBn: 'নরসিংদী', division: 'Dhaka', latitude: 23.9193, longitude: 90.7176 },
  { nameEn: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', division: 'Dhaka', latitude: 23.5422, longitude: 90.5305 },
  { nameEn: 'Manikganj', nameBn: 'মানিকগঞ্জ', division: 'Dhaka', latitude: 23.8644, longitude: 90.0047 },
  { nameEn: 'Faridpur', nameBn: 'ফরিদপুর', division: 'Dhaka', latitude: 23.6071, longitude: 89.8429 },
  { nameEn: 'Gopalganj', nameBn: 'গোপালগঞ্জ', division: 'Dhaka', latitude: 23.0051, longitude: 89.8266 },
  { nameEn: 'Madaripur', nameBn: 'মাদারীপুর', division: 'Dhaka', latitude: 23.1641, longitude: 90.1897 },
  { nameEn: 'Rajbari', nameBn: 'রাজবাড়ী', division: 'Dhaka', latitude: 23.7574, longitude: 89.6445 },
  { nameEn: 'Shariatpur', nameBn: 'শরীয়তপুর', division: 'Dhaka', latitude: 23.2423, longitude: 90.4348 },

  // Chattogram Division
  { nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম', division: 'Chattogram', latitude: 22.3569, longitude: 91.7832 },
  { nameEn: "Cox's Bazar", nameBn: 'কক্সবাজার', division: 'Chattogram', latitude: 21.4272, longitude: 92.0058 },
  { nameEn: 'Cumilla', nameBn: 'কুমিল্লা', division: 'Chattogram', latitude: 23.4682, longitude: 91.1788 },
  { nameEn: 'Feni', nameBn: 'ফেনী', division: 'Chattogram', latitude: 23.0186, longitude: 91.3966 },
  { nameEn: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', division: 'Chattogram', latitude: 23.9571, longitude: 91.1119 },
  { nameEn: 'Rangamati', nameBn: 'রাঙ্গামাটি', division: 'Chattogram', latitude: 22.6533, longitude: 92.1753 },
  { nameEn: 'Noakhali', nameBn: 'নোয়াখালী', division: 'Chattogram', latitude: 22.8696, longitude: 91.0994 },
  { nameEn: 'Chandpur', nameBn: 'চাঁদপুর', division: 'Chattogram', latitude: 23.2333, longitude: 90.6667 },
  { nameEn: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', division: 'Chattogram', latitude: 22.9425, longitude: 90.8412 },
  { nameEn: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', division: 'Chattogram', latitude: 23.1193, longitude: 91.9847 },
  { nameEn: 'Bandarban', nameBn: 'বান্দরবান', division: 'Chattogram', latitude: 22.1953, longitude: 92.2184 },

  // Rajshahi Division
  { nameEn: 'Rajshahi', nameBn: 'রাজশাহী', division: 'Rajshahi', latitude: 24.3745, longitude: 88.6042 },
  { nameEn: 'Bogura', nameBn: 'বগুড়া', division: 'Rajshahi', latitude: 24.8465, longitude: 89.3777 },
  { nameEn: 'Pabna', nameBn: 'পাবনা', division: 'Rajshahi', latitude: 24.0064, longitude: 89.2372 },
  { nameEn: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', division: 'Rajshahi', latitude: 24.4534, longitude: 89.7008 },
  { nameEn: 'Naogaon', nameBn: 'নওগাঁ', division: 'Rajshahi', latitude: 24.8138, longitude: 88.9482 },
  { nameEn: 'Natore', nameBn: 'নাটোর', division: 'Rajshahi', latitude: 24.4206, longitude: 88.9322 },
  { nameEn: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', division: 'Rajshahi', latitude: 24.5965, longitude: 88.2775 },
  { nameEn: 'Joypurhat', nameBn: 'জয়পুরহাট', division: 'Rajshahi', latitude: 25.1015, longitude: 89.0277 },

  // Khulna Division
  { nameEn: 'Khulna', nameBn: 'খুলনা', division: 'Khulna', latitude: 22.8456, longitude: 89.5403 },
  { nameEn: 'Jashore', nameBn: 'যশোর', division: 'Khulna', latitude: 23.1664, longitude: 89.2081 },
  { nameEn: 'Satkhira', nameBn: 'সাতক্ষীরা', division: 'Khulna', latitude: 22.7185, longitude: 89.0705 },
  { nameEn: 'Bagerhat', nameBn: 'বাগেরহাট', division: 'Khulna', latitude: 22.6516, longitude: 89.7859 },
  { nameEn: 'Kushtia', nameBn: 'কুষ্টিয়া', division: 'Khulna', latitude: 23.9013, longitude: 89.1204 },
  { nameEn: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', division: 'Khulna', latitude: 23.6402, longitude: 88.8418 },
  { nameEn: 'Meherpur', nameBn: 'মেহেরপুর', division: 'Khulna', latitude: 23.7725, longitude: 88.6318 },
  { nameEn: 'Jhenaidah', nameBn: 'ঝিনাইদহ', division: 'Khulna', latitude: 23.5448, longitude: 89.1539 },
  { nameEn: 'Magura', nameBn: 'মাগুরা', division: 'Khulna', latitude: 23.4873, longitude: 89.4199 },
  { nameEn: 'Narail', nameBn: 'নড়াইল', division: 'Khulna', latitude: 23.1725, longitude: 89.5127 },

  // Barishal Division
  { nameEn: 'Barishal', nameBn: 'বরিশাল', division: 'Barishal', latitude: 22.7010, longitude: 90.3535 },
  { nameEn: 'Bhola', nameBn: 'ভোলা', division: 'Barishal', latitude: 22.6859, longitude: 90.6481 },
  { nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী', division: 'Barishal', latitude: 22.3596, longitude: 90.3299 },
  { nameEn: 'Pirojpur', nameBn: 'পিরোজপুর', division: 'Barishal', latitude: 22.5841, longitude: 89.9720 },
  { nameEn: 'Barguna', nameBn: 'বরগুনা', division: 'Barishal', latitude: 22.0953, longitude: 90.0617 },
  { nameEn: 'Jhalokathi', nameBn: 'ঝালকাঠি', division: 'Barishal', latitude: 22.6406, longitude: 90.1987 },

  // Sylhet Division
  { nameEn: 'Sylhet', nameBn: 'সিলেট', division: 'Sylhet', latitude: 24.8949, longitude: 91.8687 },
  { nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার', division: 'Sylhet', latitude: 24.4829, longitude: 91.7774 },
  { nameEn: 'Habiganj', nameBn: 'হবিগঞ্জ', division: 'Sylhet', latitude: 24.3749, longitude: 91.4155 },
  { nameEn: 'Sunamganj', nameBn: 'সুনামগঞ্জ', division: 'Sylhet', latitude: 25.0658, longitude: 91.3950 },

  // Rangpur Division
  { nameEn: 'Rangpur', nameBn: 'রংপুর', division: 'Rangpur', latitude: 25.7439, longitude: 89.2752 },
  { nameEn: 'Dinajpur', nameBn: 'দিনাজপুর', division: 'Rangpur', latitude: 25.6217, longitude: 88.6355 },
  { nameEn: 'Kurigram', nameBn: 'কুড়িগ্রাম', division: 'Rangpur', latitude: 25.8054, longitude: 89.6362 },
  { nameEn: 'Gaibandha', nameBn: 'গাইবান্ধা', division: 'Rangpur', latitude: 25.3288, longitude: 89.5407 },
  { nameEn: 'Nilphamari', nameBn: 'নীলফামারী', division: 'Rangpur', latitude: 25.9318, longitude: 88.8560 },
  { nameEn: 'Panchagarh', nameBn: 'পঞ্চগড়', division: 'Rangpur', latitude: 26.3411, longitude: 88.5542 },
  { nameEn: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', division: 'Rangpur', latitude: 26.0337, longitude: 88.4617 },
  { nameEn: 'Lalmonirhat', nameBn: 'লালমনিরহাট', division: 'Rangpur', latitude: 25.9923, longitude: 89.2847 },

  // Mymensingh Division
  { nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ', division: 'Mymensingh', latitude: 24.7471, longitude: 90.4203 },
  { nameEn: 'Jamalpur', nameBn: 'জামালপুর', division: 'Mymensingh', latitude: 24.9375, longitude: 89.9378 },
  { nameEn: 'Netrokona', nameBn: 'নেত্রকোণা', division: 'Mymensingh', latitude: 24.8709, longitude: 90.7279 },
  { nameEn: 'Sherpur', nameBn: 'শেরপুর', division: 'Mymensingh', latitude: 25.0205, longitude: 90.0153 }
];

const categories = [
  { nameEn: 'Paddy & Rice', nameBn: 'ধান ও চাল', slug: 'rice', icon: '🌾', description: 'Miniket, Nazirshail, BR-28, Chinigura' },
  { nameEn: 'Potato', nameBn: 'আলু', slug: 'potato', icon: '🥔', description: 'Diamond, Cardinal, Granola' },
  { nameEn: 'Onion & Garlic', nameBn: 'পেঁয়াজ ও রসুন', slug: 'onion', icon: '🧅', description: 'Deshi Onion, Taherpuri, Garlic' },
  { nameEn: 'Tomato', nameBn: 'টমেটো', slug: 'tomato', icon: '🍅', description: 'Fresh summer and winter hybrid tomatoes' },
  { nameEn: 'Green Chili & Spices', nameBn: 'কাঁচা মরিচ ও মসলা', slug: 'green-chili', icon: '🌶️', description: 'Fresh green chili, ginger, turmeric' },
  { nameEn: 'Jute & Fiber', nameBn: 'পাট ও আঁশ', slug: 'jute', icon: '🌿', description: 'Golden fiber tosha and deshi jute' },
  { nameEn: 'Mango & Seasonal Fruits', nameBn: 'আম ও ফলমূল', slug: 'mango', icon: '🥭', description: 'Himsagar, Fazli, Amrapali, Langra' },
  { nameEn: 'Mustard & Oilseeds', nameBn: 'সরিষা ও তেলবীজ', slug: 'mustard', icon: '🌼', description: 'Tori-7, BARI Sarisha' },
  { nameEn: 'Lentils & Pulses', nameBn: 'ডাল ও ডালজাতীয়', slug: 'lentils', icon: '🥣', description: 'Mosur, Mug, Kheshari' }
];

const vehicleTypes = [
  { nameEn: 'Small Pickup (1-2 Ton)', nameBn: 'ছোট পিকআপ (১-২ টন)', ratePerKm: 25, maxWeightKg: 2000, description: 'Best for local and small orders (up to 2,000 kg)' },
  { nameEn: 'Medium Covered Van (3-5 Ton)', nameBn: 'কাভার্ড ভ্যান (৩-৫ টন)', ratePerKm: 42, maxWeightKg: 5000, description: 'Weatherproof container van (up to 5,000 kg)' },
  { nameEn: 'Standard Open Truck (7-10 Ton)', nameBn: 'মাঝারি খোলা ট্রাক (৭-১০ টন)', ratePerKm: 68, maxWeightKg: 10000, description: 'Heavy transport for bulk grain & produce (up to 10,000 kg)' },
  { nameEn: 'Heavy Freight Truck (15 Ton)', nameBn: '১০ চাকার বড় ট্রাক (১৫ টন)', ratePerKm: 95, maxWeightKg: 15000, description: 'Inter-district highway carrier (up to 15,000 kg)' }
];

async function main() {
  console.log('🌱 Starting KrishiBazar Database Seed...');

  // 1. Seed Districts
  console.log(`📍 Seeding ${bangladeshDistricts.length} Districts of Bangladesh...`);
  const districtMap = new Map<string, string>();
  for (const d of bangladeshDistricts) {
    const district = await prisma.district.upsert({
      where: { nameEn: d.nameEn },
      update: {
        nameBn: d.nameBn,
        division: d.division,
        latitude: d.latitude,
        longitude: d.longitude
      },
      create: d
    });
    districtMap.set(d.nameEn, district.id);
  }

  // 2. Seed Categories
  console.log('📦 Seeding Product Categories...');
  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    const category = await prisma.productCategory.upsert({
      where: { slug: c.slug },
      update: {
        nameEn: c.nameEn,
        nameBn: c.nameBn,
        icon: c.icon,
        description: c.description
      },
      create: c
    });
    categoryMap.set(c.slug, category.id);
  }

  // 3. Seed Vehicle Types
  console.log('🚚 Seeding Vehicle Types...');
  for (const v of vehicleTypes) {
    await prisma.vehicleType.upsert({
      where: { nameEn: v.nameEn },
      update: {
        nameBn: v.nameBn,
        ratePerKm: v.ratePerKm,
        maxWeightKg: v.maxWeightKg,
        description: v.description
      },
      create: v
    });
  }

  // 4. Seed Users & Roles
  console.log('👥 Seeding Users with Roles...');
  const defaultPasswordHash = await bcrypt.hash('Krishi@123456', 10);

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@krishibazar.gov.bd' },
    update: { role: UserRole.ADMIN, name: 'কৃষি সম্প্রসারণ কর্মকর্তা (Admin)' },
    create: {
      email: 'admin@krishibazar.gov.bd',
      name: 'কৃষি সম্প্রসারণ কর্মকর্তা (Admin)',
      passwordHash: defaultPasswordHash,
      phone: '01711000001',
      role: UserRole.ADMIN
    }
  });

  // Price Editor
  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@krishibazar.gov.bd' },
    update: { role: UserRole.PRICE_EDITOR, name: 'বাজার দর নিয়ন্ত্রক (Price Editor)' },
    create: {
      email: 'editor@krishibazar.gov.bd',
      name: 'বাজার দর নিয়ন্ত্রক (Price Editor)',
      passwordHash: defaultPasswordHash,
      phone: '01711000002',
      role: UserRole.PRICE_EDITOR
    }
  });

  // Farmer Rahim (Bogura)
  const boguraDistrictId = districtMap.get('Bogura')!;
  const farmerRahimUser = await prisma.user.upsert({
    where: { email: 'farmer.rahim@krishibazar.com' },
    update: { role: UserRole.FARMER, name: 'মো: রহিম উদ্দিন (কৃষক)' },
    create: {
      email: 'farmer.rahim@krishibazar.com',
      name: 'মো: রহিম উদ্দিন (কৃষক)',
      passwordHash: defaultPasswordHash,
      phone: '01711223344',
      role: UserRole.FARMER
    }
  });

  const rahimProfile = await prisma.farmerProfile.upsert({
    where: { userId: farmerRahimUser.id },
    update: {},
    create: {
      userId: farmerRahimUser.id,
      fullName: 'মো: রহিম উদ্দিন',
      phone: '01711223344',
      bio: 'বগুড়ার মহাস্থানগড়ে ২৫ বছর ধরে উন্নত মানের আলু ও সুগন্ধি চাল চাষ করছি। কীটনাশকমুক্ত ফসল সরাসরি কৃষকের হাত থেকে ক্রেতার কাছে পৌঁছে দেওয়াই আমাদের লক্ষ্য।',
      profileImageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80',
      districtId: boguraDistrictId
    }
  });

  const rahimFarm = await prisma.farm.upsert({
    where: { id: 'farm_rahim_bogura_01' },
    update: {},
    create: {
      id: 'farm_rahim_bogura_01',
      farmerProfileId: rahimProfile.id,
      name: 'রহিম এগ্রো ফার্ম (Mahasthangarh Farm)',
      landSize: 18.5,
      landUnit: 'Bigha',
      mainCrops: 'ডায়মন্ড আলু, মিনিকেট ধান, কাঁচা মরিচ',
      description: 'উর্বর পলিমাটির সুসজ্জিত খামার, আধুনিক ড্রিপ সেচ এবং জৈব সার প্রযুক্তিসমৃদ্ধ।',
      districtId: boguraDistrictId,
      latitude: 24.9547,
      longitude: 89.3456
    }
  });

  // Farmer Karim (Rajshahi)
  const rajshahiDistrictId = districtMap.get('Rajshahi')!;
  const farmerKarimUser = await prisma.user.upsert({
    where: { email: 'farmer.karim@krishibazar.com' },
    update: { role: UserRole.FARMER, name: 'আব্দুল করিম (কৃষক)' },
    create: {
      email: 'farmer.karim@krishibazar.com',
      name: 'আব্দুল করিম (কৃষক)',
      passwordHash: defaultPasswordHash,
      phone: '01811334455',
      role: UserRole.FARMER
    }
  });

  const karimProfile = await prisma.farmerProfile.upsert({
    where: { userId: farmerKarimUser.id },
    update: {},
    create: {
      userId: farmerKarimUser.id,
      fullName: 'আব্দুল করিম',
      phone: '01811334455',
      bio: 'রাজশাহীর বাঘার প্রসিদ্ধ আমচাষী। শতভাগ ক্যামিকেলমুক্ত প্রাকৃতিকভাবে পাকা আম ও শাকসবজি সরাসরি বাগানের গাছ থেকে ডেলিভারি দেই।',
      profileImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
      districtId: rajshahiDistrictId
    }
  });

  const karimFarm = await prisma.farm.upsert({
    where: { id: 'farm_karim_rajshahi_01' },
    update: {},
    create: {
      id: 'farm_karim_rajshahi_01',
      farmerProfileId: karimProfile.id,
      name: 'বরেন্দ্র আম্রকানন ও কৃষি ফার্ম',
      landSize: 32.0,
      landUnit: 'Bigha',
      mainCrops: 'ফজলি আম, হিমসাগর, দেশি টমেটো',
      description: 'শত বছরের ঐতিহ্যবাহী বরেন্দ্র অঞ্চলের আম বাগান ও মৌসুমী সবজি ক্ষেত।',
      districtId: rajshahiDistrictId,
      latitude: 24.3800,
      longitude: 88.6200
    }
  });

  // Buyer Hasan (Dhaka)
  await prisma.user.upsert({
    where: { email: 'buyer.hasan@krishibazar.com' },
    update: { role: UserRole.BUYER, name: 'হাসান মাহমুদ (পাইকারি ক্রেতা)' },
    create: {
      email: 'buyer.hasan@krishibazar.com',
      name: 'হাসান মাহমুদ (পাইকারি ক্রেতা)',
      passwordHash: defaultPasswordHash,
      phone: '01911445566',
      role: UserRole.BUYER
    }
  });

  // 5. Seed Sample Products
  console.log('🌾 Seeding Sample Farmer Products...');
  const sampleProducts = [
    {
      id: 'prod_bogura_potato',
      farmerProfileId: rahimProfile.id,
      farmId: rahimFarm.id,
      categoryId: categoryMap.get('potato')!,
      districtId: boguraDistrictId,
      nameEn: 'Bogura Diamond Fresh Potato',
      nameBn: 'বগুড়ার ফ্রেশ ডায়মন্ড গোল আলু',
      descriptionEn: 'Grade-A freshly harvested Diamond potatoes from fertile soil of Bogura. Perfect for storage and retail.',
      descriptionBn: 'বগুড়ার মহাস্থানগড়ের উর্বর পলিমাটির খাঁটি ডায়মন্ড আলু। কোনো কোল্ড স্টোরেজের নয়, সদ্য তোলা ফ্রেশ আলু।',
      pricePerKg: 38.50,
      quantityAvailable: 4500,
      unit: 'kg',
      minimumOrderQty: 50,
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      isAvailable: true
    },
    {
      id: 'prod_bogura_miniket_rice',
      farmerProfileId: rahimProfile.id,
      farmId: rahimFarm.id,
      categoryId: categoryMap.get('rice')!,
      districtId: boguraDistrictId,
      nameEn: 'Premium Miniket White Rice',
      nameBn: 'প্রিমিয়াম মিনিকেট চাল (নতুন ধান)',
      descriptionEn: 'Naturally aromatic, long-grain Miniket rice harvested from organic paddies, polished and clean.',
      descriptionBn: 'নতুন আমন ধানের ফ্রেশ মিনিকেট চাল। রান্নায় চমৎকার সুবাস ও লম্বা ঝরঝরে দানার গ্যারান্টি।',
      pricePerKg: 66.00,
      quantityAvailable: 6000,
      unit: 'kg',
      minimumOrderQty: 100,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      isAvailable: true
    },
    {
      id: 'prod_rajshahi_fazli_mango',
      farmerProfileId: karimProfile.id,
      farmId: karimFarm.id,
      categoryId: categoryMap.get('mango')!,
      districtId: rajshahiDistrictId,
      nameEn: 'Rajshahi Bagha Organic Fazli Mango (Advance Booking)',
      nameBn: 'রাজশাহীর বাঘার মিষ্টি ফজলি আম (আগাম বুকিং)',
      descriptionEn: 'Authentic sweet Fazli mangoes straight from the orchard. Tree-ripened, chemical-free, direct garden harvest.',
      descriptionBn: 'রাজশাহীর বিখ্যাত বাঘার বাগানের শতভাগ কেমিক্যালমুক্ত মিষ্টি ফজli আম। গাছপাকা এবং আগাম বুকিং ডেলিভারি।',
      pricePerKg: 110.00,
      quantityAvailable: 2500,
      unit: 'kg',
      minimumOrderQty: 20,
      expectedHarvestDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // In 25 days
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      isAvailable: true
    },
    {
      id: 'prod_rajshahi_tomato',
      farmerProfileId: karimProfile.id,
      farmId: karimFarm.id,
      categoryId: categoryMap.get('tomato')!,
      districtId: rajshahiDistrictId,
      nameEn: 'Field-Fresh Ripe Red Tomatoes',
      nameBn: 'ক্ষেতের পাকা লাল গোল টমেটো',
      descriptionEn: 'Plump, juicy field tomatoes with vibrant natural redness and firm skin, packed for long transit.',
      descriptionBn: 'সরাসরি জমি থেকে সংগ্রহ করা নিরেট লাল পাকা টমেটো। চমৎকার স্বাদ ও বেশিদিন ভালো থাকার নিশ্চয়তা।',
      pricePerKg: 44.00,
      quantityAvailable: 1800,
      unit: 'kg',
      minimumOrderQty: 25,
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      isAvailable: true
    },
    {
      id: 'prod_jashore_onion',
      farmerProfileId: rahimProfile.id,
      farmId: null,
      categoryId: categoryMap.get('onion')!,
      districtId: districtMap.get('Jashore')!,
      nameEn: 'Deshi High Quality Red Onion',
      nameBn: 'যশোরের ভালো মানের দেশি লাল পেঁয়াজ',
      descriptionEn: 'Crisp, spicy domestic red onions harvested locally. Highly pungent and dry for prolonged shelf life.',
      descriptionBn: 'যশোর অঞ্চলের শুকনা ও ঝাল দেশি লাল পেঁয়াজ। রান্নায় অপূর্ব স্বাদ ও দীর্ঘস্থায়ী সংরক্ষণের উপযোগী।',
      pricePerKg: 84.00,
      quantityAvailable: 3500,
      unit: 'kg',
      minimumOrderQty: 50,
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
      isAvailable: true
    },
    {
      id: 'prod_bogura_chili',
      farmerProfileId: rahimProfile.id,
      farmId: rahimFarm.id,
      categoryId: categoryMap.get('green-chili')!,
      districtId: boguraDistrictId,
      nameEn: 'Hot Green Chili (Kacha Morich)',
      nameBn: 'সারিয়াগান্দির তাজা ঝাল কাঁচা মরিচ',
      descriptionEn: 'Intensely pungent fresh green chilies picked at dawn. Firm stems and high freshness guarantee.',
      descriptionBn: 'বগুড়ার সারিয়াকান্দির যমুনার চরের বিখ্যাত ঝাল তাজা কাঁচা মরিচ। সকালের বোঁটা লাগানো সবুজ ফ্রেশ মাল।',
      pricePerKg: 125.00,
      quantityAvailable: 900,
      unit: 'kg',
      minimumOrderQty: 10,
      imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
      isAvailable: true
    }
  ];

  for (const p of sampleProducts) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p
    });
  }

  // 6. Seed 30-Day DEMO Price History for 6 crops in 8 districts
  console.log('📈 Seeding DEMO Price History (6 crops in 8 districts across 30 days)...');
  const demoCrops = ['rice', 'potato', 'onion', 'tomato', 'green-chili', 'jute'];
  const demoDistricts = ['Dhaka', 'Bogura', 'Rajshahi', 'Rangpur', 'Jashore', 'Cumilla', 'Mymensingh', 'Chattogram'];

  // Base price and daily trend variance for each crop
  const cropBasePrices: Record<string, { base: number; volatility: number; trend: number }> = {
    rice: { base: 64, volatility: 0.8, trend: 0.1 },
    potato: { base: 37, volatility: 0.9, trend: -0.05 },
    onion: { base: 82, volatility: 2.2, trend: 0.25 },
    tomato: { base: 46, volatility: 1.8, trend: -0.15 },
    'green-chili': { base: 122, volatility: 4.5, trend: 0.3 },
    jute: { base: 92, volatility: 1.5, trend: 0.12 }
  };

  // District price multiplier (Dhaka and Chattogram are higher due to transit)
  const districtMultipliers: Record<string, number> = {
    Dhaka: 1.15,
    Chattogram: 1.18,
    Bogura: 0.94,
    Rajshahi: 0.95,
    Rangpur: 0.92,
    Jashore: 0.96,
    Cumilla: 1.08,
    Mymensingh: 1.02
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let priceHistoryCount = 0;

  for (const cropSlug of demoCrops) {
    const categoryId = categoryMap.get(cropSlug);
    if (!categoryId) continue;
    const config = cropBasePrices[cropSlug];

    for (const distName of demoDistricts) {
      const districtId = districtMap.get(distName);
      if (!districtId) continue;
      const distMul = districtMultipliers[distName] || 1.0;

      // 30 days history from (today - 29 days) up to today
      for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);

        // Sinusoidal wave + trend + slight pseudo-random variance for realism
        const progress = 29 - dayOffset;
        const wave = Math.sin((progress / 30) * Math.PI * 2) * config.volatility;
        const trend = (progress - 15) * config.trend;
        const randomFactor = Math.sin((progress * 13) + (distMul * 7)) * (config.volatility * 0.4);

        const price = Math.max(10, Math.round(((config.base + wave + trend + randomFactor) * distMul) * 10) / 10);

        await prisma.priceHistory.upsert({
          where: {
            categoryId_districtId_date_source: {
              categoryId,
              districtId,
              date,
              source: PriceSource.MARKET
            }
          },
          update: {
            pricePerKg: price,
            isDemo: true,
            enteredById: editorUser.id
          },
          create: {
            categoryId,
            districtId,
            pricePerKg: price,
            date,
            source: PriceSource.MARKET,
            enteredById: editorUser.id,
            isDemo: true
          }
        });
        priceHistoryCount++;
      }
    }
  }

  console.log(`✅ DEMO Price History seeded: ${priceHistoryCount} records created.`);
  console.log('🎉 KrishiBazar Database Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
