window.addEventListener("error",event=>{
 const box=document.createElement("div");
 box.className="runtime-error";
 box.textContent="App-Fehler: "+(event.message||"Unbekannter Fehler");
 document.body.appendChild(box);
});
const KEY="etfDepotAndreas.v10.cache";
const COLORS=["#5B9BD5","#14b8a6","#f59e0b"];
const DEFAULTS={
 funds:[
  {name:"Vanguard FTSE Developed World",isin:"IE00BKX55T58",units:384.222758,value:48374.61,gain:15492.27,ytd:6396.34,monthly:600,date:"2026-08-04",costBasis:32882.34,ytdBasis:41978.27},
  {name:"Dimensional World Equity",isin:"IE00B53RD369",units:1191.018192,value:46652.18,gain:13652.18,ytd:6672.54,monthly:600,date:"2026-08-04",costBasis:33000.00,ytdBasis:39979.64},
  {name:"Amundi Robotics & AI",isin:"LU1861132840",units:179.753899,value:26136.49,gain:9665.62,ytd:5692.59,monthly:300,date:"2026-08-04",costBasis:16470.87,ytdBasis:20443.90}
 ],
 history:[{date:"2026-08-04",value:121163.28}],dividends:[],theme:"light",benchmark:{name:"MSCI World",start:0,current:0,date:""},contributions:[],autoAccounting:{lastAppliedMonth:"2026-08",totalApplied:0},cloud:{url:"https://dgrulyvrxmughqgzherg.supabase.co",anonKey:"sb_publishable_6TeNYQRBAqDpysVgKUJ0Jw_7KqDvgc2",accessToken:"",refreshToken:"",userId:"",email:"",lastSync:""},fx:{usdEur:0.87,date:"",source:""},vanguardUsdMode:false,vanguardUsdValue:0,
 targets:[40,40,20],
 audit:[],
 preferences:{reportTitle:"ETF Depot Andreas",autoPullSeconds:15}
};
const old=localStorage.getItem("etfDepotAndreas.v9_1.cache")||localStorage.getItem("etfDepotAndreas.v9")||localStorage.getItem("etfDepotAndreas.v8")||localStorage.getItem("etfDepotAndreas.v7")||localStorage.getItem("etfDepotAndreas.v6")||localStorage.getItem("etfDepotAndreas.v5_1")||localStorage.getItem("etfDepotAndreas.v5")||localStorage.getItem("etfDepotAndreas.v4")||localStorage.getItem("etfDepotAndreas.v3")||localStorage.getItem("etfDepotAndreas.v1");
let syncTimer=null;
let syncInFlight=false;
let applyingRemote=false;
let localDirty=false;
let lastCloudError="";
let state=load();
initializeAutomaticAccounting();
applyScheduledContributions();
const euro=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"});
const pct=new Intl.NumberFormat("de-DE",{style:"percent",minimumFractionDigits:2,maximumFractionDigits:2});
const num=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:6});
function clone(x){return JSON.parse(JSON.stringify(x))}
function load(){try{const raw=localStorage.getItem(KEY)||old;if(!raw)return clone(DEFAULTS);const x=JSON.parse(raw);return{...clone(DEFAULTS),...x,dividends:x.dividends||[],benchmark:{...DEFAULTS.benchmark,...(x.benchmark||{})},contributions:x.contributions||[],autoAccounting:{...DEFAULTS.autoAccounting,...(x.autoAccounting||{})},cloud:{...DEFAULTS.cloud,...(x.cloud||{})},fx:{...DEFAULTS.fx,...(x.fx||{})},targets:Array.isArray(x.targets)?x.targets:[40,40,20],audit:Array.isArray(x.audit)?x.audit:[],preferences:{...DEFAULTS.preferences,...(x.preferences||{})}}}catch{return clone(DEFAULTS)}}
function persist(options={}){
  localStorage.setItem(KEY,JSON.stringify(state));
  if(options.cloud===false||applyingRemote)return;
  localDirty=true;
  if(cloudConfigured())scheduleCloudSave();
}
function totals(){
  recalculateFundMetrics();
  const value=state.funds.reduce((s,f)=>s+Number(f.value||0),0);
  const gain=state.funds.reduce((s,f)=>s+Number(f.gain||0),0);
  const ytd=state.funds.reduce((s,f)=>s+Number(f.ytd||0),0);
  const cost=state.funds.reduce((s,f)=>s+Number(f.costBasis||0),0);
  return{value,gain,ytd,cost,ret:cost?gain/cost:0}
}
function render(){
 const t=totals();
 totalValue.textContent=euro.format(t.value);totalGain.textContent=euro.format(t.gain);totalGain.className=t.gain>=0?"positive":"negative";totalGainPct.textContent=pct.format(t.ret);totalYtd.textContent=euro.format(t.ytd);totalYtd.className=t.ytd>=0?"positive":"negative";investedCapital.textContent=euro.format(t.cost);
 const best=[...state.funds].sort((a,b)=>b.ytd-a.ytd)[0];bestFund.textContent="Bester Beitrag: "+best.name;lastUpdated.textContent="Stand "+formatDate(latestDate());statusBadge.textContent=allocationStatus(t.value);
 renderReturns(t.value);renderDailySummary(t.value);renderFunds(t.value);renderDonut(t.value);renderSavings();renderForecast();renderGoals();renderHistory();renderRisk();renderDividends();renderDividendCalendar();renderNextSavings();renderFx();renderAnalytics();renderProgressGoals();renderPeriodSummary();renderDataQuality();renderBenchmark();renderMonthlyReport();renderContributions();renderHealth();renderAutomaticAccounting();renderCloudStatus();renderFire();renderV10Intelligence();renderAudit();renderReportPreview();renderSystemSummary();
}

function renderDailySummary(current){
 const hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));
 const latestPast=hist.filter(x=>x.date<isoDate(new Date())).at(-1);
 if(latestPast){
   const base=Number(latestPast.value||0),cash=contributionsAfter(latestPast.date,isoDate(new Date())),gain=current-base-cash,rate=base?gain/base:0;
   dailyGainEuro.textContent=euro.format(gain);dailyGainEuro.className=gain>=0?"positive":"negative";
   dailyGainPct.textContent=pct.format(rate);dailyGainPct.className=rate>=0?"positive":"negative";
 }else{
   dailyGainEuro.textContent=dailyGainPct.textContent="–";
 }
 const ranked=state.funds.map(f=>{const cost=Number(f.value)-Number(f.gain);return{f,rate:cost?Number(f.gain)/cost:0}}).sort((a,b)=>b.rate-a.rate);
 const best=ranked[0],worst=ranked.at(-1);
 bestSincePurchase.textContent=best.f.name;bestSincePurchaseInfo.textContent=pct.format(best.rate);bestSincePurchase.className=best.rate>=0?"positive":"negative";
 worstSincePurchase.textContent=worst.f.name;worstSincePurchaseInfo.textContent=pct.format(worst.rate);worstSincePurchase.className=worst.rate>=0?"positive":"negative";
}
function renderDividendCalendar(){
 const items=[...(state.dividends||[])].sort((a,b)=>b.date.localeCompare(a.date));
 if(!items.length){dividendCalendar.innerHTML='<div class="calendar-empty">Noch keine Ausschüttungen erfasst.</div>';return}
 dividendCalendar.innerHTML=items.map(d=>`<div class="calendar-item"><div class="date">${formatDate(d.date)}</div><div class="fund">${state.funds[d.fundIndex]?.name||"Fonds"}</div><strong>${euro.format(d.amount)}</strong></div>`).join("");
}
function renderFire(){
 const expenses=Number(monthlyExpenses.value||0),wr=Number(withdrawalRate.value||0.04),target=wr?expenses*12/wr:0;
 fireTarget.textContent=euro.format(target);
 const months=monthsToTarget(totals().value,state.funds.reduce((s,f)=>s+Number(f.monthly||0),0),Number(forecastRate.value),target);
 fireDate.textContent=months===null?"Unter diesen Annahmen nicht erreichbar":months===0?"Bereits erreicht":`Voraussichtlich in ${formatGoalMonths(months)}`;
}
function monthsToTarget(start,monthly,annual,target){
 if(start>=target)return 0;const r=annual/12;
 for(let m=1;m<=1200;m++){const fv=start*Math.pow(1+r,m)+monthly*((Math.pow(1+r,m)-1)/r);if(fv>=target)return m}
 return null;
}
function formatGoalMonths(m){const y=Math.floor(m/12),mo=m%12;return`${y?y+" Jahren ":""}${mo?mo+" Monaten":""}`.trim()}


