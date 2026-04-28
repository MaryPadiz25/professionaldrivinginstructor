/* =============================================
   CONTACT DETAILS — OBFUSCATED
   Phone/email stored as char-code arrays so they
   are NOT readable as plain text in page source.
   Decoded only at the moment of use (click/send).
   ============================================= */
function dec(arr) { return arr.map(c => String.fromCharCode(c)).join(''); }

const CONTACT = {
  'rob-lester':  {
    p: [48,52,49,50,32,48,48,54,32,49,57,57],
    e: [114,111,98,101,114,116,95,115,97,109,115,117,110,103,64,104,111,116,109,97,105,108,46,99,111,109],
    svc: 'service_qmll1g9', tpl: 'template_v9nyycm',
    w3f: '2c2335a7-edb1-4673-b7d7-6971217f4d96',
    unavailable: false
  },
  'john-stevens': {
    p: [48,52,49,50,32,51,52,53,32,54,55,56],
    e: [109,97,114,121,106,111,121,46,112,97,100,105,122,49,64,103,109,97,105,108,46,99,111,109],
    svc: 'maryjoy.padiz1@gmail.com', tpl: 'template_v9nyycm',
    w3f: '1119cfb7-b03e-4f5d-ae4f-b8e3a077bac7',
    unavailable: false
  },
  'lisa-wong': {
    p: [48,52,49,51,32,52,53,54,32,55,56,57],
    e: [109,97,114,105,97,102,114,101,121,112,97,100,105,122,64,103,109,97,105,108,46,99,111,109],
    svc: null, tpl: null,   // EmailJS not yet configured — enquiry button hidden
    unavailable: true,
    joinUnavailable: true
  },
  'mark-harris': {
    p: [48,52,49,52,32,53,54,55,32,56,57,48],
    e: [109,97,114,121,106,111,121,46,112,97,100,105,122,64,111,117,116,108,111,111,107,46,99,111,109],
    svc: 'mariafreypadiz@gmail.com', tpl: 'template_vpug1fw',
    unavailable: false,
    joinUnavailable: true
  },
};

/* =============================================
   INSTRUCTOR DATA
   No phone/email stored here — use CONTACT map
   ============================================= */
const INSTRUCTORS = [
  {
    id: 'rob-lester',
    initials: 'RL',
    name: 'Rob Lester',
    title: 'Professional Driving Instructor',
    baseSuburb: 'Vermont',
    baseLat: -37.8483, baseLng: 145.1813,
    serviceRadius: 15,
    travelBonus: true,
    travelFee: false,
    location: 'Vermont (servicing surrounding suburbs)',
    experience: '20+ years',
    customQS: true,
    lessonFees: [
      { duration: '60 min', price: '$135' },
      { duration: '90 min', price: '$180' },
    ],
    vehicles: [
      { type: 'Auto',   car: 'Toyota Corolla Cross' },
      { type: 'Manual', car: 'Toyota Corolla' },
    ],
    availability: 'Weekdays',
    areasOfExpertise: [
      'First-Time & Learner Drivers',
      'Nervous & Confidence Building Drivers',
      'VicRoads Test Preparation',
      'Defensive Driving Techniques',
      'Adult Learners & Late Starters',
      'Overseas Licence Conversion',
      'Manual Driving Instruction',
      'Advanced Road Confidence & Decision Making',
      'Highway & Long Distance Driving',
      'Refresher Lessons (returning drivers)',
      'Logbook Hours & Structured Driving Plans',
      'NDIS & Supported Driving Instruction',
    ],
    seniorBadge: true,
    photo: 'rob-lester.jpg',
    bio: "Rob is a professional driving instructor based in Melbourne's Eastern Suburbs with over 20 years of experience helping learner drivers build confidence and pass their driving tests safely and efficiently. He is also a qualified commercial pilot and flight instructor, bringing an aviation-based approach to training that focuses on calm decision-making, structure, and safety. His calm, structured approach helps students become safe, independent drivers.",
  },
  {
    id: 'john-stevens',
    initials: 'JS',
    name: 'John Stevens',
    title: 'Professional Driving Instructor',
    baseSuburb: 'Box Hill',
    baseLat: -37.8198, baseLng: 145.1245,
    serviceRadius: 10,
    travelBonus: false,
    travelFee: false,
    location: 'Melbourne East',
    transmission: 'Manual & Automatic',
    experience: '12+ years',
    fee: 'From $90–$120/hr',
    availability: 'Weekdays / Weekends',
    seniorBadge: true,
    photo: 'john-stevens.jpg',
    bio: "John is a professional driving instructor based in Melbourne's east with over 12 years of experience helping learner drivers build confidence and pass their driving test safely and efficiently. His calm, structured approach has helped hundreds of students become safe, independent drivers.",
  },
  {
    id: 'lisa-wong',
    initials: 'LW',
    name: 'Lisa Wong',
    title: 'Professional Driving Instructor',
    baseSuburb: 'Melbourne CBD',
    baseLat: -37.8136, baseLng: 144.9631,
    serviceRadius: 10,
    travelBonus: false,
    travelFee: false,
    location: 'Melbourne CBD',
    transmission: 'Automatic',
    experience: '8+ years',
    fee: 'From $95–$115/hr',
    availability: 'Weekdays / Saturdays',
    seniorBadge: false,
    photo: 'lisa-wong.jpg',
    bio: "Lisa is an experienced automatic driving instructor operating in Melbourne's CBD and inner suburbs. With 8 years of experience, she specialises in building confidence in busy urban environments, helping students master parallel parking, roundabouts, and city traffic with ease.",
  },
  {
    id: 'mark-harris',
    initials: 'MH',
    name: 'Mark Harris',
    title: 'Professional Driving Instructor',
    baseSuburb: 'Footscray',
    baseLat: -37.8002, baseLng: 144.8996,
    serviceRadius: 15,
    travelBonus: true,
    travelFee: true,
    location: 'Melbourne West',
    transmission: 'Manual & Automatic',
    experience: '15+ years',
    fee: 'From $95–$125/hr',
    availability: 'Weekdays / Weekends',
    seniorBadge: true,
    photo: 'mark-harris.jpg',
    bio: "Mark brings over 15 years of driving instruction experience to Melbourne's western suburbs. Known for his patient, structured teaching style, Mark has helped learners of all ages — from nervous first-timers to experienced drivers seeking to improve — become safe, confident road users.",
  }
];

/* =============================================
   ENQUIRY TRACKER (localStorage — lightweight)
   ============================================= */
const TRACKER_KEY = 'pdin_enquiries';
function trackEnquiry(instructorId, instructorName) {
  try {
    const raw  = localStorage.getItem(TRACKER_KEY);
    const data = raw ? JSON.parse(raw) : {};
    if (!data[instructorId]) data[instructorId] = { name: instructorName, count: 0, lastDate: null };
    data[instructorId].count++;
    data[instructorId].lastDate = new Date().toISOString();
    localStorage.setItem(TRACKER_KEY, JSON.stringify(data));
  } catch(e) { /* storage unavailable */ }
}

