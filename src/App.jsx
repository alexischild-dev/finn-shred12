import { useState, useEffect } from "react";

// ── STORAGE ───────────────────────────────────────────────────────────────
const STORAGE_KEY = "shred12_finn_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState(state) {
  try {
    // Don't save progress photos in main state — they're saved separately
    // due to size limits. Save everything else.
    const toSave = {...state, progressPhotos: []};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { }
}

function loadPhotos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + "_photos");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePhotos(photos) {
  try {
    localStorage.setItem(STORAGE_KEY + "_photos", JSON.stringify(photos));
  } catch { }
}

// ── DATA ──────────────────────────────────────────────────────────────────
// Finn's nutrition plan v2 — with variety options
// 2,800 kcal training days / 2,600 kcal rest days | ~200g protein/day

const PHASES = [
  { weeks:[1,2,3,4],    label:"Phase 1 — Foundation Cut", color:"#3B82F6", cals:2800, protein:200, carbs:310, fats:67, restCals:2600, restProtein:195, restCarbs:275, restFats:72 },
  { weeks:[5,6,7,8],    label:"Phase 2 — Deep Cut",       color:"#F59E0B", cals:2800, protein:200, carbs:310, fats:67, restCals:2600, restProtein:195, restCarbs:275, restFats:72 },
  { weeks:[9,10,11,12], label:"Phase 3 — Final Shred",    color:"#EF4444", cals:2800, protein:200, carbs:310, fats:67, restCals:2600, restProtein:195, restCarbs:275, restFats:72 },
];
const getPhase = (week) => PHASES.find(p => p.weeks.includes(week)) || PHASES[0];

const MEAL_PLANS = {
  training: {
    label: "Training Day — Mon to Fri",
    note: "2,800 kcal. High carbs to fuel gym and on-site work. Two breakfast options — choose based on your morning. Dinner rotates each night to keep things interesting.",
    breakfastOptions: [
      {
        label: "Option A — Hot Breakfast",
        subtitle: "Best when you have 10 mins at home (6:00–7:00am)",
        items: "5 large eggs (scrambled or poached), 2 slices wholegrain toast, ½ avocado, handful wilted spinach, black coffee",
        kcal: 700, protein: 50,
        prep: "Whisk your eggs the night before and store in a container — pour straight into the pan in under 5 minutes."
      },
      {
        label: "Option B — Overnight Oats",
        subtitle: "Prep the night before, eat on-site or in the van (no cooking)",
        items: "80g rolled oats, 1 scoop vanilla whey (30g), 100g 0% Greek yoghurt, 150ml semi-skimmed milk, 1 banana, 1 tbsp chia seeds, 50g mixed berries",
        kcal: 720, protein: 52,
        prep: "Mix oats, protein, yoghurt, milk and chia in a jar the night before. Add banana and berries in the morning. Keeps 2 days — prep two on Sunday night."
      }
    ],
    midMorning: {
      time: "10:00am", kcal: 350, protein: 30,
      items: "200g 0% Greek yoghurt, 100g mixed berries, 30g mixed nuts (almonds/walnuts), 1 tsp honey (optional)"
    },
    lunch: {
      time: "12:30–1:30pm", kcal: 750, protein: 55,
      items: "200g cooked chicken breast or turkey mince, 100g dry basmati or brown rice (250g cooked), 200g mixed salad veg (cucumber, tomato, pepper), 1 tbsp olive oil & lemon dressing, 1 banana"
    },
    preWorkout: {
      time: "45–60 min pre-gym", kcal: 350, protein: 35,
      items: "1 scoop whey protein in water (30g powder), 1 medium apple, 2 rice cakes with 15g almond butter, 5g creatine in water"
    },
    postWorkout: {
      time: "Within 30 min post-gym", kcal: 200, protein: 40,
      items: "1.5 scoops whey protein (45g) in water or milk. Optional: 20–30g dextrose or fast carb if it was a heavy session."
    },
    dinners: [
      { day:"Mon", name:"Salmon & Sweet Potato",      items:"200g salmon fillet, 250g sweet potato, steamed broccoli, 1 tbsp olive oil",                                                    kcal:680, protein:44 },
      { day:"Tue", name:"Lean Beef Stir-Fry",         items:"200g lean beef strips, mixed peppers/onion/bok choy, 100g dry rice noodles, soy & ginger sauce",                               kcal:720, protein:48 },
      { day:"Wed", name:"Chicken & Rice Bowl",        items:"200g chicken breast, 100g basmati rice, roasted courgette & cherry tomatoes, tzatziki",                                        kcal:700, protein:50 },
      { day:"Thu", name:"Turkey Mince Bolognese",     items:"200g turkey mince, 100g dry wholegrain pasta, passata, garlic, mixed herbs",                                                   kcal:710, protein:52 },
      { day:"Fri", name:"Cod or Haddock & Potatoes",  items:"200g white fish fillet (cod or haddock), 250g baby potatoes, green beans, lemon butter",                                       kcal:660, protein:46 },
    ],
    eveningSnack: {
      time: "8:30–9:30pm", kcal: 200, protein: 25,
      items: "200g low-fat cottage cheese, 100g cucumber or celery sticks, optional 20g casein protein if daily target not met"
    }
  },
  rest: {
    label: "Rest Day — Sat & Sun",
    note: "2,600 kcal. More relaxed structure — three main meals, one afternoon snack. Time to cook something more interesting. Batch cook on Sunday.",
    saturday: {
      breakfast: {
        label: "Option 1 — High-Protein Pancakes",
        subtitle: "Saturday morning treat (8:00–9:00am)",
        items: "Banana & oat pancakes (2 eggs, 1 banana, 60g oats blended), 150g 0% Greek yoghurt on top, 100g mixed berries, drizzle of honey, black coffee",
        kcal: 750, protein: 50
      },
      lunch: {
        label: "Option 1 — Loaded Chicken Wrap",
        subtitle: "Quick & satisfying",
        items: "2 large wholegrain tortillas, 180g grilled chicken breast (sliced), 60g mashed avocado, lettuce/tomato/cucumber, 50g low-fat Greek yoghurt as sauce",
        kcal: 700, protein: 50
      },
      dinner: {
        label: "Option 1 — Sirloin Steak & Wedges",
        subtitle: "Saturday treat",
        items: "220g lean sirloin steak (trimmed), 250g sweet potato wedges (oven baked), mixed leaf salad with red onion & tomato, 1 tbsp olive oil dressing, yoghurt-based peppercorn sauce",
        kcal: 750, protein: 50
      }
    },
    sunday: {
      breakfast: {
        label: "Option 2 — Full Protein Fry-Up",
        subtitle: "Sunday morning (8:00–9:00am)",
        items: "3 lean turkey or pork sausages (grilled), 3 whole eggs (scrambled or fried in low-cal spray), 50g smoked salmon, 2 slices wholegrain toast, grilled mushrooms & tomatoes",
        kcal: 750, protein: 50
      },
      lunch: {
        label: "Option 2 — Prawn & Vegetable Noodles",
        subtitle: "Weekend cook-up",
        items: "200g cooked king prawns, 100g dry rice noodles, 200g bok choy/snap peas/carrots/spring onion, 1 tbsp sesame oil + soy sauce + ginger + garlic, chilli flakes optional",
        kcal: 700, protein: 50
      },
      dinner: {
        label: "Option 2 — Chicken & Chickpea Curry",
        subtitle: "Sunday batch cook — make double for Monday",
        items: "200g diced chicken breast, 100g tinned chickpeas, chopped tomatoes + light coconut milk, 100g dry basmati rice, onion/garlic/ginger/curry spices",
        kcal: 750, protein: 50,
        batchNote: "Make double on Sunday — portion the second half as a weekday lunch or dinner for Monday."
      }
    },
    afternoonSnack: {
      time: "~3:00pm", kcal: 300, protein: 20,
      items: "1 protein shake or bar (1 scoop / 1 bar), 1 apple or pear, 20g small handful mixed nuts"
    }
  }
};