async function fetchUsdEur(){
 fxStatus.textContent="Kurs wird geladen …";
 try{
   const r=await fetch("https://api.frankfurter.dev/v2/rate/USD/EUR",{cache:"no-store"});
   if(!r.ok)throw new Error("HTTP "+r.status);
   const j=await r.json();
   const rate=Number(j.rate);
   if(!Number.isFinite(rate))throw new Error("Ungültiger Kurs");
   state.fx={usdEur:rate,date:j.date||isoDate(new Date()),source:"Frankfurter"};
   persist();applyFxToVanguard();render();fxStatus.textContent="Automatischer Tageskurs";
 }catch(e){
   fxStatus.textContent="Letzter gespeicherter Kurs";
   renderFx();
 }
}
function renderFx(){
 const rate=Number(state.fx?.usdEur||0);
 usdEurRate.textContent=rate?`1 USD = ${rate.toLocaleString("de-DE",{minimumFractionDigits:4,maximumFractionDigits:4})} EUR`:"Kein Kurs";
 usdEurDate.textContent=state.fx?.date?`Stand ${formatDate(state.fx.date)} · ${state.fx.source||"gespeichert"}`:"Noch nicht geladen";
}
function applyFxToVanguard(){
 if(!state.vanguardUsdMode)return;
 const rate=Number(state.fx?.usdEur||0),usd=Number(state.vanguardUsdValue||0);
 if(rate>0&&usd>0)state.funds[0].value=usd*rate;
}


function getFilteredHistory(){
  let hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));
  const range=analyticsRange.value;
  if(range!=="all"){
    const cutoff=new Date();
    cutoff.setDate(cutoff.getDate()-Number(range));
    hist=hist.filter(x=>new Date(x.date)>=cutoff);
  }
  return hist;
}
function dailyReturnsFromHistory(hist){
  const out=[];
  for(let i=1;i<hist.length;i++){
    const prev=Number(hist[i-1].value||0),cur=Number(hist[i].value||0);
    if(prev>0){
      const cash=contributionsAfter(hist[i-1].date,hist[i].date);
      out.push({date:hist[i].date,rate:(cur-prev-cash)/prev});
    }
  }
  return out;
}
function renderAnalytics(){
  const hist=getFilteredHistory(),rets=dailyReturnsFromHistory(hist);
  if(rets.length<2){
    volatility.textContent=sharpeRatio.textContent=bestDay.textContent=worstDay.textContent="–";
    bestDayDate.textContent=worstDayDate.textContent="Mehr Tagesstände erforderlich";
    return;
  }
  const values=rets.map(x=>x.rate),mean=values.reduce((a,b)=>a+b,0)/values.length;
  const variance=values.reduce((s,x)=>s+Math.pow(x-mean,2),0)/(values.length-1);
  const sd=Math.sqrt(Math.max(0,variance));
  const annualVol=sd*Math.sqrt(252);
  const annualReturn=mean*252;
  const sharpe=sd>0?annualReturn/(sd*Math.sqrt(252)):0;
  volatility.textContent=pct.format(annualVol);
  sharpeRatio.textContent=sharpe.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2});
  const best=[...rets].sort((a,b)=>b.rate-a.rate)[0],worst=[...rets].sort((a,b)=>a.rate-b.rate)[0];
  bestDay.textContent=pct.format(best.rate);bestDay.className=best.rate>=0?"positive":"negative";bestDayDate.textContent=formatDate(best.date);
  worstDay.textContent=pct.format(worst.rate);worstDay.className=worst.rate>=0?"positive":"negative";worstDayDate.textContent=formatDate(worst.date);
}
function renderProgressGoals(){
  const current=totals().value;
  progressGoals.innerHTML=[250000,500000,1000000].map(goal=>{
    const ratio=Math.min(1,current/goal);
    return`<div class="progress-item"><div class="progress-head"><span>${euro.format(goal)}</span><strong>${pct.format(ratio)}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${ratio*100}%"></div></div></div>`;
  }).join("");
}
function periodStart(type){
  const now=new Date();
  if(type==="month")return new Date(now.getFullYear(),now.getMonth(),1);
  if(type==="quarter")return new Date(now.getFullYear(),Math.floor(now.getMonth()/3)*3,1);
  return new Date(now.getFullYear(),0,1);
}
function periodPerformance(type){
  const r=periodReturn(periodStart(type),startOfDay(new Date()),totals().value);
  return r?r.rate:null;
}
function setReturn(el,value){
  if(value===null){el.textContent="–";el.className="";return}
  el.textContent=pct.format(value);el.className=value>=0?"positive":"negative";
}
function renderPeriodSummary(){
  setReturn(monthPerformance,periodPerformance("month"));
  setReturn(quarterPerformance,periodPerformance("quarter"));
  setReturn(yearPerformance,periodPerformance("year"));
}
function renderDataQuality(){
  const hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));
  snapshotCount.textContent=hist.length;
  firstSnapshotDate.textContent=hist.length?formatDate(hist[0].date):"–";
  lastSnapshotDate.textContent=hist.length?formatDate(hist.at(-1).date):"–";
}
function clearHistoryData(){
  if(!confirm("Alle gespeicherten Tagesstände wirklich löschen?"))return;
  state.history=[{date:isoDate(new Date()),value:totals().value}];
  persist();render();
}


