// Indian freelance marketplace sample data: 40 freelancers, 10 clients and 100 projects, priced in INR.
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

export const SEED_CATEGORIES = [
  'Web Development',
  'Graphic Design',
  'Content Writing',
  'Video Editing',
  'Digital Marketing',
  'Data Entry and Virtual Assistance',
  'AI and Machine Learning',
  'App Development',
  'Photography and Creative Media',
];

interface SeedWorker {
  name: string;
  city: string;
  /** Index into the city's PIN list. */
  area: number;
  title: string;
  skills: string[];
  /** INR per hour. */
  rate: number;
  years: number;
  availability: string;
  focus: string;
  portfolio: string;
}

const w = (
  name: string, city: string, area: number, title: string, skills: string[], rate: number,
  years: number, availability: string, focus: string,
): SeedWorker => ({
  name, city, area, title, skills, rate, years, availability, focus,
  portfolio: `https://portfolio.example.in/${name.toLowerCase().replace(/[^a-z]+/g, '-')}`,
});

const WORKERS: SeedWorker[] = [
  // Web Development
  w('Priya Sharma', 'Jaipur', 1, 'React Developer', ['react', 'javascript', 'typescript', 'tailwind css'], 900, 5, 'Full-time', 'responsive React websites and dashboards for startups'),
  w('Rohan Mehta', 'Bengaluru', 1, 'Full Stack Developer', ['react', 'node.js', 'postgresql', 'rest api'], 1500, 8, 'Part-time', 'full stack web apps with React and Node.js'),
  w('Sanjay Yadav', 'Lucknow', 2, 'WordPress Developer', ['wordpress', 'php', 'woocommerce', 'elementor'], 600, 6, 'Full-time', 'WordPress and WooCommerce sites for small businesses'),
  w('Aditi Kulkarni', 'Pune', 3, 'Backend Developer', ['node.js', 'express', 'mongodb', 'rest api'], 1200, 6, 'Full-time', 'secure APIs and backend systems'),
  w('Harpreet Kaur', 'Chandigarh', 1, 'Frontend Developer', ['html', 'css', 'javascript', 'react'], 700, 3, 'Part-time', 'pixel-perfect landing pages from Figma designs'),
  // Graphic Design
  w('Karan Malhotra', 'Mumbai', 1, 'Graphic Designer', ['logo design', 'branding', 'adobe illustrator'], 1000, 9, 'Full-time', 'logos and brand identity for startups'),
  w('Tanvi Shah', 'Ahmedabad', 1, 'Social Media Designer', ['social media design', 'canva', 'photoshop'], 600, 4, 'Part-time', 'Instagram posts and ad creatives'),
  w('Divya Menon', 'Bengaluru', 2, 'UI/UX Designer', ['ui/ux design', 'figma', 'wireframing', 'prototyping'], 1400, 7, 'Full-time', 'mobile app and web UI design in Figma'),
  w('Abhishek Mishra', 'Lucknow', 3, 'Brand Designer', ['branding', 'logo design', 'brand guidelines'], 800, 5, 'Weekends only', 'brand kits and style guides'),
  w('Nisha Rathore', 'Jaipur', 3, 'UI/UX Designer', ['ui/ux design', 'figma', 'user research'], 1100, 4, 'Part-time', 'user-friendly app screens and design systems'),
  // Content Writing
  w('Ananya Iyer', 'Chennai', 2, 'Content Writer', ['blog writing', 'seo writing', 'technology'], 500, 5, 'Full-time', 'SEO-friendly technology blogs'),
  w('Neha Agarwal', 'Kolkata', 1, 'Copywriter', ['copywriting', 'website content', 'ad copy'], 700, 6, 'Part-time', 'website copy and ad copy that converts'),
  w('Vivek Rao', 'Hyderabad', 3, 'Technical Writer', ['technical writing', 'api documentation', 'markdown'], 900, 8, 'Full-time', 'developer documentation and user guides'),
  w('Meera Chatterjee', 'Kolkata', 0, 'Content Writer', ['website content', 'blog writing', 'proofreading'], 450, 3, 'Weekends only', 'website pages and blog articles'),
  // Video Editing
  w('Arjun Reddy', 'Hyderabad', 3, 'Video Editor', ['youtube video editing', 'premiere pro', 'color grading'], 800, 5, 'Full-time', 'YouTube videos with engaging cuts and captions'),
  w('Pooja Joshi', 'Mumbai', 2, 'Reels Editor', ['reels editing', 'capcut', 'shorts editing'], 500, 3, 'Part-time', 'Instagram Reels and YouTube Shorts'),
  w('Rahul Gupta', 'Delhi', 0, 'Motion Graphics Designer', ['motion graphics', 'after effects', 'animation'], 1200, 7, 'Full-time', 'animated explainers and logo reveals'),
  w('Kavya Nair', 'Bengaluru', 3, 'Video Editor', ['promotional videos', 'premiere pro', 'video editing'], 900, 6, 'Part-time', 'product promos and brand videos'),
  w('Imran Khan', 'Jaipur', 0, 'Video Editor', ['youtube video editing', 'davinci resolve', 'thumbnail design'], 600, 4, 'Full-time', 'long-form YouTube edits and thumbnails'),
  // Digital Marketing
  w('Rajesh Saini', 'Jaipur', 2, 'Digital Marketer', ['seo', 'google ads', 'google analytics'], 900, 8, 'Full-time', 'SEO and Google Ads for local businesses'),
  w('Shruti Deshpande', 'Pune', 1, 'Social Media Manager', ['social media management', 'instagram', 'content calendar'], 700, 5, 'Part-time', 'Instagram growth and content planning'),
  w('Hardik Patel', 'Ahmedabad', 3, 'SEO Specialist', ['seo', 'keyword research', 'technical seo'], 1000, 7, 'Full-time', 'on-page and technical SEO audits'),
  w('Riya Banerjee', 'Kolkata', 3, 'Content Marketer', ['content marketing', 'email marketing', 'copywriting'], 800, 5, 'Weekends only', 'content strategy and newsletters'),
  // Data Entry and Virtual Assistance
  w('Lakshmi Subramanian', 'Chennai', 1, 'Excel Expert', ['excel', 'data cleaning', 'pivot tables', 'vlookup'], 500, 6, 'Full-time', 'Excel data cleaning, formatting and reports'),
  w('Manish Tiwari', 'Delhi', 3, 'Virtual Assistant', ['virtual assistance', 'email management', 'calendar management'], 350, 4, 'Full-time', 'inbox, calendar and admin support'),
  w('Pallavi Srivastava', 'Lucknow', 0, 'Data Entry Specialist', ['data entry', 'google sheets', 'typing'], 250, 3, 'Part-time', 'accurate data entry and catalogue uploads'),
  w('Sourav Das', 'Kolkata', 2, 'Research Assistant', ['internet research', 'lead generation', 'excel'], 400, 4, 'Full-time', 'market research and lead lists'),
  // AI and Machine Learning
  w('Aman Verma', 'Bengaluru', 0, 'AI Developer', ['ai chatbot development', 'python', 'openai api', 'langchain'], 1800, 6, 'Full-time', 'AI chatbots and LLM integrations'),
  w('Sneha Pillai', 'Hyderabad', 1, 'Machine Learning Engineer', ['machine learning', 'python', 'scikit-learn', 'pandas'], 1600, 5, 'Part-time', 'prediction models and data analysis'),
  w('Deepak Chauhan', 'Delhi', 2, 'Python Developer', ['python', 'python automation', 'web scraping', 'selenium'], 1000, 6, 'Full-time', 'Python automation scripts and scrapers'),
  w('Fatima Shaikh', 'Mumbai', 0, 'AI Integration Specialist', ['ai integration', 'python', 'rest api', 'openai api'], 1500, 4, 'Part-time', 'adding AI features to existing products'),
  // App Development
  w('Mohammed Asif', 'Hyderabad', 0, 'Android Developer', ['android development', 'kotlin', 'firebase'], 1200, 6, 'Full-time', 'native Android apps in Kotlin'),
  w('Nikhil Jain', 'Mumbai', 3, 'iOS Developer', ['ios development', 'swift', 'swiftui'], 1500, 7, 'Part-time', 'iPhone apps in Swift and SwiftUI'),
  w('Ramesh Gowda', 'Bengaluru', 3, 'Flutter Developer', ['cross-platform development', 'flutter', 'dart', 'firebase'], 1100, 5, 'Full-time', 'cross-platform apps with Flutter'),
  w('Gurpreet Singh', 'Chandigarh', 2, 'React Native Developer', ['react native', 'cross-platform development', 'javascript'], 1000, 4, 'Full-time', 'React Native apps for Android and iOS'),
  // Photography and Creative Media
  w('Vikram Singh', 'Jaipur', 1, 'Photo Editor', ['photo editing', 'lightroom', 'color correction'], 500, 7, 'Full-time', 'professional photo editing and colour grading'),
  w('Anjali Bhatt', 'Ahmedabad', 2, 'Retouching Artist', ['image retouching', 'photoshop', 'background removal'], 550, 6, 'Part-time', 'product and portrait retouching'),
  w('Jaspreet Gill', 'Chandigarh', 3, 'Digital Illustrator', ['digital illustration', 'procreate', 'character design'], 900, 5, 'Weekends only', 'book covers and character illustrations'),
  w('Suresh Pillai', 'Chennai', 3, 'Creative Designer', ['creative design', 'photoshop', 'illustrator'], 700, 8, 'Full-time', 'posters, packaging and creative campaigns'),
  w('Vikas Bhosale', 'Pune', 2, 'Photo Editor', ['photo editing', 'image retouching', 'batch editing'], 400, 3, 'Part-time', 'e-commerce product photo editing'),
];