// Get today's dinner from the rotation (Mon=0, Tue=1 etc.)
const getTodayDinner = () => {
  const dow = new Date().getDay(); // 0=Sun, 1=Mon...
  const idx = dow >= 1 && dow <= 5 ? dow - 1 : 0;
  return MEAL_PLANS.training.dinners[idx];
};

const getMealPlan = (week) => {
  const dow = new Date().getDay();
  return [0, 6].includes(dow) ? MEAL_PLANS.rest : MEAL_PLANS.training;
};



const SUPPLEMENTS = [
  { name:"Whey Protein Isolate", dose:"1–1.5 scoops (25–40g)", timing:"Pre & post-workout", purpose:"Hit daily 200g protein target" },
  { name:"Creatine Monohydrate", dose:"5g daily",               timing:"Any time, consistent", purpose:"Strength, power, muscle retention" },
  { name:"Vitamin D3 + K2",      dose:"2,000–4,000 IU D3",      timing:"With breakfast",       purpose:"Muscle function, testosterone support" },
  { name:"Omega-3 Fish Oil",     dose:"2–3g EPA+DHA",           timing:"With a meal",           purpose:"Anti-inflammation, joint health" },
  { name:"Magnesium Glycinate",  dose:"300–400mg",              timing:"Before bed",            purpose:"Sleep quality, recovery, reduce cortisol" },
  { name:"Caffeine / Coffee",    dose:"150–200mg",              timing:"30–45 min pre-workout", purpose:"Performance, fat oxidation" },
];




const AB_FINISHER = {
  name:"Ab Finisher",
  note:"Add this after your main workout. 10-15 mins. Builds the muscle so when fat drops, abs POP.",
  exercises:[
    { name:"Hanging Leg Raises", sets:4, reps:"12-15", rest:"60s", tip:"Lower abs — best bang for buck. Full hang, controlled raise." },
    { name:"Cable Crunches", sets:3, reps:"15-20", rest:"60s", tip:"Weighted = thicker abs. Kneel, pull rope to forehead, crunch hard." },
    { name:"Ab Wheel Rollouts", sets:3, reps:"10-12", rest:"60s", tip:"Full core. Go slow — don't let your lower back dip." },
    { name:"Plank", sets:3, reps:"45-60 sec", rest:"45s", tip:"Core stability & lower back health. Squeeze everything." },
  ]
};
const AB_DAYS = ["push","legs","back"];

const WORKOUTS = {
  push:{ name:"Push", color:"#EF4444", emoji:"🔴", exercises:[
    { name:"Incline Barbell Press", sets:4, reps:"6-8", rest:"3 min", tip:"Upper chest — #1 Dorito builder" },
    { name:"Flat Dumbbell Press", sets:3, reps:"8-10", rest:"90s", tip:"Full stretch at bottom" },
    { name:"Overhead Press (Barbell)", sets:4, reps:"6-8", rest:"3 min", tip:"Core tight, press overhead" },
    { name:"Lateral Raises", sets:4, reps:"12-15", rest:"60s", tip:"Lead with elbows — width builder" },
    { name:"Cable Lateral Raises", sets:3, reps:"15", rest:"45s", tip:"Constant tension at bottom" },
    { name:"Tricep Rope Pushdown", sets:3, reps:"12-15", rest:"60s", tip:"Spread the rope at bottom" },
    { name:"Overhead Tricep Extension", sets:3, reps:"10-12", rest:"60s", tip:"Long head stretch" },
  ]},
  pull:{ name:"Pull", color:"#3B82F6", emoji:"🔵", exercises:[
    { name:"Weighted Pull-Ups", sets:4, reps:"6-8", rest:"3 min", tip:"Wide grip — V-taper king" },
    { name:"Barbell Row (Pendlay)", sets:4, reps:"6-8", rest:"3 min", tip:"Explosive pull, controlled lower" },
    { name:"Cable Seated Row (Wide)", sets:3, reps:"10-12", rest:"90s", tip:"Squeeze scapula at peak" },
    { name:"Straight Arm Pulldown", sets:3, reps:"12-15", rest:"60s", tip:"Lat isolation — feel the stretch" },
    { name:"Face Pulls", sets:4, reps:"15-20", rest:"60s", tip:"Rear delt — posture & Dorito back" },
    { name:"Barbell Curl", sets:3, reps:"8-10", rest:"60s", tip:"Strict — no swinging" },
    { name:"Incline Dumbbell Curl", sets:3, reps:"10-12", rest:"60s", tip:"Long head stretch for peak" },
  ]},
  legs:{ name:"Legs", color:"#F59E0B", emoji:"🟡", exercises:[
    { name:"Barbell Back Squat", sets:4, reps:"6-8", rest:"3 min", tip:"Maintain leg muscle — don't neglect" },
    { name:"Romanian Deadlift", sets:4, reps:"8-10", rest:"2 min", tip:"Hip hinge, hamstring stretch" },
    { name:"Leg Press", sets:3, reps:"10-12", rest:"90s", tip:"Feet shoulder width" },
    { name:"Walking Lunges", sets:3, reps:"12 each", rest:"90s", tip:"Controlled descent" },
    { name:"Leg Curl (Machine)", sets:3, reps:"12-15", rest:"60s", tip:"Hamstring isolation" },
    { name:"Calf Raises (Standing)", sets:4, reps:"15-20", rest:"60s", tip:"Full range, pause at top" },
  ]},
  shoulders:{ name:"Shoulders & Arms", color:"#8B5CF6", emoji:"🟣", exercises:[
    { name:"Dumbbell Shoulder Press", sets:4, reps:"8-10", rest:"90s", tip:"Don't lock out — keep tension" },
    { name:"Arnold Press", sets:3, reps:"10-12", rest:"90s", tip:"Hits all 3 delt heads" },
    { name:"Lateral Raises (Drop Set)", sets:3, reps:"10+10+10", rest:"90s", tip:"Drop weight twice — finisher" },
    { name:"Rear Delt Fly (Pec Deck)", sets:4, reps:"15-20", rest:"60s", tip:"Back of the Dorito" },
    { name:"EZ Bar Curl", sets:4, reps:"8-10", rest:"60s", tip:"Heavy, wrist-friendly" },
    { name:"Hammer Curl", sets:3, reps:"10-12", rest:"60s", tip:"Brachialis thickness" },
    { name:"Skull Crushers", sets:4, reps:"8-10", rest:"60s", tip:"Elbows in, bar to forehead" },
    { name:"Weighted Dips", sets:3, reps:"10-12", rest:"90s", tip:"Upright torso — tricep focus" },
  ]},
  back:{ name:"Back & Chest", color:"#10B981", emoji:"🟢", exercises:[
    { name:"Deadlift", sets:4, reps:"5", rest:"3 min", tip:"Overall thickness & strength" },
    { name:"Lat Pulldown (Close Grip)", sets:4, reps:"8-10", rest:"90s", tip:"Pull to upper chest" },
    { name:"T-Bar Row", sets:3, reps:"8-10", rest:"2 min", tip:"Mid back thickness" },
    { name:"Incline Dumbbell Fly", sets:3, reps:"12-15", rest:"60s", tip:"Upper chest sweep" },
    { name:"Cable Fly (Low to High)", sets:3, reps:"12-15", rest:"60s", tip:"Upper chest definition" },
    { name:"Hyperextensions", sets:3, reps:"15", rest:"60s", tip:"Lower back & posture" },
  ]},
};

const WEEK_SCHEDULE = ["push","pull","legs","shoulders","back","rest","rest"];
const DAY_NAMES = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const MILESTONES = {
  1:"🚀 Week 1 — First week. Prep on Sunday = stress-free week. Boil all eggs, cook rice & chicken in bulk.",
  2:"💪 Week 2 — Body adapting. Try to add weight to at least 2 lifts this week.",
  3:"🔥 Week 3 — Consistency is compounding. Waist may already feel tighter.",
  4:"📸 Week 4 — Take progress photos! First month done. Expect 1.5-2kg loss.",
  5:"⬇️ Week 5 — Phase 2 begins. Calories drop. Low-carb rest days start now.",
  6:"💡 Week 6 — Shoulder definition becoming visible. Push through the harder weeks.",
  7:"🎯 Week 7 — Half way! V-taper is forming. Back is noticeably wider.",
  8:"📸 Week 8 — Progress photos again. Compare to Week 4. Dorito shape building.",
  9:"🔑 Week 9 — Final phase. Zero carbs on Sat & Sun. Abs are in reach.",
  10:"⚡ Week 10 — Hard weeks, biggest results. Definition is showing everywhere.",
  11:"🏁 Week 11 — Last big push. Hit every session. The shape is almost there.",
  12:"🏆 Week 12 — FINAL WEEK. You've done it. Lean, muscular, Dorito built.",
};

