function dec(arr) { return arr.map(c => String.fromCharCode(c)).join(''); }

const CONTACT = {
};

const LANGUAGE_OPTIONS = ['English','Mandarin','Cantonese','Hindi','Punjabi','Vietnamese','Arabic','Greek','Tagalog / Filipino','Korean','Japanese','Thai'];

const EXPERTISE_CATEGORIES = [
  {
    group: 'Core Instruction Areas',
    items: [
      { id: 'learner-drivers',      label: 'First-Time Learners' },
      { id: 'nervous-drivers',      label: 'Nervous / Anxious Drivers' },
      { id: 'adult-learners',       label: 'Adult Learners (Late Starters)' },
    ]
  },
  {
    group: 'Test Preparation',
    items: [
      { id: 'vicroads-test',        label: 'Drive Test Preparation' },
      { id: 'logbook-hours',        label: 'Building Logbook Hours' },
      { id: 'refresher-lessons',    label: 'Refresher Lessons (Returning Drivers)' },
    ]
  },
  {
    group: 'Confidence & Advanced Driving Skills',
    items: [
      { id: 'defensive-driving',    label: 'Defensive Driving Techniques' },
      { id: 'city-driving',         label: 'City Driving & Complex Traffic Environments' },
      { id: 'highway-driving',      label: 'Highway & Long-Distance Driving' },
      { id: 'advanced-confidence',  label: 'Hazard Perception & Decision-Making' },
    ]
  },
  {
    group: 'Specialist Areas',
    items: [
      { id: 'overseas-licence',     label: 'Overseas Licence Conversion' },
      { id: 'manual-instruction',   label: 'Manual Transmission Instruction' },
      { id: 'senior-drivers',       label: 'Senior Driver Refresher Training' },
      { id: 'ndis-supported',       label: 'NDIS & Supported Driving Instruction' },
      { id: 'neurodiverse',         label: 'Neurodiverse Learners' },
    ]
  },
];

function resolveExpertise(ids = []) {
  const lookup = {};
  EXPERTISE_CATEGORIES.forEach(g => g.items.forEach(item => { lookup[item.id] = item.label; }));
  return ids.map(id => lookup[id] || id);
}

function credTagHTML(status) {
  return (status === 'verified' || status === 'provided')
    ? `<span class="cred-tag cred-provided">Provided</span>`
    : `<span class="cred-tag cred-not-provided">Not Provided</span>`;
}

const TEACHING_APPROACH_CATEGORIES = [
  {
    group: 'Personality & Approach',
    items: [
      { id: 'patient',            label: 'Patient' },
      { id: 'calm',               label: 'Calm' },
      { id: 'friendly',           label: 'Friendly' },
      { id: 'supportive',         label: 'Supportive' },
      { id: 'encouraging',        label: 'Encouraging' },
      { id: 'reassuring',         label: 'Reassuring' },
      { id: 'calm-under-pressure',label: 'Calm under pressure' },
      { id: 'motivational',       label: 'Motivational' },
      { id: 'strict-but-fair',    label: 'Strict but fair' },
      { id: 'no-nonsense',        label: 'No-nonsense' },
    ]
  },
];

function resolveTeachingApproach(ids = []) {
  const lookup = {};
  TEACHING_APPROACH_CATEGORIES.forEach(g => g.items.forEach(item => { lookup[item.id] = item.label; }));
  return ids.map(id => lookup[id] || id);
}

function buildTeachingApproachCheckboxes() {
  return TEACHING_APPROACH_CATEGORIES.map(group => `
    <p class="expertise-group-head">${group.group}</p>
    <div class="join-expertise-grid expertise-group-items">
      ${group.items.map(item => `
        <label class="join-toggle-label">
          <input type="checkbox" value="${item.id}" />
          <span>${item.label}</span>
        </label>`).join('')}
    </div>`).join('');
}

function buildExpertiseCheckboxes() {
  return EXPERTISE_CATEGORIES.map(group => `
    <p class="expertise-group-head">${group.group}</p>
    <div class="join-expertise-grid expertise-group-items">
      ${group.items.map(item => `
        <label class="join-toggle-label">
          <input type="checkbox" value="${item.id}" />
          <span>${item.label}</span>
        </label>`).join('')}
    </div>`).join('');
}

const INSTRUCTORS = [];

const CALL_TRACKER_KEY = 'pdin_calls';

const TRACKER_KEY = 'pdin_enquiries';
function trackEnquiry(instructorId, instructorName, leadData) {

  try {
    const raw  = localStorage.getItem(TRACKER_KEY);
    const data = raw ? JSON.parse(raw) : {};
    if (!data[instructorId]) data[instructorId] = { name: instructorName, count: 0, lastDate: null, history: [] };
    data[instructorId].count++;
    data[instructorId].lastDate = new Date().toISOString();
    data[instructorId].history.push(new Date().toISOString());
    localStorage.setItem(TRACKER_KEY, JSON.stringify(data));
  } catch(e) {  }
}

function trackCall(instructorId, instructorName, suburb, licenceStage) {

  try {
    const raw  = localStorage.getItem(CALL_TRACKER_KEY);
    const data = raw ? JSON.parse(raw) : {};
    if (!data[instructorId]) data[instructorId] = { name: instructorName, count: 0, lastDate: null, history: [] };
    data[instructorId].count++;
    data[instructorId].lastDate = new Date().toISOString();
    data[instructorId].history.push(new Date().toISOString());
    localStorage.setItem(CALL_TRACKER_KEY, JSON.stringify(data));
  } catch(e) {  }

  try {
    const safeName = instructorName.replace(/[\/\\]/g, '-');
    const now = new Date();
    db.collection('call_logs')
      .doc(safeName)
      .collection('logs')
      .doc('call-' + Date.now())
      .set({
        instructorId,
        instructorName,
        suburb:       suburb       || '',
        licenceStage: licenceStage || '',
        date: now.toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney', day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', hour12: true }),
        calledAt: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(() => {  });
  } catch(e) {  }
}

function getCallStats() {
  try {
    const raw = localStorage.getItem(CALL_TRACKER_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) { return {}; }
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const ICONS = {
  shield:     `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  document:   `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  phone:      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>`,
  user:       `<svg width="14" height="14" viewBox="2 2 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  userLg:     `<svg width="24" height="24" viewBox="2 2 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  pin:        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  car:        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
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

const PROFILE_DISCLAIMER = `
  <div class="profile-disclaimer">
    <div class="profile-disclaimer-inner">
      <span class="disclaimer-icon">${ICONS.info}</span>
      <p>All instructor information is provided by individual instructors. This includes, but is not limited to, State Driving Instructor Authority, Child Safety Clearance, insurance, qualifications, and other compliance-related documentation. The Professional Driving Instructors Network does not independently verify or guarantee the accuracy, validity, or currency of any information provided unless explicitly marked as "Verified". Information is subject to change and should be confirmed directly with the instructor prior to engagement.</p>
    </div>
  </div>`;

const EMAILJS_PUBLIC_KEY = '6h-VvWML9Chj5QA2a';
(function initEJS() {
  function tryInit() { if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); }
  if (document.readyState === 'loading') window.addEventListener('load', tryInit);
  else tryInit();
})();

async function geocodeSuburb(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=au&limit=1&addressdetails=1&q=${encodeURIComponent(query + ', Australia')}`;
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  if (!data.length) return null;
  const r   = data[0];
  const pc  = (r.address && r.address.postcode) ? r.address.postcode.split(';')[0].trim() : null;
  return { lat: parseFloat(r.lat), lng: parseFloat(r.lon), display: r.display_name.split(',')[0], postcode: pc };
}

let _acTimer = null;
let _acCache = {};

const AU_SUBURBS = [

  'Abbotsford, VIC 3067','Albert Park, VIC 3206','Alphington, VIC 3078','Altona, VIC 3018','Armadale, VIC 3143',
  'Ascot Vale, VIC 3032','Ashburton, VIC 3147','Ashwood, VIC 3147','Aspendale, VIC 3195','Avondale Heights, VIC 3034',
  'Balaclava, VIC 3183','Balwyn, VIC 3103','Balwyn North, VIC 3104','Berwick, VIC 3806','BlackBurn, VIC 3130',
  'Blackburn North, VIC 3130','Blackburn South, VIC 3130','Box Hill, VIC 3128','Box Hill North, VIC 3129','Box Hill South, VIC 3128',
  'Brighton, VIC 3186','Brighton East, VIC 3187','Broadmeadows, VIC 3047','Brunswick, VIC 3056','Brunswick East, VIC 3057',
  'Brunswick West, VIC 3055','Bulleen, VIC 3105','Bundoora, VIC 3083','Burwood, VIC 3125','Burwood East, VIC 3151',
  'Camberwell, VIC 3124','Canterbury, VIC 3126','Carlton, VIC 3053','Carlton North, VIC 3054','Carnegie, VIC 3163',
  'Carrum, VIC 3197','Carrum Downs, VIC 3201','Caulfield, VIC 3162','Caulfield North, VIC 3161','Caulfield South, VIC 3162',
  'Cheltenham, VIC 3192','Chelsea, VIC 3196','Chirnside Park, VIC 3116','Clarinda, VIC 3169','Clayton, VIC 3168',
  'Clayton South, VIC 3169','Clifton Hill, VIC 3068','Coburg, VIC 3058','Coburg North, VIC 3058','Collingwood, VIC 3066',
  'Craigieburn, VIC 3064','Cranbourne, VIC 3977','Croydon, VIC 3136','Doncaster, VIC 3108','Doncaster East, VIC 3109',
  'Donvale, VIC 3111','Doveton, VIC 3177','Eaglemont, VIC 3084','East Melbourne, VIC 3002','Eltham, VIC 3095',
  'Elsternwick, VIC 3185','Elwood, VIC 3184','Endeavour Hills, VIC 3802','Essendon, VIC 3040','Essendon North, VIC 3041',
  'Essendon West, VIC 3040','Fairfield, VIC 3078','Fitzroy, VIC 3065','Fitzroy North, VIC 3068','Footscray, VIC 3011',
  'Forest Hill, VIC 3131','Frankston, VIC 3199','Frankston North, VIC 3200','Frankston South, VIC 3199',
  'Gardenvale, VIC 3185','Glen Iris, VIC 3146','Glen Waverley, VIC 3150','Glenroy, VIC 3046','Greensborough, VIC 3088',
  'Hawthorn, VIC 3122','Hawthorn East, VIC 3123','Heidelberg, VIC 3084','Heidelberg West, VIC 3081',
  'Highett, VIC 3190','Hoppers Crossing, VIC 3029','Hughesdale, VIC 3166','Ivanhoe, VIC 3079','Ivanhoe East, VIC 3079',
  'Kensington, VIC 3031','Keysborough, VIC 3173','Kilsyth, VIC 3137','Knoxfield, VIC 3180','Kooyong, VIC 3144',
  'Lalor, VIC 3075','Laverton, VIC 3028','Lower Plenty, VIC 3093','Macleod, VIC 3085','Malvern, VIC 3144',
  'Malvern East, VIC 3145','McKinnon, VIC 3204','Melbourne, VIC 3000','Melbourne CBD, VIC 3000','Melton, VIC 3337',
  'Mentone, VIC 3194','Mernda, VIC 3754','Middle Park, VIC 3206','Mill Park, VIC 3082','Mitcham, VIC 3132',
  'Moonee Ponds, VIC 3039','Moorabbin, VIC 3189','Mooroolbark, VIC 3138','Mount Waverley, VIC 3149',
  'Mulgrave, VIC 3170','Murrumbeena, VIC 3163','Niddrie, VIC 3042','Noble Park, VIC 3174','North Melbourne, VIC 3051',
  'Northcote, VIC 3070','Nunawading, VIC 3131','Oakleigh, VIC 3166','Oakleigh East, VIC 3166','Oakleigh South, VIC 3167',
  'Ormond, VIC 3204','Pakenham, VIC 3810','Pascoe Vale, VIC 3044','Point Cook, VIC 3030','Port Melbourne, VIC 3207',
  'Prahran, VIC 3181','Preston, VIC 3072','Richmond, VIC 3121','Ringwood, VIC 3134','Ringwood East, VIC 3135',
  'Ringwood North, VIC 3134','Rosanna, VIC 3084','Rowville, VIC 3178','Roxburgh Park, VIC 3064',
  'Saint Albans, VIC 3021','Saint Kilda, VIC 3182','Saint Kilda East, VIC 3183','Saint Kilda West, VIC 3182',
  'Sandringham, VIC 3191','Scoresby, VIC 3179','Seaford, VIC 3198','Seddon, VIC 3011','Sorrento, VIC 3943',
  'South Melbourne, VIC 3205','South Yarra, VIC 3141','Southbank, VIC 3006','Spotswood, VIC 3015',
  'Springvale, VIC 3171','Springvale South, VIC 3172','St Albans, VIC 3021','St Kilda, VIC 3182',
  'Strathmore, VIC 3041','Sunshine, VIC 3020','Sunshine North, VIC 3020','Sunshine West, VIC 3020',
  'Surrey Hills, VIC 3127','Templestowe, VIC 3106','Templestowe Lower, VIC 3107','Thornbury, VIC 3071',
  'Toorak, VIC 3142','Tullamarine, VIC 3043','Vermont, VIC 3133','Vermont South, VIC 3133',
  'Viewbank, VIC 3084','Wantirna, VIC 3152','Wantirna South, VIC 3152','Warrandyte, VIC 3113',
  'Werribee, VIC 3030','West Footscray, VIC 3012','West Melbourne, VIC 3003','Wheelers Hill, VIC 3150',
  'Williamstown, VIC 3016','Woodleigh, VIC 3945','Wyndham Vale, VIC 3024','Yarraville, VIC 3013',

  'Ashfield, NSW 2131','Auburn, NSW 2144','Balmain, NSW 2041','Bankstown, NSW 2200','Bondi, NSW 2026',
  'Bondi Beach, NSW 2026','Bondi Junction, NSW 2022','Botany, NSW 2019','Burwood, NSW 2134',
  'Cabramatta, NSW 2166','Campsie, NSW 2194','Canterbury, NSW 2193','Castle Hill, NSW 2154',
  'Chatswood, NSW 2067','Concord, NSW 2137','Cronulla, NSW 2230','Dee Why, NSW 2099','Eastwood, NSW 2122',
  'Epping, NSW 2121','Fairfield, NSW 2165','Five Dock, NSW 2046','Glebe, NSW 2037','Gordon, NSW 2072',
  'Granville, NSW 2142','Homebush, NSW 2140','Hornsby, NSW 2077','Hurstville, NSW 2220',
  'Kogarah, NSW 2217','Lane Cove, NSW 2066','Leichhardt, NSW 2040','Liverpool, NSW 2170',
  'Manly, NSW 2095','Marrickville, NSW 2204','Mascot, NSW 2020','Miranda, NSW 2228',
  'Mosman, NSW 2088','Mount Druitt, NSW 2770','Newtown, NSW 2042','North Sydney, NSW 2060',
  'Parramatta, NSW 2150','Penrith, NSW 2750','Randwick, NSW 2031','Redfern, NSW 2016',
  'Rockdale, NSW 2216','Ryde, NSW 2112','Strathfield, NSW 2135','Summer Hill, NSW 2130',
  'Surry Hills, NSW 2010','Sydney, NSW 2000','Sydney CBD, NSW 2000','Ultimo, NSW 2007',
  'Waterloo, NSW 2017','Westmead, NSW 2145','Woollahra, NSW 2025','Woolloomooloo, NSW 2011',

  'Ascot, QLD 4007','Aspley, QLD 4034','Bowen Hills, QLD 4006','Brisbane, QLD 4000','Brisbane CBD, QLD 4000',
  'Bulimba, QLD 4171','Buranda, QLD 4102','Caboolture, QLD 4510','Carindale, QLD 4152',
  'Chermside, QLD 4032','Eight Mile Plains, QLD 4113','Fortitude Valley, QLD 4006',
  'Garden City, QLD 4034','Gold Coast, QLD 4217','Hamilton, QLD 4007','Inala, QLD 4077',
  'Indooroopilly, QLD 4068','Ipswich, QLD 4305','Jindalee, QLD 4074','Kangaroo Point, QLD 4169',
  'Kelvin Grove, QLD 4059','Logan, QLD 4114','Lutwyche, QLD 4030','Mackay, QLD 4740',
  'Milton, QLD 4064','Mount Gravatt, QLD 4122','Nundah, QLD 4012','Paddington, QLD 4064',
  'Redcliffe, QLD 4020','Rockhampton, QLD 4700','Sandgate, QLD 4017','Sherwood, QLD 4075',
  'Southport, QLD 4215','Spring Hill, QLD 4000','Sunnybank, QLD 4109','Sunshine Coast, QLD 4557',
  'Surfers Paradise, QLD 4217','Taringa, QLD 4068','Toowong, QLD 4066','Toowoomba, QLD 4350',
  'Townsville, QLD 4810','West End, QLD 4101','Woolloongabba, QLD 4102',

  'Adelaide, SA 5000','Adelaide CBD, SA 5000','Blackwood, SA 5051','Campbelltown, SA 5074',
  'Christies Beach, SA 5165','Elizabeth, SA 5112','Glenelg, SA 5045','Hackney, SA 5069',
  'Henley Beach, SA 5022','Marden, SA 5070','Marion, SA 5043','Norwood, SA 5067',
  'Salisbury, SA 5108','Tea Tree Gully, SA 5091','Unley, SA 5061','Victor Harbor, SA 5211',

  'Balga, WA 6061','Belmont, WA 6104','Bentley, WA 6102','Canning Vale, WA 6155',
  'Cottesloe, WA 6011','Fremantle, WA 6160','Gosnells, WA 6110','Innaloo, WA 6018',
  'Joondalup, WA 6027','Karrinyup, WA 6018','Leederville, WA 6007','Mandurah, WA 6210',
  'Midland, WA 6056','Morley, WA 6062','Mount Lawley, WA 6050','Nedlands, WA 6009',
  'Perth, WA 6000','Perth CBD, WA 6000','Rockingham, WA 6168','Scarborough, WA 6019',
  'Stirling, WA 6021','Subiaco, WA 6008','Wanneroo, WA 6065',

  'Belconnen, ACT 2617','Bruce, ACT 2617','Canberra, ACT 2600','Canberra CBD, ACT 2601',
  'Civic, ACT 2601','Gungahlin, ACT 2912','Tuggeranong, ACT 2900','Woden, ACT 2606',

  'Hobart, TAS 7000','Launceston, TAS 7250','Sandy Bay, TAS 7005',

  'Darwin, NT 0800','Palmerston, NT 0830',
];

function searchLocalSuburbs(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results = [];
  for (const entry of AU_SUBURBS) {
    const namePart = entry.split(',')[0].toLowerCase();
    if (namePart.startsWith(q) || namePart.includes(q)) {
      results.push(entry);
      if (results.length >= 8) break;
    }
  }

  results.sort((a, b) => {
    const an = a.split(',')[0].toLowerCase();
    const bn = b.split(',')[0].toLowerCase();
    return (an.startsWith(q) ? 0 : 1) - (bn.startsWith(q) ? 0 : 1) || an.localeCompare(bn);
  });
  return results;
}

async function fetchSuburbSuggestions(query) {
  const key = query.toLowerCase();
  if (_acCache[key]) return _acCache[key];
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=au&limit=20&addressdetails=1&q=${encodeURIComponent(query + ', Australia')}`;
  try {
    const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    const STATE_MAP = { 'Victoria':'VIC','New South Wales':'NSW','Queensland':'QLD','Western Australia':'WA','South Australia':'SA','Tasmania':'TAS','Australian Capital Territory':'ACT','Northern Territory':'NT' };
    const results = [];
    const seen = new Set();
    for (const r of data) {
      const addr  = r.address || {};
      const name  = addr.suburb || addr.town || addr.village || addr.city_district || addr.municipality || addr.city || '';
      if (!name) continue;
      if (!name.toLowerCase().startsWith(key) && !name.toLowerCase().includes(key)) continue;
      const state = STATE_MAP[addr.state] || addr.state || '';
      const pc    = addr.postcode ? addr.postcode.split(';')[0].trim() : '';
      const label = name + (state ? ', ' + state : '') + (pc ? ' ' + pc : '');
      if (!seen.has(label)) {
        seen.add(label);
        results.push({ label, lat: parseFloat(r.lat), lng: parseFloat(r.lon), name, postcode: pc });
      }
      if (results.length >= 8) break;
    }
    results.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(key) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(key) ? 0 : 1;
      return aStarts - bStarts || a.name.localeCompare(b.name);
    });
    _acCache[key] = results;
    return results;
  } catch { return []; }
}

