import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Plane, Compass, MapPin, CalendarDays, Wallet, Search, Menu, X, ArrowRight, Sparkles, Globe2, Heart, Plus, Trash2, CheckCircle2, Circle, ShieldCheck, Hotel, TrainFront, Utensils, SlidersHorizontal, Download, ListChecks, Map, ChevronRight, Luggage } from 'lucide-react';
import './style.css';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase=supabaseUrl&&supabaseKey?createClient(supabaseUrl,supabaseKey):null;
const starterTrips=[{id:1,title:'A weekend to remember',place:'Lisbon, Portugal',dates:'3 days · Flexible dates',color:'coral',tasks:['Choose travel dates','Save 3 places to visit','Set a daily budget']},{id:2,title:'Mountains & fresh air',place:'Banff, Canada',dates:'5 days · Flexible dates',color:'blue',tasks:['Check seasonal conditions','Compare accommodation','Prepare an outdoor packing list']}];
function App(){
 const [section,setSection]=useState('Overview'),[mobileOpen,setMobileOpen]=useState(false),[destinations,setDestinations]=useState([]),[features,setFeatures]=useState([]),[featureSearch,setFeatureSearch]=useState(''),[featureModule,setFeatureModule]=useState('All systems'),[destinationSearch,setDestinationSearch]=useState('');
const [activeTripId, setActiveTripId] = useState(null);

 const [trips,setTrips]=useState(()=>{try{return JSON.parse(localStorage.getItem('tm360-trips'))||starterTrips}catch{return starterTrips}});
 const [budget,setBudget]=useState(()=>{try{return JSON.parse(localStorage.getItem('tm360-budget'))||{total:1200,transport:350,stay:420,food:220,activities:140,other:70}}catch{return {total:1200,transport:350,stay:420,food:220,activities:140,other:70}}});
 const [checklist,setChecklist]=useState(()=>{try{return JSON.parse(localStorage.getItem('tm360-checklist'))||[{id:1,text:'Check passport and entry requirements',done:false},{id:2,text:'Confirm transport and accommodation',done:false},{id:3,text:'Save important addresses offline',done:false},{id:4,text:'Pack chargers and travel essentials',done:false}]}catch{return []}});
 const [newTrip,setNewTrip]=useState(''),[newTask,setNewTask]=useState(''),[toast,setToast]=useState('');
const [aiDestination,setAiDestination]=useState('');
const [aiDays,setAiDays]=useState(3);
const [aiInterests,setAiInterests]=useState('Culture, sightseeing, local food');
const [aiBudget,setAiBudget]=useState('Moderate');
const [aiTravelers,setAiTravelers]=useState('Family');
const [aiLoading,setAiLoading]=useState(false);
const [aiItinerary,setAiItinerary]=useState('');
const [aiError,setAiError]=useState('');
 useEffect(()=>{fetch('/destinations.json').then(r=>r.json()).then(setDestinations).catch(()=>{});fetch('/features.json').then(r=>r.json()).then(setFeatures).catch(()=>{});},[]);
 useEffect(()=>localStorage.setItem('tm360-trips',JSON.stringify(trips)),[trips]);useEffect(()=>localStorage.setItem('tm360-budget',JSON.stringify(budget)),[budget]);useEffect(()=>localStorage.setItem('tm360-checklist',JSON.stringify(checklist)),[checklist]);
 const modules=useMemo(()=>['All systems',...new Set(features.map(f=>f.module))],[features]);
 const filteredFeatures=useMemo(()=>features.filter(f=>(featureModule==='All systems'||f.module===featureModule)&&(f.name+' '+f.description+' '+f.id).toLowerCase().includes(featureSearch.toLowerCase())),[features,featureModule,featureSearch]);
 const filteredDestinations=destinations.filter(d=>(d.name+d.region+d.tag).toLowerCase().includes(destinationSearch.toLowerCase()));
 const spent=Number(budget.transport)+Number(budget.stay)+Number(budget.food)+Number(budget.activities)+Number(budget.other),remaining=Number(budget.total)-spent,completed=checklist.filter(t=>t.done).length;

const activeTrip = trips.find(t => t.id === activeTripId) || trips[0] || null;

 function notify(s){setToast(s);window.setTimeout(()=>setToast(''),2500)}
 function addTrip(e){e.preventDefault();if(!newTrip.trim())return;setTrips(old=>[{id:Date.now(),title:newTrip.trim(),place:'Destination not chosen yet',dates:'Dates to be decided',color:'purple',tasks:['Choose destination','Set dates','Create first itinerary']},...old]);setNewTrip('');notify('Trip workspace created.')}

async function generateAITrip(e) {
  e.preventDefault();
  setAiError('');
  setAiItinerary('');

  if (!aiDestination.trim()) {
    setAiError('Please enter a destination.');
    return;
  }

  setAiLoading(true);

  try {
    const response = await fetch('/api/plan-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: aiDestination.trim(),
        days: Number(aiDays),
        interests: aiInterests,
        budget: aiBudget,
        travelers: aiTravelers
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Could not generate your itinerary.'
      );
    }

    setAiItinerary(data.itinerary);
    notify('Your AI itinerary is ready.');
  } catch (error) {
    setAiError(
      error.message || 'Something went wrong. Please try again.'
    );
  } finally {
    setAiLoading(false);
  }
}