const PREP_TIPS = [
  "🥣 Every night before bed: mix overnight oats in a jar — takes 2 mins, ready to grab in the morning",
  "🥚 Every Sunday: boil 10-12 eggs at once — your work snacks are sorted for the whole week",
  "🍚 Every Sunday: cook a big batch of rice & chicken — portion into 5 containers for Mon-Fri lunches",
  "🥩 When cooking dinner: make a larger portion so tomorrow's lunch is already done",
  "🎒 Pack your work bag the night before, food containers included — morning stress gone",
  "🧅 Roast a tray of veg (peppers, courgette, broccoli) on Sunday — use throughout the week",
];

// ── DEFAULT STATE ─────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  currentWeek: 1,
  completedSets: {},
  weightInputs: {},
  savedWeights: {},
  completedWorkouts: {},
  bodyWeights: [{week:1, weight:92}],
  activeTab: "training",
  mealDay: 0,
  showPrepTips: false,
  showSupps: false,
  nutritionDay: null,
  showDinnerRotation: false,
  abFinisherOn: false,
  completedAbSets: {},
  abWeightInputs: {},
  savedAbWeights: {},
};

// ── APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState("home");
  const [selectedWorkoutKey, setSelectedWorkoutKey] = useState(null);
  const [expandedEx, setExpandedEx] = useState(null);
  const [newBodyWeight, setNewBodyWeight] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [progressPhotos, setProgressPhotos] = useState([]);

  // All persisted state in one object
  const [s, setS] = useState(DEFAULT_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) setS(prev => ({...prev, ...saved}));
    setProgressPhotos(loadPhotos());
    setLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!loaded) return;
    saveState(s);
  }, [s, loaded]);

  // Save photos separately (they're large)
  useEffect(() => {
    if (!loaded) return;
    savePhotos(progressPhotos);
  }, [progressPhotos, loaded]);

  function update(patch) { setS(prev => ({...prev, ...patch})); }

  const phase = getPhase(s.currentWeek);
  // mealPlan handled inline in nutrition tab

  const toggleSet = (wKey, exIdx, setIdx) => {
    const key = `${s.currentWeek}-${wKey}-${exIdx}-${setIdx}`;
    update({completedSets: {...s.completedSets, [key]: !s.completedSets[key]}});
  };
  const isSetDone = (wKey, exIdx, setIdx) => !!s.completedSets[`${s.currentWeek}-${wKey}-${exIdx}-${setIdx}`];
  const getExProgress = (wKey, exIdx, total) => {
    let d = 0;
    for (let i = 0; i < total; i++) if (isSetDone(wKey, exIdx, i)) d++;
    return d;
  };
  const saveWeight = (wKey, exIdx, setIdx) => {
    const ik = `${s.currentWeek}-${wKey}-${exIdx}-${setIdx}`;
    const val = s.weightInputs[ik];
    if (val) update({savedWeights: {...s.savedWeights, [ik]: val}});
  };
  const getWorkoutProgress = (wKey) => {
    if (!wKey) return 0;
    const w = WORKOUTS[wKey];
    const total = w.exercises.reduce((sum, e) => sum + e.sets, 0);
    const done = w.exercises.reduce((sum, e, ei) => sum + getExProgress(wKey, ei, e.sets), 0);
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };
  const finishWorkout = () => {
    update({completedWorkouts: {...s.completedWorkouts, [`${s.currentWeek}-${selectedWorkoutKey}`]: true}});
    setScreen("home");
    setSelectedWorkoutKey(null);
  };
  const weekDone = WEEK_SCHEDULE.filter(w => w !== "rest" && s.completedWorkouts[`${s.currentWeek}-${w}`]).length;

  const c = {
    root:{background:"#080808",minHeight:"100vh",color:"#e8e8e8",fontFamily:"'Syne',sans-serif",maxWidth:440,margin:"0 auto",paddingBottom:80},
    topBar:{padding:"18px 18px 0",display:"flex",justifyContent:"space-between",alignItems:"center"},
    logo:{fontSize:18,fontWeight:800,letterSpacing:"-1px",color:"#fff"},
    badge:{background:phase.color+"22",color:phase.color,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,border:`1px solid ${phase.color}44`},
    phaseBar:{margin:"14px 18px 0",background:phase.color+"15",border:`1px solid ${phase.color}33`,borderRadius:10,padding:"10px 14px"},
    phaseLabel:{fontSize:11,fontWeight:700,color:phase.color,letterSpacing:"1px",textTransform:"uppercase"},
    phaseMacros:{display:"flex",gap:12,marginTop:6,flexWrap:"wrap"},
    phaseMacro:{fontSize:11,color:"#888"},
    milestone:{margin:"10px 18px 0",background:"#0e0e0e",border:"1px solid #1a1a1a",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#aaa",lineHeight:1.5},
    weekNav:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px 0"},
    wBtn:(d)=>({background:d?"#0e0e0e":"#151515",border:"1px solid #222",color:d?"#333":"#888",borderRadius:8,padding:"8px 14px",fontSize:12,cursor:d?"default":"pointer"}),
    weekTitle:{fontSize:16,fontWeight:800,color:"#fff"},
    tabs:{display:"flex",padding:"0 18px",gap:6,marginTop:14},
    tab:(a)=>({flex:1,background:a?"#151515":"transparent",border:a?"1px solid #2a2a2a":"1px solid transparent",color:a?"#fff":"#555",borderRadius:8,padding:"8px 4px",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:"0.5px"}),
    sec:{padding:"14px 18px"},
    secTitle:{fontSize:10,fontWeight:700,color:"#444",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:10,marginTop:4},
    dayRow:(done)=>({background:done?"#0a120a":"#0e0e0e",border:`1px solid ${done?"#10B98133":"#1a1a1a"}`,borderRadius:10,padding:"12px 14px",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}),
    dayLabel:{fontSize:13,fontWeight:700,color:"#fff"},
    dayMeta:{fontSize:11,color:"#555",marginTop:2},
    wHeader:{padding:"16px 18px 8px",borderBottom:"1px solid #111"},
    back:{background:"none",border:"none",color:"#10B981",fontSize:13,cursor:"pointer",padding:"16px 18px 0",display:"flex",alignItems:"center",gap:6},
    exCard:(done)=>({background:done?"#081208":"#0e0e0e",border:`1px solid ${done?"#10B98122":"#1a1a1a"}`,borderRadius:10,padding:"12px 14px",marginBottom:8}),
    exName:{fontSize:14,fontWeight:700,color:"#f0f0f0"},
    exMeta:{fontSize:11,color:"#666",marginTop:3,marginBottom:10},
    sets:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6},
    bubble:(done)=>({minWidth:34,height:34,borderRadius:7,background:done?"#10B981":"#151515",border:`1px solid ${done?"#10B981":"#2a2a2a"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:done?"#000":"#555",cursor:"pointer",transition:"all 0.12s"}),
    wRow:{display:"flex",gap:6,alignItems:"center",marginTop:6},
    wIn:{background:"#111",border:"1px solid #2a2a2a",borderRadius:6,padding:"5px 10px",color:"#fff",fontSize:12,width:70,outline:"none"},
    saveBtn:{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#888",borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer"},
    saved:(col)=>({background:col+"22",color:col,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700}),
    tipText:{fontSize:11,color:"#3B82F6",fontStyle:"italic",marginTop:8,lineHeight:1.5},
    finBtn:{margin:"14px 18px",background:"#10B981",color:"#000",border:"none",borderRadius:10,padding:"14px",fontSize:14,fontWeight:800,cursor:"pointer",width:"calc(100% - 36px)"},
    pbar:{height:3,background:"#151515",borderRadius:2,margin:"10px 0 0",overflow:"hidden"},
    pfill:(pct,col)=>({height:"100%",width:`${pct}%`,background:col,transition:"width 0.3s",borderRadius:2}),
    macroGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14},
    macroBox:(col)=>({background:"#0e0e0e",border:`1px solid ${col}33`,borderRadius:10,padding:"14px",textAlign:"center"}),
    macroNum:(col)=>({fontSize:26,fontWeight:800,color:col,display:"block"}),
    macroLab:{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:"0.8px",marginTop:2},
    mealTabs:{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",marginBottom:12},
    mealBtn:(a)=>({flexShrink:0,background:a?"#10B981":"#0e0e0e",color:a?"#000":"#666",border:`1px solid ${a?"#10B981":"#1a1a1a"}`,borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}),
    mealCard:{background:"#0e0e0e",border:"1px solid #1a1a1a",borderRadius:10,padding:"12px 14px",marginBottom:8},
    mealTime:{fontSize:10,color:"#555",letterSpacing:"0.5px",textTransform:"uppercase"},
    mealName:{fontSize:13,fontWeight:700,color:"#f0f0f0",marginTop:2},
    mealItems:{fontSize:12,color:"#888",marginTop:4,lineHeight:1.7},
    mealMeta:{display:"flex",gap:12,marginTop:8},
    mealMetaItem:(col)=>({fontSize:11,color:col,fontWeight:700}),
    prepCard:{background:"#0a0e0a",border:"1px solid #10B98133",borderRadius:10,padding:"12px 14px",marginBottom:14},
    prepTip:{fontSize:12,color:"#888",lineHeight:1.8,padding:"3px 0"},
    toggleBtn:{background:"none",border:"1px solid #2a2a2a",color:"#666",borderRadius:8,padding:"8px 14px",fontSize:11,cursor:"pointer",width:"100%",marginBottom:10,textAlign:"left"},
    chart:{background:"#0e0e0e",border:"1px solid #1a1a1a",borderRadius:10,padding:"14px",marginBottom:14},
    logRow:{display:"flex",gap:8,alignItems:"center",marginTop:8},
    logIn:{flex:1,background:"#111",border:"1px solid #2a2a2a",borderRadius:8,padding:"10px 14px",color:"#fff",fontSize:14,outline:"none"},
    logBtn:{background:"#10B981",color:"#000",border:"none",borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:800,cursor:"pointer"},
  };

  if (!loaded) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080808",flexDirection:"column",gap:16}}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap" rel="stylesheet"/>
      <div style={{fontSize:24,fontWeight:800,color:"#fff",letterSpacing:"-1px"}}>SHRED<span style={{color:"#10B981"}}>12</span></div>
      <div style={{fontSize:12,color:"#555"}}>Loading your programme...</div>
    </div>
  );

  // ── WORKOUT SCREEN ──────────────────────────────────────────────────────
  if (screen === "workout" && selectedWorkoutKey) {
    const w = WORKOUTS[selectedWorkoutKey];
    const pct = getWorkoutProgress(selectedWorkoutKey);
    return (
      <div style={c.root}>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap" rel="stylesheet"/>
        <button style={c.back} onClick={() => { setScreen("home"); setSelectedWorkoutKey(null); }}>← Back</button>
        <div style={c.wHeader}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>{w.emoji}</span>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{w.name} Day</div>
              <div style={{fontSize:11,color:"#555"}}>Week {s.currentWeek} · {phase.label}</div>
            </div>
          </div>
          <div style={c.pbar}><div style={c.pfill(pct, w.color)}/></div>
          <div style={{fontSize:11,color:"#555",marginTop:5}}>{pct}% complete</div>
        </div>
        <div style={c.sec}>
          {w.exercises.map((ex, ei) => {
            const done = getExProgress(selectedWorkoutKey, ei, ex.sets) === ex.sets;
            const open = expandedEx === ei;
            return (
              <div key={ei} style={c.exCard(done)}>
                <div style={{display:"flex",justifyContent:"space-between",cursor:"pointer"}} onClick={() => setExpandedEx(open ? null : ei)}>
                  <div style={c.exName}>{ex.name} {done && "✓"}</div>
                  <span style={{color:"#333",fontSize:16}}>{open ? "▲" : "▼"}</span>
                </div>
                <div style={c.exMeta}>{ex.sets} sets · {ex.reps} reps · Rest {ex.rest}</div>
                <div style={c.sets}>
                  {Array.from({length:ex.sets}, (_, si) => (
                    <div key={si} style={c.bubble(isSetDone(selectedWorkoutKey, ei, si))} onClick={() => toggleSet(selectedWorkoutKey, ei, si)}>{si + 1}</div>
                  ))}
                </div>
                {open && (
                  <div onClick={e => e.stopPropagation()}>
                    <div style={c.tipText}>💡 {ex.tip}</div>
                    <div style={{marginTop:10}}>
                      <div style={{display:"flex",gap:4,marginBottom:6,alignItems:"center"}}>
                        <span style={{fontSize:10,color:"#444",letterSpacing:"1px",width:48}}>SET</span>
                        <span style={{fontSize:10,color:"#444",letterSpacing:"1px",flex:1,textAlign:"center"}}>WEIGHT (kg)</span>
                        <span style={{fontSize:10,color:"#444",letterSpacing:"1px",flex:1,textAlign:"center"}}>REPS</span>
                        <span style={{width:44}}/>
                      </div>
                      {Array.from({length:ex.sets}, (_, si) => {
                        const ik = `${s.currentWeek}-${selectedWorkoutKey}-${ei}-${si}`;
                        const sv = s.savedWeights[ik];
                        const rk = `${s.currentWeek}-${selectedWorkoutKey}-${ei}-${si}-reps`;
                        const sr = s.savedWeights[rk];
                        const prevWk = `${s.currentWeek-1}-${selectedWorkoutKey}-${ei}-${si}`;
                        const prevWeight = s.savedWeights[prevWk];
                        const isPB = sv && prevWeight && parseFloat(sv) > parseFloat(prevWeight);
                        return (
                          <div key={si} style={{...c.wRow, alignItems:"center", gap:4, marginBottom:6}} onClick={e => e.stopPropagation()}>
                            <span style={{fontSize:11,color:"#555",width:48,flexShrink:0}}>S{si+1}{isPB ? " 🏆" : ""}</span>
                            <input style={{...c.wIn, flex:1, width:"auto"}} type="number" inputMode="decimal" placeholder={prevWeight || "kg"}
                              value={s.weightInputs[ik] || ""}
                              onClick={e => e.stopPropagation()}
                              onChange={e => { e.stopPropagation(); update({weightInputs: {...s.weightInputs, [ik]: e.target.value}}); }}/>
                            <input style={{...c.wIn, flex:1, width:"auto"}} type="number" inputMode="numeric" placeholder="reps"
                              value={s.weightInputs[rk] || ""}
                              onClick={e => e.stopPropagation()}
                              onChange={e => { e.stopPropagation(); update({weightInputs: {...s.weightInputs, [rk]: e.target.value}}); }}/>
                          </div>
                        );
                      })}
                      {s.currentWeek > 1 && (() => {
                        const prevEntries = Array.from({length:ex.sets}, (_,si) => {
                          const pk = `${s.currentWeek-1}-${selectedWorkoutKey}-${ei}-${si}`;
                          const rk = `${s.currentWeek-1}-${selectedWorkoutKey}-${ei}-${si}-reps`;
                          return s.savedWeights[pk] ? `${s.savedWeights[pk]}kg×${s.savedWeights[rk]||"?"}` : null;
                        }).filter(Boolean);
                        if (prevEntries.length === 0) return null;
                        return <div style={{fontSize:10,color:"#444",marginTop:4,fontStyle:"italic"}}>Last week: {prevEntries.join("  ")}</div>;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* AB FINISHER */}
        {AB_DAYS.includes(selectedWorkoutKey) && (
          <div style={{margin:"0 14px"}}>
            <button onClick={() => update({abFinisherOn: !s.abFinisherOn})}
              style={{width:"100%",background:s.abFinisherOn?"#0a120a":"#0e0e0e",border:`1px solid ${s.abFinisherOn?"#10B981":"#2a2a2a"}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:700,color:s.abFinisherOn?"#10B981":"#888"}}>💪 Ab Finisher {s.abFinisherOn ? "(Added)" : "(Optional)"}</div>
                <div style={{fontSize:11,color:"#555",marginTop:2}}>4 exercises · ~10-15 mins · Toggle to add</div>
              </div>
              <div style={{width:36,height:20,borderRadius:10,background:s.abFinisherOn?"#10B981":"#2a2a2a",position:"relative",transition:"background 0.2s",flexShrink:0}}>
                <div style={{position:"absolute",top:2,left:s.abFinisherOn?18:2,width:16,height:16,borderRadius:8,background:"#fff",transition:"left 0.2s"}}/>
              </div>
            </button>
            {s.abFinisherOn && (
              <div style={{background:"#0a0e0a",border:"1px solid #10B98133",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
                <div style={{fontSize:11,color:"#10B981",fontWeight:700,marginBottom:4,letterSpacing:"0.5px"}}>AB FINISHER</div>
                <div style={{fontSize:11,color:"#666",marginBottom:12,lineHeight:1.5}}>{AB_FINISHER.note}</div>
                {AB_FINISHER.exercises.map((ex, ei) => {
                  const abKey = `ab-${s.currentWeek}-${selectedWorkoutKey}`;
                  const abDone = Array.from({length:ex.sets}, (_, si) => !!s.completedAbSets[`${abKey}-${ei}-${si}`]).every(Boolean);
                  const abOpen = expandedEx === `ab-${ei}`;
                  return (
                    <div key={ei} style={{...c.exCard(abDone), borderColor:abDone?"#10B98133":"#1a2a1a"}}>
                      <div style={{display:"flex",justifyContent:"space-between",cursor:"pointer"}} onClick={() => setExpandedEx(abOpen ? null : `ab-${ei}`)}>
                        <div style={c.exName}>{ex.name} {abDone && "✓"}</div>
                        <span style={{color:"#333",fontSize:16}}>{abOpen ? "▲" : "▼"}</span>
                      </div>
                      <div style={c.exMeta}>{ex.sets} sets · {ex.reps} · Rest {ex.rest}</div>
                      <div style={c.sets}>
                        {Array.from({length:ex.sets}, (_, si) => {
                          const done = !!s.completedAbSets[`${abKey}-${ei}-${si}`];
                          return (
                            <div key={si} style={c.bubble(done)} onClick={() => {
                              const k = `${abKey}-${ei}-${si}`;
                              update({completedAbSets: {...s.completedAbSets, [k]: !s.completedAbSets[k]}});
                            }}>{si+1}</div>
                          );
                        })}
                      </div>
                      {abOpen && (
                        <div>
                          <div style={c.tipText}>💡 {ex.tip}</div>
                          {ex.name !== "Plank" && (
                            <div style={{marginTop:10}}>
                              <div style={{fontSize:10,color:"#444",letterSpacing:"1px",marginBottom:6}}>LOG WEIGHTS / NOTES (kg)</div>
                              {Array.from({length:ex.sets}, (_, si) => {
                                const ik = `${abKey}-${ei}-${si}`;
                                const sv = s.savedAbWeights[ik];
                                return (
                                  <div key={si} style={c.wRow}>
                                    <span style={{fontSize:11,color:"#555",width:40}}>Set {si+1}</span>
                                    {sv ? <span style={c.saved("#10B981")}>{sv}kg ✓</span> : (
                                      <>
                                        <input style={c.wIn} type="number" placeholder="kg"
                                          value={s.abWeightInputs[ik] || ""}
                                          onChange={e => update({abWeightInputs: {...s.abWeightInputs, [ik]: e.target.value}})}/>
                                        <button style={c.saveBtn} onClick={() => {
                                          const val = s.abWeightInputs[ik];
                                          if (val) update({savedAbWeights: {...s.savedAbWeights, [ik]: val}});
                                        }}>Save</button>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Progress photo — always visible when in workout */}
        <div style={{margin:"0 18px 14px"}}>
          {pct === 100 && (
            <div style={{background:"#0a0e0a",border:"1px solid #10B98133",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:"#10B981",marginBottom:4}}>📸 Log a Progress Photo</div>
              <div style={{fontSize:11,color:"#666",marginBottom:10,lineHeight:1.5}}>Optional — snap a quick mirror pic to track your transformation. Front, side or back.</div>
              <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:"#111",border:"1px dashed #2a2a2a",borderRadius:8,padding:"10px 14px"}}>
                <span style={{fontSize:20}}>📷</span>
                <span style={{fontSize:12,color:"#888"}}>Tap to upload photo</span>
                <input type="file" accept="image/*" style={{display:"none"}} onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => {
                    const now = new Date();
                    setProgressPhotos(prev => [...prev, {
                      id: Date.now(),
                      src: ev.target.result,
                      week: s.currentWeek,
                      workout: WORKOUTS[selectedWorkoutKey]?.name || "",
                      date: `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`,
                      phase: getPhase(s.currentWeek).label.split("—")[1]?.trim() || "",
                    }]);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}/>
              </label>
            </div>
          )}
          <button style={{...c.finBtn, background: pct === 100 ? "#10B981" : "#1a1a1a", color: pct === 100 ? "#000" : "#555", border: pct === 100 ? "none" : "1px solid #2a2a2a"}}
            onClick={finishWorkout}>
            {pct === 100 ? "✅ Complete Workout" : `Complete Workout (${pct}% done)`}
          </button>
        </div>
        <div style={{height:40}}/>
      </div>
    );
  }

  // ── HOME SCREEN ─────────────────────────────────────────────────────────
  return (
    <div style={c.root}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap" rel="stylesheet"/>

      {/* Top bar — simplified, no week nav */}
      <div style={c.topBar}>
        <div style={c.logo}>SHRED<span style={{color:"#10B981"}}>12</span></div>
        <div style={c.badge}>Wk {s.currentWeek} · {phase.label.split("—")[0].trim()}</div>
      </div>

      {/* Tabs — Today / Training / Nutrition / Progress */}
      <div style={{...c.tabs, marginTop:14}}>
        {[["today","Today"],["training","Training"],["nutrition","Nutrition"],["progress","Progress"]].map(([id,label]) => (
          <button key={id} style={c.tab(s.activeTab === id)} onClick={() => update({activeTab: id})}>{label}</button>
        ))}
      </div>

      {/* ── TODAY TAB ── */}
      {s.activeTab === "today" && (
        <div style={c.sec}>
          {/* Phase banner */}
          <div style={{background:phase.color+"15",border:`1px solid ${phase.color}33`,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:phase.color,letterSpacing:"1px",textTransform:"uppercase",marginBottom:4}}>{phase.label}</div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:"#888"}}>🔥 {phase.cals} kcal</span>
              <span style={{fontSize:11,color:"#888"}}>🥩 {phase.protein}g protein</span>
              <span style={{fontSize:11,color:"#888"}}>🍚 {phase.carbs}g carbs</span>
              <span style={{fontSize:11,color:"#888"}}>🫒 {phase.fats}g fat</span>
            </div>
          </div>

          {/* Milestone */}
          <div style={c.milestone}>{MILESTONES[s.currentWeek]}</div>

          {/* Today's workout */}
          {(() => {
            const dow = new Date().getDay(); // 0=Sun
            const dayMap = {1:0,2:1,3:2,4:3,5:4,6:null,0:null};
            const wIdx = dayMap[dow];
            const todayKey = wIdx !== null ? WEEK_SCHEDULE[wIdx] : null;
            const todayWorkout = todayKey && todayKey !== "rest" ? WORKOUTS[todayKey] : null;
            const todayDone = todayKey ? !!s.completedWorkouts[`${s.currentWeek}-${todayKey}`] : false;
            return (
              <div style={{marginTop:14}}>
                <div style={c.secTitle}>Today's Workout</div>
                {todayWorkout ? (
                  <div style={{...c.dayRow(todayDone), cursor: todayDone ? "default" : "pointer"}}
                    onClick={() => { if (!todayDone) { setSelectedWorkoutKey(todayKey); setScreen("workout"); setExpandedEx(null); }}}>
                    <div>
                      <div style={c.dayLabel}>{todayWorkout.emoji} {todayWorkout.name} — {todayWorkout.focus} {todayDone && "✓"}</div>
                      <div style={c.dayMeta}>{todayWorkout.exercises.length} exercises · {todayDone ? "Completed!" : "Tap to start"}</div>
                    </div>
                    {!todayDone && <span style={{color:"#333",fontSize:18}}>›</span>}
                  </div>
                ) : (
                  <div style={{background:"#0e0e0e",border:"1px solid #1a1a1a",borderRadius:10,padding:"14px",textAlign:"center",color:"#555",fontSize:12}}>
                    {dow === 0 || dow === 6 ? "Rest day today 💤 Recovery is part of the process." : "No session scheduled."}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Week session summary */}
          <div style={{marginTop:16}}>
            <div style={c.secTitle}>{weekDone}/5 sessions this week</div>
            <div style={c.pbar}><div style={c.pfill((weekDone/5)*100,"#10B981")}/></div>
            <div style={{display:"flex",gap:5,marginTop:10}}>
              {WEEK_SCHEDULE.map((wKey,di) => {
                const isRest = wKey === "rest";
                const done = !isRest && !!s.completedWorkouts[`${s.currentWeek}-${wKey}`];
                const wData = isRest ? null : WORKOUTS[wKey];
                return (
                  <div key={di} style={{flex:1,textAlign:"center"}}>
                    <div style={{width:"100%",aspectRatio:"1",borderRadius:8,background:done?"#10B98122":isRest?"transparent":"#0e0e0e",border:`1px solid ${done?"#10B98144":isRest?"#111":"#1a1a1a"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:done?"#10B981":isRest?"#222":"#333",marginBottom:4}}>
                      {done ? "✓" : isRest ? "—" : wData.emoji}
                    </div>
                    <div style={{fontSize:9,color:"#444"}}>{DAY_NAMES[di]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's meals summary */}
          {(() => {
            const dow = new Date().getDay();
            const isRest = [0,6].includes(dow);
            const plan = isRest ? MEAL_PLANS.rest : MEAL_PLANS.training;
            const isSat = dow === 6;
            const macros = isRest ? {cals:2600,protein:195} : {cals:2800,protein:200};
            return (
              <div style={{marginTop:16}}>
                <div style={c.secTitle}>Today's Nutrition</div>
                <div style={{background:"#0e0e0e",border:"1px solid #1a1a1a",borderRadius:10,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#f0f0f0"}}>{isRest ? "Rest Day" : "Training Day"}</div>
                    <div style={{fontSize:11,color:"#666",marginTop:2}}>{macros.cals} kcal · {macros.protein}g protein target</div>
                  </div>
                  <button onClick={() => update({activeTab:"nutrition"})} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#888",borderRadius:8,padding:"6px 12px",fontSize:11,cursor:"pointer"}}>Full plan →</button>
                </div>
                {/* Quick meal summary */}
                {!isRest ? (
                  <>
                    <div style={c.mealCard}>
                      <div style={c.mealTime}>Breakfast</div>
                      <div style={c.mealName}>Option A: 5-Egg Scramble & Toast</div>
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 700 kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 50g protein</span></div>
                    </div>
                    <div style={c.mealCard}>
                      <div style={c.mealTime}>Lunch</div>
                      <div style={c.mealName}>Chicken Rice Box</div>
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 750 kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 55g protein</span></div>
                    </div>
                    <div style={c.mealCard}>
                      <div style={c.mealTime}>Tonight's Dinner</div>
                      <div style={c.mealName}>{getTodayDinner().name}</div>
                      <div style={{fontSize:12,color:"#888",marginTop:4}}>{getTodayDinner().items.slice(0,60)}...</div>
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {getTodayDinner().kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {getTodayDinner().protein}g protein</span></div>
                    </div>
                  </>
                ) : (
                  <div style={c.mealCard}>
                    <div style={c.mealTime}>{isSat ? "Saturday" : "Sunday"} — Rest Day</div>
                    <div style={c.mealName}>{isSat ? "High-Protein Pancakes + Sirloin Steak dinner" : "Full Fry-Up + Chicken Curry dinner"}</div>
                    <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 2,600 kcal target</span><span style={c.mealMetaItem("#3B82F6")}>💪 195g protein</span></div>
                  </div>
                )}
                <button onClick={() => update({activeTab:"nutrition"})} style={c.toggleBtn}>View full meal plan →</button>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── TRAINING TAB ── */}
      {s.activeTab === "training" && (
        <div style={c.sec}>
          {/* Week navigator — kept here only */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <button style={c.wBtn(s.currentWeek === 1)} onClick={() => s.currentWeek > 1 && update({currentWeek: s.currentWeek - 1})} disabled={s.currentWeek === 1}>← Prev</button>
            <span style={c.weekTitle}>Week {s.currentWeek} of 12</span>
            <button style={c.wBtn(s.currentWeek === 12)} onClick={() => s.currentWeek < 12 && update({currentWeek: s.currentWeek + 1})} disabled={s.currentWeek === 12}>Next →</button>
          </div>

          <div style={c.secTitle}>{weekDone}/5 sessions this week</div>
          <div style={c.pbar}><div style={c.pfill((weekDone/5)*100, "#10B981")}/></div>
          <div style={{marginBottom:12}}/>

          {WEEK_SCHEDULE.map((wKey, di) => {
            const isRest = wKey === "rest";
            const done = s.completedWorkouts[`${s.currentWeek}-${wKey}`];
            const wData = isRest ? null : WORKOUTS[wKey];
            return (
              <div key={di} style={isRest ? {...c.dayRow(false), cursor:"default", opacity:0.4} : c.dayRow(done)}
                onClick={() => { if (!isRest) { setSelectedWorkoutKey(wKey); setScreen("workout"); setExpandedEx(null); }}}>
                <div>
                  <div style={c.dayLabel}>{DAY_NAMES[di]} {isRest ? "— Rest" : `· ${wData.name}`} {done && "✓"}</div>
                  {!isRest && <div style={c.dayMeta}>{wData.emoji} {wData.exercises.length} exercises · {wData.focus}</div>}
                </div>
                {!isRest && <span style={{color:"#333",fontSize:18}}>›</span>}
              </div>
            );
          })}

          <div style={{background:"#0e0e0e",border:"1px solid #1a1a1a",borderRadius:10,padding:"14px",marginTop:4}}>
            <div style={{fontSize:11,fontWeight:700,color:"#555",letterSpacing:"1px",marginBottom:8}}>💡 CARDIO — WEEK {s.currentWeek}</div>
            {s.currentWeek <= 4 && <div style={{fontSize:12,color:"#888",lineHeight:1.7}}>Your 15k daily steps are already doing the heavy lifting. Optional: 2x 20-min Zone 2 incline treadmill walk after training.</div>}
            {s.currentWeek >= 5 && s.currentWeek <= 8 && <div style={{fontSize:12,color:"#888",lineHeight:1.7}}>2-3x per week: 25 min incline treadmill walk after training. Optional 1x HIIT Saturday (10 min sprint intervals).</div>}
            {s.currentWeek >= 9 && <div style={{fontSize:12,color:"#888",lineHeight:1.7}}>3x per week: 25-30 min incline walk post-workout. 1x HIIT Saturday. Abs showing by week 10-11.</div>}
          </div>
        </div>
      )}

      {/* ── NUTRITION TAB — full week view ── */}
      {s.activeTab === "nutrition" && (
        <div style={c.sec}>
          {(() => {
            const dow = new Date().getDay();
            const isRest = [0,6].includes(dow);
            const m = isRest ? {cals:2600,protein:195,carbs:275,fats:72} : {cals:2800,protein:200,carbs:310,fats:67};
            const isSat = dow === 6;

            // Day selector state — default to today
            const todaySelIdx = isRest ? (isSat ? 5 : 6) : Math.max(0, dow - 1);
            const [selDayIdx, setSelDayIdx] = [s.nutritionDay ?? todaySelIdx, (i) => update({nutritionDay: i})];

            const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
            const isRestDay = (i) => i >= 5;
            const selIsRest = isRestDay(selDayIdx);
            const selIsSat = selDayIdx === 5;
            const selMacros = selIsRest ? {cals:2600,protein:195,carbs:275,fats:72} : {cals:2800,protein:200,carbs:310,fats:67};
            const selPlan = selIsRest ? MEAL_PLANS.rest : MEAL_PLANS.training;
            const selDayPlan = selIsRest ? (selIsSat ? selPlan.saturday : selPlan.sunday) : null;
            const selDinner = !selIsRest ? MEAL_PLANS.training.dinners[selDayIdx] : null;

            return (
              <>
                {/* Day strip */}
                <div style={{display:"flex",gap:5,marginBottom:14}}>
                  {DAY_LABELS.map((d, i) => {
                    const active = selDayIdx === i;
                    const rest = isRestDay(i);
                    const isToday = dow === (i < 5 ? i + 1 : i === 5 ? 6 : 0);
                    return (
                      <button key={i} onClick={() => setSelDayIdx(i)}
                        style={{flex:1,padding:"7px 3px",borderRadius:8,border:`1px solid ${active?(rest?"#F59E0B":"#10B981"):"#1a1a1a"}`,background:active?(rest?"#F59E0B22":"#10B98122"):"transparent",cursor:"pointer",position:"relative"}}>
                        <div style={{fontSize:10,fontWeight:700,color:active?(rest?"#F59E0B":"#10B981"):"#555"}}>{d}</div>
                        <div style={{fontSize:9,color:"#444",marginTop:2}}>{rest?"rest":"train"}</div>
                        {isToday && <div style={{position:"absolute",bottom:3,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:"#F59E0B"}}/>}
                      </button>
                    );
                  })}
                </div>

                {/* Macros for selected day */}
                <div style={c.macroGrid}>
                  <div style={c.macroBox("#EF4444")}><span style={c.macroNum("#EF4444")}>{selMacros.cals}</span><div style={c.macroLab}>Calories</div></div>
                  <div style={c.macroBox("#3B82F6")}><span style={c.macroNum("#3B82F6")}>{selMacros.protein}g</span><div style={c.macroLab}>Protein</div></div>
                  <div style={c.macroBox("#F59E0B")}><span style={c.macroNum("#F59E0B")}>{selMacros.carbs}g</span><div style={c.macroLab}>Carbs</div></div>
                  <div style={c.macroBox("#10B981")}><span style={c.macroNum("#10B981")}>{selMacros.fats}g</span><div style={c.macroLab}>Fats</div></div>
                </div>

                {/* Training day meals */}
                {!selIsRest && (
                  <>
                    <div style={c.secTitle}>Breakfast — Choose One</div>
                    {selPlan.breakfastOptions.map((opt, i) => (
                      <div key={i} style={c.mealCard}>
                        <div style={{fontSize:10,color:"#10B981",fontWeight:700,marginBottom:2}}>{opt.label}</div>
                        <div style={c.mealTime}>{opt.subtitle}</div>
                        <div style={c.mealItems}>{opt.items}</div>
                        {opt.prep && <div style={{fontSize:11,color:"#F59E0B",fontStyle:"italic",marginTop:4,lineHeight:1.5}}>📋 {opt.prep}</div>}
                        <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {opt.kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {opt.protein}g protein</span></div>
                      </div>
                    ))}
                    <div style={c.secTitle}>Mid-Morning</div>
                    <div style={c.mealCard}>
                      <div style={c.mealTime}>{selPlan.midMorning.time}</div>
                      <div style={c.mealItems}>{selPlan.midMorning.items}</div>
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {selPlan.midMorning.kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {selPlan.midMorning.protein}g protein</span></div>
                    </div>
                    <div style={c.secTitle}>Lunch</div>
                    <div style={c.mealCard}>
                      <div style={c.mealTime}>{selPlan.lunch.time}</div>
                      <div style={c.mealItems}>{selPlan.lunch.items}</div>
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {selPlan.lunch.kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {selPlan.lunch.protein}g protein</span></div>
                    </div>
                    <div style={c.secTitle}>Pre-Workout</div>
                    <div style={c.mealCard}>
                      <div style={c.mealTime}>{selPlan.preWorkout.time}</div>
                      <div style={c.mealItems}>{selPlan.preWorkout.items}</div>
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {selPlan.preWorkout.kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {selPlan.preWorkout.protein}g protein</span></div>
                    </div>
                    <div style={c.secTitle}>Post-Workout</div>
                    <div style={c.mealCard}>
                      <div style={c.mealTime}>{selPlan.postWorkout.time}</div>
                      <div style={c.mealItems}>{selPlan.postWorkout.items}</div>
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {selPlan.postWorkout.kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {selPlan.postWorkout.protein}g protein</span></div>
                    </div>
                    {selDinner && <>
                      <div style={c.secTitle}>Dinner — {selDinner.day}</div>
                      <div style={{...c.mealCard,border:"1px solid #10B98133"}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#10B981",marginBottom:2}}>{selDinner.name}</div>
                        <div style={c.mealItems}>{selDinner.items}</div>
                        <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {selDinner.kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {selDinner.protein}g protein</span></div>
                      </div>
                    </>}
                    <div style={c.secTitle}>Evening Snack</div>
                    <div style={c.mealCard}>
                      <div style={c.mealTime}>{selPlan.eveningSnack.time}</div>
                      <div style={c.mealItems}>{selPlan.eveningSnack.items}</div>
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {selPlan.eveningSnack.kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {selPlan.eveningSnack.protein}g protein</span></div>
                    </div>
                  </>
                )}

                {/* Rest day meals */}
                {selIsRest && selDayPlan && (
                  <>
                    <div style={c.secTitle}>Breakfast</div>
                    <div style={c.mealCard}>
                      <div style={{fontSize:11,color:"#10B981",fontWeight:700,marginBottom:2}}>{selDayPlan.breakfast.label}</div>
                      <div style={c.mealTime}>{selDayPlan.breakfast.subtitle}</div>
                      <div style={c.mealItems}>{selDayPlan.breakfast.items}</div>
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {selDayPlan.breakfast.kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {selDayPlan.breakfast.protein}g protein</span></div>
                    </div>
                    <div style={c.secTitle}>Lunch</div>
                    <div style={c.mealCard}>
                      <div style={{fontSize:11,color:"#10B981",fontWeight:700,marginBottom:2}}>{selDayPlan.lunch.label}</div>
                      <div style={c.mealTime}>{selDayPlan.lunch.subtitle}</div>
                      <div style={c.mealItems}>{selDayPlan.lunch.items}</div>
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {selDayPlan.lunch.kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {selDayPlan.lunch.protein}g protein</span></div>
                    </div>
                    <div style={c.secTitle}>Afternoon Snack</div>
                    <div style={c.mealCard}>
                      <div style={c.mealTime}>{selPlan.afternoonSnack.time}</div>
                      <div style={c.mealItems}>{selPlan.afternoonSnack.items}</div>
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {selPlan.afternoonSnack.kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {selPlan.afternoonSnack.protein}g protein</span></div>
                    </div>
                    <div style={c.secTitle}>Dinner</div>
                    <div style={c.mealCard}>
                      <div style={{fontSize:11,color:"#10B981",fontWeight:700,marginBottom:2}}>{selDayPlan.dinner.label}</div>
                      <div style={c.mealTime}>{selDayPlan.dinner.subtitle}</div>
                      <div style={c.mealItems}>{selDayPlan.dinner.items}</div>
                      {selDayPlan.dinner.batchNote && <div style={{fontSize:11,color:"#F59E0B",fontStyle:"italic",marginTop:4,lineHeight:1.5}}>📦 {selDayPlan.dinner.batchNote}</div>}
                      <div style={c.mealMeta}><span style={c.mealMetaItem("#EF4444")}>🔥 {selDayPlan.dinner.kcal} kcal</span><span style={c.mealMetaItem("#3B82F6")}>💪 {selDayPlan.dinner.protein}g protein</span></div>
                    </div>
                  </>
                )}

                {/* Supplements collapsible */}
                <button style={c.toggleBtn} onClick={() => update({showSupps: !s.showSupps})}>
                  {s.showSupps ? "▲ Hide" : "▼ Show"} Supplements
                </button>
                {s.showSupps && SUPPLEMENTS.map((sup, i) => (
                  <div key={i} style={{...c.mealCard,marginBottom:6}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#f0f0f0"}}>{sup.name}</div>
                    <div style={{fontSize:11,color:"#10B981",marginTop:2,fontWeight:600}}>{sup.dose} · {sup.timing}</div>
                    <div style={{fontSize:11,color:"#666",marginTop:3}}>{sup.purpose}</div>
                  </div>
                ))}

                {/* Prep tips */}
                <button style={c.toggleBtn} onClick={() => update({showPrepTips: !s.showPrepTips})}>
                  {s.showPrepTips ? "▲ Hide" : "▼ Show"} Prep Tips
                </button>
                {s.showPrepTips && (
                  <div style={c.prepCard}>
                    {PREP_TIPS.map((t, i) => <div key={i} style={c.prepTip}>{t}</div>)}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* ── PROGRESS TAB ── */}
      {s.activeTab === "progress" && (
        <div style={c.sec}>
          <div style={c.secTitle}>Body Weight</div>
          <div style={c.chart}>
            {s.bodyWeights.length >= 2 ? (() => {
              const vals = s.bodyWeights.map(e => e.weight);
              const min = Math.min(...vals) - 1, max = Math.max(...vals) + 1;
              const W = 300, H = 90;
              const pts = s.bodyWeights.map((e, i) => `${(i/(s.bodyWeights.length-1))*W},${H-((e.weight-min)/(max-min))*H}`).join(" ");
              const diff = vals[vals.length-1] - vals[0];
              return (
                <div>
                  <svg width="100%" viewBox={`0 0 ${W} ${H+20}`} style={{overflow:"visible"}}>
                    <polyline points={pts} fill="none" stroke="#10B981" strokeWidth="2" strokeLinejoin="round"/>
                    {s.bodyWeights.map((e, i) => (
                      <g key={i}>
                        <circle cx={(i/(s.bodyWeights.length-1))*W} cy={H-((e.weight-min)/(max-min))*H} r="4" fill="#10B981"/>
                        <text x={(i/(s.bodyWeights.length-1))*W} y={H+16} textAnchor="middle" fontSize="9" fill="#555">Wk{e.week}</text>
                      </g>
                    ))}
                  </svg>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:4}}>
                    <span style={{color:"#666"}}>Start: {vals[0]}kg</span>
                    <span style={{color:diff < 0 ? "#10B981" : "#EF4444", fontWeight:700}}>{diff < 0 ? "▼" : "▲"} {Math.abs(diff).toFixed(1)}kg</span>
                    <span style={{color:"#666"}}>Now: {vals[vals.length-1]}kg</span>
                  </div>
                </div>
              );
            })() : <div style={{textAlign:"center",color:"#444",padding:"20px 0",fontSize:12}}>Log 2+ weigh-ins to see your trend</div>}
          </div>
          <div style={c.logRow}>
            <input style={c.logIn} type="number" placeholder="Log today's weight (kg)" value={newBodyWeight} onChange={e => setNewBodyWeight(e.target.value)}/>
            <button style={c.logBtn} onClick={() => {
              const v = parseFloat(newBodyWeight);
              if (!isNaN(v) && v > 0) { update({bodyWeights: [...s.bodyWeights, {week:s.currentWeek, weight:v}]}); setNewBodyWeight(""); }
            }}>Log</button>
          </div>

          <div style={{marginTop:22}}>
            <div style={c.secTitle}>Expected Timeline</div>
            {[
              {weeks:"1-4",label:"Foundation Cut",text:"2-3kg total loss. Waist narrows. Muscle maintained. Energy stays high.",color:"#3B82F6"},
              {weeks:"5-8",label:"Deep Cut",text:"Further 3-4kg loss. Shoulder definition visible. V-taper forming.",color:"#F59E0B"},
              {weeks:"9-12",label:"Final Shred",text:"Abs visible week 9-10. Full Dorito shape by week 12. Target: ~84-86kg.",color:"#EF4444"},
            ].map((t, i) => (
              <div key={i} style={{background:"#0e0e0e",border:`1px solid ${t.color}33`,borderRadius:10,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{background:t.color+"22",color:t.color,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>WK {t.weeks}</span>
                  <span style={{fontSize:12,fontWeight:700,color:"#fff"}}>{t.label}</span>
                </div>
                <div style={{fontSize:12,color:"#777",lineHeight:1.6}}>{t.text}</div>
              </div>
            ))}
          </div>

          <div style={{marginTop:8}}>
            <div style={c.secTitle}>Workouts — Week {s.currentWeek}</div>
            {WEEK_SCHEDULE.filter(w => w !== "rest").map((wKey, i) => {
              const done = s.completedWorkouts[`${s.currentWeek}-${wKey}`];
              return <div key={i} style={{fontSize:12,color:done?"#10B981":"#333",padding:"6px 0",borderBottom:"1px solid #0e0e0e"}}>{done ? "✅" : "◻️"} {WORKOUTS[wKey].name}</div>;
            })}
          </div>

          {/* Progress photos */}
          <div style={{marginTop:22}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={c.secTitle}>Progress Photos</div>
              <span style={{fontSize:11,color:"#555"}}>{progressPhotos.length} photo{progressPhotos.length !== 1 ? "s" : ""}</span>
            </div>
            {progressPhotos.length === 0 ? (
              <div style={{background:"#0e0e0e",border:"1px dashed #1e1e1e",borderRadius:10,padding:"30px 14px",textAlign:"center"}}>
                <div style={{fontSize:24,marginBottom:8}}>📸</div>
                <div style={{fontSize:12,color:"#555",lineHeight:1.6}}>No photos yet. Complete a workout and upload a mirror pic.</div>
              </div>
            ) : (
              ["Foundation Cut","Deep Cut","Final Shred"].map(phaseName => {
                const photos = progressPhotos.filter(p => p.phase === phaseName);
                if (photos.length === 0) return null;
                const phaseColor = phaseName === "Foundation Cut" ? "#3B82F6" : phaseName === "Deep Cut" ? "#F59E0B" : "#EF4444";
                return (
                  <div key={phaseName} style={{marginBottom:20}}>
                    <div style={{fontSize:11,fontWeight:700,color:phaseColor,letterSpacing:"0.5px",marginBottom:8,textTransform:"uppercase"}}>{phaseName}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                      {photos.map(photo => (
                        <div key={photo.id} style={{cursor:"pointer",borderRadius:8,overflow:"hidden",border:"1px solid #1a1a1a",aspectRatio:"3/4",position:"relative"}} onClick={() => setSelectedPhoto(photo)}>
                          <img src={photo.src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.85))",padding:"6px 6px 5px"}}>
                            <div style={{fontSize:9,fontWeight:700,color:"#fff"}}>Wk{photo.week}</div>
                            <div style={{fontSize:8,color:"#aaa"}}>{photo.workout}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PHOTO MODAL */}
      {selectedPhoto && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}} onClick={() => setSelectedPhoto(null)}>
          <div style={{width:"100%",maxWidth:400}} onClick={e => e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>Week {selectedPhoto.week} · {selectedPhoto.workout}</div>
                <div style={{fontSize:11,color:"#666",marginTop:2}}>{selectedPhoto.date} · {selectedPhoto.phase}</div>
              </div>
              <button style={{background:"#1a1a1a",border:"1px solid #333",color:"#aaa",borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer"}} onClick={() => setSelectedPhoto(null)}>✕ Close</button>
            </div>
            <img src={selectedPhoto.src} alt="" style={{width:"100%",borderRadius:12,maxHeight:"70vh",objectFit:"contain"}}/>
            <button style={{marginTop:12,background:"#1a1a1a",border:"1px solid #EF444433",color:"#EF4444",borderRadius:8,padding:"8px",fontSize:12,cursor:"pointer",width:"100%"}}
              onClick={() => { setProgressPhotos(prev => prev.filter(p => p.id !== selectedPhoto.id)); setSelectedPhoto(null); }}>
              🗑 Delete photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}