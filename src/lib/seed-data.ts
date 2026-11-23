// Indian sample marketplace data: 40 workers and 100 jobs across 11 cities, priced in INR.
// Every record has a stable seed_key so seeding twice never creates duplicates.

export interface SeedArea {
  pincode: string;
  area: string;
}

/** Real PIN codes per city (locations come from the PIN code directory in the database). */
export const SEED_CITIES: Record<string, SeedArea[]> = {
  Jaipur: [
    { pincode: '302001', area: 'Jaipur GPO' },
    { pincode: '302017', area: 'Malviya Nagar' },
    { pincode: '302020', area: 'Mansarovar' },
    { pincode: '302021', area: 'Vaishali Nagar' },
  ],
  Delhi: [
    { pincode: '110001', area: 'Connaught Place' },
    { pincode: '110017', area: 'Malviya Nagar' },
    { pincode: '110085', area: 'Rohini' },
    { pincode: '110092', area: 'Laxmi Nagar' },
  ],
  Mumbai: [
    { pincode: '400001', area: 'Fort' },
    { pincode: '400050', area: 'Bandra West' },
    { pincode: '400053', area: 'Andheri West' },
    { pincode: '400076', area: 'Powai' },
  ],
  Bengaluru: [
    { pincode: '560001', area: 'MG Road' },
    { pincode: '560034', area: 'Koramangala' },
    { pincode: '560041', area: 'Jayanagar' },
    { pincode: '560066', area: 'Whitefield' },
  ],
  Pune: [
    { pincode: '411001', area: 'Camp' },
    { pincode: '411004', area: 'Deccan Gymkhana' },
    { pincode: '411038', area: 'Kothrud' },
    { pincode: '411057', area: 'Hinjewadi' },
  ],
  Hyderabad: [
    { pincode: '500001', area: 'Abids' },
    { pincode: '500016', area: 'Begumpet' },
    { pincode: '500034', area: 'Banjara Hills' },
    { pincode: '500081', area: 'Madhapur' },
  ],
  Chennai: [
    { pincode: '600001', area: 'George Town' },
    { pincode: '600017', area: 'T. Nagar' },
    { pincode: '600020', area: 'Adyar' },
    { pincode: '600040', area: 'Anna Nagar' },
  ],
  Kolkata: [
    { pincode: '700016', area: 'Park Street' },
    { pincode: '700019', area: 'Ballygunge' },
    { pincode: '700032', area: 'Jadavpur' },
    { pincode: '700106', area: 'Salt Lake' },
  ],
  Ahmedabad: [
    { pincode: '380001', area: 'Lal Darwaja' },
    { pincode: '380009', area: 'Navrangpura' },
    { pincode: '380015', area: 'Satellite' },
    { pincode: '380054', area: 'Bodakdev' },
  ],
  Lucknow: [
    { pincode: '226001', area: 'Hazratganj' },
    { pincode: '226005', area: 'Alambagh' },
    { pincode: '226010', area: 'Gomti Nagar' },
    { pincode: '226016', area: 'Indira Nagar' },
  ],
  Chandigarh: [
    { pincode: '160017', area: 'Sector 17' },
    { pincode: '160022', area: 'Sector 22' },
    { pincode: '160036', area: 'Sector 36' },
    { pincode: '160047', area: 'Sector 47' },
  ],
};

export const SEED_CITY_NAMES = Object.keys(SEED_CITIES);

export const SEED_CATEGORIES = ['Tutoring', 'Design', 'Repairs', 'Event Help', 'Photography', 'Photo Editing'];

interface SeedWorker {
  name: string;
  city: string;
  /** Index into the city's PIN list. */
  area: number;
  category: string;
  skills: string[];
  /** INR per hour. */
  rate: number;
  years: number;
  languages: string;
  focus: string;
}