function saveAITrip() {
  if (!aiItinerary.trim()) {
    notify('Generate an itinerary before saving.');
    return;
  }

  const savedTrip = {
    id: Date.now(),
    title: `Trip to ${aiDestination.trim()}`,
    place: aiDestination.trim(),
    dates: `${Number(aiDays)} days · AI itinerary`,
    color: 'purple',
    tasks: [
      'Review the itinerary',
      'Confirm travel and accommodation',
      'Verify prices and opening hours'
    ],
    itinerary: aiItinerary,
    interests: aiInterests,
    budget: aiBudget,
    travelers: aiTravelers,
    savedAt: new Date().toISOString()
  };

  setTrips(old => [savedTrip, ...old]);
  notify('AI itinerary saved to My Trips.');
}

} function addTask(e){e.preventDefault();if(!newTask.trim())return;setChecklist(old=>[...old,{id:Date.now(),text:newTask.trim(),done:false}]);setNewTask('')}
 function exportData(){const payload={exportedAt:new Date().toISOString(),trips,budget,checklist};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='travelmate360-trip-data.json';a.click();URL.revokeObjectURL(url);notify('Planner export prepared.')}
const nav=[['Overview',Compass],['AI Trip Planner',Sparkles],['My trips',MapPin],['Discover',Globe2],['Budget planner',Wallet],['Travel checklist',ListChecks],['Feature catalogue',Sparkles]];
 const heads={
  'Overview':['Your next adventure starts here','Your travel world, thoughtfully organized.'],
  'My trips':['Your trips','Create a plan, keep the details together, and travel with confidence.'],
  'Discover':['Find your kind of somewhere','A first collection of destinations to inspire your next journey.'],
  'Budget planner':['A clearer view of your travel budget','Build an estimate before you book. Amounts are editable planning estimates.'],
  'Travel checklist':['Ready before you go','Keep important preparation tasks in one place.'],
  'Feature catalogue':['The TravelMate 360 blueprint','Explore the numbered roadmap of 1,000 planned features.'],
  'AI Trip Planner':['Build your journey with AI','Create a personalized day-by-day travel itinerary. Review estimates before departure.']
}[section];
 return <div className="app-shell"><aside className={`sidebar ${mobileOpen?'open':''}`}><div className="brand"><div className="brand-mark"><Compass size={23}/></div><div><strong>TravelMate <span>360</span></strong><small>YOUR WORLD, IN ONE PLACE</small></div><button className="icon-btn close-mobile" onClick={()=>setMobileOpen(false)}><X size={19}/></button></div><div className="side-label">WORKSPACE</div><nav>{nav.map(([name,Icon])=><button key={name} className={`nav-item ${section===name?'active':''}`} onClick={()=>{setSection(name);setMobileOpen(false)}}><Icon size={18}/><span>{name}</span>{name==='Feature catalogue'&&<b className="nav-count">1k</b>}</button>)}</nav><div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Sparkles size={18}/></div><strong>Made for curious travellers</strong><p>Your planning space grows with every journey.</p><button onClick={()=>setSection('Feature catalogue')}>Explore the roadmap <ArrowRight size={14}/></button></div><div className="profile"><div className="avatar">T</div><div><strong>Traveller</strong><small>Personal workspace</small></div><span className="online-dot"/></div></div></aside>{mobileOpen&&<button className="mobile-scrim" onClick={()=>setMobileOpen(false)} aria-label="Close navigation"/>}
 <main className="main-area"><header className="topbar"><button className="icon-btn menu-btn" onClick={()=>setMobileOpen(true)}><Menu size={21}/></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>{section}</strong></div><div className="top-actions"><span className="status-pill"><span/>{supabase?'Cloud settings configured':'Starter mode'}</span><button className="icon-btn" onClick={exportData} title="Export planner data"><Download size={18}/></button><div className="avatar avatar-small">T</div></div></header><div className="page-content"><div className="page-heading"><div><div className="eyebrow"><Sparkles size={14}/> YOUR PERSONAL TRAVEL HUB</div><h1>{heads[0]}</h1><p>{heads[1]}</p></div><button className="primary-btn" onClick={()=>setSection('My trips')}><Plus size={17}/> Plan a trip</button></div>