function attachSuburbAutocomplete(inputId, onSelect) {
  const input = document.getElementById(inputId);
  if (!input) return;

  let dropdown = document.getElementById(inputId + '-ac-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = inputId + '-ac-dropdown';
    dropdown.className = 'suburb-ac-dropdown';
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(dropdown);
  }

  function closeDropdown() { dropdown.innerHTML = ''; dropdown.style.display = 'none'; }

  function showSuggestions(results) {
    dropdown.innerHTML = '';
    if (!results.length) { closeDropdown(); return; }
    results.forEach(r => {
      const item = document.createElement('div');
      item.className = 'suburb-ac-item';

      const q   = input.value.trim();
      const idx = r.label.toLowerCase().indexOf(q.toLowerCase());
      if (idx >= 0) {
        item.innerHTML = r.label.slice(0, idx) + '<strong>' + r.label.slice(idx, idx + q.length) + '</strong>' + r.label.slice(idx + q.length);
      } else {
        item.textContent = r.label;
      }
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        input.value = r.label;
        closeDropdown();
        if (onSelect) {
          if (r.lat) {
            onSelect(r);
          } else {

            geocodeSuburb(r.name || r.label).then(geo => {
              if (geo) onSelect({ ...r, lat: geo.lat, lng: geo.lng, postcode: geo.postcode || r.postcode });
              else onSelect(r);
            });
          }
        }
      });
      dropdown.appendChild(item);
    });
    dropdown.style.display = 'block';
  }

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (q.length < 1) { closeDropdown(); return; }

    const localResults = searchLocalSuburbs(q);
    if (localResults.length) {
      showSuggestions(localResults.map(label => {
        const parts = label.match(/^(.+),\s*(\w+)\s+(\d+)$/) || label.match(/^(.+),\s*(\w+)$/);
        const name  = parts ? parts[1] : label;
        const pc    = parts && parts[3] ? parts[3] : '';
        return { label, name, postcode: pc, lat: null, lng: null };
      }));
    }

    clearTimeout(_acTimer);
    _acTimer = setTimeout(async () => {
      const results = await fetchSuburbSuggestions(q);
      if (results.length) showSuggestions(results);
    }, 350);
  });

  input.addEventListener('keydown', e => {
    const items = dropdown.querySelectorAll('.suburb-ac-item');
    const active = dropdown.querySelector('.suburb-ac-item.ac-active');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!active) { items[0]?.classList.add('ac-active'); }
      else { active.classList.remove('ac-active'); (active.nextElementSibling || items[0])?.classList.add('ac-active'); }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!active) { items[items.length-1]?.classList.add('ac-active'); }
      else { active.classList.remove('ac-active'); (active.previousElementSibling || items[items.length-1])?.classList.add('ac-active'); }
    } else if (e.key === 'Enter' && active) {
      e.preventDefault();
      active.dispatchEvent(new MouseEvent('mousedown'));
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  document.addEventListener('click', e => { if (!input.parentNode.contains(e.target)) closeDropdown(); });
}

function sortInstructorsByDistance(lat, lng, instructorList) {
  const list = instructorList || getAllInstructors();
  return list
    .map(inst => {
      if (!inst.baseLat || !inst.baseLng) return { inst, km: 9999, inRange: false };
      const km = haversineKm(lat, lng, inst.baseLat, inst.baseLng);
      const effectiveRadius = inst.travelBonus ? inst.serviceRadius + 8 : inst.serviceRadius;
      return { inst, km, inRange: km <= effectiveRadius };
    })
    .sort((a, b) => a.km - b.km);
}

function instructorCardHTML(inst, distKm) {
  const photoSrc = inst.photoDataUrl || inst.photo || null;
  const photoEl = photoSrc
    ? `<img src="${photoSrc}" alt="${inst.name}" class="card-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><div class="avatar-initials" style="display:none">${inst.initials}</div>`
    : `<div class="avatar-initials">${inst.initials}</div>`;

  let badge = '';
  if (distKm !== undefined) {
    if (distKm <= inst.serviceRadius * 0.5)       badge = `<span class="card-badge badge-best">Best Match</span>`;
    else if (distKm <= inst.serviceRadius)         badge = `<span class="card-badge badge-available">Available in Your Area</span>`;
    else if (inst.travelBonus && distKm <= inst.serviceRadius + 8) badge = `<span class="card-badge badge-travel">Travels for Longer Lessons</span>`;
  }

  const cardLocHTML = inst.state
    ? `<span class="card-loc-stack">${locationLabel(inst)}<br><span class="card-loc-suburbs">Surrounding Suburbs</span></span>`
    : inst.location;

  const distLabel = distKm !== undefined
    ? `<div class="card-dist-row">${ICONS.mapPin} ${cleanSuburb(inst.baseSuburb)} &bull; <strong>${distKm.toFixed(1)} km away</strong></div>`
    : `<div class="card-meta-row card-meta-location">${ICONS.pin} ${cardLocHTML}</div>`;

  const teachingLabels = (inst.teachingApproachIds && inst.teachingApproachIds.length)
    ? resolveTeachingApproach(inst.teachingApproachIds)
    : null;
  const tagline = teachingLabels ? teachingLabels.join(', ') : 'Patient, calm and supportive';

  const vehicleTypesLabel = (inst.vehicles && inst.vehicles.length)
    ? inst.vehicles.map(v => v.type).join(' & ')
    : (inst.transmission || 'Contact instructor');

  let metaRows = inst.customQS
    ? `${distLabel}<div class="card-meta-row">${ICONS.car} ${vehicleTypesLabel}</div><div class="card-meta-row card-tagline">${ICONS.user} ${tagline}</div><div class="card-meta-row">${ICONS.clock} ${inst.experience} experience</div>`
    : `${distLabel}<div class="card-meta-row">${ICONS.car} ${inst.transmission}</div><div class="card-meta-row">${ICONS.clock} ${inst.experience} experience</div>`;

  return `
    <div class="card" data-action="profile" data-id="${inst.id}">
      <div class="card-photo-wrap">${photoEl}${badge}</div>
      <div class="card-body">
        <div class="card-name">${inst.name}</div>
        ${metaRows}
        <button class="btn btn-navy btn-full" data-action="profile" data-id="${inst.id}">View Profile</button>
      </div>
    </div>`;
}

let _liveProfilesCache = [];

function startLiveProfilesListener() {
  db.collection('live_profiles').onSnapshot(snap => {
    _liveProfilesCache = snap.docs.map(d => d.data());

    const page = (location.hash || '#home').replace('#','').split('/')[0];
    if (['home','find','profile'].includes(page)) {
      navigate(page, history.state?.extra, false);
    }
  }, err => console.error('live_profiles listener error:', err));
}

function getLiveProfiles() {
  return _liveProfilesCache;
}
function getAllInstructors() {
  const live = getLiveProfiles();
  const liveOnly = live.filter(lp => !INSTRUCTORS.find(i => i.id === lp.id));
  return [...INSTRUCTORS, ...liveOnly];
}

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
            <input type="text" id="hero-suburb-input" placeholder="Enter a suburb or postcode" autocomplete="off" />
            <button class="btn btn-gold" id="hero-search-btn">Find Instructors</button>
          </div>
          <div class="find-location-btn-wrap">
            <button class="btn btn-find-location" id="hero-location-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9" stroke-dasharray="2 3"/></svg>
              Use my current location
            </button>
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
          ${getAllInstructors().map(i => instructorCardHTML(i)).join('')}
        </div>
      </div>
    </section>
    <section class="section-sm location-section">
      <div class="container">
        <h2 class="section-title">Find Instructors by Location</h2>
        <div class="location-tabs">
          <button class="location-tab active" data-action="nav" data-page="find">Melbourne</button>
          <button class="location-tab" data-action="nav" data-page="find-sydney">Sydney</button>
          <button class="location-tab" data-action="nav" data-page="find-brisbane">Brisbane</button>
          <button class="location-tab coming-soon">Adelaide (Coming Soon)</button>
          <button class="location-tab coming-soon">Perth (Coming Soon)</button>
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

  const NON_VIC_STATES = ['NSW','QLD','SA','WA','TAS','ACT','NT'];
  const allInst = getAllInstructors().filter(i => {
    const s = (i.state || '').toUpperCase().trim();
    return !NON_VIC_STATES.includes(s);
  });
  const sorted = (searchLat !== undefined)
    ? sortInstructorsByDistance(searchLat, searchLng, allInst)
    : allInst.map(i => ({ inst: i, km: undefined }));

  const cardsHTML = sorted.map(({ inst, km }) => instructorCardHTML(inst, km)).join('');
  const searchInfo = searchLabel
    ? `<div class="find-search-info">
        <div class="find-search-info-pill">
          <span class="find-search-info-icon">${ICONS.mapPin}</span>
          <span class="find-search-info-text">Results near <strong>${searchLabel}</strong> <span class="find-search-info-sub">— sorted by distance</span></span>
        </div>
        <a href="#" id="clear-search-link" class="find-search-clear">Clear</a>
      </div>`
    : '';

  return `
    <div class="navy-banner">
      <h1>Driving Instructors in Melbourne</h1>
      <p>Founded in Melbourne, expanding across Australia.</p>
      <div class="find-search-bar">
        <div class="find-search-inner">
          ${ICONS.search}
          <input type="text" id="find-suburb-input" placeholder="Enter a suburb or postcode" autocomplete="off" value="${searchLabel || ''}" />
          <button class="btn btn-gold" id="find-search-btn">Find Instructors</button>
        </div>
        <div class="find-location-btn-wrap">
          <button class="btn btn-find-location" id="find-location-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9" stroke-dasharray="2 3"/></svg>
            Use my current location
          </button>
        </div>
      </div>
    </div>
    <div class="container" style="padding-top:32px">
      <div class="location-tabs" style="margin-bottom:20px">
        <button class="location-tab active" data-action="nav" data-page="find">Melbourne</button>
        <button class="location-tab" data-action="nav" data-page="find-sydney">Sydney</button>
        <button class="location-tab" data-action="nav" data-page="find-brisbane">Brisbane</button>
        <button class="location-tab coming-soon">Adelaide (Coming Soon)</button>
        <button class="location-tab coming-soon">Perth (Coming Soon)</button>
      </div>
      ${searchInfo}
      <div class="find-grid" id="find-results">${cardsHTML}</div>
    </div>`;
}

function renderFindSydney(searchLat, searchLng, searchLabel) {
  const allNSW = getAllInstructors().filter(i => (i.state || '').toUpperCase() === 'NSW');
  const sorted = (searchLat !== undefined)
    ? sortInstructorsByDistance(searchLat, searchLng, allNSW)
    : allNSW.map(i => ({ inst: i, km: undefined }));
  const cardsHTML = sorted.length
    ? sorted.map(({ inst, km }) => instructorCardHTML(inst, km)).join('')
    : `<div class="no-results-msg" style="grid-column:1/-1;text-align:center;padding:48px 0">
        <p style="font-size:18px;font-weight:600;color:var(--navy);margin-bottom:8px">Instructors Coming Soon</p>
        <p style="color:var(--text-light)">We're building our Sydney network. Check back soon, or <a href="#" data-action="nav" data-page="join">join the network</a> if you're an instructor.</p>
       </div>`;
  const searchInfo = searchLabel
    ? `<div class="find-search-info">
        <div class="find-search-info-pill">
          <span class="find-search-info-icon">${ICONS.mapPin}</span>
          <span class="find-search-info-text">Results near <strong>${searchLabel}</strong> <span class="find-search-info-sub">— sorted by distance</span></span>
        </div>
        <a href="#" id="clear-search-link" class="find-search-clear">Clear</a>
      </div>` : '';
  return `
    <div class="navy-banner">
      <h1>Driving Instructors in Sydney</h1>
      <p>Founded in Melbourne, expanding across Australia.</p>
      <div class="find-search-bar">
        <div class="find-search-inner">
          ${ICONS.search}
          <input type="text" id="find-suburb-input" placeholder="Enter a suburb or postcode" autocomplete="off" value="${searchLabel || ''}" />
          <button class="btn btn-gold" id="find-search-btn">Find Instructors</button>
        </div>
        <div class="find-location-btn-wrap">
          <button class="btn btn-find-location" id="find-location-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9" stroke-dasharray="2 3"/></svg>
            Use my current location
          </button>
        </div>
      </div>
    </div>
    <div class="container" style="padding-top:32px">
      <div class="location-tabs" style="margin-bottom:20px">
        <button class="location-tab" data-action="nav" data-page="find">Melbourne</button>
        <button class="location-tab active" data-action="nav" data-page="find-sydney">Sydney</button>
        <button class="location-tab" data-action="nav" data-page="find-brisbane">Brisbane</button>
        <button class="location-tab coming-soon">Adelaide (Coming Soon)</button>
        <button class="location-tab coming-soon">Perth (Coming Soon)</button>
      </div>
      ${searchInfo}
      <div class="find-grid" id="find-results">${cardsHTML}</div>
    </div>`;
}

function renderFindBrisbane(searchLat, searchLng, searchLabel) {
  const allQLD = getAllInstructors().filter(i => (i.state || '').toUpperCase() === 'QLD');
  const sorted = (searchLat !== undefined)
    ? sortInstructorsByDistance(searchLat, searchLng, allQLD)
    : allQLD.map(i => ({ inst: i, km: undefined }));
  const cardsHTML = sorted.length
    ? sorted.map(({ inst, km }) => instructorCardHTML(inst, km)).join('')
    : `<div class="no-results-msg" style="grid-column:1/-1;text-align:center;padding:48px 0">
        <p style="font-size:18px;font-weight:600;color:var(--navy);margin-bottom:8px">Instructors Coming Soon</p>
        <p style="color:var(--text-light)">We're building our Brisbane network. Check back soon, or <a href="#" data-action="nav" data-page="join">join the network</a> if you're an instructor.</p>
       </div>`;
  const searchInfo = searchLabel
    ? `<div class="find-search-info">
        <div class="find-search-info-pill">
          <span class="find-search-info-icon">${ICONS.mapPin}</span>
          <span class="find-search-info-text">Results near <strong>${searchLabel}</strong> <span class="find-search-info-sub">— sorted by distance</span></span>
        </div>
        <a href="#" id="clear-search-link" class="find-search-clear">Clear</a>
      </div>` : '';
  return `
    <div class="navy-banner">
      <h1>Driving Instructors in Brisbane</h1>
      <p>Founded in Melbourne, expanding across Australia.</p>
      <div class="find-search-bar">
        <div class="find-search-inner">
          ${ICONS.search}
          <input type="text" id="find-suburb-input" placeholder="Enter a suburb or postcode" autocomplete="off" value="${searchLabel || ''}" />
          <button class="btn btn-gold" id="find-search-btn">Find Instructors</button>
        </div>
        <div class="find-location-btn-wrap">
          <button class="btn btn-find-location" id="find-location-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9" stroke-dasharray="2 3"/></svg>
            Use my current location
          </button>
        </div>
      </div>
    </div>
    <div class="container" style="padding-top:32px">
      <div class="location-tabs" style="margin-bottom:20px">
        <button class="location-tab" data-action="nav" data-page="find">Melbourne</button>
        <button class="location-tab" data-action="nav" data-page="find-sydney">Sydney</button>
        <button class="location-tab active" data-action="nav" data-page="find-brisbane">Brisbane</button>
        <button class="location-tab coming-soon">Adelaide (Coming Soon)</button>
        <button class="location-tab coming-soon">Perth (Coming Soon)</button>
      </div>
      ${searchInfo}
      <div class="find-grid" id="find-results">${cardsHTML}</div>
    </div>`;
}