const WORKERS: SeedWorker[] = [
  // Tutoring
  { name: 'Priya Sharma', city: 'Jaipur', area: 1, category: 'Tutoring', skills: ['home tuition', 'maths', 'cbse', 'science'], rate: 400, years: 6, languages: 'Hindi and English', focus: 'CBSE maths and science for Classes 6–10' },
  { name: 'Rohan Mehta', city: 'Delhi', area: 1, category: 'Tutoring', skills: ['physics', 'jee preparation', 'maths'], rate: 700, years: 8, languages: 'Hindi and English', focus: 'Class 11–12 physics and JEE Mains preparation' },
  { name: 'Ananya Iyer', city: 'Chennai', area: 2, category: 'Tutoring', skills: ['spoken english', 'communication', 'home tuition'], rate: 500, years: 5, languages: 'Tamil, English and Hindi', focus: 'spoken English and interview practice' },
  { name: 'Sanjay Yadav', city: 'Lucknow', area: 2, category: 'Tutoring', skills: ['hindi', 'home tuition', 'social science'], rate: 300, years: 10, languages: 'Hindi and English', focus: 'Hindi and social science for primary and middle school' },
  { name: 'Aditi Kulkarni', city: 'Pune', area: 2, category: 'Tutoring', skills: ['python', 'coding for kids', 'maths'], rate: 600, years: 4, languages: 'Marathi, Hindi and English', focus: 'Python and Scratch coding for school students' },
  { name: 'Neha Agarwal', city: 'Kolkata', area: 1, category: 'Tutoring', skills: ['accountancy', 'commerce', 'economics'], rate: 450, years: 7, languages: 'Bengali, Hindi and English', focus: 'Class 11–12 accountancy and economics' },
  { name: 'Harpreet Kaur', city: 'Chandigarh', area: 1, category: 'Tutoring', skills: ['home tuition', 'english', 'cbse'], rate: 400, years: 6, languages: 'Punjabi, Hindi and English', focus: 'English grammar and CBSE board preparation' },
  // Design
  { name: 'Karan Malhotra', city: 'Mumbai', area: 1, category: 'Design', skills: ['logo design', 'branding', 'illustrator'], rate: 1200, years: 9, languages: 'Hindi, Marathi and English', focus: 'logos and brand identity for small businesses' },
  { name: 'Tanvi Shah', city: 'Ahmedabad', area: 1, category: 'Design', skills: ['invitation design', 'graphic design', 'canva'], rate: 700, years: 5, languages: 'Gujarati, Hindi and English', focus: 'wedding cards and festive invitations' },
  { name: 'Arjun Reddy', city: 'Hyderabad', area: 3, category: 'Design', skills: ['social media design', 'canva', 'photoshop'], rate: 800, years: 4, languages: 'Telugu, Hindi and English', focus: 'Instagram posts and festival offer creatives' },
  { name: 'Nisha Rathore', city: 'Jaipur', area: 3, category: 'Design', skills: ['invitation design', 'print design', 'banner design'], rate: 600, years: 6, languages: 'Hindi and English', focus: 'wedding cards, flex banners and print work' },
  { name: 'Divya Menon', city: 'Bengaluru', area: 1, category: 'Design', skills: ['menu design', 'branding', 'print design'], rate: 1000, years: 7, languages: 'Malayalam, Kannada and English', focus: 'restaurant menus and café branding' },
  { name: 'Abhishek Mishra', city: 'Lucknow', area: 3, category: 'Design', skills: ['banner design', 'graphic design', 'photoshop'], rate: 500, years: 5, languages: 'Hindi and English', focus: 'coaching centre banners and shop signage' },
  // Repairs
  { name: 'Rajesh Saini', city: 'Jaipur', area: 2, category: 'Repairs', skills: ['electrician', 'wiring', 'fan installation', 'inverter installation'], rate: 350, years: 12, languages: 'Hindi', focus: 'house wiring, fans, inverters and switchboards' },
  { name: 'Imran Khan', city: 'Jaipur', area: 0, category: 'Repairs', skills: ['mobile repair', 'screen replacement', 'battery replacement'], rate: 300, years: 8, languages: 'Hindi and Urdu', focus: 'smartphone screens, batteries and charging ports' },
  { name: 'Suresh Pillai', city: 'Chennai', area: 3, category: 'Repairs', skills: ['ac repair', 'ac servicing', 'electrician'], rate: 450, years: 11, languages: 'Tamil and English', focus: 'split AC servicing and gas top-up' },
  { name: 'Deepak Chauhan', city: 'Delhi', area: 2, category: 'Repairs', skills: ['electrician', 'geyser installation', 'wiring'], rate: 400, years: 9, languages: 'Hindi', focus: 'geysers, MCB panels and new wiring' },
  { name: 'Mohammed Asif', city: 'Hyderabad', area: 0, category: 'Repairs', skills: ['mobile repair', 'screen replacement', 'software update'], rate: 300, years: 6, languages: 'Urdu, Telugu and Hindi', focus: 'Android and iPhone repairs at your doorstep' },
  { name: 'Vivek Rao', city: 'Bengaluru', area: 2, category: 'Repairs', skills: ['plumbing', 'leak repair', 'geyser installation'], rate: 400, years: 10, languages: 'Kannada, Hindi and English', focus: 'leaking taps, flush tanks and bathroom fittings' },
  { name: 'Gurpreet Singh', city: 'Chandigarh', area: 2, category: 'Repairs', skills: ['carpentry', 'furniture assembly', 'modular kitchen'], rate: 450, years: 13, languages: 'Punjabi and Hindi', focus: 'flat-pack furniture, wardrobes and kitchen shutters' },
  { name: 'Sourav Das', city: 'Kolkata', area: 2, category: 'Repairs', skills: ['electrician', 'inverter installation', 'fan installation'], rate: 350, years: 7, languages: 'Bengali and Hindi', focus: 'inverters, fans and lighting' },
  { name: 'Hardik Patel', city: 'Ahmedabad', area: 3, category: 'Repairs', skills: ['ac servicing', 'ac repair', 'refrigerator repair'], rate: 400, years: 8, languages: 'Gujarati and Hindi', focus: 'AC and fridge repair before summer' },
  { name: 'Amit Kumar', city: 'Pune', area: 0, category: 'Repairs', skills: ['plumbing', 'bathroom fittings', 'leak repair'], rate: 350, years: 9, languages: 'Hindi and Marathi', focus: 'plumbing and bathroom fittings' },
  { name: 'Ramesh Gowda', city: 'Bengaluru', area: 3, category: 'Repairs', skills: ['mobile repair', 'battery replacement', 'charging port repair'], rate: 300, years: 5, languages: 'Kannada and English', focus: 'quick phone repairs with genuine parts' },
  // Event Help
  { name: 'Pooja Joshi', city: 'Mumbai', area: 2, category: 'Event Help', skills: ['event assistance', 'guest management', 'hostess'], rate: 250, years: 3, languages: 'Hindi, Marathi and English', focus: 'guest registration and hosting at corporate events' },
  { name: 'Manish Tiwari', city: 'Delhi', area: 3, category: 'Event Help', skills: ['event setup', 'decoration', 'crowd management'], rate: 200, years: 5, languages: 'Hindi', focus: 'tent, stage and décor setup for functions' },
  { name: 'Meera Chatterjee', city: 'Kolkata', area: 0, category: 'Event Help', skills: ['decoration', 'kids party', 'event setup'], rate: 250, years: 4, languages: 'Bengali, Hindi and English', focus: 'balloon décor and games for kids’ birthday parties' },
  { name: 'Lakshmi Subramanian', city: 'Chennai', area: 1, category: 'Event Help', skills: ['catering service', 'event assistance'], rate: 180, years: 6, languages: 'Tamil', focus: 'serving and catering help at family functions' },
  { name: 'Vikas Bhosale', city: 'Pune', area: 3, category: 'Event Help', skills: ['packing', 'moving help', 'loading'], rate: 200, years: 4, languages: 'Marathi and Hindi', focus: 'packing and shifting help for flats' },
  { name: 'Kavya Nair', city: 'Hyderabad', area: 2, category: 'Event Help', skills: ['event assistance', 'guest management', 'anchoring'], rate: 300, years: 3, languages: 'Malayalam, Telugu, Hindi and English', focus: 'anchoring and guest management' },
  // Photography
  { name: 'Vikram Singh', city: 'Jaipur', area: 1, category: 'Photography', skills: ['wedding photography', 'candid photography', 'pre-wedding shoot'], rate: 2500, years: 9, languages: 'Hindi and English', focus: 'candid wedding and pre-wedding shoots' },
  { name: 'Riya Banerjee', city: 'Kolkata', area: 3, category: 'Photography', skills: ['candid photography', 'event photography', 'wedding photography'], rate: 2000, years: 6, languages: 'Bengali, Hindi and English', focus: 'weddings, annaprashan and family events' },
  { name: 'Nikhil Jain', city: 'Mumbai', area: 3, category: 'Photography', skills: ['product photography', 'studio lighting', 'e-commerce photography'], rate: 2200, years: 7, languages: 'Hindi and English', focus: 'product shoots for online sellers' },
  { name: 'Jaspreet Gill', city: 'Chandigarh', area: 3, category: 'Photography', skills: ['pre-wedding shoot', 'outdoor photography', 'drone photography'], rate: 3000, years: 8, languages: 'Punjabi, Hindi and English', focus: 'outdoor pre-wedding and drone shoots' },
  { name: 'Shruti Deshpande', city: 'Pune', area: 1, category: 'Photography', skills: ['portrait photography', 'headshots', 'event photography'], rate: 1800, years: 5, languages: 'Marathi, Hindi and English', focus: 'corporate headshots and portraits' },
  // Photo Editing
  { name: 'Rahul Gupta', city: 'Delhi', area: 0, category: 'Photo Editing', skills: ['photo editing', 'album design', 'lightroom'], rate: 500, years: 7, languages: 'Hindi and English', focus: 'wedding photo editing and album layouts' },
  { name: 'Fatima Shaikh', city: 'Mumbai', area: 0, category: 'Photo Editing', skills: ['background removal', 'photoshop', 'e-commerce photo editing'], rate: 400, years: 5, languages: 'Hindi, Urdu and English', focus: 'white-background product images for marketplaces' },
  { name: 'Anjali Bhatt', city: 'Ahmedabad', area: 2, category: 'Photo Editing', skills: ['photo restoration', 'photoshop', 'retouching'], rate: 450, years: 6, languages: 'Gujarati, Hindi and English', focus: 'restoring old family photographs' },
  { name: 'Pallavi Srivastava', city: 'Lucknow', area: 0, category: 'Photo Editing', skills: ['color correction', 'thumbnail design', 'lightroom'], rate: 350, years: 4, languages: 'Hindi and English', focus: 'colour grading and YouTube thumbnails' },
  { name: 'Sneha Patil', city: 'Bengaluru', area: 0, category: 'Photo Editing', skills: ['batch editing', 'photo editing', 'retouching'], rate: 400, years: 5, languages: 'Kannada, Marathi and English', focus: 'fast batch edits for schools and events' },
];

