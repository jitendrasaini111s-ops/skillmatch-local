// Sample marketplace data generator (ported from the Bolt Admin page).
const FIRST_NAMES = [
  'Maya', 'Jordan', 'Sofia', 'Liam', 'Priya', 'Noah', 'Elena', 'Marcus', 'Aisha', 'Tom',
  'Grace', 'Diego', 'Nina', 'Owen', 'Zara', 'Felix', 'Hana', 'Leo', 'Ivy', 'Sam',
  'Rosa', 'Eli', 'Mona', 'Jack', 'Lena', 'Theo', 'Anya', 'Cole', 'Ruby', 'Miles',
  'Tara', 'Ben', 'Cleo', 'Reid', 'Nova', 'Kai', 'June', 'Wes', 'Faye', 'Dean',
];
const LAST_NAMES = [
  'Rivera', 'Chen', 'Patel', 'Okafor', 'Kim', 'Nguyen', 'Silva', 'Brooks', 'Haddad', 'Moreau',
];
const CITIES = ['Austin', 'Denver', 'Seattle', 'Chicago', 'Portland', 'Atlanta', 'Boston', 'Phoenix'];
export const SEED_CATEGORIES = ['Tutoring', 'Design', 'Repairs', 'Event Help', 'Photo Editing'];

const CATEGORY_CONFIG: Record<string, { skills: string[]; jobs: string[]; verbs: string[] }> = {
  Tutoring: {
    skills: ['tutoring', 'math', 'algebra', 'reading', 'writing', 'sat prep', 'spanish', 'science', 'homework help'],
    jobs: [
      'Math tutor for 8th grader', 'SAT prep coach needed', 'Weekly reading help for 2nd grader',
      'Algebra homework helper', 'Spanish conversation practice partner', 'Physics tutor before finals',
      'Essay writing coach for high schooler', 'Kindergarten phonics tutor',
    ],
    verbs: ['twice a week after school', 'one hour sessions, flexible timing', 'weekday evenings over video', 'at the local library on Saturdays', 'small group of three students'],
  },
  Design: {
    skills: ['logo design', 'canva', 'figma', 'illustration', 'branding', 'flyer design', 'graphic design', 'web design'],
    jobs: [
      'Logo for new coffee cart', 'Flyer design for garage sale weekend', 'Business cards for handyman service',
      'Simple landing page mockup', 'Menu redesign for food truck', 'Band poster for local show',
      'Instagram highlight icons for bakery', 'Wedding invitation illustration',
    ],
    verbs: ['need 2-3 concepts to choose from', 'should match our existing colors', 'print-ready files required', 'casual, friendly style preferred', 'quick turnaround appreciated'],
  },
  Repairs: {
    skills: ['repair', 'furniture assembly', 'plumbing', 'painting', 'handyman', 'ikea assembly', 'drywall', 'bike repair'],
    jobs: [
      'Assemble two bookshelves and a desk', 'Fix leaking kitchen faucet', 'Patch and paint hallway wall',
      'Mount TV on living room wall', 'Repair wobbly patio table', 'Replace bathroom cabinet handles',
      'Bike tune-up before charity ride', 'Fix squeaky deck boards',
    ],
    verbs: ['tools and parts provided', 'materials to be discussed on site', 'weekend morning preferred', 'should take under 2 hours', 'will supply paint and brushes'],
  },
  'Event Help': {
    skills: ['event help', 'setup', 'server', 'bartending', 'birthday party', 'moving help', 'crowd management'],
    jobs: [
      'Birthday party setup and teardown', 'Serve food at family reunion', 'Bartender for backyard wedding',
      'Extra hands for booth at farmers market', 'Move boxes to new apartment (stairs)', 'Registration desk at charity 5K',
      'Kids party face painting and games', 'Stage crew for school talent show',
    ],
    verbs: ['about 4 hours on a Saturday', 'friendly and reliable, will greet guests', 'early morning setup at 7am', 'dress code is casual black', 'team of 3 needed'],
  },
  'Photo Editing': {
    skills: ['photo editing', 'photoshop', 'lightroom', 'retouching', 'background removal', 'color correction'],
    jobs: [
      'Edit 30 real-estate photos', 'Remove backgrounds from 20 product shots', 'Retouch family portrait session',
      'Color-correct travel blog photos', 'Restore old scanned wedding photos', 'Batch-crop 50 Instagram photos',
      'Light edit for headshot session', 'Photoshop out a photobomber from group shot',
    ],
    verbs: ['consistent bright style please', 'will send RAW files via drive', '48-hour turnaround needed', 'natural look, no heavy filters', 'sample edit appreciated before batch'],
  },
};

export function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length] as T;
}

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}


export function buildSeedRows(now: number = Date.now()) {
  const rand = seededRand(42);

  const workerRows = Array.from({ length: 40 }, (_, i) => {
    const category = pick(SEED_CATEGORIES, i);
    const conf = CATEGORY_CONFIG[category]!;
    const skills = [
      pick(conf.skills, i),
      pick(conf.skills, (i + 3)),
      pick(conf.skills, (i + 5)),
    ];
    return {
      id: crypto.randomUUID(),
      role: 'worker' as const,
      full_name: `${pick(FIRST_NAMES, i * 7 + 1)} ${pick(LAST_NAMES, i * 3 + 2)}`,
      bio: `Friendly local ${category.toLowerCase()} specialist with ${2 + (i % 8)} years of experience. Happy to travel within the city.`,
      skills: Array.from(new Set(skills)),
      hourly_rate: 15 + Math.round(rand() * 45),
      city: pick(CITIES, i * 5 + 3),
    };
  });

  const jobRows = Array.from({ length: 100 }, (_, i) => {
    const category = pick(SEED_CATEGORIES, i);
    const conf = CATEGORY_CONFIG[category]!;
    const title = pick(conf.jobs, i);
    const detail = pick(conf.verbs, (i + 2));
    const daysAgo = Math.floor(rand() * 30);
    const deadline = new Date(now + (7 + Math.floor(rand() * 21)) * 86400000);
    return {
      title,
      description: `${title} — ${detail}. Looking for someone reliable and easy to work with. Message me with your availability and I'll reply quickly.`,
      budget: 40 + Math.round(rand() * 260),
      city: pick(CITIES, i * 3 + 1),
      deadline: deadline.toISOString().slice(0, 10),
      category,
      status: 'open' as const,
      created_at: new Date(now - daysAgo * 86400000).toISOString(),
    };
  });

  return { workerRows, jobRows };
}