function renderProfile(id) {
  const allInst = getAllInstructors();
  const inst = allInst.find(i => i.id === id) || allInst[0];
  const effectiveRadius = inst.travelBonus ? inst.serviceRadius + 8 : inst.serviceRadius;
  const photoSrc = inst.photoDataUrl || inst.photo || null;
  const avatarEl = photoSrc
    ? `<img src="${photoSrc}" alt="${inst.name}" class="profile-photo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><div class="profile-avatar-circle" style="display:none">${inst.initials}</div>`
    : `<div class="profile-avatar-circle">${inst.initials}</div>`;

  const serviceAreaBlock = `
    <div class="qs-block">
      <div class="qs-item-label">Service Area</div>
      <div class="qs-item-value">Based in ${locationLabel(inst)}</div>
      <div class="qs-item-value">Travel Range: ${inst.serviceRadius} km</div>
      <div class="qs-item-value qs-travel-note">Travel outside service area may be available by arrangement (additional fee may apply).</div>
      ${inst.travelFee   ? `<div class="qs-item-value qs-travel-note">May charge travel fee for outer areas</div>` : ''}
    </div>`;

  let qsRows = '';
  if (inst.customQS) {

    const expertiseLabels = resolveExpertise(inst.expertiseIds || inst.areasOfExpertise || []);
    const expertiseHTML = expertiseLabels.map(a => `<li>${a}</li>`).join('');
    const teachingLabels = resolveTeachingApproach(inst.teachingApproachIds || []);
    const teachingHTML = teachingLabels.map(a => `<li>${a}</li>`).join('');
    const feesHTML      = inst.lessonFees.map(f => `<div class="qs-item-value">${f.duration} — ${f.price}</div>`).join('');
    const vehiclesHTML  = inst.vehicles.map(v => `<div class="qs-item-value">${v.type} — ${v.car}</div>`).join('');
    const creds = inst.credentials || {};
    const credentialsBlock = `
      <div class="qs-block">
        <div class="qs-item-label">Credentials</div>
        <div class="cred-row"><span class="cred-label">State Driving Instructor Authority</span>${credTagHTML(creds.dia)}</div>
        <div class="cred-row"><span class="cred-label">Child Safety Clearance</span>${credTagHTML(creds.wwcc)}</div>
      </div>`;
    const languagesBlock = (inst.languages && inst.languages.length)
      ? `<div class="qs-block"><div class="qs-item-label">Languages Spoken</div><div class="qs-item-value">${inst.languages.join(', ')}</div></div>`
      : '';
    qsRows = `
      <div class="qs-col-left">
        <div class="qs-block"><div class="qs-item-label">Experience</div><div class="qs-item-value">${inst.experience}</div></div>
        ${credentialsBlock}
        ${teachingHTML ? `<div class="qs-block"><div class="qs-item-label">Teaching Approach</div><ul class="qs-expertise-list">${teachingHTML}</ul></div>` : ''}
        <div class="qs-block"><div class="qs-item-label">Areas of Expertise</div><ul class="qs-expertise-list">${expertiseHTML}</ul></div>
      </div>
      <div class="qs-col-right">
        <div class="qs-block"><div class="qs-item-label">Vehicles</div>${vehiclesHTML}</div>
        <div class="qs-block"><div class="qs-item-label">Availability</div><div class="qs-item-value">${inst.availability}</div>${(inst.availabilityTimes||[]).length ? `<div class="qs-avail-times">${inst.availabilityTimes.map(t=>`<div class="qs-avail-time">${t}</div>`).join('')}</div>` : ''}${inst.availabilityNote ? `<div class="qs-item-value qs-travel-note">${inst.availabilityNote}</div>` : ''}</div>
        ${languagesBlock}
        <div class="qs-block"><div class="qs-item-label">Lesson Fees</div>${feesHTML}</div>
        ${serviceAreaBlock}
      </div>`;
  } else {
    const creds = inst.credentials || {};
    qsRows = `
      <div><div class="qs-item-label">Experience</div><div class="qs-item-value">${inst.experience}</div></div>
      <div>
        <div class="qs-item-label">Credentials</div>
        <div class="cred-row"><span class="cred-label">State Driving Instructor Authority</span>${credTagHTML(creds.dia)}</div>
        <div class="cred-row"><span class="cred-label">Child Safety Clearance</span>${credTagHTML(creds.wwcc)}</div>
      </div>
      <div><div class="qs-item-label">Lesson Fee</div><div class="qs-item-value">${inst.fee}</div></div>
      <div><div class="qs-item-label">Transmission</div><div class="qs-item-value">${inst.transmission}</div></div>
      <div><div class="qs-item-label">Availability</div><div class="qs-item-value">${inst.availability}</div>${(inst.availabilityTimes||[]).length ? `<div class="qs-avail-times">${inst.availabilityTimes.map(t=>`<div class="qs-avail-time">${t}</div>`).join('')}</div>` : ''}${inst.availabilityNote ? `<div class="qs-item-value qs-travel-note">${inst.availabilityNote}</div>` : ''}</div>
      ${(inst.languages && inst.languages.length) ? `<div><div class="qs-item-label">Languages Spoken</div><div class="qs-item-value">${inst.languages.join(', ')}</div></div>` : ''}
      ${serviceAreaBlock}`;
  }

  const qsGridClass = inst.customQS ? 'qs-grid qs-grid-custom' : 'qs-grid';

  return `
    <div class="profile-hero">
      <div class="profile-hero-inner">
        <div class="profile-avatar-wrap">
          ${avatarEl}
          <div>
            <div class="profile-name">${inst.name}</div>
            <div class="profile-title">${inst.title}</div>
            <div class="profile-location">${ICONS.pin} <span class="profile-loc-stack">${locationLabel(inst)}<br><span class="profile-loc-suburbs">Surrounding Suburbs</span></span></div>
          </div>
        </div>
        <div class="quick-summary">
          <div class="qs-title">Instructor Profile</div>
          <div class="${qsGridClass}">${qsRows}</div>
          <div class="qs-btns">
            <div class="qs-btn-wrap">
              <button class="btn btn-navy" id="call-instructor-btn" data-id="${inst.id}">${ICONS.phoneSmall} Call Instructor</button>
              <p class="btn-trust-text">Call instantly — connects you directly to the instructor</p>
            </div>
            <div class="qs-btn-wrap">
              ${((CONTACT[inst.id] && CONTACT[inst.id].unavailable) || inst.contactUnavailable)
                ? `<button class="btn btn-gold btn-unavailable" disabled title="Online enquiry not yet available for this instructor">${ICONS.mail} Enquiry Unavailable</button>
                   <p class="btn-trust-text">Online enquiry not yet available for this instructor</p>`
                : `<button class="btn btn-gold" id="open-enquiry-btn" data-instructor-id="${inst.id}">${ICONS.mail} Send Enquiry</button>
                   <p class="btn-trust-text">Send an enquiry — the instructor will respond directly to you</p>`
              }
            </div>
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
  const yearOptions = Array.from({length: 2026 - 1970 + 1}, (_, i) => 2026 - i)
    .map(y => `<option value="${y}">${y}</option>`).join('');

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

        <!-- Progress bar -->
        <div class="join-progress-wrap" id="join-progress-wrap">
          <div class="join-progress-bar"><div class="join-progress-fill" id="join-progress-fill"></div></div>
          <div class="join-progress-label" id="join-progress-label">Step 1 of 8</div>
        </div>

        <!-- ── STEP 1: Personal Details ── -->
        <div class="join-step" id="join-step-1">
          <div class="form-section-head join-step-head"><span class="join-step-num">1</span> Personal Details</div>
          <div class="form-group"><label class="form-label">Full Name <span>*</span></label><input type="text" class="form-input" placeholder="Your full name" id="join-name" /></div>
          <div class="form-group"><label class="form-label">Email <span>*</span></label><input type="email" class="form-input" placeholder="your@email.com" id="join-email" /></div>
          <div class="form-group"><label class="form-label">Mobile Number <span>*</span></label><input type="tel" class="form-input" placeholder="0412 345 678" id="join-phone" /></div>
          <div class="form-group">
            <label class="form-label">Profile Photo</label>
            <div class="photo-upload-zone" id="photo-upload-zone">
              <input type="file" id="join-photo" accept="image/jpeg,image/png,image/webp,image/gif" style="display:none" />
              <div class="photo-upload-preview" id="photo-upload-preview" style="display:none">
                <img id="photo-preview-img" src="" alt="Preview" />
                <button type="button" class="photo-remove-btn" id="photo-remove-btn" aria-label="Remove photo">&#x2715;</button>
              </div>
              <div class="photo-upload-prompt" id="photo-upload-prompt">
                <div class="photo-upload-icon">${ICONS.upload}</div>
                <div class="photo-upload-text"><span class="photo-upload-cta">Click to upload</span> or drag &amp; drop</div>
                <div class="photo-upload-hint">JPG, PNG, WEBP — max 5 MB</div>
              </div>
            </div>
            <small class="form-hint">Your photo will be reviewed before being displayed on your public profile.</small>
          </div>
          <div class="join-step-nav">
            <span></span>
            <button class="btn btn-navy join-next-btn" data-next="2">Next: Professional Information →</button>
          </div>
        </div>

        <!-- ── STEP 2: Professional Information ── -->
        <div class="join-step" id="join-step-2" style="display:none">
          <div class="form-section-head join-step-head"><span class="join-step-num">2</span> Professional Information</div>
          <div class="form-group">
            <label class="form-label">Year you started working as a professional driving instructor <span>*</span></label>
            <select class="form-input" id="join-exp">
              <option value="" disabled selected>Select year…</option>
              ${yearOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">State Driving Instructor Authority <span>*</span></label>
            <select class="form-input" id="join-dia-type">
              <option value="" disabled selected>Select your authority type…</option>
              <option value="VIC – Driving Instructor Authority (DIA)">VIC – Driving Instructor Authority (DIA)</option>
              <option value="NSW – Driving Instructor Licence">NSW – Driving Instructor Licence</option>
              <option value="QLD – Driver Trainer Accreditation / Industry Authority">QLD – Driver Trainer Accreditation / Industry Authority</option>
              <option value="WA – Driving Instructor Licence">WA – Driving Instructor Licence</option>
              <option value="SA – Motor Driving Instructor Licence">SA – Motor Driving Instructor Licence</option>
              <option value="TAS – Driving Instructor Accreditation">TAS – Driving Instructor Accreditation</option>
              <option value="ACT – Driving Instructor Accreditation">ACT – Driving Instructor Accreditation</option>
              <option value="NT – Driving Instructor Accreditation">NT – Driving Instructor Accreditation</option>
            </select>
            <input type="text" class="form-input" placeholder="Your authority / licence number" id="join-dia" style="margin-top:8px" />
            <small class="form-hint">This information is used to check instructor eligibility and is not shown publicly.</small>
          </div>
          <div class="form-group">
            <label class="form-label">Child Safety Clearance</label>
            <select class="form-input" id="join-wwcc-type">
              <option value="" selected>Select your clearance type… (if applicable)</option>
              <option value="Working With Children Check (WWCC)">VIC / NSW / WA / SA – Working With Children Check (WWCC)</option>
              <option value="Blue Card">QLD – Blue Card</option>
              <option value="Working With Vulnerable People Check">ACT / TAS – Working With Vulnerable People Check</option>
              <option value="Ochre Card">NT – Ochre Card</option>
            </select>
            <input type="text" class="form-input" placeholder="Your card / clearance number" id="join-wwcc" style="margin-top:8px" />
            <small class="form-hint">This information is used to check instructor eligibility and is not shown publicly.</small>
          </div>
          <div class="form-group">
            <label class="form-label">Automatic Vehicle</label>
            <input type="text" class="form-input" placeholder="Vehicle make &amp; model (if applicable)" id="join-vehicle-auto" />
          </div>
          <div class="form-group">
            <label class="form-label">Manual Vehicle</label>
            <input type="text" class="form-input" placeholder="Vehicle make &amp; model (if applicable)" id="join-vehicle-manual" />
          </div>
          <div class="form-group">
            <label class="form-label">Languages Spoken</label>
            <div class="join-expertise-grid" id="join-languages-grid">
              ${LANGUAGE_OPTIONS.map(l=>`<label class="join-toggle-label"><input type="checkbox" value="${l}" /><span>${l}</span></label>`).join('')}
            </div>
            <div class="form-group" style="margin-top:10px;margin-bottom:0">
              <input type="text" class="form-input" id="join-lang-other" placeholder="Other language (if not listed above)" />
            </div>
          </div>
          <div class="join-step-nav">
            <button class="btn btn-outline join-back-btn" data-back="1">← Back</button>
            <button class="btn btn-navy join-next-btn" data-next="3">Next: Teaching Approach →</button>
          </div>
        </div>

        <!-- ── STEP 3: Teaching Approach ── -->
        <div class="join-step" id="join-step-3" style="display:none">
          <div class="form-section-head join-step-head"><span class="join-step-num">3</span> Teaching Approach <span style="font-size:12px;font-weight:400;color:var(--text-light)">(Select a total of 2–3)</span></div>
          <p style="font-size:14px;color:var(--text-light);margin:-4px 0 18px;">Choose words that best describe your teaching style and how lessons feel for your students.</p>
          <div class="form-group">
            <div id="join-teaching-grid">
              ${buildTeachingApproachCheckboxes()}
            </div>
            <small class="form-hint" id="teaching-count-hint">Most instructors choose 2–3 tags that reflect both their personality and how they run lessons.</small>
          </div>
          <div class="join-step-nav">
            <button class="btn btn-outline join-back-btn" data-back="2">← Back</button>
            <button class="btn btn-navy join-next-btn" data-next="4">Next: Areas of Expertise →</button>
          </div>
        </div>

        <!-- ── STEP 4: Areas of Expertise ── -->
        <div class="join-step" id="join-step-4" style="display:none">
          <div class="form-section-head join-step-head"><span class="join-step-num">4</span> Areas of Expertise <span style="font-size:12px;font-weight:400;color:var(--text-light)">(Select a total of 3–5)</span></div>
          <p style="font-size:14px;color:var(--text-light);margin:-4px 0 18px;">Choose the learners you enjoy working with most.</p>
          <div class="form-group">
            <div id="join-expertise-grid">
              ${buildExpertiseCheckboxes()}
            </div>
            <small class="form-hint expertise-count-hint" id="expertise-count-hint"></small>
          </div>
          <div class="join-step-nav">
            <button class="btn btn-outline join-back-btn" data-back="3">← Back</button>
            <button class="btn btn-navy join-next-btn" data-next="5">Next: Your Location →</button>
          </div>
        </div>

        <!-- ── STEP 5: Your Location ── -->
        <div class="join-step" id="join-step-5" style="display:none">
          <div class="form-section-head join-step-head"><span class="join-step-num">5</span> Your Location</div>
          <div class="form-group">
            <label class="form-label">Your Suburb / Local Area <span>*</span></label>
            <input type="text" class="form-input" placeholder="e.g. Burwood, Doncaster, Geelong" id="join-suburb" list="join-suburb-list" autocomplete="off" />
            <datalist id="join-suburb-list">
              <option value="Burwood"></option>
              <option value="Doncaster"></option>
              <option value="Geelong"></option>
              <option value="Vermont"></option>
              <option value="Box Hill"></option>
              <option value="Melbourne CBD"></option>
              <option value="Footscray"></option>
              <option value="Frankston"></option>
              <option value="Dandenong"></option>
              <option value="Ringwood"></option>
              <option value="Werribee"></option>
              <option value="Bendigo"></option>
              <option value="Ballarat"></option>
              <option value="Geelong West"></option>
              <option value="Glen Waverley"></option>
            </datalist>
          </div>
          <div class="form-group">
            <label class="form-label">State <span>*</span></label>
            <select class="form-input" id="join-state">
              <option value="" disabled selected>Select state…</option>
              <option value="VIC">VIC</option>
              <option value="NSW">NSW</option>
              <option value="QLD">QLD</option>
              <option value="SA">SA</option>
              <option value="WA">WA</option>
              <option value="TAS">TAS</option>
              <option value="ACT">ACT</option>
              <option value="NT">NT</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">How far are you willing to travel?</label>
            <select class="form-input" id="join-radius">
              <option value="10" selected>10 km</option>
              <option value="15">15 km</option>
              <option value="20">20 km</option>
              <option value="30">30 km</option>
              <option value="40">40 km</option>
              <option value="50">50 km</option>
              <option value="60">60 km</option>
              <option value="80">80 km</option>
              <option value="100">100 km</option>
            </select>
          </div>
          <div class="join-step-nav">
            <button class="btn btn-outline join-back-btn" data-back="4">← Back</button>
            <button class="btn btn-navy join-next-btn" data-next="6">Next: Availability &amp; Lesson Details →</button>
          </div>
        </div>

        <!-- ── STEP 6: Availability & Lesson Details ── -->
        <div class="join-step" id="join-step-6" style="display:none">
          <div class="form-section-head join-step-head"><span class="join-step-num">6</span> Availability &amp; Lesson Details</div>
          <div class="form-group">
            <label class="form-label">Preferred Days</label>
            <div class="join-avail-grid">
              <label class="join-toggle-label"><input type="checkbox" id="avail-weekdays" value="Weekdays (Mon–Fri)" /><span>Weekdays (Mon–Fri)</span></label>
              <label class="join-toggle-label"><input type="checkbox" id="avail-saturday" value="Saturday" /><span>Saturday</span></label>
              <label class="join-toggle-label"><input type="checkbox" id="avail-sunday" value="Sunday" /><span>Sunday</span></label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Preferred Times</label>
            <div class="join-avail-grid">
              <label class="join-toggle-label"><input type="checkbox" id="avail-morning" value="Morning (8am–12pm)" /><span>Morning (8am–12pm)</span></label>
              <label class="join-toggle-label"><input type="checkbox" id="avail-afternoon" value="Afternoon (12pm–5pm)" /><span>Afternoon (12pm–5pm)</span></label>
              <label class="join-toggle-label"><input type="checkbox" id="avail-evening" value="Evening (5pm–8pm)" /><span>Evening (5pm–8pm)</span></label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Additional Availability Information <span class="form-label-optional">(optional)</span></label>
            <input type="text" class="form-input" id="avail-specific" placeholder='e.g. "Usually available weekdays after 3pm."' />
          </div>

          <!-- Lesson Fees -->
          <div class="form-section-head join-step-head" style="margin-top:28px">Lesson Fees</div>
          <div class="form-group">
            <label class="form-label">60 minute lesson <span>*</span></label>
            <div class="fee-input-wrap">
              <span class="fee-input-prefix">$</span>
              <input type="number" class="form-input fee-input" id="join-fee-60" placeholder="e.g. 110" min="0" step="1" />
            </div>
            <small class="form-hint">Typical range on the platform: $85 – $135 per 60 minute lesson</small>
          </div>
          <div class="form-group">
            <label class="form-label">90 minute lesson <span class="form-label-optional">(optional)</span></label>
            <div class="fee-input-wrap">
              <span class="fee-input-prefix">$</span>
              <input type="number" class="form-input fee-input" id="join-fee-90" placeholder="e.g. 155" min="0" step="1" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">120 minute lesson <span class="form-label-optional">(optional)</span></label>
            <div class="fee-input-wrap">
              <span class="fee-input-prefix">$</span>
              <input type="number" class="form-input fee-input" id="join-fee-120" placeholder="e.g. 220" min="0" step="1" />
            </div>
          </div>

          <div class="join-step-nav">
            <button class="btn btn-outline join-back-btn" data-back="5">← Back</button>
            <button class="btn btn-navy join-next-btn" data-next="7">Next: About You →</button>
          </div>
        </div>

        <!-- ── STEP 7: About You ── -->
        <div class="join-step" id="join-step-7" style="display:none">
          <div class="form-section-head join-step-head"><span class="join-step-num">7</span> About You</div>
          <div class="form-group">
            <label class="form-label">Tell us about yourself</label>
            <small class="form-hint" style="display:block;margin-bottom:8px">Tell learners a little about your teaching style, experience, personality, and what type of students you work best with.</small>
            <textarea class="form-input" placeholder="e.g. I'm a calm and patient driving instructor who focuses on building confidence through simple, structured lessons. I work with a range of students, including beginners, nervous drivers, and those preparing for their driving test. My goal is to help learners become safe, independent drivers not just pass the driving test." id="join-bio" style="min-height:140px"></textarea>
          </div>
          <div class="join-step-nav">
            <button class="btn btn-outline join-back-btn" data-back="6">← Back</button>
            <button class="btn btn-navy join-next-btn" data-next="8">Next: Compliance →</button>
          </div>
        </div>

        <!-- ── STEP 8: Compliance & Declaration ── -->
        <div class="join-step" id="join-step-8" style="display:none">
          <div class="form-section-head join-step-head"><span class="join-step-num">8</span> Instructor Requirements &amp; Compliance</div>
          <div class="form-group join-requirements-group">
            <div class="join-req-subtitle">Please review and confirm you meet all of the following requirements:</div>
            <div class="join-req-box">
              <div class="join-req-section-head">Licensing &amp; Compliance</div>
              <ul class="join-req-list">
                <li>Current State Driving Instructor Authority (or equivalent) for your state or territory</li>
                <li>Valid Child Safety Clearance (WWCC, Blue Card, Working With Vulnerable People Check, or Ochre Card — as required in your state or territory)</li>
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
          </div>
          <div class="form-group">
            <div class="join-req-title" style="margin-bottom:14px">Instructor Declaration <span class="req-required">*</span></div>
            <div class="join-declaration-list">
              <label class="join-req-confirm"><input type="checkbox" id="join-decl-1" /><span>I confirm that I meet the Instructor Requirements outlined above and that the information provided is true and accurate. I understand that submission does not guarantee approval and that my application may be reviewed before my profile is published. I agree to keep my profile information accurate and up to date.</span></label>
            </div>
          </div>
          <div class="join-step-nav">
            <button class="btn btn-outline join-back-btn" data-back="7">← Back</button>
          </div>
          <button class="btn btn-navy btn-full btn-lg" id="join-submit" style="margin-top:24px">Apply to Join</button>
          <div class="join-approval-notice">
            <p>Once your instructor profile has been approved, you will receive a confirmation email. Your profile, including your photo and submitted details, will then be visible to users, allowing them to view your information and contact you directly. If you need to edit or update your profile at any time, or if you have any questions or require assistance, please contact our team at <a href="mailto:support@pdin.au">support@pdin.au</a>.</p>
          </div>
          <p class="join-reserve-note">Professional Driving Instructors Network reserves the right to verify credentials before approval.</p>
        </div>

      </div>
    </div>`;
}