function renderBenchmark(){
  const b=state.benchmark||{};
  const p=totals();
  const portfolioReturn=p.cost?p.gain/p.cost:null;
  const benchmarkRet=(Number(b.start)>0&&Number(b.current)>0)?Number(b.current)/Number(b.start)-1:null;
  setReturn(portfolioBenchmarkReturn,portfolioReturn);
  setReturn(benchmarkReturn,benchmarkRet);
  setReturn(benchmarkDifference,(portfolioReturn!==null&&benchmarkRet!==null)?portfolioReturn-benchmarkRet:null);
  benchmarkInfo.textContent=benchmarkRet===null?"Benchmarkwerte noch nicht hinterlegt.":`${b.name||"Benchmark"} · Start ${formatDate(b.date)} · ${Number(b.start).toLocaleString("de-DE")} → ${Number(b.current).toLocaleString("de-DE")}`;
}
function openBenchmarkDialog(){
  const b=state.benchmark||DEFAULTS.benchmark;
  benchmarkName.value=b.name||"MSCI World";benchmarkStart.value=b.start||"";benchmarkCurrent.value=b.current||"";benchmarkDate.value=b.date||isoDate(new Date());
  document.getElementById("benchmarkDialog").showModal();
}
function saveBenchmarkData(){
  state.benchmark={name:benchmarkName.value||"MSCI World",start:Number(benchmarkStart.value||0),current:Number(benchmarkCurrent.value||0),date:benchmarkDate.value};
  addAudit("Benchmark aktualisiert",state.benchmark.name);persist();render();
}
function renderMonthlyReport(){
  const now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),1),hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));
  const c=hist.filter(x=>x.date<=isoDate(start));
  const baseline=c.length?Number(c.at(-1).value||0):null;
  const current=totals().value;
  const scheduled=baseline===null?null:contributionsAfter(c.at(-1).date,isoDate(now));
  const extras=(state.contributions||[]).filter(x=>x.date>=isoDate(start)&&x.date<=isoDate(now)).reduce((s,x)=>s+Number(x.amount||0),0);
  monthStartValue.textContent=baseline===null?"–":euro.format(baseline);
  monthCurrentValue.textContent=euro.format(current);
  monthContributions.textContent=scheduled===null?"–":euro.format(scheduled+extras);
  const gain=baseline===null?null:current-baseline-scheduled-extras;
  if(gain===null){monthGainEuro.textContent="–";monthGainEuro.className=""}else{monthGainEuro.textContent=euro.format(gain);monthGainEuro.className=gain>=0?"positive":"negative"}
}
function renderContributions(){
  const items=[...(state.contributions||[])].sort((a,b)=>b.date.localeCompare(a.date));
  if(!items.length){contributionList.innerHTML='<div class="calendar-empty">Noch keine zusätzlichen Einzahlungen erfasst.</div>'}
  else contributionList.innerHTML=items.map(x=>`<div class="calendar-item"><div class="date">${formatDate(x.date)}</div><div class="fund">${x.note||"Einzahlung"}</div><strong>${euro.format(x.amount)}</strong></div>`).join("");
  extraContributionsTotal.textContent=euro.format(items.reduce((s,x)=>s+Number(x.amount||0),0));
}
function openContributionDialog(){
  contributionAmount.value="";contributionDate.value=isoDate(new Date());contributionNote.value="";document.getElementById("contributionDialog").showModal();
}
function saveContributionData(){
  const amount=Number(contributionAmount.value||0);if(amount<=0)return;
  state.contributions=state.contributions||[];
  state.contributions.push({amount,date:contributionDate.value,note:contributionNote.value});
  addAudit("Einzahlung erfasst",euro.format(amount));persist();render();
}
function renderHealth(){
  const hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));
  const now=isoDate(new Date()),last=hist.length?hist.at(-1).date:"";
  const age=last?Math.floor((new Date(now)-new Date(last))/86400000):999;
  const fxFresh=state.fx?.date===now;
  const checks=[
    {label:"Tagesstände",ok:hist.length>=7,text:`${hist.length} gespeichert`,warn:hist.length<7},
    {label:"Letzter Tagesstand",ok:age<=1,text:last?formatDate(last):"fehlt",warn:age>1},
    {label:"USD/EUR-Kurs",ok:fxFresh,text:state.fx?.date?formatDate(state.fx.date):"fehlt",warn:!fxFresh},
    {label:"Backup",ok:true,text:"manuell verfügbar",warn:false}
  ];
  healthList.innerHTML=checks.map(c=>`<div class="health-item"><span>${c.label}</span><strong class="${c.ok?"health-ok":c.warn?"health-warn":"health-bad"}">${c.ok?"OK":"Prüfen"} · ${c.text}</strong></div>`).join("");
}
function exportHistoryCsv(){
  const rows=[["Datum","Depotwert_EUR"],...[...state.history].sort((a,b)=>a.date.localeCompare(b.date)).map(x=>[x.date,String(x.value).replace(".",",")])];
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(";")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download="ETF-Depot-Andreas-Verlauf.csv";a.click();URL.revokeObjectURL(a.href);
}