interface JobTemplate {
  title: string;
  detail: string;
  skills: string[];
  hours: number;
  /** Typical total budget in INR. */
  budget: number;
  urgency: 'low' | 'medium' | 'high';
}

const JOB_TEMPLATES: Record<string, JobTemplate[]> = {
  Tutoring: [
    { title: 'Class 10 CBSE maths home tuition', detail: 'Need a home tutor for my son in Class 10 (CBSE) for algebra and trigonometry before the board exams. 8 sessions of 1 hour on weekday evenings at our home.', skills: ['home tuition', 'maths', 'cbse'], hours: 8, budget: 4000, urgency: 'medium' },
    { title: 'Spoken English classes for a working professional', detail: 'Looking for a spoken English trainer to help me speak confidently in office meetings and interviews. 10 one-hour sessions, evenings or weekends.', skills: ['spoken english', 'communication'], hours: 10, budget: 5000, urgency: 'low' },
    { title: 'Class 12 physics revision for JEE Mains', detail: 'My daughter needs a physics tutor for JEE Mains revision — mechanics and electrostatics. 12 hours over the next three weeks.', skills: ['physics', 'jee preparation'], hours: 12, budget: 9000, urgency: 'high' },
    { title: 'Hindi tuition for Class 5 student', detail: 'Need a patient Hindi teacher for my Class 5 child — reading, writing and grammar. 8 sessions at home after school.', skills: ['hindi', 'home tuition'], hours: 8, budget: 2400, urgency: 'low' },
    { title: 'Python coding basics for Class 8 student', detail: 'Want online or home classes to teach my son Python basics and a small project. 6 sessions on weekends.', skills: ['python', 'coding for kids'], hours: 6, budget: 3600, urgency: 'low' },
    { title: 'Accountancy tuition for Class 11 commerce', detail: 'Need help with journal entries, ledgers and trial balance for Class 11 commerce. 10 sessions before the half-yearly exams.', skills: ['accountancy', 'commerce'], hours: 10, budget: 4500, urgency: 'medium' },
  ],
  Design: [
    { title: 'Logo for a new chai stall', detail: 'Opening a chai stall next month and need a simple, catchy logo for the board and cups. Please share 2–3 concepts.', skills: ['logo design', 'branding'], hours: 6, budget: 4000, urgency: 'medium' },
    { title: 'Wedding card design in Hindi and English', detail: 'Need a traditional wedding invitation designed in both Hindi and English, print-ready, plus a WhatsApp version.', skills: ['invitation design', 'graphic design'], hours: 5, budget: 3500, urgency: 'high' },
    { title: 'Diwali offer posters for kirana store', detail: 'Need 5 Instagram and WhatsApp posters for our Diwali offers on dry fruits and sweets. Bright, festive look.', skills: ['social media design', 'canva'], hours: 4, budget: 2000, urgency: 'high' },
    { title: 'Menu card redesign for South Indian restaurant', detail: 'Redesign our dine-in menu (dosa, idli, thali sections) with prices in rupees. Print-ready A3 file.', skills: ['menu design', 'print design'], hours: 6, budget: 4500, urgency: 'medium' },
    { title: 'Visiting cards and letterhead for CA firm', detail: 'Need a clean, professional visiting card and letterhead design for a chartered accountant office.', skills: ['graphic design', 'print design'], hours: 3, budget: 2000, urgency: 'low' },
    { title: 'Flex banner for coaching centre', detail: 'Need a 10x4 ft flex banner for our IIT-JEE and NEET coaching centre with results and contact details.', skills: ['banner design', 'photoshop'], hours: 3, budget: 1500, urgency: 'medium' },
  ],
  Repairs: [
    { title: 'Mobile screen replacement (Redmi Note)', detail: 'Cracked screen on a Redmi Note phone. Need doorstep replacement; I will pay for the original part separately. Budget is labour only.', skills: ['mobile repair', 'screen replacement'], hours: 1.5, budget: 600, urgency: 'high' },
    { title: 'Fix phone charging port and check battery', detail: 'Phone charges only at an angle and the battery drains fast. Need the charging port repaired and battery checked.', skills: ['mobile repair', 'battery replacement'], hours: 1, budget: 500, urgency: 'medium' },
    { title: 'Install 3 ceiling fans and fix switchboard', detail: 'Need an electrician to install 3 new ceiling fans and repair a sparking switchboard in the bedroom.', skills: ['electrician', 'wiring', 'fan installation'], hours: 3, budget: 1200, urgency: 'high' },
    { title: 'Inverter and wiring check for 2BHK flat', detail: 'Frequent power cuts — need an electrician to check inverter connections and wiring for the whole 2BHK.', skills: ['electrician', 'inverter installation', 'wiring'], hours: 2, budget: 800, urgency: 'medium' },
    { title: 'Fix leaking kitchen tap and bathroom flush', detail: 'Kitchen tap is dripping and the bathroom flush tank keeps running. Need a plumber this weekend.', skills: ['plumbing', 'leak repair'], hours: 2, budget: 700, urgency: 'medium' },
    { title: 'Assemble wardrobe and bed (flat-pack)', detail: 'Bought a flat-pack wardrobe and queen bed online. Need a carpenter to assemble both; tools required.', skills: ['carpentry', 'furniture assembly'], hours: 4, budget: 1500, urgency: 'low' },
    { title: 'Servicing for 2 split ACs before summer', detail: 'Need wet servicing for two 1.5 ton split ACs and a check for gas leakage.', skills: ['ac servicing', 'ac repair'], hours: 2, budget: 1200, urgency: 'medium' },
    { title: 'Geyser installation in bathroom', detail: 'New 15-litre geyser needs to be wall-mounted with plumbing and electrical connection.', skills: ['electrician', 'geyser installation', 'plumbing'], hours: 1.5, budget: 700, urgency: 'medium' },
  ],
  'Event Help': [
    { title: 'Helper for sangeet night setup', detail: 'Need one helper for décor, lighting and seating setup for a sangeet function in the evening.', skills: ['event setup', 'decoration'], hours: 6, budget: 1500, urgency: 'high' },
    { title: 'Guest registration desk at corporate seminar', detail: 'Need a polite, presentable person to manage the guest registration desk at a half-day seminar.', skills: ['event assistance', 'guest management'], hours: 5, budget: 1200, urgency: 'medium' },
    { title: 'Serving staff for griha pravesh puja', detail: 'Need help serving food to around 80 guests at our griha pravesh puja lunch.', skills: ['catering service', 'event assistance'], hours: 5, budget: 1000, urgency: 'medium' },
    { title: 'Packing and shifting help for 1BHK', detail: 'Need help packing and loading household items for a 1BHK move within the city. Tempo already booked.', skills: ['packing', 'moving help'], hours: 5, budget: 1500, urgency: 'high' },
    { title: 'Birthday party decoration and games for kids', detail: 'Balloon decoration and games for a 6-year-old’s birthday party with about 20 children.', skills: ['decoration', 'kids party'], hours: 4, budget: 1200, urgency: 'medium' },
    { title: 'Crowd management volunteer for Ganesh pandal', detail: 'Need volunteers to manage queues and crowd at our society Ganesh pandal in the evenings.', skills: ['crowd management', 'event assistance'], hours: 6, budget: 1500, urgency: 'medium' },
  ],
  Photography: [
    { title: 'Wedding photography for 2-day ceremony', detail: 'Need a candid and traditional photographer for haldi, mehendi and wedding over two days. Edited photos in a pen drive.', skills: ['wedding photography', 'candid photography'], hours: 16, budget: 40000, urgency: 'medium' },
    { title: 'Pre-wedding shoot at a heritage location', detail: 'Looking for a pre-wedding outdoor shoot at a fort or heritage spot, about 5 hours including travel within the city.', skills: ['pre-wedding shoot', 'outdoor photography'], hours: 5, budget: 15000, urgency: 'low' },
    { title: 'Product photos for handloom saree store', detail: 'Need clean product photos of 40 handloom sarees for our online store, with model and flat-lay shots.', skills: ['product photography', 'studio lighting'], hours: 4, budget: 8000, urgency: 'medium' },
    { title: 'Photographer for godh bharai ceremony', detail: 'Need an event photographer for a godh bharai (baby shower) at home, about 4 hours, candid style.', skills: ['event photography', 'candid photography'], hours: 4, budget: 10000, urgency: 'medium' },
    { title: 'Corporate headshots for 20 employees', detail: 'Need professional headshots for 20 employees at our office for LinkedIn and ID cards.', skills: ['portrait photography', 'headshots'], hours: 3, budget: 7500, urgency: 'low' },
  ],
  'Photo Editing': [
    { title: 'Edit 300 wedding photos and design album', detail: 'Need colour correction for 300 wedding photos and a 40-page album layout.', skills: ['photo editing', 'album design', 'lightroom'], hours: 15, budget: 9000, urgency: 'medium' },
    { title: 'Remove background from 50 product photos', detail: 'Need white-background images of 50 products for our Amazon and Flipkart listings.', skills: ['background removal', 'photoshop'], hours: 4, budget: 2000, urgency: 'high' },
    { title: 'Restore old family photographs', detail: 'Have 10 scanned black-and-white family photos with scratches and fading. Need careful restoration.', skills: ['photo restoration', 'photoshop'], hours: 5, budget: 3000, urgency: 'low' },
    { title: 'Colour correction for travel vlog thumbnails', detail: 'Need colour grading and thumbnail design for 10 YouTube travel vlogs.', skills: ['color correction', 'thumbnail design'], hours: 3, budget: 1500, urgency: 'medium' },
    { title: 'Passport-size photo edits for 120 school ID cards', detail: 'Crop, background-clean and resize 120 student photos for school ID cards.', skills: ['photo editing', 'batch editing'], hours: 4, budget: 1600, urgency: 'high' },
  ],
};

