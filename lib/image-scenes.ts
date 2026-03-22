/**
 * Image Scene Rotation Utility
 *
 * Maintains a diverse pool of visual settings for AI-generated cover images.
 * Each new blog or news post picks the NEXT scene in sequence (using post count
 * as an index), so no two consecutive posts share the same backdrop.
 *
 * Pool size is 24 for each type — meaning the visual cycle repeats only after
 * every 24 posts, guaranteeing maximum diversity in a typical publishing schedule.
 */

// ── Blog cover image scenes ───────────────────────────────────────────────────
// Each entry describes a distinct visual setting for a healthcare marketing blog.
// Scenes deliberately rotate between locations (clinic, office, outdoor, lab, etc.)
// and lighting moods so consecutive covers look nothing alike.
const BLOG_SCENES = [
  'a modern urgent care clinic reception desk with soft overhead lighting, a healthcare worker checking in a patient on a tablet, warm white interior walls',
  'a physician reviewing analytics on a large wall-mounted monitor in a tech-forward medical office, data charts visible on screen, bright natural light from floor-to-ceiling windows',
  'a medspa consultation room with marble surfaces, orchid arrangements, neutral linen chairs, and a practitioner discussing a treatment plan with a client',
  'a rooftop terrace of a hospital building at golden hour, healthcare executives in business attire having a standing conversation, city skyline behind them',
  'a radiology suite with blue-tinted lighting, a radiologist studying imaging scans on a high-resolution display, dark room with focused task lighting',
  'an open-plan digital marketing agency office with healthcare clients visible on presentation screens, collaborative team discussion around a long white table',
  'a busy ER triage area seen from the hallway with nurses at a nursing station, bright fluorescent lighting, organized medical supplies in the background',
  'a medical professional photographed from behind walking through a glass-walled hospital corridor, sunlight casting long shadows on the polished floor',
  'a healthcare software dashboard displayed on a MacBook on a clean white desk, notebook and pen beside it, blurred plant in the background',
  'a telehealth consultation in progress — physician on one side of a screen, patient on the other, warm home-office lighting for the patient side',
  'a Google My Business profile and five-star reviews displayed on a smartphone, held by a smiling clinic front-desk receptionist in scrubs',
  'an outdoor health fair tent with medical staff in branded polo shirts speaking with community members, sunny day with blue skies',
  'a physical therapy gym with modern rehabilitation equipment, a therapist assisting a patient with arm exercises, natural daylight from large windows',
  'a medical billing office with professionals at dual-monitor workstations, neutral grays and blues, organized and professional atmosphere',
  'a community health clinic waiting room full of diverse patients, artwork on bright walls, a welcoming front-desk staff member in the background',
  'a dental practice consultation room — dentist and patient reviewing X-rays on a tablet monitor, clean white clinical environment',
  'a stethoscope, prescription pad, and a smartphone showing a marketing dashboard arranged on a wooden desk, overhead flat-lay perspective, soft shadows',
  'a healthcare marketing team in a glass conference room reviewing printed analytics reports, whiteboards with patient acquisition funnels drawn on them',
  'a pediatric clinic waiting room decorated in greens and yellows, a nurse reading to a child, parents watching in the seating area',
  'a hospital administrator reviewing a Google Ads campaign performance report at a standing desk workstation, city view through the window',
  'a medical practice\'s social media profile on a large desktop monitor, a marketing coordinator making post edits, bright agency-style green-plant office',
  'a late-afternoon clinical hallway with diffused warm light, a physician and practice manager walking side by side in conversation',
  'a close-up of a healthcare professional\'s hands typing on a laptop displaying an email drip campaign workflow, blurred clinic background',
  'an urgent care exterior signage at dusk with warm interior lights glowing through the windows, parking lot with a few cars, welcoming atmosphere',
] as const;