function initializeAutomaticAccounting(){
  state.autoAccounting=state.autoAccounting||{lastAppliedMonth:"2026-08",totalApplied:0};
  state.funds.forEach(f=>{
    if(!Number.isFinite(Number(f.costBasis)))f.costBasis=Number(f.value||0)-Number(f.gain||0);
    if(!Number.isFinite(Number(f.ytdBasis)))f.ytdBasis=Number(f.value||0)-Number(f.ytd||0);
  });
  recalculateFundMetrics();
}
function recalculateFundMetrics(){
  state.funds.forEach(f=>{
    f.gain=Number(f.value||0)-Number(f.costBasis||0);
    f.ytd=Number(f.value||0)-Number(f.ytdBasis||0);
  });
}
function currentMonthKey(){
  const d=new Date();
  return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function nextMonthKey(key){
  const[y,m]=key.split("-").map(Number),d=new Date(y,m,1);
  return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function applyScheduledContributions(){
  const today=new Date();
  if(today.getDate()<1)return;
  let cursor=state.autoAccounting.lastAppliedMonth||"2026-08";
  const target=currentMonthKey();
  while(cursor<target){
    cursor=nextMonthKey(cursor);
    state.funds.forEach(f=>{
      const amount=Number(f.monthly||0);
      f.costBasis=Number(f.costBasis||0)+amount;
      f.ytdBasis=Number(f.ytdBasis||0)+amount;
      state.autoAccounting.totalApplied=Number(state.autoAccounting.totalApplied||0)+amount;
    });
    state.autoAccounting.lastAppliedMonth=cursor;
  }
  recalculateFundMetrics();
  persist();
}
function renderAutomaticAccounting(){
  autoContributions.textContent=euro.format(Number(state.autoAccounting?.totalApplied||0));
  lastContributionMonth.textContent=`Zuletzt berücksichtigt: ${formatMonthKey(state.autoAccounting?.lastAppliedMonth)}`;
  automaticCostBasis.textContent=euro.format(state.funds.reduce((s,f)=>s+Number(f.costBasis||0),0));
  const next=nextMonthKey(state.autoAccounting?.lastAppliedMonth||currentMonthKey());
  nextAutoContribution.textContent=`01.${next.split("-")[1]}.${next.split("-")[0]}`;
}
function formatMonthKey(key){
  if(!key)return"–";
  const[y,m]=key.split("-");
  return`${m}.${y}`;
}


function cloudConfigured(){
  return Boolean(state.cloud?.url&&state.cloud?.anonKey&&state.cloud?.userId&&(state.cloud?.accessToken||state.cloud?.refreshToken));
}
function cloudHeaders(auth=true){
  const h={"apikey":state.cloud.anonKey,"Content-Type":"application/json"};
  if(auth&&state.cloud.accessToken)h["Authorization"]="Bearer "+state.cloud.accessToken;
  return h;
}
function tokenExpiryMs(token){
  try{
    const payload=JSON.parse(atob(token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
    return Number(payload.exp||0)*1000;
  }catch{return 0}
}
async function refreshCloudSession(){
  if(!state.cloud?.refreshToken)throw new Error("Bitte erneut bei Supabase anmelden.");
  const url=state.cloud.url.replace(/\/$/,"")+"/auth/v1/token?grant_type=refresh_token";
  const r=await fetch(url,{method:"POST",headers:{"apikey":state.cloud.anonKey,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:state.cloud.refreshToken})});
  const text=await r.text();let body=null;try{body=text?JSON.parse(text):null}catch{body=text}
  if(!r.ok)throw new Error(body?.msg||body?.message||body?.error_description||body?.error||`HTTP ${r.status}`);
  storeSession(body);
  return body;
}
async function ensureCloudSession(){
  if(!state.cloud?.userId)throw new Error("Nicht bei Supabase angemeldet.");
  const exp=tokenExpiryMs(state.cloud.accessToken);
  if(state.cloud.accessToken&&exp>Date.now()+90000)return;
  await refreshCloudSession();
}
async function cloudRequest(path,options={}){
  const auth=options.auth!==false;
  if(auth)await ensureCloudSession();
  const url=state.cloud.url.replace(/\/$/,"")+path;
  const requestOptions={...options};
  delete requestOptions.auth;delete requestOptions.retry;
  let r=await fetch(url,{...requestOptions,headers:{...cloudHeaders(auth),...(requestOptions.headers||{})}});
  if(auth&&r.status===401&&!options.retry&&state.cloud.refreshToken){
    await refreshCloudSession();
    r=await fetch(url,{...requestOptions,headers:{...cloudHeaders(true),...(requestOptions.headers||{})}});
  }
  const text=await r.text();
  let body=null;try{body=text?JSON.parse(text):null}catch{body=text}
  if(!r.ok)throw new Error(body?.msg||body?.message||body?.error_description||body?.error||`HTTP ${r.status}`);
  return body;
}
function openCloudDialog(){
  supabaseUrl.value=state.cloud.url||"";
  supabaseAnonKey.value=state.cloud.anonKey||"";
  cloudEmail.value=state.cloud.email||"";
  cloudPassword.value="";
  cloudDialogMessage.textContent=cloudConfigured()
    ?"Dieses Gerät ist angemeldet. Supabase ist die führende Datenquelle."
    :"Melde dieses Gerät einmalig mit demselben Konto an, das du auf deinen anderen Geräten verwendest.";
  document.getElementById("cloudDialog").showModal();
}
function saveCloudForm(){
  state.cloud.url=supabaseUrl.value.trim()||"https://dgrulyvrxmughqgzherg.supabase.co";
  state.cloud.anonKey=supabaseAnonKey.value.trim()||"sb_publishable_6TeNYQRBAqDpysVgKUJ0Jw_7KqDvgc2";
  state.cloud.email=cloudEmail.value.trim();
  persist({cloud:false});
}
async function registerCloud(){
  try{
    saveCloudForm();
    cloudDialogMessage.textContent="Konto wird erstellt …";
    const body=await cloudRequest("/auth/v1/signup",{method:"POST",auth:false,body:JSON.stringify({email:state.cloud.email,password:cloudPassword.value})});
    if(body?.access_token){
      storeSession(body);
      cloudDialogMessage.textContent="Konto erstellt. Vorhandener Datenstand wird einmalig zur Cloud übertragen …";
      await bootstrapCloud(true);
      cloudDialogMessage.textContent="Fertig. Supabase ist jetzt der Hauptspeicher.";
    }else{
      cloudDialogMessage.textContent="Konto erstellt. Bestätige ggf. die E-Mail und melde dich danach an.";
    }
    renderCloudStatus();
  }catch(e){cloudDialogMessage.textContent="Fehler: "+e.message}
}
async function loginCloud(){
  try{
    saveCloudForm();
    cloudDialogMessage.textContent="Anmeldung läuft …";
    const body=await cloudRequest("/auth/v1/token?grant_type=password",{method:"POST",auth:false,body:JSON.stringify({email:state.cloud.email,password:cloudPassword.value})});
    storeSession(body);
    cloudDialogMessage.textContent="Angemeldet. Der zentrale Cloud-Datenstand wird geladen …";
    await bootstrapCloud(true);
    render();
    addAudit("Supabase verbunden",state.cloud.email);persist();cloudDialogMessage.textContent="Verbunden. Künftige Änderungen werden automatisch synchronisiert.";
  }catch(e){cloudDialogMessage.textContent="Fehler: "+e.message}
}
function storeSession(body){
  state.cloud.accessToken=body.access_token||state.cloud.accessToken||"";
  state.cloud.refreshToken=body.refresh_token||state.cloud.refreshToken||"";
  state.cloud.userId=body.user?.id||state.cloud.userId||"";
  state.cloud.email=body.user?.email||state.cloud.email;
  persist({cloud:false});
}
function logoutCloud(){
  addAudit("Supabase abgemeldet",state.cloud.email||"");
  state.cloud.accessToken="";state.cloud.refreshToken="";state.cloud.userId="";state.cloud.lastSync="";
  localDirty=false;
  persist({cloud:false});renderCloudStatus();cloudDialogMessage.textContent="Abgemeldet. Der letzte Datenstand bleibt nur als Offline-Cache auf diesem Gerät.";
}
function cloudPayload(){
  const copy=JSON.parse(JSON.stringify(state));
  if(copy.cloud){
    copy.cloud.accessToken="";
    copy.cloud.refreshToken="";
    copy.cloud.anonKey="";
    copy.cloud.url="";
    copy.cloud.lastSync="";
  }
  copy.schemaVersion="10.0";
  return copy;
}
function mergeRemoteState(remote,updatedAt){
  if(!remote)return;
  applyingRemote=true;
  const cloudKeep={...state.cloud};
  state={...clone(DEFAULTS),...state,...remote,cloud:cloudKeep};
  state.dividends=remote.dividends||[];
  state.benchmark={...DEFAULTS.benchmark,...(remote.benchmark||{})};
  state.contributions=remote.contributions||[];
  state.autoAccounting={...DEFAULTS.autoAccounting,...(remote.autoAccounting||{})};
  state.fx={...DEFAULTS.fx,...(remote.fx||{})};
  state.cloud.lastSync=updatedAt||new Date().toISOString();
  localDirty=false;
  localStorage.setItem(KEY,JSON.stringify(state));
  applyingRemote=false;
}
function scheduleCloudSave(){
  if(!cloudConfigured()||applyingRemote)return;
  clearTimeout(syncTimer);
  cloudBadge.textContent="Speichere …";cloudBadge.className="status";
  syncTimer=setTimeout(()=>syncToCloud().catch(handleCloudError),700);
}
function handleCloudError(e){
  lastCloudError=e?.message||String(e);
  cloudMessage.textContent="Cloud-Synchronisation wartet: "+lastCloudError;
  cloudBadge.textContent=navigator.onLine?"Fehler":"Offline";
  cloudBadge.className="status cloud-error";
}
async function syncToCloud(){
  if(!cloudConfigured())throw new Error("Cloud-Verbindung ist nicht vollständig eingerichtet.");
  if(syncInFlight)return;
  syncInFlight=true;
  try{
    const now=new Date().toISOString();
    const row={user_id:state.cloud.userId,portfolio_data:cloudPayload(),updated_at:now};
    await cloudRequest("/rest/v1/portfolio_sync?on_conflict=user_id",{method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(row)});
    state.cloud.lastSync=now;
    localDirty=false;
    lastCloudError="";
    persist({cloud:false});
    renderCloudStatus();
  }finally{syncInFlight=false}
}
async function getCloudRow(){
  const rows=await cloudRequest(`/rest/v1/portfolio_sync?user_id=eq.${encodeURIComponent(state.cloud.userId)}&select=portfolio_data,updated_at`);
  return rows?.[0]||null;
}
async function syncFromCloud(preferCloud=true){
  if(!cloudConfigured())throw new Error("Cloud-Verbindung ist nicht vollständig eingerichtet.");
  if(syncInFlight)return false;
  if(localDirty){
    await syncToCloud();
    return true;
  }
  syncInFlight=true;
  try{
    const row=await getCloudRow();
    if(!row){
      syncInFlight=false;
      await syncToCloud();
      return true;
    }
    const remoteTime=row.updated_at?new Date(row.updated_at).getTime():0;
    const localTime=state.cloud.lastSync?new Date(state.cloud.lastSync).getTime():0;
    if(preferCloud&&row.portfolio_data&&(remoteTime>localTime||!state.cloud.lastSync)){
      mergeRemoteState(row.portfolio_data,row.updated_at);
      initializeAutomaticAccounting();
      applyScheduledContributions();
      render();
      return true;
    }
    state.cloud.lastSync=row.updated_at||state.cloud.lastSync;
    persist({cloud:false});
    renderCloudStatus();
    return false;
  }finally{syncInFlight=false}
}
async function bootstrapCloud(firstLogin=false){
  if(!cloudConfigured())return;
  try{
    await ensureCloudSession();
    const row=await getCloudRow();
    if(row?.portfolio_data){
      mergeRemoteState(row.portfolio_data,row.updated_at);
      initializeAutomaticAccounting();
      applyScheduledContributions();
      render();
    }else{
      localDirty=true;
      await syncToCloud();
    }
    lastCloudError="";
    renderCloudStatus();
  }catch(e){
    handleCloudError(e);
    if(firstLogin)throw e;
  }
}
async function syncNowHandler(){
  try{
    if(!cloudConfigured()){openCloudDialog();return}
    cloudBadge.textContent="Gleiche ab …";cloudBadge.className="status";
    if(localDirty)await syncToCloud();
    else await syncFromCloud(true);
    cloudMessage.textContent="Cloud und dieses Gerät sind auf demselben Stand.";
  }catch(e){handleCloudError(e)}
}
function renderCloudStatus(){
  if(cloudConfigured()){
    cloudBadge.textContent=localDirty?"Änderung ausstehend":"Auto-Sync aktiv";
    cloudBadge.className="status cloud-on";
    cloudMessage.textContent=`Supabase ist die führende Datenquelle. Angemeldet als ${state.cloud.email}. Änderungen auf einem Gerät werden automatisch auf die anderen Geräte übertragen.`;
    cloudLastSync.textContent=state.cloud.lastSync?`Cloud-Stand: ${new Date(state.cloud.lastSync).toLocaleString("de-DE")}`:"Cloud wird initialisiert …";
  }else{
    cloudBadge.textContent="Nicht verbunden";cloudBadge.className="status cloud-off";
    cloudMessage.textContent="Einmalig auf jedem Gerät anmelden. Danach musst du Depotwerte nur noch auf einem Gerät erfassen.";
    cloudLastSync.textContent="Lokaler Datenstand dient bis zur Anmeldung als Offline-Cache";
  }
}

function renderFunds(total){fundList.innerHTML=state.funds.map(f=>{const cost=Number(f.costBasis||0),avg=f.units?cost/f.units:0;return`<div class="fund"><div><div class="fund-name">${f.name}</div><div class="fund-sub">${f.isin} · ${num.format(f.units)} Anteile · Ø Kauf ${euro.format(avg)}</div></div><div><div class="metric-label">Depotwert</div><div class="metric-value">${euro.format(f.value)}</div></div><div><div class="metric-label">Gewichtung</div><div class="metric-value">${pct.format(total?f.value/total:0)}</div></div><div><div class="metric-label">Seit Kauf</div><div class="metric-value ${f.gain>=0?"positive":"negative"}">${euro.format(f.gain)}</div></div><div><div class="metric-label">GuV YTD</div><div class="metric-value ${f.ytd>=0?"positive":"negative"}">${euro.format(f.ytd)}</div></div></div>`}).join("")}
function renderDonut(total){let start=0,parts=[];state.funds.forEach((f,i)=>{const s=total?f.value/total*100:0;parts.push(`${COLORS[i]} ${start}% ${start+s}%`);start+=s});donut.style.background=`conic-gradient(${parts.join(",")})`;donutValue.textContent=euro.format(total);legend.innerHTML=state.funds.map((f,i)=>`<div class="legend-row"><span><i class="dot" style="background:${COLORS[i]}"></i>${f.name}</span><strong>${pct.format(total?f.value/total:0)}</strong></div>`).join("")}
function renderSavings(){savingsList.innerHTML=state.funds.map(f=>`<div class="saving-row"><span>${f.name}</span><strong>${euro.format(f.monthly)}</strong></div>`).join("")}
function renderReturns(current){const today=startOfDay(new Date()),periods=[["Today",returnToday,returnTodayInfo,addDays(today,-1),"Stand von gestern erforderlich"],["7d",return7d,return7dInfo,addDays(today,-7),"Stand von vor 7 Tagen erforderlich"],["Week",returnWeek,returnWeekInfo,startOfWeek(today),"Stand vom Wochenbeginn erforderlich"],["Month",returnMonth,returnMonthInfo,new Date(today.getFullYear(),today.getMonth(),1),"Stand vom Monatsbeginn erforderlich"],["Year",returnYear,returnYearInfo,new Date(today.getFullYear(),0,1),"Stand vom Jahresbeginn erforderlich"]];for(const[,el,info,start,fallback]of periods){const r=periodReturn(start,today,current);if(!r){el.textContent="–";el.className="";info.textContent=fallback;continue}el.textContent=pct.format(r.rate);el.className=r.rate>=0?"positive":"negative";info.textContent=`Vergleich mit ${formatDate(r.baseline.date)}${r.cashflows?` · ${euro.format(r.cashflows)} Sparrate abgezogen`:""}`}}
function periodReturn(start,end,current){const hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date)),iso=isoDate(start),c=hist.filter(x=>x.date<=iso);if(!c.length)return null;const baseline=c.at(-1),base=Number(baseline.value||0);if(!base)return null;const cashflows=contributionsAfter(baseline.date,isoDate(end));return{baseline,cashflows,rate:(current-base-cashflows)/base}}
function contributionsAfter(startIso,endIso){const monthly=state.funds.reduce((s,f)=>s+Number(f.monthly||0),0);let d=new Date(startIso+"T12:00:00");d=new Date(d.getFullYear(),d.getMonth(),1);if(isoDate(d)<=startIso)d=new Date(d.getFullYear(),d.getMonth()+1,1);let total=0;while(isoDate(d)<=endIso){total+=monthly;d=new Date(d.getFullYear(),d.getMonth()+1,1)}return total}
function renderForecast(){const t=totals(),rate=Number(forecastRate.value),monthly=state.funds.reduce((s,f)=>s+f.monthly,0),r=rate/12;forecastGrid.innerHTML=[5,10,20,30].map(y=>{const m=y*12,fv=t.value*Math.pow(1+r,m)+monthly*((Math.pow(1+r,m)-1)/r);return`<div class="forecast-item"><span>In ${y} Jahren</span><strong>${euro.format(fv)}</strong></div>`}).join("")}
function renderGoals(){const t=totals(),rate=Number(forecastRate.value),monthly=state.funds.reduce((s,f)=>s+Number(f.monthly||0),0);goalGrid.innerHTML=[250000,500000,1000000].map(g=>`<div class="goal-item"><span>${euro.format(g)}</span><strong>${goalTime(t.value,monthly,rate,g)}</strong></div>`).join("")}
function goalTime(start,monthly,annual,goal){if(start>=goal)return"bereits erreicht";const r=annual/12;for(let m=1;m<=1200;m++){const fv=start*Math.pow(1+r,m)+monthly*((Math.pow(1+r,m)-1)/r);if(fv>=goal){const y=Math.floor(m/12),mo=m%12;return`${y?y+" J. ":""}${mo?mo+" Mon.":""}`.trim()}}return"nicht erreichbar"}
let chartPoints=[];
function renderHistory(){
 const canvas=document.getElementById("historyChart"),rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
 const w=Math.max(320,Math.round(rect.width||900)),h=Math.max(240,Math.round(Math.min(w*.43,360))),p=48;
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 let hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));if(historyRange.value!=="all"){const c=new Date();c.setDate(c.getDate()-Number(historyRange.value));hist=hist.filter(x=>new Date(x.date)>=c)}
 const ink=getComputedStyle(document.documentElement).getPropertyValue("--ink").trim(),line=getComputedStyle(document.documentElement).getPropertyValue("--line").trim(),card=getComputedStyle(document.documentElement).getPropertyValue("--card").trim();
 if(!hist.length){chartPoints=[];ctx.fillStyle=ink;ctx.font="600 15px -apple-system";ctx.textAlign="center";ctx.fillText("Noch keine Tagesstände gespeichert",w/2,h/2);return}
 const vals=hist.map(x=>Number(x.value||0)),rawMin=Math.min(...vals),rawMax=Math.max(...vals),padding=Math.max(100,(rawMax-rawMin)*.15),min=rawMin-padding,max=rawMax+padding,span=Math.max(1,max-min);
 ctx.strokeStyle=line;ctx.lineWidth=1;ctx.fillStyle=ink;ctx.font="12px -apple-system";ctx.textAlign="left";for(let i=0;i<5;i++){const y=p+i*(h-2*p)/4;ctx.beginPath();ctx.moveTo(p,y);ctx.lineTo(w-p,y);ctx.stroke();ctx.fillText(euro.format(max-i*span/4),p+5,y-7)}
 chartPoints=hist.map((pt,i)=>({x:p+(hist.length===1?(w-2*p)/2:i*(w-2*p)/(hist.length-1)),y:h-p-((Number(pt.value)-min)/span)*(h-2*p),date:pt.date,value:Number(pt.value)}));
 const grad=ctx.createLinearGradient(0,p,0,h-p);grad.addColorStop(0,"rgba(91,155,213,.32)");grad.addColorStop(1,"rgba(91,155,213,0)");ctx.beginPath();ctx.moveTo(chartPoints[0].x,h-p);chartPoints.forEach(q=>ctx.lineTo(q.x,q.y));ctx.lineTo(chartPoints.at(-1).x,h-p);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
 ctx.beginPath();chartPoints.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.strokeStyle=COLORS[0];ctx.lineWidth=4;ctx.lineJoin="round";ctx.lineCap="round";ctx.stroke();chartPoints.forEach(q=>{ctx.beginPath();ctx.arc(q.x,q.y,4,0,Math.PI*2);ctx.fillStyle=COLORS[0];ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=card;ctx.stroke()});
 ctx.fillStyle=ink;ctx.textAlign="left";ctx.fillText(formatDate(hist[0].date),p,h-12);ctx.textAlign="right";ctx.fillText(formatDate(hist.at(-1).date),w-p,h-12);
}
function showChartTooltip(event){const canvas=historyChart,tip=chartTooltip;if(!chartPoints.length)return;const r=canvas.getBoundingClientRect(),x=(event.touches?.[0]?.clientX??event.clientX)-r.left;const q=chartPoints.reduce((a,b)=>Math.abs(b.x-x)<Math.abs(a.x-x)?b:a);tip.textContent=`${formatDate(q.date)} · ${euro.format(q.value)}`;tip.style.left=q.x+"px";tip.style.top=q.y+"px";tip.hidden=false}
function hideChartTooltip(){chartTooltip.hidden=true}
function renderRisk(){const hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));if(!hist.length)return;let peak=Number(hist[0].value),ath=peak,maxDD=0;for(const x of hist){const v=Number(x.value);peak=Math.max(peak,v);ath=Math.max(ath,v);if(peak)maxDD=Math.min(maxDD,(v-peak)/peak)}maxDrawdown.textContent=pct.format(maxDD);maxDrawdown.className=maxDD<0?"negative":"";allTimeHigh.textContent=euro.format(ath);const d=ath?totals().value/ath-1:0;distanceToHigh.textContent=pct.format(d);distanceToHigh.className=d>=0?"positive":"negative"}
function renderDividends(){totalDividends.textContent=euro.format(state.dividends.reduce((s,d)=>s+Number(d.amount||0),0))}
function renderNextSavings(){const now=new Date(),next=new Date(now.getFullYear(),now.getMonth()+1,1),days=Math.ceil((startOfDay(next)-startOfDay(now))/86400000);nextSavingsDate.textContent=`${formatDate(isoDate(next))} · in ${days} Tagen`}