/** Demo client accounts (no sign-in) who own the sample projects. */
const CLIENTS: { name: string; city: string; area: number; bio: string }[] = [
  { name: 'Ankit Bansal', city: 'Jaipur', area: 0, bio: 'Founder of a Jaipur handicrafts e-commerce brand.' },
  { name: 'Sneha Kapoor', city: 'Delhi', area: 1, bio: 'Marketing head at an edtech startup.' },
  { name: 'Rakesh Nair', city: 'Bengaluru', area: 1, bio: 'CTO of a SaaS startup.' },
  { name: 'Megha Joshi', city: 'Mumbai', area: 1, bio: 'YouTuber and lifestyle creator.' },
  { name: 'Siddharth Rao', city: 'Hyderabad', area: 3, bio: 'Runs a digital agency.' },
  { name: 'Kavita Desai', city: 'Ahmedabad', area: 1, bio: 'Owner of a textile export business.' },
  { name: 'Arvind Krishnan', city: 'Chennai', area: 1, bio: 'Chartered accountant with a growing practice.' },
  { name: 'Ritu Saxena', city: 'Lucknow', area: 2, bio: 'Runs an online coaching institute.' },
  { name: 'Manpreet Sandhu', city: 'Chandigarh', area: 0, bio: 'Café and restaurant owner.' },
  { name: 'Debashish Roy', city: 'Kolkata', area: 3, bio: 'Product manager at a fintech company.' },
];