function renderAbout() {
  return `
    <div class="about-hero"><h1>About PDIN</h1></div>
    <section class="about-content">
      <div class="container">
        <p>The Professional Driving Instructors Network was created to help learner drivers find experienced, independent, professional driving instructors through clear and structured profiles.</p>
        <p>Too often, learners are forced to choose between inconsistent listings, unclear experience levels, and price-driven platforms where quality can vary significantly. At the same time, many experienced instructors find themselves competing alongside underqualified newcomers on discount-driven platforms that fail to reflect the value of professional instruction.</p>
        <p style="text-align:center;font-style:italic;font-weight:600;color:var(--navy);">We believe there is a better way.</p>
        <p>PDIN provides a professional platform where driving instructors can present their services in a consistent and structured format, making it easier for learners to compare options and choose the right instructor for their needs.</p>
        <p><strong>For learners,</strong> this means greater transparency. Instructor profiles include experience, lesson pricing, areas of expertise, vehicle information, service areas, and other important details, helping learners make informed decisions with confidence.</p>
        <p><strong>For instructors,</strong> this means respect. No commission fees. No race to the bottom on pricing. No algorithm deciding your visibility. Just a professional platform designed to showcase your experience, services, and teaching strengths in a way that reflects the value you bring to your students.</p>
        <p>Our goal is simple: to create a professional network that benefits both learners and instructors by making quality driving instruction easier to find and easier to present.</p>
        <p>PDIN is currently launching in Melbourne, with plans to expand to Sydney and Brisbane.</p>

        <hr class="pricing-divider" />

        <h2>Get Started</h2>
        <div class="about-cta-grid">
          <div class="about-cta-card">
            <p>Looking for a driving instructor?</p>
            <a href="#" data-action="nav" data-page="find" class="btn btn-navy btn-full">Find an Instructor</a>
          </div>
          <div class="about-cta-card">
            <p>Are you a professional driving instructor who takes pride in your work and would like to be part of a growing network focused on quality, professionalism, and transparency?</p>
            <a href="#" data-action="nav" data-page="join" class="btn btn-gold btn-full">Apply to Join PDIN</a>
          </div>
        </div>
      </div>
    </section>`;
}

function renderPricing() {
  return `
    <div class="pricing-hero"><h1>Pricing</h1><p>Transparent, fair pricing with no hidden fees or commissions.</p></div>
    <section class="pricing-content">
      <div class="container">
        <h2>Why We Don't Compete on Price</h2>
        <p>Many platforms focus on the cheapest lesson available. We don't.</p>
        <p>Lower prices often lead to rushed lessons, inexperienced instruction, inconsistent quality, and instructors needing to overbook to survive.</p>
        <p>Instead, we focus on <strong>quality instruction, better outcomes, and safer drivers</strong>.</p>
        <hr class="pricing-divider" />
        <h2>Independent Instructor Pricing</h2>
        <p>All instructors on this platform are independent professionals and set their own pricing based on experience, vehicle type, lesson structure, and location.</p>
        <p>Pricing displayed on PDIN is provided by individual instructors and is not independently verified.</p>
        <p>As a general guide only, lesson pricing submitted by instructors on the platform is commonly listed within the range of:</p>
        <h2>$85 – $135 per hour <span style="font-size:15px;font-weight:400;color:var(--text-light)">(guide only)</span></h2>
        <p>Actual pricing may vary significantly and may be higher or lower depending on the instructor and circumstances.</p>
        <p>Users should confirm current pricing directly with the instructor prior to booking.</p>
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
            <div class="contact-detail">${ICONS.mail}<span>support@pdin.au</span></div>
            <div class="contact-detail">${ICONS.pin}<span>Melbourne, Victoria, Australia</span></div>
          </div>
          <div id="contact-form-wrap">
            <div class="form-group"><label class="form-label">Full Name <span style="color:#e53e3e">*</span></label><input type="text" class="form-input" placeholder="Your full name" id="c-name" /></div>
            <div class="form-group"><label class="form-label">Email <span style="color:#e53e3e">*</span></label><input type="email" class="form-input" placeholder="your@email.com" id="c-email" /></div>
            <div class="form-group"><label class="form-label">Subject</label><input type="text" class="form-input" placeholder="How can we help?" id="c-subject" /></div>
            <div class="form-group"><label class="form-label">Message <span style="color:#e53e3e">*</span></label><textarea class="form-input" placeholder="Your message..." id="c-message" style="min-height:80px"></textarea></div>
            <button class="btn btn-navy btn-full btn-lg" id="contact-submit">Send Message</button>
          </div>
        </div>
      </div>
    </section>`;
}

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

    const fieldMap = [
      ['eq-name', name, 'Full Name'],
      ['eq-mobile', mobile, 'Mobile Number'],
      ['eq-email', email, 'Email Address'],
      ['eq-suburb', suburb, 'Suburb / Area'],
      ['eq-licence', licence, 'Licence Stage'],
      ['eq-transmission', transmission, 'Transmission Preference'],
    ];
    const missing = fieldMap.filter(([, val]) => !val);

    fieldMap.forEach(([id]) => document.getElementById(id).classList.remove('eq-invalid'));

    if (missing.length) {
      missing.forEach(([id]) => {
        const el = document.getElementById(id);
        el.classList.add('eq-invalid');
        el.addEventListener('input', () => el.classList.remove('eq-invalid'), { once: true });
        el.addEventListener('change', () => el.classList.remove('eq-invalid'), { once: true });
      });
      const names = missing.map(([, , label]) => label);
      const list = names.length === 1
        ? names[0]
        : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
      showEnquiryError(`Please fill in: ${list}.`);
      missing[0][0] && document.getElementById(missing[0][0]).focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('eq-email').classList.add('eq-invalid');
      showEnquiryError('Please enter a valid email address.'); return;
    }
    clearEnquiryError();
    setEnquiryButtonLoading(true);

    const isUnavailable = inst.contactUnavailable || false;

    if (isUnavailable) {
      showEnquiryError('Online enquiry is not yet available for this instructor. Please call them directly.');
      setEnquiryButtonLoading(false);
      return;
    }

    const enquiryDocId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    db.collection('enquiries').doc(enquiryDocId).set({
      instructorId:   inst.id,
      instructorName: inst.name,
      studentName:    name,
      studentMobile:  mobile,
      studentEmail:   email,
      suburb,
      licenceStage:   licence,
      transmission,
      preferredDays:  days.length ? days.join(', ') : 'Not specified',
      preferredTime:  starttime || 'Not specified',
      message:        message || '(No message)',
      status:         'pending',
      createdAt:      firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      trackEnquiry(inst.id, inst.name, { name, mobile, email, suburb, licence, transmission, days: days.join(', '), starttime, message });
      document.getElementById('enquiry-form-body').innerHTML = `
        <div class="success-box">
          <div class="success-icon">${ICONS.check}</div>
          <h3>Enquiry Sent!</h3>
          <p>Your enquiry has been sent directly to <strong>${inst.name}</strong>. They'll be in touch soon.</p>
          <p style="margin-top:12px;font-size:13.5px;color:var(--text-light)">For urgent bookings, call the instructor directly using the button on their profile.</p>
        </div>`;
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

function setButtonLoading(btnId, loading, originalText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (loading) { btn.disabled = true; btn.innerHTML = '<span class="btn-spinner"></span> Sending…'; }
  else { btn.disabled = false; btn.textContent = originalText; }
}
function showFormError(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const visibleStep = [...container.querySelectorAll('.join-step')]
    .find(step => step.style.display !== 'none') || container;
  const existing = visibleStep.querySelector('.form-error-msg');
  if (existing) existing.remove();
  const err = document.createElement('p');
  err.className = 'form-error-msg';
  err.textContent = message;
  const navRow = visibleStep.querySelector('.join-step-nav');
  if (navRow) navRow.before(err); else visibleStep.appendChild(err);
  err.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showToast(message) {

  const existing = document.getElementById('pdin-toast');
  if (existing) { existing.remove(); }

  const toast = document.createElement('div');
  toast.id = 'pdin-toast';
  toast.className = 'pdin-toast';
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="pdin-toast-icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </span>
    <span class="pdin-toast-msg">${message}</span>
    <button class="pdin-toast-close" aria-label="Dismiss">&times;</button>
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('pdin-toast--visible'));
  });

  toast.querySelector('.pdin-toast-close').addEventListener('click', () => dismissToast(toast));

  const timer = setTimeout(() => dismissToast(toast), 4000);
  toast._dismissTimer = timer;
}

function dismissToast(toast) {
  if (!toast || !toast.isConnected) return;
  clearTimeout(toast._dismissTimer);
  toast.classList.remove('pdin-toast--visible');
  toast.classList.add('pdin-toast--hiding');
  setTimeout(() => { if (toast.isConnected) toast.remove(); }, 340);
}

let _searchLat, _searchLng, _searchLabel, _cityPage = 'find';

function getPageContent(page, extra) {

  if (page === 'find' || page === 'find-sydney' || page === 'find-brisbane') _cityPage = page;
  switch (page) {
    case 'find':         return renderFind(_searchLat, _searchLng, _searchLabel);
    case 'find-sydney':  return renderFindSydney(_searchLat, _searchLng, _searchLabel);
    case 'find-brisbane':return renderFindBrisbane(_searchLat, _searchLng, _searchLabel);
    case 'profile': return renderProfile(extra);
    case 'join':    return renderJoin();
    case 'about':   return renderAbout();
    case 'pricing': return renderPricing();
    case 'contact': return renderContact();
    case 'stats':   return renderStatsPage();
    case 'admin':   return renderAdminPage(extra);
    default:        return renderHome();
  }
}

function formatExperienceLabel(expYears) {
  if (expYears < 1)  return 'Under 1 year';
  if (expYears === 1) return '1 year';
  if (expYears < 20) return expYears + ' years';
  const tierFloor = Math.floor(expYears / 10) * 10;
  return tierFloor + '+ years';
}

function buildLiveProfileFromApp(app, appId) {
  const expYears    = app.exp ? (new Date().getFullYear() - parseInt(app.exp)) : 0;
  const expLabel    = formatExperienceLabel(expYears);
  const idSlug      = app.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const initials    = app.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const availLabel  = (app.availDays||[]).join(' / ') || 'Contact instructor';
  const feesArr     = [{ duration: '60 min', price: '$' + app.fee60 }];
  if (app.fee90)    feesArr.push({ duration: '90 min', price: '$' + app.fee90 });
  if (app.fee120)   feesArr.push({ duration: '120 min', price: '$' + app.fee120 });
  const vehiclesArr = [];
  if (app.vAuto)    vehiclesArr.push({ type: 'Auto',   car: app.vAuto });
  if (app.vManual)  vehiclesArr.push({ type: 'Manual', car: app.vManual });

  const liveProfile = {
    id:           idSlug,
    initials,
    name:         app.name,
    title:        'Professional Driving Instructor',
    baseSuburb:   cleanSuburb(app.suburb),
    state:        app.state || '',
    baseLat:      null,
    baseLng:      null,
    serviceRadius: parseInt(app.radius) || 10,
    travelBonus:  false,
    travelFee:    false,
    location:     '<span class="profile-loc-stack">' + cleanSuburb(app.suburb) + (app.state ? ', ' + app.state : '') + '<br><span class="profile-loc-suburbs">Surrounding Suburbs</span></span>',
    experience:   expLabel,
    customQS:     true,
    lessonFees:   feesArr,
    vehicles:     vehiclesArr,
    availability: availLabel,
    availabilityTimes: app.availTimes || [],
    availabilityNote: app.availSpecific || '',
    teachingApproachIds: app.teachingApproachIds || [],
    expertiseIds: app.expertiseIds || [],
    credentials:  {
      dia:     app.credentials?.dia     || credStatus(false, app.dia),
      diaType: app.credentials?.diaType || app.diaType || '',
      wwcc:    app.credentials?.wwcc    || credStatus(false, app.wwcc),
      wwccType:app.credentials?.wwccType|| app.wwccType || '',
    },
    seniorBadge:  expYears >= 10,
    photo:        null,
    photoDataUrl: app.photoDataUrl || null,
    bio:          app.bio || '',
    languages:    app.languages || [],
    phone:        app.phone || '',
    _fromApp:     appId,
  };
  return { idSlug, liveProfile };
}

function purgeExpiredTrash(apps) {
  return Promise.resolve(apps);
}