/* =============================================
   DISTANCE UTILITY (Haversine)
   ============================================= */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* =============================================
   SVG ICONS
   ============================================= */
const ICONS = {
  shield:     `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  document:   `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  phone:      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>`,
  user:       `<svg width="14" height="14" viewBox="2 2 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  userLg:     `<svg width="24" height="24" viewBox="2 2 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  pin:        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  car:        `<svg viewBox="-5 1 160 70" width="26" height="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(120,0) scale(-1,1)"><path stroke-width="8" d="M35 10 C-5 30 -10 30 2 45 C-5 30 -15 30 5 25 C-15 15 4 25 35 8 C40 -5 50 -8 70 -6 C98 -12 90 -5 105 1 C144 25 90 30 115 20 C110 55 175 10 85 50 C185 -10 119 54 125 10 M-8 34 C25 4 4 10 -2 45 C-6 9 -6 70 -2 40 C1 32 4 4 4 34"/><path stroke-width="8" d="M125 44 C90 44 109 45 150 38 C128 90 127 0 185 2 C129 50 158 20 100 0"/><line x1="8" y1="44" x2="86" y2="44" stroke-width="8"/><circle cx="26" cy="50" r="15" stroke-width="8"/><circle cx="26" cy="50" r="5" stroke-width="5"/><circle cx="94" cy="50" r="15" stroke-width="8"/><circle cx="94" cy="50" r="5" stroke-width="5"/></g></svg>`,
  clock:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  dollar:     `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
  users:      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  award:      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  star:       `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  mail:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  phoneSmall: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5 19.79 19.79 0 0 0 0 .82 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.28-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
  check:      `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38a169" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  info:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  search:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  mapPin:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  upload:     `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>`,
};

/* =============================================
   DISCLAIMER
   ============================================= */
const PROFILE_DISCLAIMER = `
  <div class="profile-disclaimer">
    <div class="profile-disclaimer-inner">
      <span class="disclaimer-icon">${ICONS.info}</span>
      <p>All instructor information is provided by individual instructors. The Professional Driving Instructors Network does not independently verify or guarantee qualifications, insurance, or compliance. Information is subject to change and should be confirmed directly with the instructor.</p>
    </div>
  </div>`;

/* =============================================
   EMAILJS INIT
   ============================================= */
const EMAILJS_PUBLIC_KEY = '6h-VvWML9Chj5QA2a';
(function initEJS() {
  function tryInit() { if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); }
  if (document.readyState === 'loading') window.addEventListener('load', tryInit);
  else tryInit();
})();

/* =============================================
   SUBURB GEOCODING (OpenStreetMap Nominatim)
   ============================================= */
async function geocodeSuburb(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=au&limit=1&q=${encodeURIComponent(query + ', VIC, Australia')}`;
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name.split(',')[0] };
}

function sortInstructorsByDistance(lat, lng) {
  return INSTRUCTORS
    .map(inst => {
      const km = haversineKm(lat, lng, inst.baseLat, inst.baseLng);
      const effectiveRadius = inst.travelBonus ? inst.serviceRadius + 8 : inst.serviceRadius;
      return { inst, km, inRange: km <= effectiveRadius };
    })
    .sort((a, b) => a.km - b.km);
}

/* =============================================
   INSTRUCTOR CARD HTML
   ============================================= */
function instructorCardHTML(inst, distKm) {
  const photoEl = inst.photo
    ? `<img src="${inst.photo}" alt="${inst.name}" class="card-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><div class="avatar-initials" style="display:none">${inst.initials}</div>`
    : `<div class="avatar-initials">${inst.initials}</div>`;

  // Smart badge
  let badge = '';
  if (distKm !== undefined) {
    if (distKm <= inst.serviceRadius * 0.5)       badge = `<span class="card-badge badge-best">Best Match</span>`;
    else if (distKm <= inst.serviceRadius)         badge = `<span class="card-badge badge-available">Available in Your Area</span>`;
    else if (inst.travelBonus && distKm <= inst.serviceRadius + 8) badge = `<span class="card-badge badge-travel">Travels for Longer Lessons</span>`;
  }

  const distLabel = distKm !== undefined
    ? `<div class="card-dist-row">${ICONS.mapPin} ${inst.baseSuburb} &bull; <strong>${distKm.toFixed(1)} km away</strong></div>`
    : `<div class="card-meta-row">${ICONS.pin} ${inst.location}</div>`;

  let metaRows = inst.customQS
    ? `${distLabel}<div class="card-meta-row">${ICONS.car} Manual &amp; Automatic</div><div class="card-meta-row card-tagline">${ICONS.user} Patient and calm</div><div class="card-meta-row">${ICONS.clock} ${inst.experience}</div>`
    : `${distLabel}<div class="card-meta-row">${ICONS.car} ${inst.transmission}</div><div class="card-meta-row">${ICONS.clock} ${inst.experience}</div>`;

  return `
    <div class="card" data-action="profile" data-id="${inst.id}">
      <div class="card-photo-wrap">${photoEl}${badge}</div>
      <div class="card-body">
        <div class="card-name">${inst.name}${inst.seniorBadge ? '<span class="senior-badge" title="10+ Years Experience">⭐</span>' : ''}</div>
        ${metaRows}
        <button class="btn btn-navy btn-full" data-action="profile" data-id="${inst.id}">View Profile</button>
      </div>
    </div>`;
}

/* =============================================
   PAGES
   ============================================= */
function renderHome() {
  return `
    <section class="hero">
      <img src="hero-bg.png" alt="Driving lesson" class="hero-bg-img" />
      <div class="hero-content">
        <h1>Find a Professional Driving Instructor Near You</h1>
        <p>A network of experienced, independent driving instructors who take pride in quality, safety, and results.</p>
        <div class="hero-search-bar">
          <div class="hero-search-inner">
            ${ICONS.search}
            <input type="text" id="hero-suburb-input" placeholder="Enter your suburb or postcode…" autocomplete="off" />
            <button class="btn btn-gold" id="hero-search-btn">Find Instructors</button>
          </div>
        </div>
        <div class="hero-btns">
          <button class="btn btn-navy-outline btn-lg" data-action="nav" data-page="find">Browse All Instructors</button>
          <button class="btn btn-navy-outline btn-lg" data-action="nav" data-page="join">Join the Network</button>
        </div>
      </div>
    </section>
    <section class="section why-section">
      <div class="container">
        <h2 class="section-title">Why Choose the Professional Driving Instructors Network?</h2>
        <div class="why-grid reveal">
          <div class="why-card"><div class="icon-circle">${ICONS.shield}</div><h3>Experienced Instructors</h3><p>Qualified professionals focused on helping learners succeed.</p></div>
          <div class="why-card"><div class="icon-circle">${ICONS.document}</div><h3>No Commission Platforms</h3><p>Instructors keep 100% of their lesson fees</p></div>
          <div class="why-card"><div class="icon-circle">${ICONS.phone}</div><h3>Direct Contact</h3><p>Connect directly with your instructor — no middleman</p></div>
          <div class="why-card"><div class="icon-circle">${ICONS.userLg}</div><h3>Professional Standards</h3><p>Quality-focused instructors who take pride in their work</p></div>
        </div>
      </div>
    </section>
    <section class="section featured-section">
      <div class="container">
        <h2 class="section-title reveal">Featured Instructors</h2>
        <div class="instructor-grid">
          ${INSTRUCTORS.map(i => instructorCardHTML(i)).join('')}
        </div>
      </div>
    </section>
    <section class="section-sm location-section">
      <div class="container">
        <h2 class="section-title">Find Instructors by Location</h2>
        <div class="location-tabs">
          <button class="location-tab active" data-action="nav" data-page="find">Melbourne</button>
          <button class="location-tab coming-soon">Sydney (Coming Soon)</button>
          <button class="location-tab coming-soon">Brisbane (Coming Soon)</button>
        </div>
      </div>
    </section>
    <section class="cta-section">
      <div class="cta-content reveal">
        <h2>Are you a professional driving instructor?</h2>
        <button class="btn btn-gold btn-lg" data-action="nav" data-page="join">Join the Network</button>
      </div>
    </section>`;
}