function openHistoryManager(){
 const rows=[...state.history].sort((a,b)=>b.date.localeCompare(a.date));historyManagerList.innerHTML=rows.length?rows.map(x=>`<div class="history-manage-row"><label>Datum<input data-hdate="${x.date}" type="date" value="${x.date}"></label><label>Depotwert €<input data-hvalue="${x.date}" type="number" step="0.01" value="${Number(x.value).toFixed(2)}"></label><button type="button" data-hdelete="${x.date}">Löschen</button></div>`).join(""):'<div class="calendar-empty">Keine Tagesstände vorhanden.</div>';
 historyManagerList.querySelectorAll("input").forEach(inp=>inp.onchange=()=>{const key=inp.dataset.hdate||inp.dataset.hvalue,row=state.history.find(x=>x.date===key);if(!row)return;if(inp.dataset.hdate){row.date=inp.value}else row.value=Number(inp.value||0);state.history=state.history.filter((x,i,a)=>a.findIndex(y=>y.date===x.date)===i);persist();render();openHistoryManager()});
 historyManagerList.querySelectorAll("button[data-hdelete]").forEach(btn=>btn.onclick=()=>{if(!confirm("Diesen Tagesstand löschen?"))return;state.history=state.history.filter(x=>x.date!==btn.dataset.hdelete);persist();render();openHistoryManager()});historyDialog.showModal();
}
function renderSystemSummary(){const age=state.history.length?Math.floor((new Date(isoDate(new Date()))-new Date([...state.history].sort((a,b)=>a.date.localeCompare(b.date)).at(-1).date))/86400000):999;const cloud=cloudConfigured()?"Supabase Master · Auto-Sync":"Offline-Cache · Supabase nicht angemeldet";systemSummary.textContent=`${state.history.length} Tagesstände · letzter Stand ${age===0?"heute":age===1?"gestern":`vor ${age} Tagen`} · ${cloud}`}
function forceVersionRefresh(){if("serviceWorker" in navigator)navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.update()))).finally(()=>location.reload(true));else location.reload(true)}
let deferredInstallPrompt=null;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;installApp.hidden=false});async function installPwa(){if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;installApp.hidden=true}