{section==='AI Trip Planner'&&<div className="single-column">
  <section className="panel">
    <div className="panel-head">
      <div>
        <h3><Sparkles size={19}/> AI itinerary creator</h3>
        <p>Create a day-by-day plan for your next journey.</p>
      </div>
      <div className="panel-symbol purple"><Plane size={20}/></div>
    </div>

    <form className="trip-form" onSubmit={generateAITrip}>
      <label className="field-label">Destination
        <input required maxLength={100}
          value={aiDestination}
          onChange={e=>setAiDestination(e.target.value)}
          placeholder="e.g. Tokyo, Japan"/>
      </label>

      <label className="field-label">Duration (days)
        <input type="number" min="1" max="14" required
          value={aiDays}
          onChange={e=>setAiDays(e.target.value)}/>
      </label>

      <label className="field-label">Interests
        <input maxLength={300}
          value={aiInterests}
          onChange={e=>setAiInterests(e.target.value)}
          placeholder="Nature, food, history…"/>
      </label>

      <label className="field-label">Budget
        <select value={aiBudget} onChange={e=>setAiBudget(e.target.value)}>
          <option>Budget-friendly</option>
          <option>Moderate</option>
          <option>Premium</option>
          <option>Not specified</option>
        </select>
      </label>

      <label className="field-label">Travellers
        <select value={aiTravelers} onChange={e=>setAiTravelers(e.target.value)}>
          <option>Solo</option>
          <option>Couple</option>
          <option>Family</option>
          <option>Friends</option>
          <option>Not specified</option>
        </select>
      </label>

      <button className="primary-btn" type="submit" disabled={aiLoading}>
        <Sparkles size={17}/>
        {aiLoading ? 'Creating itinerary…' : 'Generate AI itinerary'}
      </button>
    </form>

    {aiError&&<p role="alert" className="error-message">{aiError}</p>}

    {aiItinerary&&<div className="ai-result">
      <h3>Your itinerary</h3>
      <p>{aiDestination} · {aiDays} days</p>
    
<div className="ai-actions">
  <button className="primary-btn" type="button" onClick={saveAITrip}>
    <Plus size={17}/> Save to My Trips
  </button>

  <button className="outline-btn" type="button"
    onClick={() => {
      navigator.clipboard.writeText(aiItinerary)
        .then(() => notify('Itinerary copied.'))
        .catch(() => notify('Could not copy. Please select the itinerary text.'));
    }}>
    Copy itinerary
  </button>
</div>

      <pre className="ai-itinerary-text">{aiItinerary}</pre>
      <p className="fine-print">
        Verify prices, opening hours, entry requirements and transport information before travelling.
      </p>
    </div>}
  </section>
</div>}

  {section==='Overview'&&<><section className="hero-banner"><div className="hero-copy"><span className="hero-chip"><Sparkles size={13}/> YOUR NEXT CHAPTER</span><h2>The world is full of<br/><em>somewhere new.</em></h2><p>Bring your plans, places, and travel details together. Your next great story starts with one small step.</p><button className="light-btn" onClick={()=>setSection('Discover')}>Explore destinations <ArrowRight size={16}/></button><div className="hero-foot"><span><Globe2 size={15}/> Worldwide inspiration</span><span><Heart size={15}/> Made around you</span></div></div><div className="hero-art"><div className="sun-disc"/><div className="hill hill-back"/><div className="hill hill-front"/><div className="hero-pin"><MapPin size={23}/></div><div className="floating-card"><div className="float-icon"><Plane size={17}/></div><div><strong>Your next stop?</strong><small>Somewhere wonderful</small></div><Sparkles size={16} className="float-spark"/></div><div className="art-stamp">GO<br/>EXPLORE</div></div></section>
 <div className="stats-grid"><Stat icon={MapPin} label="Planned trips" value={trips.length} color="coral" hint="Your journeys, gathered"/><Stat icon={Wallet} label="Budget target" value={money(budget.total)} color="purple" hint="Your current trip budget"/><Stat icon={ListChecks} label="Prep progress" value={`${checklist.length?Math.round(completed/checklist.length*100):0}%`} color="green" hint={`${completed} tasks completed`}/><Stat icon={Globe2} label="Destinations to explore" value={destinations.length} color="blue" hint="Starter inspiration list"/></div>
 <div className="content-grid"><section className="panel"><div className="panel-head"><div><h3>Trip spaces</h3><p>Your ideas and upcoming journeys</p></div><button className="text-btn" onClick={()=>setSection('My trips')}>View all <ArrowRight size={14}/></button></div>{trips.slice(0,2).map((t,i)=><div className="trip-row" key={t.id}><div className={`trip-thumb ${t.color}`}><span>{i===0?'🌅':'🏔️'}</span><small>{i===0?'CITY ESCAPE':'OUTDOOR DAYS'}</small></div><div className="trip-info"><strong>{t.title}</strong><span><MapPin size={13}/>{t.place}</span><small><CalendarDays size={13}/>{t.dates}</small></div><button className="round-arrow" onClick={()=>setSection('My trips')}><ArrowRight size={17}/></button></div>)}{!trips.length&&<Empty text="Your first trip will appear here."/>}<button className="dashed-add" onClick={()=>setSection('My trips')}><Plus size={16}/> Create another trip</button></section>
 <section className="panel"><div className="panel-head"><div><h3>Budget snapshot</h3><p>A quick look at your plan</p></div><button className="soft-icon" onClick={()=>setSection('Budget planner')}><ArrowRight size={16}/></button></div><div className="budget-total"><div><small>Planned total</small><strong>{money(budget.total)}</strong></div><span className={`budget-badge ${remaining<0?'over':''}`}>{remaining<0?'Over budget':'Estimate'}</span></div><div className="budget-bar"><span style={{width:`${Math.min(100,Math.max(0,spent/Math.max(1,budget.total)*100))}%`}}/></div><div className="budget-legend"><span><i/> Estimated expenses</span><strong>{money(spent)}</strong></div><div className="budget-legend muted"><span><i/>{remaining<0?'Over by':'Remaining'}</span><strong>{money(Math.abs(remaining))}</strong></div><button className="outline-btn full" onClick={()=>setSection('Budget planner')}>Manage budget <ArrowRight size={15}/></button></section></div>
 <section className="section-block"><div className="section-title"><div><h3>Places to spark your imagination</h3><p>Start with a feeling, then find a destination.</p></div><button className="text-btn" onClick={()=>setSection('Discover')}>Discover all <ArrowRight size={14}/></button></div><div className="destination-grid">{destinations.slice(0,4).map((d,i)=><DestinationCard key={d.name} d={d} i={i} onClick={()=>setSection('Discover')}/>)}</div></section><Note/></>}
 {section==='My trips'&&<div className="single-column"><section className="panel"><div className="panel-head"><div><h3>Create a trip space</h3><p>Start with a name. You can add destinations and dates later.</p></div><div className="panel-symbol coral"><Plane size={20}/></div></div><form className="inline-form" onSubmit={addTrip}><input value={newTrip} onChange={e=>setNewTrip(e.target.value)} placeholder="e.g. Summer in Japan" aria-label="Trip name" maxLength={90}/><button className="primary-btn"><Plus size={16}/> Create trip</button></form></section><section className="panel"><div className="panel-head"><div><h3>All trip spaces</h3><p>{trips.length} trip{trips.length===1?'':'s'} in your personal workspace</p></div></div>{trips.map((t,i)=><article className="trip-detail" key={t.id}><div className={`trip-thumb ${t.color||'purple'}`}><span>{['🌅','🏔️','🌴','🏙️'][i%4]}</span></div><div className="trip-detail-main"><h4>{t.title}</h4><p><MapPin size={14}/>{t.place}</p><small><CalendarDays size={13}/>{t.dates}</small><div className="mini-task-list">{(t.tasks||[]).slice(0,3).map(task=><span key={task}><CheckCircle2 size={12}/>{task}</span>)}</div></div><button className="icon-btn danger" title="Delete trip" onClick={()=>setTrips(old=>old.filter(x=>x.id!==t.id))}><Trash2 size={17}/></button></article>)}{!trips.length&&<Empty text="No trips yet. Create one above to get started."/>}</section></div>}
 {section==='Discover'&&<><div className="search-banner"><div className="search-symbol"><Compass size={25}/></div><div><h3>Where would you love to go?</h3><p>Search our starter destination collection. More data sources can be connected later.</p></div><div className="search-field"><Search size={17}/><input value={destinationSearch} onChange={e=>setDestinationSearch(e.target.value)} placeholder="Try Japan, nature, culture…"/></div></div><div className="filter-row"><span><SlidersHorizontal size={15}/> {filteredDestinations.length} destinations</span><span className="sample-label">Curated starter examples · not live availability</span></div><div className="destination-grid discover-grid">{filteredDestinations.map((d,i)=><DestinationCard key={d.name} d={d} i={i} onClick={()=>setSection('My trips')}/>)}</div>{!filteredDestinations.length&&<Empty text="No matching destination. Try another search."/>}<Note/></>}
 {section==='Budget planner'&&<div className="budget-layout"><section className="panel"><div className="panel-head"><div><h3>Build your estimate</h3><p>Enter amounts in USD for this starter release.</p></div><div className="panel-symbol purple"><Wallet size={20}/></div></div><label className="field-label">Total budget target (USD)<input className="money-input" type="number" min="0" value={budget.total} onChange={e=>setBudget({...budget,total:e.target.value})}/></label><div className="budget-fields">{[['transport','Transport'],['stay','Accommodation'],['food','Food'],['activities','Activities'],['other','Other & buffer']].map(([key,label])=><label className="field-label" key={key}>{label}<div className="input-with-prefix"><span>$</span><input type="number" min="0" value={budget[key]} onChange={e=>setBudget({...budget,[key]:e.target.value})}/></div></label>)}</div></section><section className="panel budget-result"><div className="result-orbit"><Wallet size={27}/></div><span className="eyebrow">YOUR ESTIMATE</span><h2>{money(budget.total)}</h2><p>Budget target</p><div className="result-line"><span>Planned expenses</span><strong>{money(spent)}</strong></div><div className="result-line"><span>{remaining>=0?'Remaining':'Over budget'}</span><strong className={remaining<0?'negative':'positive'}>{money(Math.abs(remaining))}</strong></div><div className="budget-bar large"><span style={{width:`${Math.min(100,Math.max(0,spent/Math.max(1,Number(budget.total))*100))}%`}}/></div><p className="fine-print">Estimates only. Actual prices, taxes, fees and exchange rates may differ. Confirm costs with providers before booking.</p></section></div>}
 {section==='Travel checklist'&&<div className="single-column"><section className="panel"><div className="panel-head"><div><h3>Your pre-travel checklist</h3><p>{completed} of {checklist.length} tasks completed</p></div><div className="progress-ring"><strong>{checklist.length?Math.round(completed/checklist.length*100):0}%</strong></div></div><div className="check-progress"><span style={{width:`${checklist.length?completed/checklist.length*100:0}%`}}/></div><form className="inline-form" onSubmit={addTask}><input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="Add a preparation task…" aria-label="New checklist task"/><button className="primary-btn"><Plus size={16}/> Add task</button></form><div className="checklist-items">{checklist.map(task=><div className={`checklist-item ${task.done?'done':''}`} key={task.id}><button className="check-toggle" onClick={()=>setChecklist(old=>old.map(t=>t.id===task.id?{...t,done:!t.done}:t))} aria-label={task.done?'Mark incomplete':'Mark complete'}>{task.done?<CheckCircle2 size={21}/>:<Circle size={21}/>}</button><span>{task.text}</span><button className="icon-btn danger small" onClick={()=>setChecklist(old=>old.filter(t=>t.id!==task.id))} aria-label="Delete task"><Trash2 size={15}/></button></div>)}</div>{!checklist.length&&<Empty text="Add a task to build your travel checklist."/>}</section><Note/></div>}
 {section==='Feature catalogue'&&<Catalogue features={filteredFeatures} allFeatures={features} modules={modules} selectedModule={featureModule} setSelectedModule={setFeatureModule} search={featureSearch} setSearch={setFeatureSearch}/>}
 <footer className="footer"><span>© 2026 TravelMate 360</span><span><ShieldCheck size={14}/> Plan smart. Travel thoughtfully.</span><button onClick={exportData}>Export my data</button></footer></div></main>{toast&&<div className="toast"><CheckCircle2 size={18}/>{toast}</div>}</div>
}
function Stat({icon:Icon,label,value,color,hint}){return <div className="stat-card"><div className={`stat-icon ${color}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-hint">{hint}</div></div>}
function DestinationCard({d,i,onClick}){return <button className={`destination-card dest-${i%4}`} onClick={onClick}><div className="dest-art"><span>{d.emoji}</span><div className="dest-bubble">{d.tag}</div></div><div className="dest-copy"><div><strong>{d.name}</strong><span>{d.region} · {d.budget}</span></div><ArrowRight size={17}/><p>{d.description}</p></div></button>}
function Note(){return <div className="bottom-note"><div className="note-icon"><ShieldCheck size={20}/></div><div><strong>A thoughtful travel reminder</strong><p>Confirm visa rules, opening times, transport schedules, safety advice, and booking details with official sources before departure.</p></div></div>}
function Empty({text}){return <div className="empty-state"><Compass size={25}/><p>{text}</p></div>}
function Catalogue({features,allFeatures,modules,selectedModule,setSelectedModule,search,setSearch}){const [page,setPage]=useState(0),pageSize=25;useEffect(()=>setPage(0),[search,selectedModule]);const pages=Math.max(1,Math.ceil(features.length/pageSize)),visible=features.slice(page*pageSize,(page+1)*pageSize);function exportCatalog(){const url=URL.createObjectURL(new Blob([JSON.stringify(allFeatures,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='travelmate360-1000-feature-catalogue.json';a.click();URL.revokeObjectURL(url)}return <><div className="catalogue-hero"><div className="catalogue-icon"><Sparkles size={27}/></div><div><span>PRODUCT ROADMAP</span><h2>1,000 planned features</h2><p>25 systems · 40 roadmap entries each · staged implementation</p></div><button className="light-btn" onClick={exportCatalog}><Download size={15}/> Export catalogue</button></div><div className="catalogue-tools"><div className="search-field"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search features, IDs, or descriptions…"/></div><select value={selectedModule} onChange={e=>setSelectedModule(e.target.value)} aria-label="Filter feature system">{modules.map(m=><option key={m}>{m}</option>)}</select><span className="results-count">{features.length.toLocaleString()} results</span></div><div className="catalogue-summary"><div><strong>{allFeatures.length.toLocaleString()}</strong><span>Total roadmap items</span></div><div><strong>25</strong><span>Feature systems</span></div><div><strong>0</strong><span>Marked implemented</span></div><div><strong>40</strong><span>Items per system</span></div></div><section className="panel feature-panel"><div className="feature-table-head"><span>FEATURE</span><span>SYSTEM</span><span>PRIORITY</span><span>STATUS</span></div>{visible.map(f=><div className="feature-row" key={f.id}><div className="feature-name"><small>{f.id}</small><strong>{f.name}</strong><p>{f.description}</p></div><div className="feature-system">{f.module}</div><div><span className={`priority ${f.priority.toLowerCase()}`}>{f.priority}</span></div><div><span className="status-planned">{f.status}</span></div></div>)}{!visible.length&&<Empty text="No features match this search."/>}<div className="pagination"><span>Showing {features.length?page*pageSize+1:0}–{Math.min((page+1)*pageSize,features.length)} of {features.length}</span><div><button className="outline-btn" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page+1} of {pages}</span><button className="outline-btn" disabled={page>=pages-1} onClick={()=>setPage(p=>p+1)}>Next</button></div></div></section><p className="fine-print">All entries begin as Planned roadmap items, not production capabilities. Priorities and statuses will be refined as integrations, security, and testing are implemented.</p></>}
function money(n){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(n)||0)}
createRoot(document.getElementById('root')).render(<App/>);