function renderFind(searchLat, searchLng, searchLabel) {
  const sorted = (searchLat !== undefined)
    ? sortInstructorsByDistance(searchLat, searchLng)
    : INSTRUCTORS.map(i => ({ inst: i, km: undefined }));

  const cardsHTML = sorted.map(({ inst, km }) => instructorCardHTML(inst, km)).join('');
  const searchInfo = searchLabel
    ? `<p class="find-search-info">${ICONS.mapPin} Results near <strong>${searchLabel}</strong> — sorted by distance &nbsp;<a href="#" id="clear-search-link">Clear</a></p>`
    : '';

  return `
    <div class="navy-banner">
      <h1>Driving Instructors in Melbourne</h1>
      <p>Find an experienced, independent driving instructor near you.</p>
      <div class="find-search-bar">
        <div class="find-search-inner">
          ${ICONS.search}
          <input type="text" id="find-suburb-input" placeholder="Enter your suburb or postcode…" autocomplete="off" value="${searchLabel || ''}" />
          <button class="btn btn-gold" id="find-search-btn">Search</button>
        </div>
      </div>
    </div>
    <div class="container">
      ${searchInfo}
      <div class="find-grid" id="find-results">${cardsHTML}</div>
    </div>`;
}

function renderProfile(id) {
  const inst = INSTRUCTORS.find(i => i.id === id) || INSTRUCTORS[0];
  const effectiveRadius = inst.travelBonus ? inst.serviceRadius + 8 : inst.serviceRadius;

  const avatarEl = inst.photo
    ? `<img src="${inst.photo}" alt="${inst.name}" class="profile-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><div class="profile-avatar-circle" style="display:none">${inst.initials}</div>`
    : `<div class="profile-avatar-circle">${inst.initials}</div>`;

  const serviceAreaBlock = `
    <div class="qs-block">
      <div class="qs-item-label">Service Area</div>
      <div class="qs-item-value">Based in ${inst.baseSuburb}</div>
      <div class="qs-item-value">Travel Range: ${inst.serviceRadius} km</div>
      ${inst.travelBonus ? `<div class="qs-item-value qs-travel-note">Travel outside service area may be available by arrangement (additional fee may apply).</div>` : ''}
      ${inst.travelFee   ? `<div class="qs-item-value qs-travel-note">May charge travel fee for outer areas</div>` : ''}
    </div>`;

  let qsRows = '';
  if (inst.customQS) {
    const expertiseHTML = inst.areasOfExpertise ? inst.areasOfExpertise.map(a => `<li>${a}</li>`).join('') : '';
    const feesHTML      = inst.lessonFees.map(f => `<div class="qs-item-value">${f.duration} — ${f.price}</div>`).join('');
    const vehiclesHTML  = inst.vehicles.map(v => `<div class="qs-item-value">${v.type} — ${v.car}</div>`).join('');
    qsRows = `
      <div class="qs-col-left">
        <div class="qs-block"><div class="qs-item-label">Experience</div><div class="qs-item-value">${inst.experience}</div></div>
        <div class="qs-block"><div class="qs-item-label">Areas of Expertise</div><ul class="qs-expertise-list">${expertiseHTML}</ul></div>
      </div>
      <div class="qs-col-right">
        <div class="qs-block"><div class="qs-item-label">Vehicles</div>${vehiclesHTML}</div>
        <div class="qs-block"><div class="qs-item-label">Availability</div><div class="qs-item-value">${inst.availability}</div></div>
        <div class="qs-block"><div class="qs-item-label">Lesson Fees</div>${feesHTML}</div>
        ${serviceAreaBlock}
      </div>`;
  } else {
    qsRows = `
      <div><div class="qs-item-label">Experience</div><div class="qs-item-value">${inst.experience}</div></div>
      <div><div class="qs-item-label">Lesson Fee</div><div class="qs-item-value">${inst.fee}</div></div>
      <div><div class="qs-item-label">Transmission</div><div class="qs-item-value">${inst.transmission}</div></div>
      <div><div class="qs-item-label">Availability</div><div class="qs-item-value">${inst.availability}</div></div>
      ${serviceAreaBlock}`;
  }

  const qsGridClass = inst.customQS ? 'qs-grid qs-grid-custom' : 'qs-grid';

  return `
    <div class="profile-hero">
      <div class="profile-hero-inner">
        <div class="profile-avatar-wrap">
          ${avatarEl}
          <div>
            <div class="profile-name">${inst.name}${inst.seniorBadge ? '<span class="senior-badge" title="10+ Years Experience — Premium Badge">⭐</span>' : ''}</div>
            <div class="profile-title">${inst.title}</div>
            <div class="profile-location">${ICONS.pin} ${inst.location}</div>
          </div>
        </div>
        <div class="quick-summary">
          <div class="qs-title">Instructor Profile</div>
          <div class="${qsGridClass}">${qsRows}</div>
          <div class="qs-btns">
            <button class="btn btn-navy" id="call-instructor-btn" data-id="${inst.id}">${ICONS.phoneSmall} Call Instructor</button>
            ${(CONTACT[inst.id] && CONTACT[inst.id].unavailable)
              ? `<button class="btn btn-gold btn-unavailable" disabled title="Online enquiry not yet available for this instructor">${ICONS.mail} Enquiry Unavailable</button>`
              : `<button class="btn btn-gold" id="open-enquiry-btn" data-instructor-id="${inst.id}">${ICONS.mail} Send Enquiry</button>`
            }
          </div>
        </div>
      </div>
    </div>
    <div class="profile-about">
      <div class="profile-about-inner">
        <h2>About ${inst.name}</h2>
        <p>${inst.bio}</p>
      </div>
    </div>
    ${PROFILE_DISCLAIMER}`;
}