function addAudit(action,detail=""){
  state.audit=Array.isArray(state.audit)?state.audit:[];
  state.audit.unshift({ts:new Date().toISOString(),action,detail});
  state.audit=state.audit.slice(0,80);
}
function renderAudit(){
  const items=(state.audit||[]).slice(0,12);
  auditList.innerHTML=items.length?items.map(x=>`<div class="calendar-item audit-item"><div class="date">${new Date(x.ts).toLocaleString("de-DE")}</div><div class="fund">${x.action}${x.detail?` · ${x.detail}`:""}</div></div>`).join(""):'<div class="calendar-empty">Noch keine Änderungen protokolliert.</div>';
}
function clearAuditLog(){
  if(!confirm("Änderungsprotokoll wirklich leeren?"))return;
  state.audit=[];persist();renderAudit();
}
function ensureTargets(){
  if(!Array.isArray(state.targets)||state.targets.length!==state.funds.length){
    state.targets=state.funds.map((_,i)=>i===0?40:i===1?40:20);
  }
}
function openTargetsDialog(){
  ensureTargets();
  targetRows.innerHTML=state.funds.map((f,i)=>`<label class="target-row"><span>${f.name}</span><input data-target-i="${i}" type="number" min="0" max="100" step="0.1" value="${Number(state.targets[i]||0).toFixed(1)}"><b>%</b></label>`).join("");
  targetsDialog.showModal();
}
function saveTargetWeights(){
  const vals=[...targetRows.querySelectorAll("input[data-target-i]")].map(x=>Number(x.value||0));
  const sum=vals.reduce((a,b)=>a+b,0);
  if(Math.abs(sum-100)>0.11){alert(`Die Zielgewichtungen ergeben ${sum.toFixed(1)} %. Bitte auf 100 % korrigieren.`);return}
  state.targets=vals;
  addAudit("Zielgewichtungen geändert",vals.map(v=>v.toFixed(1)+" %").join(" / "));
  persist();render();
}
function renderV10Intelligence(){
  ensureTargets();
  const t=totals(), total=t.value||1;
  const rows=state.funds.map((f,i)=>{
    const actual=Number(f.value||0)/total*100,target=Number(state.targets[i]||0),drift=actual-target;
    return{f,i,actual,target,drift};
  });
  rebalanceList.innerHTML=rows.map(r=>`<div class="rebalance-row">
    <div><strong>${r.f.name}</strong><small>Ziel ${r.target.toFixed(1)} % · Ist ${r.actual.toFixed(1)} %</small></div>
    <div class="drift ${r.drift>0.5?"over":r.drift<-0.5?"under":"ok"}">${r.drift>0?"+":""}${r.drift.toFixed(2)} %-Pkt.</div>
  </div>`).join("");
  const worst=[...rows].sort((a,b)=>Math.abs(b.drift)-Math.abs(a.drift))[0];
  maxAllocationDrift.textContent=worst?`${worst.f.name}: ${worst.drift>0?"+":""}${worst.drift.toFixed(2)} %-Pkt.`:"–";
  const under=[...rows].sort((a,b)=>a.drift-b.drift)[0];
  const monthly=state.funds.reduce((s,f)=>s+Number(f.monthly||0),0);
  nextSavingsRecommendation.textContent=under&&monthly?`${euro.format(monthly)} bevorzugt in ${under.f.name}`:"–";
  rebalanceHint.textContent=under&&under.drift<-.5?`${under.f.name} ist am stärksten untergewichtet. Eine zusätzliche Sparrate würde die Zielverteilung annähern.`:"Die aktuelle Verteilung liegt nahe an deinen Zielgewichten.";

  const hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));
  if(hist.length){
    const first=Number(hist[0].value||0),current=t.value, startDate=new Date(hist[0].date+"T12:00:00");
    const years=Math.max((Date.now()-startDate.getTime())/(365.25*86400000),1/365.25);
    const since=first?current/first-1:null;
    const cagr=first&&years>0?Math.pow(current/first,1/years)-1:null;
    setReturn(v10SinceStart,since);
    setReturn(v10Cagr,cagr);
    const ath=Math.max(current,...hist.map(x=>Number(x.value||0)));
    v10Ath.textContent=euro.format(ath);
    setReturn(v10AthDistance,ath?current/ath-1:null);
  }else{
    v10SinceStart.textContent=v10Cagr.textContent=v10Ath.textContent=v10AthDistance.textContent="–";
  }
}
function renderReportPreview(){
  const t=totals();
  reportDepotValue.textContent=euro.format(t.value);
  reportTotalGain.textContent=euro.format(t.gain);reportTotalGain.className=t.gain>=0?"positive":"negative";
  reportTotalReturn.textContent=pct.format(t.ret);reportTotalReturn.className=t.ret>=0?"positive":"negative";
  reportCloudState.textContent=cloudConfigured()?(localDirty?"Synchronisierung läuft":"Synchronisiert"):"Offline";
}
function printDepotReport(){
  addAudit("Depotbericht erstellt",euro.format(totals().value));
  persist();
  document.documentElement.classList.add("printing-report");
  window.print();
  setTimeout(()=>document.documentElement.classList.remove("printing-report"),300);
}