interface JobTemplate {
  title: string;
  detail: string;
  sub: string;
  skills: string[];
  hours: number;
  /** Typical total budget in INR. */
  budget: number;
  urgency: 'low' | 'medium' | 'high';
  type: 'fixed' | 'hourly';
  level: 'beginner' | 'intermediate' | 'expert';
  duration: string;
}

const t = (
  title: string, detail: string, sub: string, skills: string[], hours: number, budget: number,
  urgency: JobTemplate['urgency'], type: JobTemplate['type'], level: JobTemplate['level'], duration: string,
): JobTemplate => ({ title, detail, sub, skills, hours, budget, urgency, type, level, duration });

const JOB_TEMPLATES: Record<string, JobTemplate[]> = {
  'Web Development': [
    t('Need a responsive portfolio website developed using React', 'I am a UX designer and need a fast, responsive portfolio site built in React with a projects gallery, about page and contact form. Designs are ready in Figma. Must work well on mobile and be deployed on Vercel or Netlify.', 'Frontend Development', ['react', 'javascript', 'tailwind css'], 30, 18000, 'medium', 'fixed', 'intermediate', '1 to 2 weeks'),
    t('Need a WordPress website for a small business', 'We are a small interior design studio and need a 6-page WordPress website with a services section, project gallery, WhatsApp chat button and enquiry form. Basic on-page SEO setup required.', 'WordPress Development', ['wordpress', 'elementor', 'php'], 25, 15000, 'medium', 'fixed', 'intermediate', '1 to 2 weeks'),
    t('Build REST API for an order management system', 'Looking for a backend developer to build a REST API in Node.js with PostgreSQL for orders, customers and invoices. JWT authentication and API documentation needed.', 'Backend Development', ['node.js', 'postgresql', 'rest api'], 60, 45000, 'high', 'fixed', 'expert', '2 to 4 weeks'),
    t('Full stack developer for a booking web app', 'Need a full stack developer to build a slot booking web app with React frontend, Node.js backend, admin panel and Razorpay payment integration.', 'Full Stack Development', ['react', 'node.js', 'razorpay'], 120, 90000, 'medium', 'hourly', 'expert', '1 to 3 months'),
  ],
  'Graphic Design': [
    t('Looking for a graphic designer to create a business logo', 'Starting a tea brand and need a modern, memorable logo with 3 initial concepts, 2 rounds of revisions and final files in AI, SVG and PNG.', 'Logo Design', ['logo design', 'adobe illustrator', 'branding'], 10, 6000, 'medium', 'fixed', 'intermediate', 'Less than 1 week'),
    t('Looking for a UI/UX designer to create mobile app screens', 'Need 12 mobile app screens designed in Figma for a fitness tracking app, including onboarding, dashboard and workout pages, with a clickable prototype.', 'UI/UX Design', ['ui/ux design', 'figma', 'prototyping'], 40, 30000, 'medium', 'fixed', 'expert', '2 to 4 weeks'),
    t('Social media post designs for a clothing brand', 'Need 20 Instagram post and story designs per month for our ethnic wear brand, following our brand colours. Canva or Photoshop files required.', 'Social Media Design', ['social media design', 'canva', 'photoshop'], 20, 8000, 'low', 'fixed', 'beginner', '2 to 4 weeks'),
    t('Complete brand identity for a fintech startup', 'Looking for a brand designer to create logo, colour palette, typography and brand guidelines PDF for a fintech startup.', 'Branding', ['branding', 'logo design', 'brand guidelines'], 35, 40000, 'medium', 'fixed', 'expert', '2 to 4 weeks'),
  ],
  'Content Writing': [
    t('Looking for a content writer for a technology blog', 'Need 8 SEO-friendly blog articles of 1,200 words each on cloud computing and cybersecurity topics. Original content with proper research.', 'Blog Writing', ['blog writing', 'seo writing', 'technology'], 24, 9600, 'low', 'fixed', 'intermediate', '2 to 4 weeks'),
    t('Website content for a CA firm', 'Need clear, professional website content for 7 pages (home, about, services, GST, income tax, contact, FAQ) for a chartered accountant firm.', 'Website Content', ['website content', 'copywriting'], 12, 7000, 'medium', 'fixed', 'beginner', 'Less than 1 week'),
    t('Technical writer for API documentation', 'Need a technical writer to document our payments REST API: authentication, endpoints, examples and error codes, in Markdown.', 'Technical Writing', ['technical writing', 'api documentation', 'markdown'], 30, 24000, 'medium', 'hourly', 'expert', '2 to 4 weeks'),
    t('Copywriter for product landing page and ads', 'Looking for a copywriter to write a high-converting landing page and 10 Google and Meta ad copies for a skincare launch.', 'Copywriting', ['copywriting', 'ad copy'], 10, 8000, 'high', 'fixed', 'intermediate', 'Less than 1 week'),
  ],
  'Video Editing': [
    t('Need a video editor for YouTube videos', 'Looking for a video editor for 4 YouTube videos per month (15–20 minutes each) on personal finance. Cuts, captions, B-roll, music and thumbnails needed.', 'YouTube Video Editing', ['youtube video editing', 'premiere pro', 'thumbnail design'], 32, 16000, 'medium', 'fixed', 'intermediate', '2 to 4 weeks'),
    t('Edit 15 Instagram Reels for a café', 'Need 15 short, trendy Reels edited from raw footage of our café with music, transitions and text overlays.', 'Reels and Shorts Editing', ['reels editing', 'capcut', 'shorts editing'], 15, 6000, 'medium', 'fixed', 'beginner', '1 to 2 weeks'),
    t('Motion graphics explainer video for a SaaS product', 'Need a 90-second animated explainer video with motion graphics, voice-over sync and our brand colours.', 'Motion Graphics', ['motion graphics', 'after effects', 'animation'], 40, 35000, 'low', 'fixed', 'expert', '2 to 4 weeks'),
    t('Promotional video for a real estate project', 'Need a 60-second promotional video edited from drone footage and walkthrough clips for a housing project launch.', 'Promotional Videos', ['promotional videos', 'premiere pro', 'color grading'], 16, 12000, 'high', 'fixed', 'intermediate', 'Less than 1 week'),
  ],
  'Digital Marketing': [
    t('Looking for someone to manage Instagram and create social media posts', 'Need a social media manager to plan a monthly content calendar, create 15 posts and 8 stories, write captions and respond to comments for our bakery brand.', 'Social Media Management', ['social media management', 'instagram', 'content calendar'], 40, 15000, 'medium', 'hourly', 'intermediate', '1 to 3 months'),
    t('SEO audit and on-page optimisation for e-commerce site', 'Need a complete SEO audit and on-page fixes (titles, meta, schema, speed) for a Shopify store with 200 products.', 'SEO', ['seo', 'technical seo', 'keyword research'], 30, 25000, 'medium', 'fixed', 'expert', '2 to 4 weeks'),
    t('Set up and manage Google Ads campaign', 'Looking for a Google Ads expert to set up search campaigns for a coaching institute, with conversion tracking and weekly optimisation.', 'Google Ads', ['google ads', 'google analytics'], 20, 12000, 'high', 'hourly', 'intermediate', '1 to 3 months'),
    t('Content marketing strategy and newsletters', 'Need a content marketer to create a 3-month content strategy and write 6 email newsletters for a B2B software company.', 'Content Marketing', ['content marketing', 'email marketing'], 25, 20000, 'low', 'fixed', 'intermediate', '1 to 3 months'),
  ],
  'Data Entry and Virtual Assistance': [
    t('Need an Excel expert for data cleaning and formatting', 'Have a messy Excel sheet with 5,000 customer records. Need duplicates removed, columns standardised, formulas added and a pivot-table summary.', 'Excel Work', ['excel', 'data cleaning', 'pivot tables'], 8, 3500, 'high', 'fixed', 'intermediate', 'Less than 1 week'),
    t('Product data entry for an online store', 'Need 300 products entered into our WooCommerce store with titles, descriptions, prices and images from a supplier catalogue.', 'Data Entry', ['data entry', 'google sheets'], 20, 5000, 'medium', 'fixed', 'beginner', '1 to 2 weeks'),
    t('Virtual assistant for email and calendar management', 'Looking for a part-time virtual assistant to manage my inbox, schedule meetings and prepare weekly reports.', 'Virtual Assistance', ['virtual assistance', 'email management', 'calendar management'], 40, 12000, 'low', 'hourly', 'beginner', '1 to 3 months'),
    t('Internet research for a lead list of 500 companies', 'Need a researcher to compile 500 IT companies in India with website, decision-maker name, email and LinkedIn into Google Sheets.', 'Internet Research', ['internet research', 'lead generation', 'excel'], 25, 6000, 'medium', 'fixed', 'beginner', '1 to 2 weeks'),
  ],
  'AI and Machine Learning': [
    t('Looking for an AI developer to create a chatbot prototype', 'Need a chatbot prototype that answers customer questions from our FAQ and product PDFs using an LLM, with a simple web chat widget.', 'AI Chatbot Development', ['ai chatbot development', 'python', 'openai api'], 40, 40000, 'medium', 'fixed', 'expert', '2 to 4 weeks'),
    t('Need a Python developer for an automation script', 'Need a Python script that downloads daily sales reports from our portal, merges them in Excel and emails a summary every morning.', 'Python Automation', ['python', 'python automation', 'selenium'], 15, 10000, 'high', 'fixed', 'intermediate', '1 to 2 weeks'),
    t('Machine learning model for sales forecasting', 'Looking for an ML engineer to build a sales forecasting model from 3 years of data with a short report on accuracy.', 'Machine Learning Projects', ['machine learning', 'python', 'pandas'], 50, 50000, 'low', 'fixed', 'expert', '1 to 3 months'),
    t('Integrate AI text summarisation into our web app', 'Need a developer to add AI-powered document summarisation to our existing web app via API.', 'AI Integration', ['ai integration', 'openai api', 'rest api'], 25, 25000, 'medium', 'hourly', 'intermediate', '1 to 2 weeks'),
  ],
  'App Development': [
    t('Android app for a local grocery delivery business', 'Need a native Android app with product catalogue, cart, UPI payment and order tracking, connected to Firebase.', 'Android Development', ['android development', 'kotlin', 'firebase'], 150, 120000, 'medium', 'fixed', 'expert', '1 to 3 months'),
    t('iOS app for a meditation timer', 'Looking for an iOS developer to build a simple meditation timer app in SwiftUI with reminders and progress stats.', 'iOS Development', ['ios development', 'swift', 'swiftui'], 60, 60000, 'low', 'fixed', 'intermediate', '2 to 4 weeks'),
    t('Flutter app for an online coaching institute', 'Need a cross-platform Flutter app for students to watch recorded classes, take quizzes and receive notifications.', 'Cross-Platform Development', ['cross-platform development', 'flutter', 'firebase'], 120, 90000, 'medium', 'hourly', 'expert', '1 to 3 months'),
  ],
  'Photography and Creative Media': [
    t('Edit 200 product photos for an e-commerce store', 'Need background removal, colour correction and consistent sizing for 200 jewellery product photos for Amazon and Flipkart.', 'Photo Editing', ['photo editing', 'background removal', 'photoshop'], 15, 6000, 'high', 'fixed', 'beginner', '1 to 2 weeks'),
    t('Portrait retouching for a fashion lookbook', 'Need high-end skin retouching and colour grading for 40 fashion portraits.', 'Image Retouching', ['image retouching', 'photoshop'], 20, 12000, 'medium', 'fixed', 'expert', '1 to 2 weeks'),
    t('Digital illustrations for a children’s storybook', 'Looking for an illustrator to create 12 colourful digital illustrations for a children’s storybook in Hindi and English.', 'Digital Illustration', ['digital illustration', 'procreate', 'character design'], 45, 30000, 'low', 'fixed', 'intermediate', '1 to 3 months'),
    t('Creative poster designs for a music festival', 'Need 5 creative poster designs and social media banners for a college music festival.', 'Creative Design', ['creative design', 'photoshop', 'illustrator'], 12, 7000, 'high', 'fixed', 'intermediate', 'Less than 1 week'),
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

/** Stable id for a demo client profile (no sign-in account). */
export function clientSeedKey(i: number): string {
  return `in-client-${String(i + 1).padStart(2, '0')}`;
}

export function buildSeedRows(now: number = Date.now()) {
  const rand = seededRand(42);

  const workerRows = WORKERS.map((wk, i) => {
    const area = SEED_CITIES[wk.city]![wk.area]!;
    return {
      id: crypto.randomUUID(),
      seed_key: `fl-worker-${String(i + 1).padStart(2, '0')}`,
      role: 'worker' as const,
      full_name: wk.name,
      professional_title: wk.title,
      experience_years: wk.years,
      portfolio_url: wk.portfolio,
      availability: wk.availability,
      bio: `${wk.title} with ${wk.years} years of experience in ${wk.focus}. Based in ${area.area}, ${wk.city}; works remotely with clients across India.`,
      skills: wk.skills,
      hourly_rate: wk.rate,
      city: wk.city,
      pincode: area.pincode,
    };
  });

  const clientRows = CLIENTS.map((c, i) => {
    const area = SEED_CITIES[c.city]![c.area]!;
    return {
      id: crypto.randomUUID(),
      seed_key: clientSeedKey(i),
      role: 'client' as const,
      full_name: c.name,
      bio: c.bio,
      city: c.city,
      pincode: area.pincode,
    };
  });

  const jobRows = Array.from({ length: 100 }, (_, i) => {
    const category = pick(SEED_CATEGORIES, i);
    const templates = JOB_TEMPLATES[category]!;
    const tp = pick(templates, Math.floor(i / SEED_CATEGORIES.length));
    const city = pick(SEED_CITY_NAMES, i);
    const area = pick(SEED_CITIES[city]!, Math.floor(i / SEED_CITY_NAMES.length));
    const daysAgo = Math.floor(rand() * 30);
    const deadline = new Date(now + (7 + Math.floor(rand() * 45)) * 86400000);
    const budget = roundRupees(tp.budget * (0.8 + rand() * 0.5));
    return {
      seed_key: `fl-job-${String(i + 1).padStart(3, '0')}`,
      client_seed_key: clientSeedKey(i % CLIENTS.length),
      title: tp.title,
      description: `${tp.detail} Remote work is fine; client is based in ${area.area}, ${city}.`,
      budget,
      city,
      pincode: area.pincode,
      deadline: deadline.toISOString().slice(0, 10),
      category,
      subcategory: tp.sub,
      project_type: tp.type,
      experience_level: tp.level,
      duration: tp.duration,
      required_skills: tp.skills,
      urgency: tp.urgency,
      estimated_hours: tp.hours,
      status: 'open' as const,
      created_at: new Date(now - daysAgo * 86400000).toISOString(),
    };
  });

  return { workerRows, clientRows, jobRows };
}