function renderJoin() {
  return `
    <div class="join-hero">
      <h1>Join the Network</h1>
      <p>Are you a professional driving instructor who takes pride in your work? Apply to join our network.</p>
    </div>
    <section class="section">
      <div class="container">
        <div class="join-benefits">
          <div class="benefit-card"><div class="icon-circle">${ICONS.dollar}</div><h3>Keep 100% of Your Fees</h3><p>No commissions, no percentage cuts, no hidden charges.</p></div>
          <div class="benefit-card"><div class="icon-circle">${ICONS.users}</div><h3>Free Exposure to New Students</h3><p>Get discovered by learners actively searching for quality instructors.</p></div>
          <div class="benefit-card"><div class="icon-circle">${ICONS.award}</div><h3>Professional Branding</h3><p>Be presented as a professional, not a commodity listing.</p></div>
          <div class="benefit-card"><div class="icon-circle">${ICONS.star}</div><h3>Free to Join</h3><p>Become a Founding Member today and lock in early benefits before any fees are introduced.</p></div>
        </div>
      </div>
    </section>
    <div class="apply-form-wrap">
      <div class="apply-form-box" id="join-form-box">
        <div class="apply-form-title">Apply to Join</div>



        <div class="form-group"><label class="form-label">Full Name <span>*</span></label><input type="text" class="form-input" placeholder="Your full name" id="join-name" /></div>
        <div class="form-group"><label class="form-label">Email <span>*</span></label><input type="email" class="form-input" placeholder="your@email.com" id="join-email" /></div>
        <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" placeholder="0412 345 678" id="join-phone" /></div>
        <div class="form-group">
          <label class="form-label">Year you started working as a driving instructor <span>*</span></label>
          <select class="form-input" id="join-exp">
            <option value="" disabled selected>Select year…</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="2019">2019</option>
            <option value="2018">2018</option>
            <option value="2017">2017</option>
            <option value="2016">2016</option>
            <option value="2015">2015</option>
            <option value="2014">2014</option>
            <option value="2013">2013</option>
            <option value="2012">2012</option>
            <option value="2011">2011</option>
            <option value="2010">2010</option>
            <option value="2009">2009</option>
            <option value="2008">2008</option>
            <option value="2007">2007</option>
            <option value="2006">2006</option>
            <option value="2005">2005</option>
            <option value="2004">2004</option>
            <option value="2003">2003</option>
            <option value="2002">2002</option>
            <option value="2001">2001</option>
            <option value="2000">2000</option>
            <option value="1999">1999</option>
            <option value="1998">1998</option>
            <option value="1997">1997</option>
            <option value="1996">1996</option>
            <option value="1995">1995</option>
            <option value="1994">1994</option>
            <option value="1993">1993</option>
            <option value="1992">1992</option>
            <option value="1991">1991</option>
            <option value="1990">1990</option>
            <option value="1989">1989</option>
            <option value="1988">1988</option>
            <option value="1987">1987</option>
            <option value="1986">1986</option>
            <option value="1985">1985</option>
            <option value="1984">1984</option>
            <option value="1983">1983</option>
            <option value="1982">1982</option>
            <option value="1981">1981</option>
            <option value="1980">1980</option>
            <option value="1979">1979</option>
            <option value="1978">1978</option>
            <option value="1977">1977</option>
            <option value="1976">1976</option>
            <option value="1975">1975</option>
            <option value="1974">1974</option>
            <option value="1973">1973</option>
            <option value="1972">1972</option>
            <option value="1971">1971</option>
            <option value="1970">1970</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">DIA Number <span>*</span></label><input type="text" class="form-input" placeholder="Your Driving Instructor Authority number" id="join-dia" /><small class="form-hint">For verification purposes. This will not be displayed publicly.</small></div>
        <div class="form-group"><label class="form-label">Tell us about yourself</label><textarea class="form-input" placeholder="Brief overview of your experience and teaching style" id="join-bio"></textarea></div>

        <!-- Vehicle Details -->
        <div class="form-section-head">Vehicles</div>
        <div class="form-group">
          <label class="form-label">Automatic Vehicle</label>
          <input type="text" class="form-input" placeholder="Vehicle make &amp; model (if applicable)" id="join-vehicle-auto" />
        </div>
        <div class="form-group">
          <label class="form-label">Manual Vehicle</label>
          <input type="text" class="form-input" placeholder="Vehicle make &amp; model (if applicable)" id="join-vehicle-manual" />
        </div>

        <!-- Availability -->
        <div class="form-section-head">Availability</div>
        <div class="form-group">
          <div class="join-avail-grid">
            <label class="join-toggle-label"><input type="checkbox" id="avail-weekdays" value="Weekdays" /><span>Weekdays</span></label>
            <label class="join-toggle-label"><input type="checkbox" id="avail-weekends" value="Weekends" /><span>Weekends</span></label>
            <label class="join-toggle-label"><input type="checkbox" id="avail-evenings" value="Evenings" /><span>Evenings</span></label>
            <label class="join-toggle-label"><input type="checkbox" id="avail-early" value="Early Mornings" /><span>Early Mornings</span></label>
          </div>
        </div>

        <!-- Areas of Expertise -->
        <div class="form-section-head">Areas of Expertise <span style="font-size:12px;font-weight:400;color:var(--text-light)">(choose 3–5)</span></div>
        <div class="form-group">
          <div class="join-expertise-grid" id="join-expertise-grid">
            <label class="join-toggle-label"><input type="checkbox" value="First-Time &amp; Learner Drivers" /><span>First-Time &amp; Learner Drivers</span></label>
            <label class="join-toggle-label"><input type="checkbox" value="Nervous &amp; Confidence Building Drivers" /><span>Nervous &amp; Confidence Building Drivers</span></label>
            <label class="join-toggle-label"><input type="checkbox" value="VicRoads Test Preparation" /><span>VicRoads Test Preparation</span></label>
            <label class="join-toggle-label"><input type="checkbox" value="Defensive Driving Techniques" /><span>Defensive Driving Techniques</span></label>
            <label class="join-toggle-label"><input type="checkbox" value="Adult Learners &amp; Late Starters" /><span>Adult Learners &amp; Late Starters</span></label>
            <label class="join-toggle-label"><input type="checkbox" value="Overseas Licence Conversion" /><span>Overseas Licence Conversion</span></label>
            <label class="join-toggle-label"><input type="checkbox" value="Manual Driving Instruction" /><span>Manual Driving Instruction</span></label>
            <label class="join-toggle-label"><input type="checkbox" value="Advanced Road Confidence &amp; Decision Making" /><span>Advanced Road Confidence &amp; Decision Making</span></label>
            <label class="join-toggle-label"><input type="checkbox" value="Highway &amp; Long Distance Driving" /><span>Highway &amp; Long Distance Driving</span></label>
            <label class="join-toggle-label"><input type="checkbox" value="Refresher Lessons (returning drivers)" /><span>Refresher Lessons (returning drivers)</span></label>
            <label class="join-toggle-label"><input type="checkbox" value="Logbook Hours &amp; Structured Driving Plans" /><span>Logbook Hours &amp; Structured Driving Plans</span></label>
            <label class="join-toggle-label"><input type="checkbox" value="NDIS &amp; Supported Driving Instruction" /><span>NDIS &amp; Supported Driving Instruction</span></label>
          </div>
          <small class="form-hint expertise-count-hint" id="expertise-count-hint"></small>
        </div>

        <!-- Service Area -->
        <div class="form-section-head">Where do you provide lessons?</div>
        <div class="form-group">
          <label class="form-label">Primary Suburb <span>*</span></label>
          <input type="text" class="form-input" placeholder="e.g. Doncaster VIC" id="join-suburb" />
        </div>
        <div class="form-group">
          <label class="form-label">How far are you willing to travel?</label>
          <select class="form-input" id="join-radius">
            <option value="10" selected>10 km</option>
            <option value="15">15 km</option>
            <option value="20">20 km</option>
            <option value="30">30 km</option>
            <option value="50">50 km</option>
          </select>
        </div>


        <!-- Instructor Requirements -->
        <div class="form-group join-requirements-group">
          <div class="join-req-title">Instructor Requirements <span class="req-required">*</span></div>
          <div class="join-req-subtitle">Please tick to confirm you meet all of the following requirements:</div>
          <div class="join-req-box">
            <div class="join-req-section-head">Licensing &amp; Compliance</div>
            <ul class="join-req-list">
              <li>Current Driving Instructor Authority (DIA)</li>
              <li>Valid Working With Children Check (WWCC)</li>
            </ul>
            <div class="join-req-section-head">Vehicle Standards</div>
            <ul class="join-req-list">
              <li>Fully registered and roadworthy vehicle suitable for professional driving instruction</li>
              <li>Dual-controlled vehicle fitted and operational</li>
              <li>Clean, safe, and presentable condition suitable for learner drivers</li>
            </ul>
            <div class="join-req-section-head">Insurance</div>
            <ul class="join-req-list">
              <li>Comprehensive motor vehicle insurance covering use of the vehicle for paid driving instruction</li>
            </ul>
            <div class="join-req-section-head">Professional Standards</div>
            <ul class="join-req-list">
              <li>Maintain safe, professional, and student-focused instruction standards consistent with industry expectations</li>
              <li>Have appropriate professional driving instruction experience and competency to deliver safe, structured, and effective driving lessons</li>
            </ul>
          </div>
          <label class="join-req-confirm">
            <input type="checkbox" id="join-req-check" />
            <span>I confirm I meet all of the above Instructor Requirements</span>
          </label>
        </div>

        <button class="btn btn-navy btn-full btn-lg" id="join-submit">Apply to Join</button>
        <div class="join-approval-notice">
          <p>Once your instructor profile has been approved, you will receive a confirmation email. Your profile, including your photo and submitted details, will then be visible to users, allowing them to view your information and contact you directly.</p>
          <p>If you have any questions or require assistance, please contact our team at <a href="mailto:support@professionaldrivinginstructorsnetwork.com">support@professionaldrivinginstructorsnetwork.com</a></p>
        </div>
        <p class="join-reserve-note">Professional Driving Instructors Network reserves the right to verify credentials before approval.</p>
      </div>
    </div>`;
}