function renderAdminPage(extra, apps) {

  if (!auth.currentUser) {
    return `
      <div class="admin-gate">
        <div class="admin-gate-box">
          <div class="admin-gate-logo">🔒</div>
          <h2>Admin Sign In</h2>
          <p>Sign in with your admin account to continue.</p>
          <div class="form-group" style="margin-top:18px">
            <input type="email" class="form-input" id="admin-email-input" placeholder="Email" autocomplete="username" style="margin-bottom:10px" />
            <input type="password" class="form-input" id="admin-pass-input" placeholder="Password" autocomplete="current-password" />
          </div>
          <button class="btn btn-navy btn-full" id="admin-key-btn" style="margin-top:10px">Sign In</button>
          <p id="admin-key-error" class="admin-key-error" style="display:none">Incorrect email or password.</p>
        </div>
      </div>`;
  }

  apps = apps || [];

  const pending  = apps.filter(a => a.status === 'pending');
  const approved = apps.filter(a => a.status === 'approved');
  const rejected = apps.filter(a => a.status === 'rejected');
  const trashed  = apps.filter(a => a.status === 'trashed');

  function appCard(app) {
    const initials   = app.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const expYears   = app.exp ? (new Date().getFullYear() - parseInt(app.exp)) : 0;
    const expLabel   = formatExperienceLabel(expYears);
    const vehicles   = [app.vAuto ? 'Auto: ' + app.vAuto : '', app.vManual ? 'Manual: ' + app.vManual : ''].filter(Boolean).join(' · ') || '(none listed)';
    const avail      = [...(app.availDays||[]), ...(app.availTimes||[])].join(', ') || '(not specified)';
    const expertise  = resolveExpertise(app.expertiseIds || []);
    const teachingApproach = resolveTeachingApproach(app.teachingApproachIds || []);
    const submittedDate = app.submittedAt && app.submittedAt.toDate ? app.submittedAt.toDate() : new Date(app.submittedAt || Date.now());
    const submitted  = submittedDate.toLocaleString('en-AU',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    const statusBadge = app.status === 'approved'
      ? `<span class="admin-status-badge admin-badge-approved">✓ Approved</span>`
      : app.status === 'rejected'
      ? `<span class="admin-status-badge admin-badge-rejected">✕ Rejected</span>`
      : app.status === 'trashed'
      ? `<span class="admin-status-badge admin-badge-trashed">🗑 Trashed</span>`
      : `<span class="admin-status-badge admin-badge-pending">Pending Review</span>`;

    let trashNote = 'This record has been moved to Trash. Restore it or delete it permanently.';

    const idSlug     = app.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const transmission = [app.vAuto ? 'Automatic' : '', app.vManual ? 'Manual' : ''].filter(Boolean).join(' & ') || 'Automatic';
    const feesArr    = [`{ duration: '60 min', price: '$${app.fee60}' }`, ...(app.fee90 ? [`{ duration: '90 min', price: '$${app.fee90}' }`] : []), ...(app.fee120 ? [`{ duration: '120 min', price: '$${app.fee120}' }`] : [])];
    const vehiclesArr = [...(app.vAuto ? [`{ type: 'Auto',   car: '${app.vAuto}' }`] : []), ...(app.vManual ? [`{ type: 'Manual', car: '${app.vManual}' }`] : [])];
    const availLabel = (app.availDays||[]).join(' / ') || 'Weekdays';
    const availTimesArr = (app.availTimes||[]).map(t => `'${t.replace(/'/g,"\\'")}'`);
    const expertiseIdStr = (app.expertiseIds||[]).map(id => `      '${id}',`).join('\n');
    const teachingIdStr  = (app.teachingApproachIds||[]).map(id => `      '${id}',`).join('\n');

    const codeBlock = `  {
    id: '${idSlug}',
    initials: '${initials}',
    name: '${app.name}',
    title: 'Professional Driving Instructor',
    baseSuburb: '${cleanSuburb(app.suburb)}',
    state: '${app.state || ''}',
    baseLat: -37.8136, baseLng: 144.9631,
    serviceRadius: ${app.radius || 10},
    travelBonus: false,
    travelFee: false,
    location: '<span class="profile-loc-stack">${cleanSuburb(app.suburb)}${app.state ? ', ' + app.state : ''}<br><span class="profile-loc-suburbs">Surrounding Suburbs</span></span>',
    transmission: '${transmission}',
    experience: '${expLabel}',
    lessonFees: [
      ${feesArr.join(',\n      ')},
    ],${vehiclesArr.length ? `
    vehicles: [
      ${vehiclesArr.join(',\n      ')},
    ],` : ''}
    availability: '${availLabel}',
    availabilityTimes: [${availTimesArr.join(', ')}],
    availabilityNote: '${(app.availSpecific||'').replace(/'/g,"\\'")}',
    teachingApproachIds: [
${teachingIdStr}
    ],
    expertiseIds: [
${expertiseIdStr}
    ],
    seniorBadge: ${expYears >= 10},
    photo: '${idSlug}.jpg',
    bio: "${(app.bio||'').replace(/"/g, '\\"')}",
  },`;

    const contactBlock = `  '${idSlug}': {
    email: '',
    phone: [],
  },`;

    return `
      <div class="admin-app-card" id="admin-card-${app.id}">
        <div class="admin-app-header">
          ${app.photoDataUrl
            ? `<img src="${app.photoDataUrl}" alt="${app.name}" class="admin-app-avatar-photo" style="width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0" />`
            : `<div class="admin-app-avatar">${initials}</div>`
          }
          <div class="admin-app-meta">
            <div class="admin-app-name">${app.name} ${statusBadge}</div>
            <div class="admin-app-sub">${app.email}</div>
            <div class="admin-app-sub">${app.phone}</div>
            <div class="admin-app-sub">DIA: ${app.diaType ? app.diaType + ' — ' : ''}${app.dia}</div>
            <div class="admin-app-sub">Submitted: ${submitted}</div>
          </div>
        </div>

        <div class="admin-app-details">
          <div class="admin-detail-row"><span class="admin-detail-label">Suburb / Area</span><span>${app.suburb}${app.state ? ', ' + app.state : ''} (radius: ${app.radius} km)</span></div>
          <div class="admin-detail-row"><span class="admin-detail-label">Experience</span><span>Since ${app.exp} (${expLabel})</span></div>
          <div class="admin-detail-row"><span class="admin-detail-label">Vehicles</span><span>${vehicles}</span></div>
          <div class="admin-detail-row"><span class="admin-detail-label">Languages</span><span>${(app.languages||[]).join(', ') || '(not specified)'}</span></div>
          <div class="admin-detail-row"><span class="admin-detail-label">Availability</span><span>${avail}${app.availSpecific ? ' — ' + app.availSpecific : ''}</span></div>
          <div class="admin-detail-row"><span class="admin-detail-label">Fees</span><span>60 min: $${app.fee60}${app.fee90 ? ' · 90 min: $'+app.fee90 : ''}${app.fee120 ? ' · 120 min: $'+app.fee120 : ''}</span></div>
          <div class="admin-detail-row"><span class="admin-detail-label">Photo uploaded</span><span>${app.photoName || '(none)'}</span></div>
          <div class="admin-detail-row admin-detail-full"><span class="admin-detail-label">Teaching Approach</span>
            <div class="admin-expertise-pills">${teachingApproach.map(e => `<span class="admin-expertise-pill">${e}</span>`).join('')}</div>
          </div>
          <div class="admin-detail-row admin-detail-full"><span class="admin-detail-label">Expertise</span>
            <div class="admin-expertise-pills">${expertise.map(e => `<span class="admin-expertise-pill">${e}</span>`).join('')}</div>
          </div>
          ${app.bio ? `<div class="admin-detail-row admin-detail-full"><span class="admin-detail-label">Bio</span><p class="admin-bio-text">${app.bio}</p></div>` : ''}
        </div>

        <!-- Live profile preview -->
        <details class="admin-preview-toggle">
          <summary>👁 Preview profile as it would appear on the site</summary>
          <div class="admin-profile-preview" id="admin-preview-${app.id}">
            ${renderPendingProfile(app)}
          </div>
        </details>

        <!-- Optional: raw data reference (no longer required — Approve & Publish Live handles this automatically) -->
        <details class="admin-code-toggle">
          <summary>📋 View raw data (optional reference, not required)</summary>
          <div class="admin-code-wrap">
            <p class="admin-code-label">For reference only — clicking "Approve &amp; Publish Live" already does this automatically. <code>INSTRUCTORS</code>-style entry:</p>
            <pre class="admin-code-block" id="code-instructors-${app.id}">${escHtml(codeBlock)}</pre>
            <button class="btn btn-outline admin-copy-btn" data-copy="code-instructors-${app.id}">Copy</button>

            <p class="admin-code-label" style="margin-top:18px"><code>CONTACT</code>-style entry:</p>
            <pre class="admin-code-block" id="code-contact-${app.id}">${escHtml(contactBlock)}</pre>
            <button class="btn btn-outline admin-copy-btn" data-copy="code-contact-${app.id}">Copy</button>
          </div>
        </details>

        ${app.status === 'pending' ? `
        <div class="admin-app-actions">
          <button class="btn btn-navy admin-approve-btn" data-appid="${app.id}">✓ Approve &amp; Publish Live</button>
          <button class="btn btn-outline admin-reject-btn" data-appid="${app.id}">✕ Reject</button>
          <button class="btn btn-outline admin-edit-btn" data-appid="${app.id}">✏️ Edit Profile</button>
          <button class="btn btn-outline admin-delete-btn" data-appid="${app.id}">🗑 Move to Trash</button>
        </div>` : app.status === 'approved' ? `
        <div class="admin-app-actions">
          <button class="btn btn-outline admin-view-live-btn" data-slug="${app.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}">👁 View Live Profile</button>
          <button class="btn btn-outline admin-edit-btn" data-appid="${app.id}">✏️ Edit Profile</button>
          <button class="btn btn-outline admin-reject-btn" data-appid="${app.id}" style="color:#c0392b;border-color:#c0392b">✕ Remove from Site</button>
          <button class="btn btn-outline admin-delete-btn" data-appid="${app.id}">🗑 Move to Trash</button>
        </div>` : app.status === 'rejected' ? `
        <div class="admin-app-actions">
          <button class="btn btn-outline admin-restore-btn" data-appid="${app.id}">↩ Restore to Pending</button>
          <button class="btn btn-outline admin-edit-btn" data-appid="${app.id}">✏️ Edit Profile</button>
          <button class="btn btn-outline admin-delete-btn" data-appid="${app.id}">🗑 Move to Trash</button>
        </div>` : `
        <div class="admin-trash-note">🗑 ${trashNote}</div>
        <div class="admin-app-actions">
          <button class="btn btn-navy admin-trash-restore-btn" data-appid="${app.id}">↩ Restore</button>
          <button class="btn btn-outline admin-trash-purge-btn" data-appid="${app.id}" style="color:#c0392b;border-color:#c0392b">🗑 Delete Permanently</button>
        </div>`}

        <!-- ── Inline Edit Panel (hidden until ✏️ Edit is clicked) ── -->
        <div class="admin-edit-panel" id="edit-panel-${app.id}" style="display:none">
          <div class="admin-edit-panel-title">✏️ Edit Profile — ${app.name}</div>
          <div class="admin-edit-grid">
            <div class="admin-edit-section">
              <div class="admin-edit-section-head">Personal Details</div>
              <div class="admin-edit-row"><label>Full Name</label><input class="form-input" id="ep-name-${app.id}" value="${escHtml(app.name||'')}" /></div>
              <div class="admin-edit-row"><label>Email</label><input class="form-input" type="email" id="ep-email-${app.id}" value="${escHtml(app.email||'')}" /></div>
              <div class="admin-edit-row"><label>Phone</label><input class="form-input" id="ep-phone-${app.id}" value="${escHtml(app.phone||'')}" /></div>
            </div>
            <div class="admin-edit-section">
              <div class="admin-edit-section-head">Location &amp; Service Area</div>
              <div class="admin-edit-row"><label>Primary Suburb</label><input class="form-input" id="ep-suburb-${app.id}" value="${escHtml(app.suburb||'')}" /></div>
              <div class="admin-edit-row"><label>State</label>
                <select class="form-input" id="ep-state-${app.id}">
                  ${['VIC','NSW','QLD','SA','WA','TAS','ACT','NT'].map(s=>`<option value="${s}" ${app.state===s?'selected':''}>${s}</option>`).join('')}
                </select>
              </div>
              <div class="admin-edit-row"><label>Travel Radius (km)</label>
                <select class="form-input" id="ep-radius-${app.id}">
                  ${[10,15,20,30,40,50,60,80,100].map(r=>`<option value="${r}" ${parseInt(app.radius)===r?'selected':''}>${r} km</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="admin-edit-section">
              <div class="admin-edit-section-head">Lesson Fees</div>
              <div class="admin-edit-row"><label>60-min fee ($)</label><input class="form-input" type="number" id="ep-fee60-${app.id}" value="${app.fee60||''}" min="0" /></div>
              <div class="admin-edit-row"><label>90-min fee ($) <span style="font-weight:400;color:var(--text-light)">(optional)</span></label><input class="form-input" type="number" id="ep-fee90-${app.id}" value="${app.fee90||''}" min="0" /></div>
              <div class="admin-edit-row"><label>120-min fee ($) <span style="font-weight:400;color:var(--text-light)">(optional)</span></label><input class="form-input" type="number" id="ep-fee120-${app.id}" value="${app.fee120||''}" min="0" /></div>
            </div>
            <div class="admin-edit-section">
              <div class="admin-edit-section-head">Vehicles</div>
              <div class="admin-edit-row"><label>Automatic vehicle</label><input class="form-input" id="ep-vauto-${app.id}" value="${escHtml(app.vAuto||'')}" placeholder="Make &amp; model" /></div>
              <div class="admin-edit-row"><label>Manual vehicle</label><input class="form-input" id="ep-vmanual-${app.id}" value="${escHtml(app.vManual||'')}" placeholder="Make &amp; model" /></div>
            </div>
            <div class="admin-edit-section">
              <div class="admin-edit-section-head">Credentials</div>
              <div class="admin-edit-row"><label>State Driving Instructor Authority Type</label>
                <select class="form-input" id="ep-dia-type-${app.id}">
                  <option value="">— select —</option>
                  <option value="VIC – Driving Instructor Authority (DIA)" ${app.diaType==='VIC – Driving Instructor Authority (DIA)'?'selected':''}>VIC – Driving Instructor Authority (DIA)</option>
                  <option value="NSW – Driving Instructor Licence" ${app.diaType==='NSW – Driving Instructor Licence'?'selected':''}>NSW – Driving Instructor Licence</option>
                  <option value="QLD – Driver Trainer Accreditation / Industry Authority" ${app.diaType==='QLD – Driver Trainer Accreditation / Industry Authority'?'selected':''}>QLD – Driver Trainer Accreditation / Industry Authority</option>
                  <option value="WA – Driving Instructor Licence" ${app.diaType==='WA – Driving Instructor Licence'?'selected':''}>WA – Driving Instructor Licence</option>
                  <option value="SA – Motor Driving Instructor Licence" ${app.diaType==='SA – Motor Driving Instructor Licence'?'selected':''}>SA – Motor Driving Instructor Licence</option>
                  <option value="TAS – Driving Instructor Accreditation" ${app.diaType==='TAS – Driving Instructor Accreditation'?'selected':''}>TAS – Driving Instructor Accreditation</option>
                  <option value="ACT – Driving Instructor Accreditation" ${app.diaType==='ACT – Driving Instructor Accreditation'?'selected':''}>ACT – Driving Instructor Accreditation</option>
                  <option value="NT – Driving Instructor Accreditation" ${app.diaType==='NT – Driving Instructor Accreditation'?'selected':''}>NT – Driving Instructor Accreditation</option>
                </select>
              </div>
              <div class="admin-edit-row"><label>Authority / Licence Number</label><input class="form-input" id="ep-dia-${app.id}" value="${escHtml(app.dia||'')}" /></div>
              <div class="admin-edit-row"><label>Child Safety Clearance Type <span style="font-weight:400;color:var(--text-light)">(optional)</span></label>
                <select class="form-input" id="ep-wwcc-type-${app.id}">
                  <option value="">— select —</option>
                  <option value="Working With Children Check (WWCC)" ${app.wwccType==='Working With Children Check (WWCC)'?'selected':''}>VIC / NSW / WA / SA – Working With Children Check (WWCC)</option>
                  <option value="Blue Card" ${app.wwccType==='Blue Card'?'selected':''}>QLD – Blue Card</option>
                  <option value="Working With Vulnerable People Check" ${app.wwccType==='Working With Vulnerable People Check'?'selected':''}>ACT / TAS – Working With Vulnerable People Check</option>
                  <option value="Ochre Card" ${app.wwccType==='Ochre Card'?'selected':''}>NT – Ochre Card</option>
                </select>
              </div>
              <div class="admin-edit-row"><label>Clearance Number <span style="font-weight:400;color:var(--text-light)">(optional)</span></label><input class="form-input" id="ep-wwcc-${app.id}" value="${escHtml(app.wwcc||'')}" /></div>
              <div class="admin-edit-row admin-edit-row-check">
                <label><input type="checkbox" id="ep-cred-dia-${app.id}" ${app.credentials?.dia==='provided'||app.credentials?.dia==='verified'?'checked':''} /> Mark State Driving Instructor Authority as Provided</label>
                <label><input type="checkbox" id="ep-cred-wwcc-${app.id}" ${app.credentials?.wwcc==='provided'||app.credentials?.wwcc==='verified'?'checked':''} /> Mark Child Safety Clearance as Provided</label>
                <small class="form-hint">Ticked = shows "Provided" on live profile. Unticked = shows "Not Provided".</small>
              </div>
            </div>
            <div class="admin-edit-section">
              <div class="admin-edit-section-head">Contact / Enquiry</div>
              <div class="admin-edit-row">
                <span class="admin-edit-hint" style="display:block;margin-bottom:6px">Student enquiries are forwarded automatically to the <strong>Email</strong> entered above in Personal Details — no per-instructor key needed.</span>
              </div>
              <div class="admin-edit-row admin-edit-row-check">
                <label><input type="checkbox" id="ep-unavailable-${app.id}" ${app.contactUnavailable?'checked':''} /> Mark enquiry as unavailable (hides Send Enquiry button on profile)</label>
              </div>
            </div>
          </div>

          <div class="admin-edit-section" style="margin-top:0">
            <div class="admin-edit-section-head">Languages Spoken</div>
            <div class="admin-edit-checks" id="ep-languages-${app.id}">
              <div class="admin-edit-tag-grid">
                ${LANGUAGE_OPTIONS.map(l=>`<label class="join-toggle-label"><input type="checkbox" value="${l}" ${(app.languages||[]).includes(l)?'checked':''}/><span>${l}</span></label>`).join('')}
              </div>
            </div>
            <input class="form-input" style="margin-top:8px" id="ep-lang-other-${app.id}" value="${escHtml((app.languages||[]).find(l=>!LANGUAGE_OPTIONS.includes(l))||'')}" placeholder="Other language (if not listed above)" />
          </div>

          <div class="admin-edit-section" style="margin-top:0">
            <div class="admin-edit-section-head">Availability</div>
            <div class="admin-edit-avail">
              ${['Weekdays (Mon–Fri)','Saturday','Sunday'].map(d=>`
                <label class="join-toggle-label"><input type="checkbox" class="ep-avail-day-${app.id}" value="${d}" ${(app.availDays||[]).includes(d)?'checked':''}/><span>${d}</span></label>`).join('')}
              ${['Morning (8am–12pm)','Afternoon (12pm–5pm)','Evening (5pm–8pm)'].map(t=>`
                <label class="join-toggle-label"><input type="checkbox" class="ep-avail-time-${app.id}" value="${t}" ${(app.availTimes||[]).includes(t)?'checked':''}/><span>${t}</span></label>`).join('')}
            </div>
            <input class="form-input" style="margin-top:8px" id="ep-availnote-${app.id}" value="${escHtml(app.availSpecific||'')}" placeholder="Additional availability notes (optional)" />
          </div>

          <div class="admin-edit-section" style="margin-top:16px">
            <div class="admin-edit-section-head">Teaching Approach <span style="font-weight:400;font-size:12px;color:var(--text-light)">(select 2–3)</span></div>
            <div class="admin-edit-checks" id="ep-teaching-${app.id}">
              ${TEACHING_APPROACH_CATEGORIES.map(g=>`
                <p class="expertise-group-head" style="font-size:12px;margin:8px 0 4px">${g.group}</p>
                <div class="admin-edit-tag-grid">
                ${g.items.map(item=>`<label class="join-toggle-label"><input type="checkbox" value="${item.id}" ${(app.teachingApproachIds||[]).includes(item.id)?'checked':''}/><span>${item.label}</span></label>`).join('')}
                </div>`).join('')}
            </div>
          </div>

          <div class="admin-edit-section" style="margin-top:16px">
            <div class="admin-edit-section-head">Areas of Expertise <span style="font-weight:400;font-size:12px;color:var(--text-light)">(select 3–5)</span></div>
            <div class="admin-edit-checks" id="ep-expertise-${app.id}">
              ${EXPERTISE_CATEGORIES.map(g=>`
                <p class="expertise-group-head" style="font-size:12px;margin:8px 0 4px">${g.group}</p>
                <div class="admin-edit-tag-grid">
                ${g.items.map(item=>`<label class="join-toggle-label"><input type="checkbox" value="${item.id}" ${(app.expertiseIds||[]).includes(item.id)?'checked':''}/><span>${item.label}</span></label>`).join('')}
                </div>`).join('')}
            </div>
          </div>

          <div class="admin-edit-section" style="margin-top:16px">
            <div class="admin-edit-section-head">Bio / About</div>
            <textarea class="form-input" id="ep-bio-${app.id}" style="min-height:120px">${escHtml(app.bio||'')}</textarea>
          </div>

          <div class="admin-edit-section" style="margin-top:16px">
            <div class="admin-edit-section-head">Photo</div>
            ${app.photoDataUrl ? `<img src="${app.photoDataUrl}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;display:block;margin-bottom:10px" alt="Current photo" />` : '<p style="font-size:13px;color:var(--text-light);margin-bottom:8px">No photo uploaded.</p>'}
            <label style="font-size:13px;color:var(--text-dark);display:block;margin-bottom:4px">Replace photo <span style="font-weight:400;color:var(--text-light)">(JPG/PNG, max 5 MB)</span></label>
            <input type="file" class="form-input" id="ep-photo-${app.id}" accept="image/jpeg,image/png,image/webp" style="padding:6px" />
          </div>

          <div class="admin-edit-actions">
            <button class="btn btn-navy admin-edit-save-btn" data-appid="${app.id}" data-status="${app.status}" data-notify="1">💾 Save Changes</button>
            <button class="btn btn-outline admin-edit-silent-btn" data-appid="${app.id}" data-status="${app.status}">🔕 Admin Update</button>
            <button class="btn btn-outline admin-edit-cancel-btn" data-appid="${app.id}">Cancel</button>
            <span class="admin-edit-saved-msg" id="edit-saved-${app.id}" style="display:none;color:#38a169;font-size:13px;font-weight:600">✓ Saved!</span>
          </div>
        </div>
      </div>`;
  }

  const noneMsg      = `<div class="admin-empty">No applications yet. They'll appear here when instructors submit the join form.</div>`;
  const noneRejected = `<div class="admin-empty">Rejected applications will appear here.</div>`;
  const noneTrash    = `<div class="admin-empty">Trash is empty. Deleted records appear here and stay until permanently removed.</div>`;

  return `
    <div class="admin-page">
      <div class="admin-page-header">
        <h1>Admin — Instructor Applications</h1>
        <p>Signed in as ${auth.currentUser.email}. Applications submitted via the Join the Network form, synced live from any device.</p>
        <button class="btn btn-outline" id="admin-signout-btn" style="margin-top:10px">Sign Out</button>
      </div>

      <div class="admin-tabs" id="admin-tabs">
        <button class="admin-tab active" data-tab="pending">Pending <span class="admin-tab-count">${pending.length}</span></button>
        <button class="admin-tab" data-tab="approved">Approved <span class="admin-tab-count">${approved.length}</span></button>
        <button class="admin-tab" data-tab="rejected">Rejected <span class="admin-tab-count">${rejected.length}</span></button>
        <button class="admin-tab" data-tab="trash">🗑 Trash <span class="admin-tab-count">${trashed.length}</span></button>
      </div>

      <div class="admin-tab-panel" id="admin-panel-pending">
        ${pending.length ? pending.map(appCard).join('') : noneMsg}
      </div>
      <div class="admin-tab-panel" id="admin-panel-approved" style="display:none">
        ${approved.length ? approved.map(appCard).join('') : noneMsg}
      </div>
      <div class="admin-tab-panel" id="admin-panel-rejected" style="display:none">
        ${rejected.length ? rejected.map(appCard).join('') : noneRejected}
      </div>
      <div class="admin-tab-panel" id="admin-panel-trash" style="display:none">
        ${trashed.length ? trashed.map(appCard).join('') : noneTrash}
      </div>

      <div class="admin-footer-note">
        <p>💡 <strong>How it works:</strong> Click <em>Approve &amp; Publish Live</em> to instantly publish an instructor's profile on the live website — no manual copy-paste needed. Applications and live profiles are stored in a shared cloud database, so this admin panel works the same from any device once you're signed in.</p>
        <p>🗑 <strong>Trash:</strong> "Move to Trash" takes a record (and its live profile, if any) off the site but keeps it recoverable. Restore it any time, or delete it permanently from the Trash tab. Records stay in Trash indefinitely until you remove them.</p>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0">
          <p style="margin-bottom:8px">📍 <strong>Search distance not working?</strong> Use this to geocode all live profiles that are missing coordinates.</p>
          <button class="btn btn-navy" id="admin-geocode-all-btn" style="font-size:0.85rem;padding:8px 16px">Fix Search Coordinates for All Profiles</button>
          <span id="admin-geocode-status" style="margin-left:12px;font-size:0.85rem;color:#4a5568"></span>
        </div>
      </div>
    </div>`;
}

function renderPendingProfile(app) {
  const initials   = app.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const expYears   = app.exp ? (new Date().getFullYear() - parseInt(app.exp)) : 0;
  const expLabel   = formatExperienceLabel(expYears);
  const expertise  = resolveExpertise(app.expertiseIds || []);
  const teachingApproach = resolveTeachingApproach(app.teachingApproachIds || []);
  const transmission = [app.vAuto ? 'Automatic' : '', app.vManual ? 'Manual' : ''].filter(Boolean).join(' & ') || 'Automatic';
  const avail      = (app.availDays||[]).join(' / ') || '(not specified)';

  const feesHTML = [
    `<div class="qs-item"><div class="qs-item-label">60 min lesson</div><div class="qs-item-value">$${app.fee60}</div></div>`,
    app.fee90 ? `<div class="qs-item"><div class="qs-item-label">90 min lesson</div><div class="qs-item-value">$${app.fee90}</div></div>` : '',
    app.fee120 ? `<div class="qs-item"><div class="qs-item-label">120 min lesson</div><div class="qs-item-value">$${app.fee120}</div></div>` : ''
  ].join('');

  const vehiclesHTML = [
    app.vAuto   ? `<div class="qs-item"><div class="qs-item-label">Automatic</div><div class="qs-item-value">${app.vAuto}</div></div>`   : '',
    app.vManual ? `<div class="qs-item"><div class="qs-item-label">Manual</div><div class="qs-item-value">${app.vManual}</div></div>` : ''
  ].join('');

  return `
    <div class="profile-card-wrap">
      <div class="profile-header-row">
        ${app.photoDataUrl
          ? `<img src="${app.photoDataUrl}" alt="${app.name}" class="profile-photo" style="width:80px;height:80px;border-radius:50%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><div class="profile-avatar-circle" style="width:80px;height:80px;font-size:28px;display:none">${initials}</div>`
          : `<div class="profile-avatar-circle" style="width:80px;height:80px;font-size:28px">${initials}</div>`
        }
        <div>
          <div class="profile-name" style="font-size:22px">${app.name}</div>
          <div class="profile-title">Professional Driving Instructor</div>
          <div class="profile-location">${ICONS.pin} <span class="profile-loc-stack">${cleanSuburb(app.suburb)}${app.state ? ', ' + app.state : ''}<br><span class="profile-loc-suburbs">Surrounding Suburbs</span></span></div>
        </div>
      </div>
      <div class="quick-summary" style="margin-top:20px">
        <div class="qs-title">Instructor Profile</div>
        <div class="qs-grid">
          <div class="qs-item"><div class="qs-item-label">Service Area</div><div class="qs-item-value">Based in ${cleanSuburb(app.suburb)}${app.state ? ', ' + app.state : ''}</div></div>
          <div class="qs-item"><div class="qs-item-label">Travel Radius</div><div class="qs-item-value">Up to ${app.radius} km<div class="qs-travel-note">Travel outside service area may be available by arrangement (additional fee may apply).</div></div></div>
          <div class="qs-item"><div class="qs-item-label">Transmission</div><div class="qs-item-value">${transmission}</div></div>
          <div class="qs-item"><div class="qs-item-label">Experience</div><div class="qs-item-value">${expLabel}</div></div>
          <div class="qs-item"><div class="qs-item-label">Availability</div><div class="qs-item-value">${avail}</div>${(app.availTimes||[]).length ? `<div class="qs-avail-times">${app.availTimes.map(t=>`<div class="qs-avail-time">${t}</div>`).join('')}</div>` : ''}${app.availSpecific ? `<div class="qs-item-value qs-travel-note">${app.availSpecific}</div>` : ''}</div>
          <div class="qs-item">
            <div class="qs-item-label">Credentials</div>
            <div class="cred-row"><span class="cred-label">State Driving Instructor Authority</span>${credTagHTML(app.credentials?.dia || credStatus(false, app.dia))}</div>
            <div class="cred-row"><span class="cred-label">Child Safety Clearance</span>${credTagHTML(app.credentials?.wwcc || credStatus(false, app.wwcc))}</div>
          </div>
          ${feesHTML}
          ${vehiclesHTML}
          ${app.languages && app.languages.length ? `<div class="qs-item"><div class="qs-item-label">Languages</div><div class="qs-item-value">${app.languages.join(', ')}</div></div>` : ''}
        </div>
      </div>
      ${app.bio ? `<div class="profile-about" style="margin-top:20px"><div class="profile-about-inner"><h2>About ${app.name}</h2><p>${app.bio}</p></div></div>` : ''}
      ${teachingApproach.length ? `
        <div class="profile-expertise-wrap" style="margin-top:20px;padding:20px;background:var(--off-white);border-radius:var(--radius)">
          <h3 style="font-size:15px;margin-bottom:14px;color:var(--text-dark)">Teaching Approach</h3>
          <div class="expertise-tags">${teachingApproach.map(e=>`<span class="expertise-tag">${e}</span>`).join('')}</div>
        </div>` : ''}
      ${expertise.length ? `
        <div class="profile-expertise-wrap" style="margin-top:20px;padding:20px;background:var(--off-white);border-radius:var(--radius)">
          <h3 style="font-size:15px;margin-bottom:14px;color:var(--text-dark)">Areas of Expertise</h3>
          <div class="expertise-tags">${expertise.map(e=>`<span class="expertise-tag">${e}</span>`).join('')}</div>
        </div>` : ''}
    </div>`;
}

function credStatus(adminProvided, value) {
  if (adminProvided) return 'provided';
  return 'not_provided';
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function cleanSuburb(str) {
  if (!str) return str;
  return String(str)
    .replace(/[\s,-]*\b\d{4}\b\s*$/, '')
    .trim();
}

function locationLabel(inst) {
  const suburb = cleanSuburb(inst.baseSuburb || inst.suburb || '');
  const state  = inst.state || '';
  const pc     = inst.basePostcode || '';
  let label = suburb;
  if (state) label += ', ' + state;
  if (pc)    label += ' ' + pc;
  return label;
}

function bindAdminEvents() {

  const keyBtn = document.getElementById('admin-key-btn');
  if (keyBtn) {
    const doUnlock = () => {
      const email = document.getElementById('admin-email-input').value.trim();
      const pass  = document.getElementById('admin-pass-input').value;
      keyBtn.disabled = true; keyBtn.textContent = 'Signing in…';
      auth.signInWithEmailAndPassword(email, pass)
        .then(() => navigate('admin'))
        .catch(() => {
          keyBtn.disabled = false; keyBtn.textContent = 'Sign In';
          document.getElementById('admin-key-error').style.display = 'block';
        });
    };
    keyBtn.addEventListener('click', doUnlock);
    document.getElementById('admin-pass-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') doUnlock(); });
    return;
  }

  const signOutBtn = document.getElementById('admin-signout-btn');
  if (signOutBtn) signOutBtn.addEventListener('click', () => auth.signOut().then(() => navigate('admin')));

  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-tab-panel').forEach(p => p.style.display = 'none');
      tab.classList.add('active');
      document.getElementById('admin-panel-' + tab.dataset.tab).style.display = 'block';
    });
  });

  document.querySelectorAll('.admin-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = document.getElementById(btn.dataset.copy);
      if (!pre) return;
      navigator.clipboard.writeText(pre.textContent).then(() => {
        const orig = btn.textContent; btn.textContent = '✓ Copied!'; btn.disabled = true;
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2500);
      });
    });
  });

  document.querySelectorAll('.admin-view-live-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate('profile', btn.dataset.slug));
  });

  document.querySelectorAll('.admin-approve-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const appId = btn.dataset.appid;
      btn.disabled = true; btn.textContent = 'Publishing…';

      db.collection('applications').doc(appId).get().then(async doc => {
        if (!doc.exists) return;
        const app = doc.data();
        const { idSlug, liveProfile } = buildLiveProfileFromApp(app, appId);

        try {
          const geo = await geocodeSuburb(app.suburb || '');
          if (geo) {
            liveProfile.baseLat = geo.lat;
            liveProfile.baseLng = geo.lng;
            if (geo.postcode) liveProfile.basePostcode = geo.postcode;
          }
        } catch(e) {  }

        return Promise.all([
          db.collection('applications').doc(appId).update({ status: 'approved' }),
          db.collection('live_profiles').doc(idSlug).set(liveProfile),

          db.collection('instructor_contacts').doc(idSlug).set({
            email: app.email || '',
            phone: app.phone || '',
          })
        ]).then(() => {
          showToast('✅ ' + app.name + ' is now live on the website!');
          setTimeout(() => navigate('admin'), 400);
        });
      }).catch(err => {
        console.error('Approve failed:', err);
        showToast('Could not publish this profile. Please try again.');
        btn.disabled = false; btn.textContent = '✓ Approve & Publish Live';
      });
    });
  });

  document.querySelectorAll('.admin-reject-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Reject this application? If already approved, the profile will be removed from the site.')) return;
      const appId = btn.dataset.appid;
      btn.disabled = true;
      db.collection('applications').doc(appId).update({ status: 'rejected' })
        .then(() => {

          return db.collection('live_profiles').where('_fromApp', '==', appId).get();
        })
        .then(snap => Promise.all(snap.docs.map(d => d.ref.delete())))
        .then(() => navigate('admin'))
        .catch(err => { console.error('Reject failed:', err); showToast('Could not reject this application.'); btn.disabled = false; });
    });
  });

  document.querySelectorAll('.admin-restore-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const appId = btn.dataset.appid;
      btn.disabled = true;
      db.collection('applications').doc(appId).update({ status: 'pending' })
        .then(() => navigate('admin'))
        .catch(err => { console.error('Restore failed:', err); showToast('Could not restore this application.'); btn.disabled = false; });
    });
  });

  document.querySelectorAll('.admin-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const appId = btn.dataset.appid;
      const panel = document.getElementById('edit-panel-' + appId);
      if (!panel) return;
      const isOpen = panel.style.display !== 'none';
      panel.style.display = isOpen ? 'none' : 'block';
      btn.textContent = isOpen ? '✏️ Edit Profile' : '✖ Close Editor';
      if (!isOpen) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  document.querySelectorAll('.admin-edit-cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const appId = btn.dataset.appid;
      const panel = document.getElementById('edit-panel-' + appId);
      if (panel) panel.style.display = 'none';
      const editBtn = document.querySelector(`.admin-edit-btn[data-appid="${appId}"]`);
      if (editBtn) editBtn.textContent = '✏️ Edit Profile';
    });
  });

  function handleAdminSave(btn, sendEmail) {
      const appId  = btn.dataset.appid;
      const status = btn.dataset.status;
      btn.disabled = true;
      btn.textContent = '💾 Saving…';

      const v  = id => (document.getElementById(id)?.value || '').trim();
      const cb = id => document.getElementById(id)?.checked || false;
      const chks = cls => [...document.querySelectorAll('.' + cls)].filter(c=>c.checked).map(c=>c.value);

      const name     = v(`ep-name-${appId}`);
      const email    = v(`ep-email-${appId}`);
      const phone    = v(`ep-phone-${appId}`);
      const suburb   = cleanSuburb(v(`ep-suburb-${appId}`));
      const state    = v(`ep-state-${appId}`);
      const radius   = parseInt(v(`ep-radius-${appId}`)) || 10;
      const fee60    = v(`ep-fee60-${appId}`);
      const fee90    = v(`ep-fee90-${appId}`);
      const fee120   = v(`ep-fee120-${appId}`);
      const vAuto    = v(`ep-vauto-${appId}`);
      const vManual  = v(`ep-vmanual-${appId}`);
      const dia      = v(`ep-dia-${appId}`);
      const diaType  = v(`ep-dia-type-${appId}`);
      const wwcc     = v(`ep-wwcc-${appId}`);
      const wwccType = v(`ep-wwcc-type-${appId}`);
      const credDia  = cb(`ep-cred-dia-${appId}`);
      const credWwcc = cb(`ep-cred-wwcc-${appId}`);
      const unavail  = cb(`ep-unavailable-${appId}`);
      const bio      = (document.getElementById(`ep-bio-${appId}`)?.value || '').trim();
      const availNote= v(`ep-availnote-${appId}`);
      const availDays  = chks(`ep-avail-day-${appId}`);
      const availTimes = chks(`ep-avail-time-${appId}`);
      const teachingApproachIds = [...document.querySelectorAll(`#ep-teaching-${appId} input:checked`)].map(c=>c.value);
      const expertiseIds        = [...document.querySelectorAll(`#ep-expertise-${appId} input:checked`)].map(c=>c.value);
      const languages = [...document.querySelectorAll(`#ep-languages-${appId} input:checked`)].map(c=>c.value);
      const langOther = v(`ep-lang-other-${appId}`);
      if (langOther) languages.push(langOther);

      const updates = {
        name, email, phone, suburb, state, radius,
        fee60, fee90, fee120, vAuto, vManual, dia, diaType, wwcc, wwccType,
        credentials: { dia: credStatus(credDia, dia), diaType, wwcc: credStatus(credWwcc, wwcc), wwccType },
        contactUnavailable: unavail,
        bio, availDays, availTimes, availSpecific: availNote,
        teachingApproachIds, expertiseIds, languages,
      };

      const idSlug     = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      const initials   = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
      const availLabel = availDays.join(' / ') || 'Contact instructor';
      const feesArr    = [{ duration: '60 min', price: '$' + fee60 }];
      if (fee90) feesArr.push({ duration: '90 min', price: '$' + fee90 });
      if (fee120) feesArr.push({ duration: '120 min', price: '$' + fee120 });
      const vehiclesArr = [];
      if (vAuto)   vehiclesArr.push({ type: 'Auto',   car: vAuto });
      if (vManual) vehiclesArr.push({ type: 'Manual', car: vManual });
      const transmission = [vAuto ? 'Automatic' : '', vManual ? 'Manual' : ''].filter(Boolean).join(' & ') || 'Automatic';

      const photoInput = document.getElementById(`ep-photo-${appId}`);
      const photoFile  = photoInput?.files?.[0] || null;

      async function doSave(photoDataUrl) {
        if (photoDataUrl !== undefined) updates.photoDataUrl = photoDataUrl;

        const writes = [db.collection('applications').doc(appId).update(updates)];

        writes.push(db.collection('instructor_contacts').doc(idSlug).set({ email, phone }, { merge: true }));

        if (status === 'approved') {
          const liveUpdates = {
            name, initials,
            baseSuburb: suburb, state,
            serviceRadius: radius,
            location: '<span class="profile-loc-stack">' + suburb + (state ? ', ' + state : '') + '<br><span class="profile-loc-suburbs">Surrounding Suburbs</span></span>',
            availability: availLabel,
            availabilityTimes: availTimes,
            availabilityNote: availNote,
            lessonFees: feesArr,
            vehicles: vehiclesArr,
            transmission,
            bio, teachingApproachIds, expertiseIds, languages,
            credentials: { dia: credStatus(credDia, dia), diaType, wwcc: credStatus(credWwcc, wwcc), wwccType },
            contactUnavailable: unavail,
            notifyInstructor: sendEmail,
          };
          if (photoDataUrl !== undefined) liveUpdates.photoDataUrl = photoDataUrl;

          try {
            const geo = await geocodeSuburb(suburb || '');
            if (geo) {
              liveUpdates.baseLat = geo.lat;
              liveUpdates.baseLng = geo.lng;
              if (geo.postcode) liveUpdates.basePostcode = geo.postcode;
            }
          } catch(e) {  }

          writes.push(
            db.collection('live_profiles').where('_fromApp', '==', appId).get()
              .then(snap => {
                if (!snap.empty) {
                  return Promise.all(snap.docs.map(d => d.ref.update(liveUpdates)));
                }
              })
          );
        }

        Promise.all(writes)
          .then(() => {
            btn.disabled = false;
            btn.textContent = sendEmail ? '💾 Save Changes' : '🔕 Admin Update';
            const msg = document.getElementById('edit-saved-' + appId);
            if (msg) { msg.style.display = 'inline'; setTimeout(() => msg.style.display = 'none', 3000); }
            showToast('✅ Profile updated successfully.' + (sendEmail ? ' Notification email sent.' : ''));
          })
          .catch(err => {
            console.error('Edit save failed:', err);
            btn.disabled = false;
            btn.textContent = sendEmail ? '💾 Save Changes' : '🔕 Admin Update';
            showToast('Could not save changes. Please try again.');
          });
      }

      if (photoFile) {
        if (photoFile.size > 5 * 1024 * 1024) {
          showToast('Photo exceeds 5 MB. Please choose a smaller image.');
          btn.disabled = false;
          btn.textContent = sendEmail ? '💾 Save Changes' : '🔕 Admin Update';
          return;
        }
        const reader = new FileReader();
        reader.onload = ev => {
          const img = new Image();
          img.onload = () => {
            const MAX = 400;
            let w = img.width, h = img.height;
            if (w > MAX || h > MAX) {
              if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
              else       { w = Math.round(w * MAX / h); h = MAX; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            doSave(canvas.toDataURL('image/jpeg', 0.82));
          };
          img.onerror = () => doSave(undefined);
          img.src = ev.target.result;
        };
        reader.onerror = () => doSave(undefined);
        reader.readAsDataURL(photoFile);
      } else {
        doSave(undefined);
      }
  }

  document.querySelectorAll('.admin-edit-save-btn').forEach(btn => {
    btn.onclick = () => handleAdminSave(btn, true);
  });

  document.querySelectorAll('.admin-edit-silent-btn').forEach(btn => {
    btn.onclick = () => handleAdminSave(btn, false);
  });
  document.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Move this record to Trash? If it has a live profile, that will come off the site too. Trashed records are kept for 24 hours and can be restored, or permanently deleted from the Trash tab.')) return;
      const appId = btn.dataset.appid;
      btn.disabled = true;
      db.collection('applications').doc(appId).get().then(doc => {
        if (!doc.exists) return;
        const prevStatus = doc.data().status;
        return db.collection('applications').doc(appId).update({
          status: 'trashed',
          prevStatus: prevStatus,
          trashedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {

          return db.collection('live_profiles').where('_fromApp', '==', appId).get();
        }).then(snap => Promise.all(snap.docs.map(d => d.ref.delete())));
      })
      .then(() => navigate('admin'))
      .catch(err => { console.error('Move to trash failed:', err); showToast('Could not move this record to trash.'); btn.disabled = false; });
    });
  });

  document.querySelectorAll('.admin-trash-restore-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const appId = btn.dataset.appid;
      btn.disabled = true;
      db.collection('applications').doc(appId).get().then(async doc => {
        if (!doc.exists) return;
        const app = doc.data();
        const restoredStatus = app.prevStatus || 'pending';
        const updatePromise = db.collection('applications').doc(appId).update({
          status: restoredStatus,
          prevStatus: firebase.firestore.FieldValue.delete(),
          trashedAt: firebase.firestore.FieldValue.delete()
        });
        if (restoredStatus === 'approved') {
          const { idSlug, liveProfile } = buildLiveProfileFromApp(app, appId);

          try {
            const geo = await geocodeSuburb(app.suburb || '');
            if (geo) {
              liveProfile.baseLat = geo.lat;
              liveProfile.baseLng = geo.lng;
              if (geo.postcode) liveProfile.basePostcode = geo.postcode;
            }
          } catch(e) {  }
          return Promise.all([updatePromise, db.collection('live_profiles').doc(idSlug).set(liveProfile)]);
        }
        return updatePromise;
      })
      .then(() => { showToast('↩ Restored from trash.'); navigate('admin'); })
      .catch(err => { console.error('Restore from trash failed:', err); showToast('Could not restore this record.'); btn.disabled = false; });
    });
  });

  document.querySelectorAll('.admin-trash-purge-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Permanently delete this record? This cannot be undone.')) return;
      const appId = btn.dataset.appid;
      btn.disabled = true;
      Promise.all([
        db.collection('applications').doc(appId).delete(),
        db.collection('live_profiles').where('_fromApp', '==', appId).get()
          .then(snap => Promise.all(snap.docs.map(d => d.ref.delete())))
      ])
      .then(() => navigate('admin'))
      .catch(err => { console.error('Permanent delete failed:', err); showToast('Could not permanently delete this record.'); btn.disabled = false; });
    });
  });

  const geocodeAllBtn = document.getElementById('admin-geocode-all-btn');
  if (geocodeAllBtn) {
    geocodeAllBtn.addEventListener('click', async () => {
      geocodeAllBtn.disabled = true;
      const statusEl = document.getElementById('admin-geocode-status');
      statusEl.textContent = 'Loading profiles…';
      try {
        const snap = await db.collection('live_profiles').get();
        const docs = snap.docs;
        const missing = docs.filter(d => { const v = d.data(); return !v.baseLat || !v.baseLng || !v.basePostcode; });
        if (!missing.length) {
          statusEl.textContent = '✅ All profiles already have coordinates!';
          geocodeAllBtn.disabled = false;
          return;
        }
        statusEl.textContent = `Found ${missing.length} profile(s) without coordinates. Geocoding…`;
        let done = 0, failed = 0;
        for (const docSnap of missing) {
          const data = docSnap.data();
          const suburb = data.baseSuburb || '';
          try {

            await new Promise(r => setTimeout(r, 1100));
            const geo = await geocodeSuburb(suburb);
            if (geo) {
              const update = { baseLat: geo.lat, baseLng: geo.lng };
              if (geo.postcode) update.basePostcode = geo.postcode;
              await docSnap.ref.update(update);
              done++;
            } else {
              failed++;
            }
          } catch(e) {
            failed++;
          }
          statusEl.textContent = `Geocoding… ${done + failed} / ${missing.length} done`;
        }
        statusEl.textContent = `✅ Done! ${done} fixed, ${failed} could not be geocoded.`;
      } catch(e) {
        console.error('Geocode-all failed:', e);
        statusEl.textContent = '❌ Error — check the console.';
      }
      geocodeAllBtn.disabled = false;
    });
  }
}