// ── News cover image scenes ───────────────────────────────────────────────────
// Photojournalistic settings for healthcare news articles.
const NEWS_SCENES = [
  'a health policy conference podium with a speaker addressing a large auditorium of healthcare professionals, American flag and conference branding in background',
  'a hospital boardroom with executives and administrators seated around a polished table, presentation slides about healthcare strategy visible on screen',
  'a government health agency building exterior with the American flag flying, clear blue sky, professional architectural photography style',
  'a medical research laboratory with scientists in white coats examining samples, rows of centrifuges and clinical equipment, cool scientific lighting',
  'a healthcare technology expo convention floor with display booths, attendees in business attire, large LED screens showing health-tech products',
  'documentary-style photograph of an emergency medicine team in a trauma bay during a high-acuity scenario, motion blur conveying urgency, blue-tinted lighting',
  'a press briefing room with CDC or HHS branding on a podium, reporters seated with notebooks, broadcast cameras visible on tripods',
  'a healthcare startup open-concept office with employees collaborating, whiteboards with patient journey maps, exposed brick and plant-filled interior',
  'a health insurance company headquarters lobby with reception desk, large corporate logo on the wall, professionals in business-casual attire',
  'a medical school lecture hall with students using laptops and tablets, a projected anatomy diagram on the main screen, natural afternoon light',
  'a hospital CEO and CFO reviewing financial performance charts on a tablet in a modern corner office overlooking a city',
  'a community health workers doing outreach at an outdoor urban clinic tent, folding tables, clipboards, and a banner with a health organization logo',
  'a wide-angle photograph of a crowd of medical professionals at an American Medical Association annual convention, badge lanyards visible',
  'a pharmaceutical distribution warehouse with shelves of medication, masked workers scanning barcodes, industrial lighting',
  'a policy analyst at a think-tank office reviewing printed federal health legislation, stacks of documents on a desk, bookcases in background',
  'a telehealth company headquarters with customer support agents at headsets in an open-plan office, healthcare brand colors on the walls',
  'an ambulance pulling into a hospital emergency entrance, motion blur, leading paramedics visible, documentary photojournalism style',
  'a healthcare workforce recruitment fair — nurses and physicians speaking with hospital HR representatives at branded booths',
  'a CMS (Centers for Medicare & Medicaid Services) offices building exterior in Baltimore, Maryland, sunny day, documentary photography',
  'a rural health clinic exterior in a small American town, gravel parking area, hand-painted sign, one nurse practitioner visible near the entrance',
  'a medical device manufacturer quality-control inspection line with workers in clean-room gowns examining equipment, sterile environment',
  'a state capitol building exterior with healthcare advocate protesters holding signs about patient rights, natural outdoor light, documentary style',
  'a health journalism newsroom with reporters and editors at laptop workstations, editorial calendar on the wall, natural light from tall windows',
  'a pharmacy benefit manager corporate campus walkway, professionals talking outdoors, glass-and-steel modern architecture, spring foliage',
] as const;

export type BlogScene = (typeof BLOG_SCENES)[number];
export type NewsScene = (typeof NEWS_SCENES)[number];

/**
 * Picks a blog cover image scene based on how many posts already exist.
 * Using modulo rotation ensures every scene is used before repeating.
 *
 * @param existingCount - The total number of blog posts currently in the DB.
 * @returns A descriptive scene string for use in the Replicate prompt.
 */
export function pickBlogScene(existingCount: number): BlogScene {
  return BLOG_SCENES[existingCount % BLOG_SCENES.length];
}

/**
 * Picks a news cover image scene based on how many articles already exist.
 *
 * @param existingCount - The total number of news articles currently in the DB.
 * @returns A descriptive scene string for use in the Replicate prompt.
 */
export function pickNewsScene(existingCount: number): NewsScene {
  return NEWS_SCENES[existingCount % NEWS_SCENES.length];
}

export const BLOG_SCENE_COUNT = BLOG_SCENES.length;
export const NEWS_SCENE_COUNT = NEWS_SCENES.length;