function renderAbout() {
  return `
    <div class="about-hero"><h1>About Us</h1></div>
    <section class="about-content">
      <div class="container-narrow">
        <p>The Professional Driving Instructors Network was created to support experienced instructors who take pride in their work and want to operate independently, without being forced to compete on price.</p>
        <p>Too often, talented instructors are listed alongside underqualified newcomers on discount-driven platforms that erode trust, lower standards, and devalue the profession. We believe there's a better way.</p>
        <p>Our network is built on a simple principle: <strong>quality instruction deserves quality presentation</strong>. We provide a professional platform where instructors who meet our standards can present their services in a way that reflects the true value of their work.</p>
        <p>For learners, this means confidence. You're choosing from a network of instructors who have confirmed they meet our stated professional, safety, and compliance requirements at the time of joining.</p>
        <p>For instructors, this means respect. No commission fees. No race to the bottom on pricing. No algorithm deciding your visibility. Just a professional platform that presents your business the way it deserves to be presented.</p>
        <p>We're starting in Melbourne, with plans to expand to Sydney and Brisbane. If you're a professional instructor who meets our standards and shares our values, we'd love to hear from you.</p>
      </div>
    </section>`;
}

function renderPricing() {
  return `
    <div class="pricing-hero"><h1>Pricing</h1><p>Transparent, fair pricing with no hidden fees or commissions.</p></div>
    <section class="pricing-content">
      <div class="container-narrow">
        <h2>Why We Don't Compete on Price</h2>
        <p>Many platforms focus on the cheapest lesson available. We don't.</p>
        <p>Lower prices often lead to rushed lessons, inexperienced instruction, inconsistent quality, and instructors needing to overbook to survive.</p>
        <p>Instead, we focus on <strong>quality instruction, better outcomes, and safer drivers</strong>.</p>
        <hr class="pricing-divider" />
        <h2>Independent Instructor Pricing</h2>
        <p>All instructors on this platform are independent professionals. They set their own pricing, reflecting their experience and expertise.</p>
        <p>Typical lesson pricing across the network generally falls within:</p>
        <div class="price-highlight">$85 – $135 per hour <span>(guide only)</span></div>
        <p>Some instructors may charge more or less depending on experience level, vehicle type, lesson type, and location.</p>
        <hr class="pricing-divider" />
        <h2>No Commission Model</h2>
        <p>Unlike many booking platforms, we do not take a percentage of lesson fees. This means instructors keep 100% of their earnings, pricing is not inflated to cover platform fees, and no hidden charges are passed onto learners.</p>
        <hr class="pricing-divider" />
        <h2>Network Membership (For Instructors)</h2>
        <p>Join the Professional Driving Instructors Network — currently free for founding members.</p>
        <p>No commissions, no per-booking fees, and no lock-in contracts.</p>
        <p>Introductory pricing may be introduced as the network grows, with founding members securing the lowest rate.</p>
        <p><a href="#" data-action="nav" data-page="join" style="color:var(--navy);font-weight:600;text-decoration:underline;">Apply to join</a></p>
      </div>
    </section>`;
}