function openEditor(){
  document.getElementById("simpleValueRows").innerHTML=state.funds.map((f,i)=>`
    <section class="simple-value-row">
      <div><h3>${f.name}</h3><p>${f.isin} · aktueller Einstand ${euro.format(f.costBasis)}</p></div>
      <label>Aktueller Depotwert €
        <input data-simple-i="${i}" type="number" step="0.01" value="${Number(f.value).toFixed(2)}">
      </label>
    </section>`).join("");
  document.getElementById("advancedRows").innerHTML=state.funds.map((f,i)=>`
    <section class="edit-row"><h3>${f.name}</h3>
      <div class="edit-grid">
        <label>Anteile<input data-advanced-i="${i}" data-k="units" type="number" step="0.000001" value="${f.units}"></label>
        <label>Stand<input data-advanced-i="${i}" data-k="date" type="date" value="${f.date}"></label>
        <label>Einstandskapital €<input data-advanced-i="${i}" data-k="costBasis" type="number" step="0.01" value="${f.costBasis}"></label>
        <label>YTD-Basis €<input data-advanced-i="${i}" data-k="ytdBasis" type="number" step="0.01" value="${f.ytdBasis}"></label>
      </div>
    </section>`).join("");
  document.getElementById("editDialog").showModal();
}
function applyEditor(){
  document.getElementById("simpleValueRows").querySelectorAll("input[data-simple-i]").forEach(inp=>{
    const i=Number(inp.dataset.simpleI);
    state.funds[i].value=Number(inp.value||0);
    state.funds[i].date=isoDate(new Date());
  });
  document.getElementById("advancedRows").querySelectorAll("input[data-advanced-i]").forEach(inp=>{
    const i=Number(inp.dataset.advancedI),k=inp.dataset.k;
    state.funds[i][k]=k==="date"?inp.value:Number(inp.value||0);
  });
  recalculateFundMetrics();
  addAudit("Depotwerte aktualisiert",euro.format(totals().value));
  persist();
  render();
  if(cloudConfigured())syncToCloud().catch(()=>{});
}
function snapshot(){const today=isoDate(new Date()),value=totals().value,f=state.history.find(x=>x.date===today);f?f.value=value:state.history.push({date:today,value});addAudit("Tagesstand gespeichert",`${formatDate(today)} · ${euro.format(value)}`);persist();render();if(cloudConfigured())syncToCloud().catch(()=>{});alert("Tagesstand gespeichert.")}
function openDividendDialog(){dividendFund.innerHTML=state.funds.map((f,i)=>`<option value="${i}">${f.name}</option>`).join("");dividendAmount.value="";dividendDate.value=isoDate(new Date());document.getElementById("dividendDialog").showModal()}
function saveDividendEntry(){const amount=Number(dividendAmount.value||0);if(amount<=0)return;state.dividends.push({fundIndex:Number(dividendFund.value),amount,date:dividendDate.value});addAudit("Ausschüttung erfasst",euro.format(amount));persist();render()}
function exportBackup(){const b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="ETF-Depot-Andreas-Backup.json";a.click();URL.revokeObjectURL(a.href)}
function importBackup(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);persist();render()}catch{alert("Ungültige Backup-Datei")}};r.readAsText(f)}
function toggleTheme(){state.theme=state.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=state.theme;persist();renderHistory()}
function allocationStatus(total){return state.funds.some(f=>f.value/total>.5)?"Gewichtung prüfen":"Depot läuft planmäßig"}
function latestDate(){return state.funds.map(f=>f.date).sort().at(-1)}
function formatDate(s){if(!s)return"–";const[y,m,d]=s.split("-");return`${d}.${m}.${y}`}
function startOfDay(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function startOfWeek(d){const x=startOfDay(d),day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return x}
function isoDate(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
document.getElementById("openEdit").onclick=openEditor;
document.getElementById("syncNow").onclick=syncNowHandler;
document.getElementById("cloudSettings").onclick=openCloudDialog;
document.getElementById("cloudRegister").onclick=registerCloud;
document.getElementById("cloudLogin").onclick=loginCloud;
document.getElementById("cloudLogout").onclick=logoutCloud;
document.getElementById("editBenchmark").onclick=openBenchmarkDialog;
document.getElementById("saveBenchmark").onclick=saveBenchmarkData;
document.getElementById("addContribution").onclick=openContributionDialog;
document.getElementById("saveContribution").onclick=saveContributionData;
document.getElementById("exportCsv").onclick=exportHistoryCsv;
document.getElementById("refreshFx").onclick=fetchUsdEur;
document.getElementById("applyEdit").onclick=applyEditor;
document.getElementById("saveSnapshot").onclick=snapshot;
document.getElementById("exportBtn").onclick=exportBackup;
document.getElementById("importInput").onchange=importBackup;
document.getElementById("themeToggle").onclick=toggleTheme;
document.getElementById("forecastRate").onchange=()=>{renderForecast();renderGoals();renderFire()};
document.getElementById("historyRange").onchange=renderHistory;
document.getElementById("analyticsRange").onchange=renderAnalytics;
document.getElementById("clearHistory").onclick=clearHistoryData;
document.getElementById("monthlyExpenses").oninput=renderFire;
document.getElementById("withdrawalRate").onchange=renderFire;
document.getElementById("addDividend").onclick=openDividendDialog;
document.getElementById("saveDividend").onclick=saveDividendEntry;
document.getElementById("openHistoryManager").onclick=openHistoryManager;
document.getElementById("forceRefresh").onclick=forceVersionRefresh;
document.getElementById("installApp").onclick=installPwa;
document.getElementById("editTargets").onclick=openTargetsDialog;
document.getElementById("saveTargets").onclick=saveTargetWeights;
document.getElementById("clearAudit").onclick=clearAuditLog;
document.getElementById("printReport").onclick=printDepotReport;
document.getElementById("printReportCard").onclick=printDepotReport;
document.getElementById("historyChart").addEventListener("mousemove",showChartTooltip);
document.getElementById("historyChart").addEventListener("mouseleave",hideChartTooltip);
document.getElementById("historyChart").addEventListener("touchmove",showChartTooltip,{passive:true});
document.getElementById("historyChart").addEventListener("touchend",hideChartTooltip);
if(!state.cloud.url)state.cloud.url="https://dgrulyvrxmughqgzherg.supabase.co";
if(!state.cloud.anonKey)state.cloud.anonKey="sb_publishable_6TeNYQRBAqDpysVgKUJ0Jw_7KqDvgc2";
persist();

document.documentElement.dataset.theme=state.theme;render();if(!state.fx?.date||state.fx.date!==isoDate(new Date()))fetchUsdEur();

document.title="ETF Depot Andreas · Version 10.0";

let chartResizeTimer;
window.addEventListener("resize",()=>{clearTimeout(chartResizeTimer);chartResizeTimer=setTimeout(renderHistory,120)});
async function resumeCloudSync(){
  if(!state.fx?.date||state.fx.date!==isoDate(new Date()))fetchUsdEur();
  if(!cloudConfigured())return;
  try{
    if(localDirty)await syncToCloud();
    await syncFromCloud(true);
  }catch(e){handleCloudError(e)}
}
window.addEventListener("focus",resumeCloudSync);
window.addEventListener("online",resumeCloudSync);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")resumeCloudSync()});
window.addEventListener("storage",e=>{if(e.key===KEY&&!localDirty){state=load();render()}});
setInterval(()=>{if(document.visibilityState==="visible"&&navigator.onLine&&cloudConfigured()&&!localDirty)syncFromCloud(true).catch(handleCloudError)},15000);
bootstrapCloud(false);