export function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length] as T;
}

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

/** Round a rupee amount to a natural price: nearest ₹50 under ₹5,000, else nearest ₹500. */
export function roundRupees(n: number): number {
  const step = n < 5000 ? 50 : 500;
  return Math.max(step, Math.round(n / step) * step);
}

export function buildSeedRows(now: number = Date.now()) {
  const rand = seededRand(42);

  const workerRows = WORKERS.map((w, i) => {
    const area = SEED_CITIES[w.city]![w.area]!;
    return {
      id: crypto.randomUUID(),
      seed_key: `in-worker-${String(i + 1).padStart(2, '0')}`,
      role: 'worker' as const,
      full_name: w.name,
      bio: `${w.years} years of experience in ${w.focus}. Works in ${area.area} and nearby areas of ${w.city}. Speaks ${w.languages}.`,
      skills: w.skills,
      hourly_rate: w.rate,
      city: w.city,
      pincode: area.pincode,
    };
  });

  const jobRows = Array.from({ length: 100 }, (_, i) => {
    const category = pick(SEED_CATEGORIES, i);
    const templates = JOB_TEMPLATES[category]!;
    const t = pick(templates, Math.floor(i / SEED_CATEGORIES.length));
    const city = pick(SEED_CITY_NAMES, i);
    const area = pick(SEED_CITIES[city]!, Math.floor(i / SEED_CITY_NAMES.length));
    const daysAgo = Math.floor(rand() * 30);
    const deadline = new Date(now + (7 + Math.floor(rand() * 21)) * 86400000);
    const budget = roundRupees(t.budget * (0.8 + rand() * 0.5));
    return {
      seed_key: `in-job-${String(i + 1).padStart(3, '0')}`,
      title: t.title,
      description: `${t.detail} Location: ${area.area}, ${city}.`,
      budget,
      city,
      pincode: area.pincode,
      deadline: deadline.toISOString().slice(0, 10),
      category,
      required_skills: t.skills,
      urgency: t.urgency,
      estimated_hours: t.hours,
      status: 'open' as const,
      created_at: new Date(now - daysAgo * 86400000).toISOString(),
    };
  });

  return { workerRows, jobRows };
}