function renderContact() {
  return `
    <div class="contact-hero"><h1>Contact Us</h1><p>Have a question? We'd love to hear from you.</p></div>
    <section class="contact-content">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-info">
            <h2>Get in Touch</h2>
            <p>Whether you're a learner or an instructor interested in joining, reach out and we'll get back to you promptly.</p>
            <div class="contact-detail">${ICONS.mail}<span>support@professionaldrivinginstructorsnetwork.com</span></div>
            <div class="contact-detail">${ICONS.pin}<span>Melbourne, Victoria, Australia</span></div>
          </div>
          <div id="contact-form-wrap">
            <div class="form-group"><label class="form-label">Full Name <span style="color:#e53e3e">*</span></label><input type="text" class="form-input" placeholder="Your full name" id="c-name" /></div>
            <div class="form-group"><label class="form-label">Email <span style="color:#e53e3e">*</span></label><input type="email" class="form-input" placeholder="your@email.com" id="c-email" /></div>
            <div class="form-group"><label class="form-label">Subject</label><input type="text" class="form-input" placeholder="How can we help?" id="c-subject" /></div>
            <div class="form-group"><label class="form-label">Message <span style="color:#e53e3e">*</span></label><textarea class="form-input" placeholder="Your message..." id="c-message" style="min-height:140px"></textarea></div>
            <button class="btn btn-navy btn-full btn-lg" id="contact-submit">Send Message</button>
          </div>
        </div>
      </div>
    </section>`;
}

/* =============================================
   ENQUIRY MODAL
   ============================================= */
function enquiryModalHTML(inst) {
  return `
  <div class="enquiry-overlay" id="enquiry-overlay" role="dialog" aria-modal="true">
    <div class="enquiry-modal" id="enquiry-modal">
      <button class="enquiry-close" id="enquiry-close">&times;</button>
      <div class="enquiry-header">
        <div class="enquiry-title">Send Enquiry to ${inst.name}</div>
        <div class="enquiry-subtitle">Your details go directly to the instructor — no middleman.</div>
      </div>
      <div id="enquiry-form-body">
        <div class="enquiry-section-label">Your Details</div>
        <div class="form-group"><label class="form-label">Full Name <span>*</span></label><input type="text" class="form-input" id="eq-name" placeholder="Your full name" /></div>
        <div class="form-group"><label class="form-label">Mobile Number <span>*</span></label><input type="tel" class="form-input" id="eq-mobile" placeholder="e.g. 0400 123 456" /></div>
        <div class="form-group"><label class="form-label">Email Address <span>*</span></label><input type="email" class="form-input" id="eq-email" placeholder="your@email.com" /></div>
        <div class="enquiry-section-label">Lesson Details</div>
        <div class="form-group"><label class="form-label">Suburb / Area <span>*</span></label><input type="text" class="form-input" id="eq-suburb" placeholder="e.g. Box Hill" /></div>
        <div class="form-group">
          <label class="form-label">Licence Stage <span>*</span></label>
          <select class="form-input" id="eq-licence">
            <option value="" disabled selected>Select licence stage…</option>
            <option>Learner (new)</option><option>Learner (some experience)</option>
            <option>Preparing for Drive Test</option><option>Overseas Licence Conversion</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Transmission Preference <span>*</span></label>
          <select class="form-input" id="eq-transmission">
            <option value="" disabled selected>Select preference…</option>
            <option>Auto</option><option>Manual</option><option>No Preference</option>
          </select>
        </div>
        <div class="enquiry-section-label">Availability</div>
        <div class="form-group">
          <label class="form-label">Preferred Days</label>
          <div class="eq-checkboxes">
            <label class="eq-check"><input type="checkbox" value="Weekdays" /> Weekdays</label>
            <label class="eq-check"><input type="checkbox" value="Weekends" /> Weekends</label>
            <label class="eq-check"><input type="checkbox" value="Evenings" /> Evenings</label>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Preferred Start Time <span class="form-label-optional">(optional)</span></label><input type="text" class="form-input" id="eq-starttime" placeholder="e.g. mornings / flexible" /></div>
        <div class="enquiry-section-label">Message</div>
        <div class="form-group"><label class="form-label">Additional Information <span class="form-label-optional">(optional)</span></label><textarea class="form-input" id="eq-message" placeholder="e.g. Test booked, nervous driver, looking for weekly lessons…"></textarea></div>
        <button class="btn btn-gold btn-full btn-lg" id="eq-submit">${ICONS.mail} Send Enquiry</button>
        <p class="eq-note">For urgent bookings, call the instructor directly.</p>
      </div>
    </div>
  </div>`;
}

function openEnquiryModal(inst) {
  const existing = document.getElementById('enquiry-overlay');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', enquiryModalHTML(inst));
  document.body.classList.add('modal-open');
  const overlay  = document.getElementById('enquiry-overlay');
  const closeBtn = document.getElementById('enquiry-close');
  requestAnimationFrame(() => overlay.classList.add('visible'));

  function closeModal() {
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.remove(); document.body.classList.remove('modal-open'); }, 260);
  }
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onEsc); }
  });

  document.getElementById('eq-submit').addEventListener('click', () => {
    const name         = document.getElementById('eq-name').value.trim();
    const mobile       = document.getElementById('eq-mobile').value.trim();
    const email        = document.getElementById('eq-email').value.trim();
    const suburb       = document.getElementById('eq-suburb').value.trim();
    const licence      = document.getElementById('eq-licence').value;
    const transmission = document.getElementById('eq-transmission').value;
    const starttime    = document.getElementById('eq-starttime').value.trim();
    const message      = document.getElementById('eq-message').value.trim();
    const days         = [...document.querySelectorAll('.eq-checkboxes input:checked')].map(c => c.value);

    if (!name || !mobile || !email || !suburb || !licence || !transmission) {
      showEnquiryError('Please fill in all required fields marked with *'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showEnquiryError('Please enter a valid email address.'); return;
    }
    clearEnquiryError();
    setEnquiryButtonLoading(true);

    const ct = CONTACT[inst.id] || {};

    // Use the instructor's own web3forms access key so the enquiry
    // lands directly in their inbox
    if (!ct.w3f) {
      showEnquiryError('Online enquiry is not yet available for this instructor. Please call them directly.');
      setEnquiryButtonLoading(false);
      return;
    }

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key:      ct.w3f,
        subject:         'New Lesson Enquiry from ' + name + ' — Professional Driving Instructors Network',
        from_name:       'Professional Driving Instructors Network',
        Instructor:      inst.name,
        Student_Name:    name,
        Student_Mobile:  mobile,
        Student_Email:   email,
        Suburb:          suburb,
        Licence_Stage:   licence,
        Transmission:    transmission,
        Preferred_Days:  days.length ? days.join(', ') : 'Not specified',
        Preferred_Time:  starttime || 'Not specified',
        Message:         message || '(No message)',
        replyto:         email,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        trackEnquiry(inst.id, inst.name);
        document.getElementById('enquiry-form-body').innerHTML = `
          <div class="success-box">
            <div class="success-icon">${ICONS.check}</div>
            <h3>Enquiry Sent!</h3>
            <p>Your enquiry has been sent directly to <strong>${inst.name}</strong>. They'll be in touch soon.</p>
            <p style="margin-top:12px;font-size:13.5px;color:var(--text-light)">For urgent bookings, call the instructor directly using the button on their profile.</p>
          </div>`;
      } else {
        setEnquiryButtonLoading(false);
        showEnquiryError('Sorry, there was a problem sending your enquiry. Please try again or call the instructor directly.');
      }
    })
    .catch(() => {
      setEnquiryButtonLoading(false);
      showEnquiryError('Network error. Please check your connection and try again.');
    });
  });
}