function renderStatsPage() {
  const callData    = getCallStats();
  const enquiryData = (function(){ try { const r=localStorage.getItem('pdin_enquiries'); return r?JSON.parse(r):{};} catch(e){return {};} })();
  const allIds      = [...new Set([...Object.keys(callData), ...Object.keys(enquiryData), ...getAllInstructors().map(i=>i.id)])];

  let totalCalls = 0, totalEnquiries = 0;
  allIds.forEach(id => {
    totalCalls     += (callData[id]?.count    || 0);
    totalEnquiries += (enquiryData[id]?.count || 0);
  });

  const rows = allIds.map(id => {
    const inst      = getAllInstructors().find(i => i.id === id);
    const calls     = callData[id]?.count    || 0;
    const enqs      = enquiryData[id]?.count || 0;
    const lastCall  = callData[id]?.lastDate    ? new Date(callData[id].lastDate).toLocaleString('en-AU',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
    const lastEnq   = enquiryData[id]?.lastDate ? new Date(enquiryData[id].lastDate).toLocaleString('en-AU',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';

    const callHistory = callData[id]?.history || [];
    const now         = Date.now();
    const callDays    = Array.from({length:7}, (_,i) => {
      const dayStart = now - (6-i)*86400000;
      const dayEnd   = dayStart + 86400000;
      return callHistory.filter(d => { const t=new Date(d).getTime(); return t>=dayStart && t<dayEnd; }).length;
    });
    const maxCallDay  = Math.max(...callDays, 1);
    const callBars    = callDays.map(v => {
      const h = Math.round((v/maxCallDay)*28);
      return `<div class="spark-bar" style="height:${Math.max(h,2)}px" title="${v} call${v!==1?'s':''}"></div>`;
    }).join('');

    const enqHistory = enquiryData[id]?.history || [];
    const enqDays    = Array.from({length:7}, (_,i) => {
      const dayStart = now - (6-i)*86400000;
      const dayEnd   = dayStart + 86400000;
      return enqHistory.filter(d => { const t=new Date(d).getTime(); return t>=dayStart && t<dayEnd; }).length;
    });
    const maxEnqDay  = Math.max(...enqDays, 1);
    const enqBars    = enqDays.map(v => {
      const h = Math.round((v/maxEnqDay)*28);
      return `<div class="spark-bar spark-bar-gold" style="height:${Math.max(h,2)}px" title="${v} enquir${v!==1?'ies':'y'}"></div>`;
    }).join('');

    return `
      <tr>
        <td class="stats-name-cell">
          <div class="stats-avatar">${inst?.initials||id.slice(0,2).toUpperCase()}</div>
          <div>
            <div class="stats-inst-name">${inst?.name||id}</div>
            <div class="stats-inst-sub">${inst?.baseSuburb||''}</div>
          </div>
        </td>
        <td class="stats-num calls-num">${calls}</td>
        <td class="stats-num enq-num">${enqs}</td>
        <td class="stats-spark"><div class="sparkline">${callBars}</div><div class="spark-label">Calls 7d</div></td>
        <td class="stats-spark"><div class="sparkline">${enqBars}</div><div class="spark-label">Enquiries 7d</div></td>
        <td class="stats-last">${lastCall}</td>
        <td class="stats-last">${lastEnq}</td>
      </tr>`;
  }).join('');

  return `
    <section class="stats-page">
      <div class="stats-header">
        <h1 class="stats-title">Call &amp; Enquiry Stats</h1>
        <p class="stats-sub">Recorded from this browser's local storage. Data is per-device.</p>
      </div>
      <div class="stats-summary-row">
        <div class="stats-summary-card">
          <div class="stats-summary-num">${totalCalls}</div>
          <div class="stats-summary-label">Total Calls</div>
        </div>
        <div class="stats-summary-card">
          <div class="stats-summary-num">${totalEnquiries}</div>
          <div class="stats-summary-label">Total Enquiries</div>
        </div>
        <div class="stats-summary-card">
          <div class="stats-summary-num">${allIds.length}</div>
          <div class="stats-summary-label">Instructors</div>
        </div>
      </div>
      <div class="stats-table-wrap">
        <table class="stats-table">
          <thead>
            <tr>
              <th>Instructor</th>
              <th>Calls</th>
              <th>Enquiries</th>
              <th>Calls (last 7 days)</th>
              <th>Enquiries (last 7 days)</th>
              <th>Last Call</th>
              <th>Last Enquiry</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="stats-actions">
        <button class="btn btn-outline" onclick="if(confirm('Clear all call records?')){localStorage.removeItem('pdin_calls');navigate('stats');}">Clear Call Records</button>
        <button class="btn btn-outline" onclick="if(confirm('Clear all enquiry records?')){localStorage.removeItem('pdin_enquiries');navigate('stats');}">Clear Enquiry Records</button>
      </div>
      <p class="stats-note">Navigate here anytime via <code>#stats</code> in the URL.</p>
    </section>`;
}

const SEO_META = {
  home: {
    title: 'Professional Driving Instructors Network | Find a Driving Instructor in Melbourne',
    desc:  'PDIN is a Melbourne-founded platform connecting learner drivers with qualified professional instructors across Australia, with transparent profiles and teaching styles.',
  },
  find: {
    title: 'Find a Driving Instructor in Melbourne | PDIN Directory',
    desc:  'Browse and search our directory of qualified driving instructors across Melbourne. Filter by suburb, transmission type and specialty. Connect directly with your instructor.',
  },
  join: {
    title: 'Join the Driving Instructors Network | Apply to List Your Profile',
    desc:  'Are you a professional driving instructor in Melbourne? Join PDIN for free — keep 100% of your fees, get discovered by new students, and build your professional profile.',
  },
  about: {
    title: 'About PDIN | Professional Driving Instructors Network Melbourne',
    desc:  'Learn about the Professional Driving Instructors Network — a quality-focused directory connecting learner drivers with experienced, independent driving instructors across Australia.',
  },
  pricing: {
    title: 'Driving Lesson Prices Melbourne | PDIN Instructor Pricing',
    desc:  'Transparent driving lesson pricing from PDIN instructors in Melbourne. Lesson rates from $90/hr. No hidden fees, no commissions — pay your instructor directly.',
  },
  contact: {
    title: 'Contact PDIN | Professional Driving Instructors Network',
    desc:  'Get in touch with the Professional Driving Instructors Network. Questions about joining, listings, or finding an instructor in Melbourne? We\'re happy to help.',
  },
};

function updatePageMeta(page, extra) {
  let meta = SEO_META[page];

  if (page === 'profile' && extra) {
    const inst = getAllInstructors().find(i => i.id === extra);
    if (inst) {
      meta = {
        title: `${inst.name} — Driving Instructor in ${cleanSuburb(inst.baseSuburb)}, Melbourne | PDIN`,
        desc:  inst.bio ? inst.bio.slice(0, 155) + '…' : `${inst.name} is a professional driving instructor based in ${cleanSuburb(inst.baseSuburb)}, Melbourne. View profile, lesson fees, and contact details.`,
      };
    }
  }
  if (!meta) meta = SEO_META.home;

  document.title = meta.title;

  let descEl = document.querySelector('meta[name="description"]');
  if (descEl) descEl.setAttribute('content', meta.desc);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc  = document.querySelector('meta[property="og:description"]');
  const ogUrl   = document.querySelector('meta[property="og:url"]');
  if (ogTitle) ogTitle.setAttribute('content', meta.title);
  if (ogDesc)  ogDesc.setAttribute('content', meta.desc);
  if (ogUrl)   ogUrl.setAttribute('content', `https://pdin.au/${extra ? '#' + page + '/' + extra : '#' + page}`);

  let canonEl = document.querySelector('link[rel="canonical"]');
  if (canonEl) canonEl.setAttribute('href', `https://pdin.au/${extra ? '#' + page + '/' + extra : '#' + page}`);
}

function navigate(page, extra, pushState = true) {
  const app = document.getElementById('app');
  app.innerHTML = getPageContent(page, extra);
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  updateActiveLinks(page);
  updatePageMeta(page, extra);
  closeMenu();
  if (pushState) {
    const state = { page, extra: extra||null, searchLat: _searchLat||null, searchLng: _searchLng||null, searchLabel: _searchLabel||'' };
    if (page === 'join') state.joinStep = 1;
    history.pushState(state, '', extra ? `#${page}/${extra}` : `#${page}`);
  }
  bindPageEvents();
  setTimeout(initReveal, 50);

  if (page === 'admin' && auth.currentUser) {
    db.collection('applications').orderBy('submittedAt', 'desc').get()
      .then(snap => {
        const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return purgeExpiredTrash(apps);
      })
      .then(apps => {
        const appEl = document.getElementById('app');
        if (appEl) {
          appEl.innerHTML = renderAdminPage(extra, apps);
        }
        bindPageEvents();
      })
      .catch(err => {
        console.error('Failed to load applications:', err);
        showToast('Could not load applications. Check your connection and try again.');
      });
  }
}

function bindPageEvents() {
  document.querySelectorAll('[data-action="nav"]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); });
  });
  document.querySelectorAll('[data-action="profile"]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); navigate('profile', el.dataset.id); });
  });
  bindAdminEvents();

  const heroSearchBtn = document.getElementById('hero-search-btn');
  const heroInput     = document.getElementById('hero-suburb-input');
  if (heroSearchBtn && heroInput) {
    async function doHeroSearch() {
      const q = heroInput.value.trim();
      if (!q) {
        showToast('Please enter a suburb or postcode to search for instructors.');
        heroInput.classList.add('input-error');
        setTimeout(() => heroInput.classList.remove('input-error'), 2000);
        return;
      }
      heroSearchBtn.disabled = true; heroSearchBtn.innerHTML = '<span class="btn-spinner"></span>';
      const result = await geocodeSuburb(q).catch(() => null);
      heroSearchBtn.disabled = false; heroSearchBtn.innerHTML = 'Find Instructors';
      if (result) { _searchLat = result.lat; _searchLng = result.lng; _searchLabel = result.display; navigate('find'); }
      else { heroInput.classList.add('input-error'); setTimeout(() => heroInput.classList.remove('input-error'), 2000); }
    }
    heroSearchBtn.addEventListener('click', doHeroSearch);
    heroInput.addEventListener('keydown', e => { if (e.key === 'Enter') doHeroSearch(); });

    attachSuburbAutocomplete('hero-suburb-input', async (r) => {
      _searchLat = r.lat; _searchLng = r.lng; _searchLabel = r.name + (r.postcode ? ' ' + r.postcode : '');
      navigate(_cityPage);
    });
  }

  const heroLocationBtn = document.getElementById('hero-location-btn');
  if (heroLocationBtn) {
    heroLocationBtn.addEventListener('click', () => {
      if (!navigator.geolocation) { showToast('Geolocation is not supported by your browser.'); return; }
      heroLocationBtn.disabled = true;
      heroLocationBtn.innerHTML = '<span class="btn-spinner" style="border-color:rgba(255,255,255,0.3);border-top-color:#fff"></span> Locating…';
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude, lng = pos.coords.longitude;
          try {
            const res    = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`, { headers: { 'Accept-Language': 'en' } });
            const data   = await res.json();
            const suburb = data.address?.suburb || data.address?.town || data.address?.city || 'Your Location';
            _searchLat = lat; _searchLng = lng; _searchLabel = suburb;
          } catch { _searchLat = lat; _searchLng = lng; _searchLabel = 'Your Location'; }
          navigate('find');
        },
        (err) => {
          heroLocationBtn.disabled = false;
          heroLocationBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9" stroke-dasharray="2 3"/></svg> Use my current location`;
          showToast(err.code === err.PERMISSION_DENIED ? 'Location access was denied. Please allow location access in your browser settings.' : 'Unable to determine your location. Please enter your suburb manually.');
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  const findSearchBtn = document.getElementById('find-search-btn');
  const findInput     = document.getElementById('find-suburb-input');
  if (findSearchBtn && findInput) {
    async function doFindSearch() {
      const q = findInput.value.trim();
      if (!q) {
        showToast('Please enter a suburb or postcode to search for instructors.');
        findInput.classList.add('input-error');
        setTimeout(() => findInput.classList.remove('input-error'), 2000);
        return;
      }
      findSearchBtn.disabled = true; findSearchBtn.innerHTML = '<span class="btn-spinner"></span>';
      const result = await geocodeSuburb(q).catch(() => null);
      findSearchBtn.disabled = false; findSearchBtn.innerHTML = 'Find Instructors';
      if (result) { _searchLat = result.lat; _searchLng = result.lng; _searchLabel = result.display; navigate(_cityPage); }
      else { findInput.classList.add('input-error'); setTimeout(() => findInput.classList.remove('input-error'), 2000); }
    }
    findSearchBtn.addEventListener('click', doFindSearch);
    findInput.addEventListener('keydown', e => { if (e.key === 'Enter') doFindSearch(); });

    attachSuburbAutocomplete('find-suburb-input', async (r) => {
      _searchLat = r.lat; _searchLng = r.lng; _searchLabel = r.name + (r.postcode ? ' ' + r.postcode : '');
      navigate(_cityPage);
    });
    const clearLink = document.getElementById('clear-search-link');
    if (clearLink) clearLink.addEventListener('click', e => { e.preventDefault(); _searchLat = undefined; _searchLng = undefined; _searchLabel = ''; navigate(_cityPage); });
  }

  const locationBtn = document.getElementById('find-location-btn');
  if (locationBtn) {
    locationBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser.');
        return;
      }
      locationBtn.disabled = true;
      locationBtn.innerHTML = '<span class="btn-spinner" style="border-color:rgba(44,74,110,0.3);border-top-color:var(--navy)"></span> Locating…';
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          try {
            const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`, { headers: { 'Accept-Language': 'en' } });
            const data = await res.json();
            const suburb = data.address?.suburb || data.address?.town || data.address?.city || 'Your Location';
            _searchLat = lat; _searchLng = lng; _searchLabel = suburb;
          } catch {
            _searchLat = lat; _searchLng = lng; _searchLabel = 'Your Location';
          }
          navigate(_cityPage);
        },
        (err) => {
          locationBtn.disabled = false;
          locationBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9" stroke-dasharray="2 3"/></svg> Use my current location`;
          if (err.code === err.PERMISSION_DENIED) {
            showToast('Location access was denied. Please allow location access in your browser settings.');
          } else {
            showToast('Unable to determine your location. Please try entering your suburb manually.');
          }
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  const callBtn = document.getElementById('call-instructor-btn');
  if (callBtn) {
    callBtn.addEventListener('click', () => {
      const ct   = CONTACT[callBtn.dataset.id];
      const inst = getAllInstructors().find(i => i.id === callBtn.dataset.id);

      let rawNumber = null;
      if (ct && ct.p) {
        rawNumber = dec(ct.p);
      } else if (inst && inst.phone) {
        rawNumber = inst.phone;
      }

      if (rawNumber) {

        let digits = rawNumber.replace(/[^\d+]/g, '');
        if (digits.startsWith('0')) digits = '+61' + digits.slice(1);
        else if (digits.startsWith('61')) digits = '+' + digits;
        else if (!digits.startsWith('+')) digits = '+61' + digits;

        trackCall(callBtn.dataset.id, inst ? inst.name : callBtn.dataset.id, inst ? inst.baseSuburb : '', '');
        const a = document.createElement('a');
        a.href = 'tel:' + digits;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        showToast('This instructor\'s phone number is not available yet.');
      }
    });
  }

  const phoneInput = document.getElementById('join-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      const digits = phoneInput.value.replace(/\D/g, '').slice(0, 10);
      let formatted = digits;
      if (digits.length > 4 && digits.length <= 7) formatted = digits.slice(0,4) + ' ' + digits.slice(4);
      else if (digits.length > 7) formatted = digits.slice(0,4) + ' ' + digits.slice(4,7) + ' ' + digits.slice(7);
      phoneInput.value = formatted;
    });
  }

  function collectJoinFormData() {
    const get  = id => document.getElementById(id)?.value ?? '';
    const chks = sel => [...document.querySelectorAll(sel)].filter(c => c.checked).map(c => c.value);
    return {
      name:        get('join-name'),
      email:       get('join-email'),
      phone:       get('join-phone'),
      exp:         get('join-exp'),
      dia:         get('join-dia'),
      wwcc:        get('join-wwcc'),
      vAuto:       get('join-vehicle-auto'),
      vManual:     get('join-vehicle-manual'),
      langOther:   get('join-lang-other'),
      suburb:      get('join-suburb'),
      state:       get('join-state'),
      radius:      get('join-radius'),
      availNote:   get('avail-specific'),
      fee60:       get('join-fee-60'),
      fee90:       get('join-fee-90'),
      fee120:      get('join-fee-120'),
      bio:         get('join-bio'),
      languages:   chks('#join-languages-grid input'),
      teaching:    chks('#join-teaching-grid input'),
      expertise:   chks('#join-expertise-grid input'),
      availDays:   chks('#join-step-6 input[type="checkbox"][id^="avail-weekdays"], #join-step-6 input[type="checkbox"][id^="avail-saturday"], #join-step-6 input[type="checkbox"][id^="avail-sunday"]'),
      availTimes:  chks('#join-step-6 input[type="checkbox"][id^="avail-morning"], #join-step-6 input[type="checkbox"][id^="avail-afternoon"], #join-step-6 input[type="checkbox"][id^="avail-evening"]'),
      decl:        chks('#join-step-8 input[type="checkbox"]'),
    };
  }

  function restoreJoinFormData(d) {
    if (!d) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
    set('join-name', d.name);  set('join-email', d.email); set('join-phone', d.phone);
    set('join-exp', d.exp);    set('join-dia', d.dia);    set('join-wwcc', d.wwcc);
    set('join-vehicle-auto', d.vAuto); set('join-vehicle-manual', d.vManual);
    set('join-lang-other', d.langOther);
    set('join-suburb', d.suburb); set('join-state', d.state); set('join-radius', d.radius);
    set('avail-specific', d.availNote); set('join-fee-60', d.fee60); set('join-fee-90', d.fee90); set('join-fee-120', d.fee120); set('join-bio', d.bio);
    const restoreChecks = (sel, vals) => {
      if (!vals) return;
      document.querySelectorAll(sel).forEach(c => { c.checked = vals.includes(c.value); });
    };
    restoreChecks('#join-languages-grid input', d.languages);
    restoreChecks('#join-teaching-grid input', d.teaching);
    restoreChecks('#join-expertise-grid input', d.expertise);
    restoreChecks('#join-step-6 input[type="checkbox"]', [...(d.availDays||[]), ...(d.availTimes||[])]);
    restoreChecks('#join-step-8 input[type="checkbox"]', d.decl);

    const teachingHint = document.getElementById('teaching-count-hint');
    if (teachingHint) {
      const tCount = (d.teaching || []).length;
      if (tCount < 2) teachingHint.textContent = `Select at least ${2-tCount} more`;
      else if (tCount > 3) teachingHint.textContent = 'Maximum 3 selected — please deselect one';
      else teachingHint.textContent = `${tCount} selected ✓`;
      teachingHint.style.color = (tCount < 2 || tCount > 3) ? '#e53e3e' : '#38a169';
    }

    const hint = document.getElementById('expertise-count-hint');
    if (hint) {
      const count = (d.expertise || []).length;
      if (count < 3) hint.textContent = `Select at least ${3-count} more`;
      else if (count > 5) hint.textContent = 'Maximum 5 selected — please deselect one';
      else hint.textContent = `${count} selected ✓`;
      hint.style.color = (count < 3 || count > 5) ? '#e53e3e' : '#38a169';
    }
  }

  function updateJoinProgress(step) {
    const fill  = document.getElementById('join-progress-fill');
    const label = document.getElementById('join-progress-label');
    if (fill)  fill.style.width  = Math.round((step / 8) * 100) + '%';
    if (label) label.textContent = `Step ${step} of 8`;
  }

  function goToJoinStep(step, pushToHistory) {
    for (let i = 1; i <= 8; i++) {
      const el = document.getElementById(`join-step-${i}`);
      if (el) el.style.display = (i === step) ? 'block' : 'none';
    }

    const existingErr = document.querySelector('#join-form-box .form-error-msg');
    if (existingErr) existingErr.remove();
    updateJoinProgress(step);
    const box = document.getElementById('join-form-box');
    if (box) window.scrollTo({ top: box.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    if (pushToHistory) {
      history.pushState(
        { page: 'join', extra: null, joinStep: step, joinFormData: collectJoinFormData(),
          searchLat: _searchLat||null, searchLng: _searchLng||null, searchLabel: _searchLabel||'' },
        '',
        '#join'
      );
    }
  }

  window._goToJoinStep = goToJoinStep;
  window._restoreJoinFormData = restoreJoinFormData;

  document.querySelectorAll('.join-next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.dataset.next);
      const curStep  = nextStep - 1;

      if (curStep === 1) {
        const name  = document.getElementById('join-name')?.value.trim();
        const email = document.getElementById('join-email')?.value.trim();
        const phone = document.getElementById('join-phone')?.value.trim();
        if (!name) { showToast('Please enter your full name before continuing.'); return; }
        if (!email) { showToast('Email address is required — for enquiry delivery, records, and reliable communication.'); return; }
        if (!phone) { showToast('Mobile number is required — instructors are on the road all day, and this ensures quick contact.'); return; }
      }
      if (curStep === 2) {
        const diaType = document.getElementById('join-dia-type')?.value;
        const dia = document.getElementById('join-dia')?.value.trim();
        if (!diaType) { showToast('Please select your State Driving Instructor Authority type before continuing.'); return; }
        if (!dia) { showToast('Please enter your authority / licence number before continuing.'); return; }
      }
      if (curStep === 3) {
        const teaching = [...document.querySelectorAll('#join-teaching-grid input:checked')];
        if (teaching.length < 2) { showToast('Please select at least 2 teaching approach tags before continuing.'); return; }
        if (teaching.length > 3) { showToast('You have selected more than 3 teaching approach tags — please deselect some to continue.'); return; }
      }
      if (curStep === 4) {
        const expertise = [...document.querySelectorAll('#join-expertise-grid input:checked')];
        if (expertise.length < 3) { showToast('Please select at least 3 areas of expertise before continuing.'); return; }
        if (expertise.length > 5) { showToast('You have selected more than 5 areas of expertise — please deselect some to continue.'); return; }
      }
      if (curStep === 5) {
        const suburb = document.getElementById('join-suburb')?.value.trim();
        const state  = document.getElementById('join-state')?.value;
        if (!suburb) { showToast('Please enter your primary suburb before continuing.'); return; }
        if (!state)  { showToast('Please select your state before continuing.'); return; }
      }
      if (curStep === 6) {
        const fee60 = document.getElementById('join-fee-60')?.value.trim();
        if (!fee60) { showToast('Please enter your 60-minute lesson fee before continuing.'); return; }
      }

      goToJoinStep(nextStep, true);
    });
  });

  document.querySelectorAll('.join-back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const backStep = parseInt(btn.dataset.back);
      goToJoinStep(backStep, true);
    });
  });

  updateJoinProgress(1);

  const teachingGrid = document.getElementById('join-teaching-grid');
  const teachingHint = document.getElementById('teaching-count-hint');
  const teachingHintDefault = 'Most instructors choose 2–3 tags that reflect both their personality and how they run lessons.';
  if (teachingGrid && teachingHint) {
    teachingGrid.addEventListener('change', () => {
      const count = teachingGrid.querySelectorAll('input:checked').length;
      if (count < 2) teachingHint.textContent = `Select at least ${2-count} more`;
      else if (count > 3) teachingHint.textContent = 'Maximum 3 selected — please deselect one';
      else teachingHint.textContent = `${count} selected ✓`;
      teachingHint.style.color = (count < 2 || count > 3) ? '#e53e3e' : '#38a169';
    });
  }

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

  const enquiryBtn = document.getElementById('open-enquiry-btn');
  if (enquiryBtn) {
    enquiryBtn.addEventListener('click', () => {
      const inst = getAllInstructors().find(i => i.id === enquiryBtn.dataset.instructorId) || getAllInstructors()[0];
      openEnquiryModal(inst);
    });
  }

  const photoZone    = document.getElementById('photo-upload-zone');
  const photoInput2  = document.getElementById('join-photo');
  const photoPrompt  = document.getElementById('photo-upload-prompt');
  const photoPreview = document.getElementById('photo-upload-preview');
  const photoImg     = document.getElementById('photo-preview-img');
  const photoRemove  = document.getElementById('photo-remove-btn');

  function showPhotoPreview(file) {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      showFormError('join-form-box', 'Photo exceeds the 5 MB limit. Please choose a smaller image.');
      photoInput2.value = '';
      return;
    }
    const url = URL.createObjectURL(file);
    photoImg.src = url;
    photoPreview.style.display = 'block';
    photoPrompt.style.display  = 'none';
    photoZone.classList.add('has-photo');
  }
  if (photoZone) {
    photoZone.addEventListener('click', e => { if (!e.target.closest('#photo-remove-btn')) photoInput2.click(); });
    photoInput2.addEventListener('change', () => { if (photoInput2.files[0]) showPhotoPreview(photoInput2.files[0]); });
    photoRemove.addEventListener('click', e => {
      e.stopPropagation();
      photoInput2.value = '';
      photoImg.src = '';
      photoPreview.style.display = 'none';
      photoPrompt.style.display  = 'flex';
      photoZone.classList.remove('has-photo');
    });
    photoZone.addEventListener('dragover', e => { e.preventDefault(); photoZone.classList.add('drag-over'); });
    photoZone.addEventListener('dragleave', () => photoZone.classList.remove('drag-over'));
    photoZone.addEventListener('drop', e => {
      e.preventDefault(); photoZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) { photoInput2.files = e.dataTransfer.files; showPhotoPreview(file); }
    });
  }

  const joinSubmit = document.getElementById('join-submit');
  if (joinSubmit) {
    joinSubmit.addEventListener('click', async () => {
      const name   = document.getElementById('join-name').value.trim();
      const email  = document.getElementById('join-email').value.trim();
      const dia    = (document.getElementById('join-dia') || {}).value?.trim() || '';
      const suburb = cleanSuburb((document.getElementById('join-suburb') || {}).value?.trim() || '');
      const state  = (document.getElementById('join-state')  || {}).value || '';
      const decl1  = document.getElementById('join-decl-1')?.checked || false;

      if (!name || !email)             { showFormError('join-form-box', 'Your name and email address are required. Please go back and fill them in.'); return; }
      if (!dia)                        { showFormError('join-form-box', 'Your State Driving Instructor Authority number is missing. Please go back to Step 2 and enter it.'); return; }
      if (!suburb)                     { showFormError('join-form-box', 'Your primary suburb is missing. Please go back to Step 5 and enter it.'); return; }
      if (!state)                      { showFormError('join-form-box', 'Your state is missing. Please go back to Step 5 and select it.'); return; }
      if (!decl1) {
        showFormError('join-form-box', 'Please tick the box to confirm the Instructor Declaration before submitting your application.');
        const declLabel = document.getElementById('join-decl-1')?.closest('.join-req-confirm');
        if (declLabel) {
          declLabel.classList.add('field-error-highlight');
          declLabel.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => declLabel.classList.remove('field-error-highlight'), 3000);
        }
        return;
      }

      const phone   = document.getElementById('join-phone')?.value || '';
      const exp     = document.getElementById('join-exp')?.value || '';
      const diaType = document.getElementById('join-dia-type')?.value || '';
      const wwcc    = document.getElementById('join-wwcc')?.value?.trim() || '';
      const wwccType= document.getElementById('join-wwcc-type')?.value || '';
      const bio     = document.getElementById('join-bio')?.value || '';
      const radius  = document.getElementById('join-radius')?.value || '10';
      const vAuto   = document.getElementById('join-vehicle-auto')?.value || '';
      const vManual = document.getElementById('join-vehicle-manual')?.value || '';

      const languages = [...document.querySelectorAll('#join-languages-grid input:checked')].map(c => c.value);
      const langOther = document.getElementById('join-lang-other')?.value.trim() || '';
      if (langOther) languages.push(langOther);

      const photoInput = document.getElementById('join-photo');
      const photoFile  = photoInput?.files?.[0] || null;
      if (photoFile && photoFile.size > 5 * 1024 * 1024) {
        showFormError('join-form-box', 'Photo exceeds the 5 MB limit. Please choose a smaller image.');
        photoInput.value = '';
        return;
      }

      const availDays  = ['avail-weekdays','avail-saturday','avail-sunday']
        .filter(id => document.getElementById(id)?.checked)
        .map(id => document.getElementById(id).value);
      const availTimes = ['avail-morning','avail-afternoon','avail-evening']
        .filter(id => document.getElementById(id)?.checked)
        .map(id => document.getElementById(id).value);
      const availSpecific = document.getElementById('avail-specific')?.value.trim() || '';
      const avail = [...availDays, ...availTimes, ...(availSpecific ? ['Note: ' + availSpecific] : [])];

      const fee60 = document.getElementById('join-fee-60')?.value.trim() || '';
      const fee90 = document.getElementById('join-fee-90')?.value.trim() || '';
      const fee120 = document.getElementById('join-fee-120')?.value.trim() || '';
      if (!fee60) { showFormError('join-form-box', 'Your 60-minute lesson fee is missing. Please go back to Step 5 and enter it.'); return; }

      const teachingApproachIds = [...document.querySelectorAll('#join-teaching-grid input:checked')].map(c => c.value);
      if (teachingApproachIds.length < 2) {
        showFormError('join-form-box', 'Please select at least 2 teaching approach tags. Go back to Step 3 to update your selections.'); return;
      }
      if (teachingApproachIds.length > 3) {
        showFormError('join-form-box', 'You have selected more than 3 teaching approach tags. Go back to Step 3 and deselect some.'); return;
      }
      const teachingApproach = resolveTeachingApproach(teachingApproachIds);

      const expertiseIds = [...document.querySelectorAll('#join-expertise-grid input:checked')].map(c => c.value);
      if (expertiseIds.length < 3) {
        showFormError('join-form-box', 'Please select at least 3 areas of expertise. Go back to Step 4 to update your selections.'); return;
      }
      if (expertiseIds.length > 5) {
        showFormError('join-form-box', 'You have selected more than 5 areas of expertise. Go back to Step 4 and deselect some.'); return;
      }
      const expertise = resolveExpertise(expertiseIds);

      setButtonLoading('join-submit', true, 'Apply to Join');

      const application = {
        submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
        status:      'pending',
        name, email, phone, dia, diaType, wwcc, wwccType,
        exp, suburb, state,
        radius:      parseInt(radius, 10),
        vAuto:       vAuto  || '',
        vManual:     vManual|| '',
        languages:   languages.length ? languages : [],
        availDays, availTimes, availSpecific,
        fee60, fee90: fee90 || '', fee120: fee120 || '',
        teachingApproachIds,
        expertiseIds,
        bio,
        photoName:   photoFile ? photoFile.name : '',
        photoDataUrl: null,
      };

      function showSuccess(applicantName) {
        const box = document.getElementById('join-form-box');
        if (box) {
          box.innerHTML = `
            <div class="success-box">
              <div class="success-icon">${ICONS.check}</div>
              <h3>Application Received!</h3>
              <p>Thank you, <strong>${applicantName}</strong>. We’ll review your application and be in touch within 2–3 business days.</p>
            </div>`;
          box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

      }

      function saveToFirestore(photoDataUrl) {
        if (photoDataUrl) application.photoDataUrl = photoDataUrl;

        let settled = false;

        const timeoutId = setTimeout(() => {
          if (settled) return;
          settled = true;
          console.error('Firestore save timed out — write may not have reached the server.');
          setButtonLoading('join-submit', false, 'Apply to Join');
          showFormError('join-form-box', 'Your application is taking too long to send. Please check your internet connection and try again — do not refresh the page yet.');
        }, 12000);

        const appDocId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
        db.collection('applications').doc(appDocId).set(application)
          .then(() => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            showSuccess(name);
          })
          .catch(err => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            console.error('Firestore save failed:', err);
            setButtonLoading('join-submit', false, 'Apply to Join');
            showFormError('join-form-box', 'Could not save your application. Please check your internet connection and try again.');
          });
      }

      if (photoFile) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const MAX = 400;
            let w = img.width, h = img.height;
            if (w > MAX || h > MAX) {
              if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
              else       { w = Math.round(w * MAX / h); h = MAX; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            saveToFirestore(canvas.toDataURL('image/jpeg', 0.82));
          };
          img.onerror = () => saveToFirestore(null);
          img.src = ev.target.result;
        };
        reader.onerror = () => saveToFirestore(null);
        reader.readAsDataURL(photoFile);
      } else {
        saveToFirestore(null);
      }
    });
  }

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
      const contactDocId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
      db.collection('contact_form').doc(contactDocId).set({
        name, email,
        subject: subject || '(none)',
        message: msg,
        submittedAt: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        document.getElementById('contact-form-wrap').innerHTML = `
          <div class="success-box">
            <div class="success-icon">${ICONS.check}</div>
            <h3>Message Sent!</h3>
            <p>Thanks ${name}, we've received your message and will get back to you shortly.</p>
          </div>`;
      })
      .catch(() => {
        showFormError('contact-form-wrap', 'Network error. Please try again.');
        setButtonLoading('contact-submit', false, 'Send Message');
      });
    });
  }
}

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
    link.classList.toggle('active', link.dataset.page === page || (page === 'profile' && link.dataset.page === 'find') || (page === 'find-brisbane' && link.dataset.page === 'find') || (page === 'find-sydney' && link.dataset.page === 'find'));
  });
}
function initReveal() {
  const els = document.querySelectorAll('.reveal'); if (!els.length) return;
  const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }); }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}