function showEnquiryError(msg) {
  let el = document.getElementById('eq-error');
  if (!el) { el = document.createElement('p'); el.id = 'eq-error'; el.className = 'eq-error-msg'; const btn = document.getElementById('eq-submit'); if (btn) btn.before(el); }
  el.textContent = msg;
}
function clearEnquiryError() { const el = document.getElementById('eq-error'); if (el) el.remove(); }
function setEnquiryButtonLoading(loading) {
  const btn = document.getElementById('eq-submit');
  if (!btn) return;
  if (loading) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Sending…'; }
  else { btn.disabled = false; btn.innerHTML = `${ICONS.mail} Send Enquiry`; }
}

/* =============================================
   FORM HELPERS
   ============================================= */
function setButtonLoading(btnId, loading, originalText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Sending…'; }
  else { btn.disabled = false; btn.textContent = originalText; }
}
function showFormError(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const existing = container.querySelector('.form-error-msg');
  if (existing) existing.remove();
  const err = document.createElement('p');
  err.className = 'form-error-msg';
  err.textContent = message;
  const btn = container.querySelector('button');
  if (btn) btn.before(err); else container.appendChild(err);
}

/* =============================================
   ROUTER
   ============================================= */
let _searchLat, _searchLng, _searchLabel;

function getPageContent(page, extra) {
  switch (page) {
    case 'find':    return renderFind(_searchLat, _searchLng, _searchLabel);
    case 'profile': return renderProfile(extra);
    case 'join':    return renderJoin();
    case 'about':   return renderAbout();
    case 'pricing': return renderPricing();
    case 'contact': return renderContact();
    default:        return renderHome();
  }
}

function navigate(page, extra, pushState = true) {
  const app = document.getElementById('app');
  app.innerHTML = getPageContent(page, extra);
  window.scrollTo({ top: 0, behavior: 'instant' });
  updateActiveLinks(page);
  closeMenu();
  if (pushState) history.pushState({ page, extra: extra||null }, '', extra ? `#${page}/${extra}` : `#${page}`);
  bindPageEvents();
  setTimeout(initReveal, 50);
}

function bindPageEvents() {
  document.querySelectorAll('[data-action="nav"]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); });
  });
  document.querySelectorAll('[data-action="profile"]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); navigate('profile', el.dataset.id); });
  });

  /* Hero suburb search */
  const heroSearchBtn = document.getElementById('hero-search-btn');
  const heroInput     = document.getElementById('hero-suburb-input');
  if (heroSearchBtn && heroInput) {
    async function doHeroSearch() {
      const q = heroInput.value.trim(); if (!q) return;
      heroSearchBtn.disabled = true; heroSearchBtn.innerHTML = '<span class="btn-spinner"></span>';
      const result = await geocodeSuburb(q).catch(() => null);
      heroSearchBtn.disabled = false; heroSearchBtn.innerHTML = 'Find Instructors';
      if (result) { _searchLat = result.lat; _searchLng = result.lng; _searchLabel = result.display; navigate('find'); }
      else { heroInput.classList.add('input-error'); setTimeout(() => heroInput.classList.remove('input-error'), 2000); }
    }
    heroSearchBtn.addEventListener('click', doHeroSearch);
    heroInput.addEventListener('keydown', e => { if (e.key === 'Enter') doHeroSearch(); });
  }

  /* Find page search */
  const findSearchBtn = document.getElementById('find-search-btn');
  const findInput     = document.getElementById('find-suburb-input');
  if (findSearchBtn && findInput) {
    async function doFindSearch() {
      const q = findInput.value.trim();
      if (!q) { _searchLat = undefined; _searchLng = undefined; _searchLabel = ''; navigate('find'); return; }
      findSearchBtn.disabled = true; findSearchBtn.innerHTML = '<span class="btn-spinner"></span>';
      const result = await geocodeSuburb(q).catch(() => null);
      findSearchBtn.disabled = false; findSearchBtn.innerHTML = 'Search';
      if (result) { _searchLat = result.lat; _searchLng = result.lng; _searchLabel = result.display; navigate('find'); }
      else { findInput.classList.add('input-error'); setTimeout(() => findInput.classList.remove('input-error'), 2000); }
    }
    findSearchBtn.addEventListener('click', doFindSearch);
    findInput.addEventListener('keydown', e => { if (e.key === 'Enter') doFindSearch(); });
    const clearLink = document.getElementById('clear-search-link');
    if (clearLink) clearLink.addEventListener('click', e => { e.preventDefault(); _searchLat = undefined; _searchLng = undefined; _searchLabel = ''; navigate('find'); });
  }

  /* Call instructor (obfuscated — decoded only on click) */
  const callBtn = document.getElementById('call-instructor-btn');
  if (callBtn) {
    callBtn.addEventListener('click', () => {
      const ct = CONTACT[callBtn.dataset.id];
      if (ct && ct.p) window.location.href = 'tel:' + dec(ct.p).replace(/\s/g, '');
    });
  }

  /* Expertise counter */
  const expertiseGrid = document.getElementById('join-expertise-grid');
  const expertiseHint = document.getElementById('expertise-count-hint');
  if (expertiseGrid && expertiseHint) {
    expertiseGrid.addEventListener('change', () => {
      const count = expertiseGrid.querySelectorAll('input:checked').length;
      if (count < 3) expertiseHint.textContent = `Select at least ${3-count} more`;
      else if (count > 5) expertiseHint.textContent = 'Maximum 5 selected — please deselect one';
      else expertiseHint.textContent = `${count} selected ✓`;
      expertiseHint.style.color = (count < 3 || count > 5) ? '#e53e3e' : '#38a169';
    });
  }

  /* Send enquiry modal */
  const enquiryBtn = document.getElementById('open-enquiry-btn');
  if (enquiryBtn) {
    enquiryBtn.addEventListener('click', () => {
      const inst = INSTRUCTORS.find(i => i.id === enquiryBtn.dataset.instructorId) || INSTRUCTORS[0];
      openEnquiryModal(inst);
    });
  }

  /* Join form */
  const joinSubmit = document.getElementById('join-submit');
  if (joinSubmit) {
    joinSubmit.addEventListener('click', () => {
      const name   = document.getElementById('join-name').value.trim();
      const email  = document.getElementById('join-email').value.trim();
      const dia    = (document.getElementById('join-dia') || {}).value?.trim() || '';
      const suburb = (document.getElementById('join-suburb') || {}).value?.trim() || '';
      const reqOK  = document.getElementById('join-req-check')?.checked || false;

      if (!name || !email)  { showFormError('join-form-box', 'Please fill in your full name and email address.'); return; }
      if (!dia)             { showFormError('join-form-box', 'Please enter your DIA number.'); return; }
      if (!suburb)          { showFormError('join-form-box', 'Please enter your primary suburb.'); return; }
      if (!reqOK)           { showFormError('join-form-box', 'Please confirm you meet all Instructor Requirements.'); return; }

      const phone  = document.getElementById('join-phone')?.value || '';
      const exp    = document.getElementById('join-exp')?.value || '';
      const bio    = document.getElementById('join-bio')?.value || '';
      const radius = document.getElementById('join-radius')?.value || '10';
      const vAuto  = document.getElementById('join-vehicle-auto')?.value || '';
      const vManual= document.getElementById('join-vehicle-manual')?.value || '';

      // Collect availability
      const avail = ['avail-weekdays','avail-weekends','avail-evenings','avail-early']
        .filter(id => document.getElementById(id)?.checked)
        .map(id => document.getElementById(id).value);

      // Collect expertise (3-5 required)
      const expertise = [...document.querySelectorAll('#join-expertise-grid input:checked')].map(c => c.value);
      if (expertise.length < 3 || expertise.length > 5) {
        showFormError('join-form-box', 'Please select between 3 and 5 areas of expertise.'); return;
      }

      // Determine which web3forms key to use based on email match
      // Rob: robert_samsung@hotmail.com → key 2c2335a7-edb1-4673-b7d7-6971217f4d96
      // John: maryjoy.padiz1@gmail.com → key 1119cfb7-b03e-4f5d-ae4f-b8e3a077bac7
      // Default admin key for others
      const emailLower = email.toLowerCase();
      let w3fKey = 'b9dcce58-e3f6-444a-b788-e5424d3edf9d'; // admin fallback
      if (emailLower === dec([114,111,98,101,114,116,95,115,97,109,115,117,110,103,64,104,111,116,109,97,105,108,46,99,111,109])) {
        w3fKey = '2c2335a7-edb1-4673-b7d7-6971217f4d96'; // Rob
      } else if (emailLower === dec([109,97,114,121,106,111,121,46,112,97,100,105,122,49,64,103,109,97,105,108,46,99,111,109])) {
        w3fKey = '1119cfb7-b03e-4f5d-ae4f-b8e3a077bac7'; // John
      }

      setButtonLoading('join-submit', true, 'Apply to Join');
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: w3fKey,
          subject: 'New Instructor Application — ' + name,
          from_name: 'Professional Driving Instructors Network',
          form_type: 'Join the Network',
          Name: name, Email: email, Phone: phone,
          DIA_Number: dia, Year_Started: exp,
          Primary_Suburb: suburb, Travel_Radius_km: radius + ' km',
          Auto_Vehicle: vAuto || '(none)', Manual_Vehicle: vManual || '(none)',
          Availability: avail.join(', ') || '(none selected)',
          Areas_of_Expertise: expertise.join(' | '),
          Requirements_Confirmed: 'Yes — all requirements confirmed',
          About: bio
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('join-form-box').innerHTML = `
            <div class="success-box">
              <div class="success-icon">${ICONS.check}</div>
              <h3>Application Received!</h3>
              <p>Thank you, ${name}. We'll review your application and be in touch within 2–3 business days.</p>
            </div>`;
        } else { showFormError('join-form-box', 'Submission failed. Please try again.'); setButtonLoading('join-submit', false, 'Apply to Join'); }
      })
      .catch(() => { showFormError('join-form-box', 'Network error. Please try again.'); setButtonLoading('join-submit', false, 'Apply to Join'); });
    });
  }

  /* Contact form */
  const contactSubmit = document.getElementById('contact-submit');
  if (contactSubmit) {
    contactSubmit.addEventListener('click', () => {
      const name    = document.getElementById('c-name').value.trim();
      const email   = document.getElementById('c-email').value.trim();
      const subject = (document.getElementById('c-subject')?.value || '').trim();
      const msg     = document.getElementById('c-message').value.trim();
      if (!name || !email || !msg) {
        showFormError('contact-form-wrap', 'Please fill in your name, email, and message.');
        return;
      }
      setButtonLoading('contact-submit', true, 'Send Message');
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'b9dcce58-e3f6-444a-b788-e5424d3edf9d',
          subject: subject || 'New Contact Form Message — ' + name,
          from_name: 'Professional Driving Instructors Network',
          Name: name, Email: email, Subject: subject || '(none)', Message: msg
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('contact-form-wrap').innerHTML = `
            <div class="success-box">
              <div class="success-icon">${ICONS.check}</div>
              <h3>Message Sent!</h3>
              <p>Thanks ${name}, we've received your message and will get back to you shortly.</p>
            </div>`;
        } else {
          showFormError('contact-form-wrap', 'Submission failed. Please try again.');
          setButtonLoading('contact-submit', false, 'Send Message');
        }
      })
      .catch(() => {
        showFormError('contact-form-wrap', 'Network error. Please try again.');
        setButtonLoading('contact-submit', false, 'Send Message');
      });
    });
  }
}

/* =============================================
   NAVBAR
   ============================================= */
function closeMenu() {
  const h = document.getElementById('hamburger');
  const d = document.getElementById('nav-dropdown');
  if (h) { h.classList.remove('open'); h.setAttribute('aria-expanded', 'false'); }
  if (d) d.classList.remove('open');
}
function bindNavEvents() {
  const hamburger = document.getElementById('hamburger');
  const dropdown  = document.getElementById('nav-dropdown');
  hamburger.addEventListener('click', () => {
    dropdown.classList.contains('open') ? closeMenu() : (hamburger.classList.add('open'), hamburger.setAttribute('aria-expanded','true'), dropdown.classList.add('open'));
  });
  document.addEventListener('click', e => { if (!e.target.closest('.navbar') && !e.target.closest('#nav-dropdown')) closeMenu(); });
  document.querySelectorAll('#nav-links-desktop .nav-link').forEach(link => { link.addEventListener('click', e => { e.preventDefault(); navigate(link.dataset.page); }); });
  document.querySelectorAll('#nav-dropdown .nav-link').forEach(link => { link.addEventListener('click', e => { e.preventDefault(); closeMenu(); navigate(link.dataset.page); }); });
  document.querySelector('.nav-logo').addEventListener('click', e => { e.preventDefault(); navigate('home'); });
  document.querySelectorAll('.footer-links a').forEach(link => { link.addEventListener('click', e => { e.preventDefault(); navigate(link.dataset.page); }); });
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', window.scrollY > 10); }, { passive: true });
}
function updateActiveLinks(page) {
  document.querySelectorAll('#nav-links-desktop .nav-link, #nav-dropdown .nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page || (page === 'profile' && link.dataset.page === 'find'));
  });
}
function initReveal() {
  const els = document.querySelectorAll('.reveal'); if (!els.length) return;
  const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }); }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}
window.addEventListener('popstate', e => { if (e.state) navigate(e.state.page, e.state.extra||null, false); else navigate('home', null, false); });
document.addEventListener('DOMContentLoaded', () => {
  bindNavEvents();
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const [page, extra] = hash.split('/');
    navigate(page||'home', extra||null, false);
    history.replaceState({ page: page||'home', extra: extra||null }, '', window.location.hash);
  } else { navigate('home', null, false); history.replaceState({ page:'home', extra:null }, '', '#home'); }
});