window.addEventListener('popstate', e => {
  if (e.state) {

    _searchLat   = e.state.searchLat   || undefined;
    _searchLng   = e.state.searchLng   || undefined;
    _searchLabel = e.state.searchLabel || '';

    if (e.state.page === 'join' && e.state.joinStep) {
      const joinFormBox = document.getElementById('join-form-box');
      if (joinFormBox && document.getElementById('join-step-1')) {

        if (window._restoreJoinFormData) window._restoreJoinFormData(e.state.joinFormData);
        if (window._goToJoinStep) window._goToJoinStep(e.state.joinStep, false);
        return;
      }
    }

    navigate(e.state.page, e.state.extra||null, false);

    if (e.state.page === 'join' && e.state.joinStep && e.state.joinStep > 1) {
      setTimeout(() => {
        if (window._restoreJoinFormData) window._restoreJoinFormData(e.state.joinFormData);
        if (window._goToJoinStep) window._goToJoinStep(e.state.joinStep, false);
      }, 0);
    }
  } else {
    navigate('home', null, false);
  }
});
document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  bindNavEvents();

  startLiveProfilesListener();

  auth.onAuthStateChanged(() => {
    if ((location.hash || '').replace('#','').split('/')[0] === 'admin') {
      navigate('admin', null, false);
    }
  });

  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const [page, extra] = hash.split('/');
    navigate(page||'home', extra||null, false);
    const initState = { page: page||'home', extra: extra||null };
    if ((page||'home') === 'join') initState.joinStep = 1;
    history.replaceState(initState, '', window.location.hash);
  } else {
    navigate('home', null, false);
    history.replaceState({ page:'home', extra:null }, '', '#home');
  }
});
