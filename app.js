const KEY="etfDepotAndreas.v8";
const COLORS=["#5B9BD5","#14b8a6","#f59e0b"];
const DEFAULTS={
 funds:[
  {name:"Vanguard FTSE Developed World",isin:"IE00BKX55T58",units:384.222758,value:48374.61,gain:15492.27,ytd:6396.34,monthly:600,date:"2026-08-04",costBasis:32882.34,ytdBasis:41978.27},
  {name:"Dimensional World Equity",isin:"IE00B53RD369",units:1191.018192,value:46652.18,gain:13652.18,ytd:6672.54,monthly:600,date:"2026-08-04",costBasis:33000.00,ytdBasis:39979.64},
  {name:"Amundi Robotics & AI",isin:"LU1861132840",units:179.753899,value:26136.49,gain:9665.62,ytd:5692.59,monthly:300,date:"2026-08-04",costBasis:16470.87,ytdBasis:20443.90}
 ],
 history:[{date:"2026-08-04",value:121163.28}],dividends:[],theme:"light",benchmark:{name:"MSCI World",start:0,current:0,date:""},contributions:[],autoAccounting:{lastAppliedMonth:"2026-08",totalApplied:0},cloud:{url:"",anonKey:"",accessToken:"",refreshToken:"",userId:"",email:"",lastSync:""},fx:{usdEur:0.87,date:"",source:""},vanguardUsdMode:false,vanguardUsdValue:0
};
const old=localStorage.getItem("etfDepotAndreas.v7")||localStorage.getItem("etfDepotAndreas.v6")||localStorage.getItem("etfDepotAndreas.v5_1")||localStorage.getItem("etfDepotAndreas.v5")||localStorage.getItem("etfDepotAndreas.v4")||localStorage.getItem("etfDepotAndreas.v3")||localStorage.getItem("etfDepotAndreas.v1");
let state=load();
initializeAutomaticAccounting();
applyScheduledContributions();
const euro=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"});
const pct=new Intl.NumberFormat("de-DE",{style:"percent",minimumFractionDigits:2,maximumFractionDigits:2});
const num=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:6});
function clone(x){return JSON.parse(JSON.stringify(x))}
function load(){try{const raw=localStorage.getItem(KEY)||old;if(!raw)return clone(DEFAULTS);const x=JSON.parse(raw);return{...clone(DEFAULTS),...x,dividends:x.dividends||[],benchmark:{...DEFAULTS.benchmark,...(x.benchmark||{})},contributions:x.contributions||[],autoAccounting:{...DEFAULTS.autoAccounting,...(x.autoAccounting||{})},cloud:{...DEFAULTS.cloud,...(x.cloud||{})},fx:{...DEFAULTS.fx,...(x.fx||{})}}}catch{return clone(DEFAULTS)}}
function persist(){localStorage.setItem(KEY,JSON.stringify(state))}
function totals(){
  recalculateFundMetrics();
  const value=state.funds.reduce((s,f)=>s+Number(f.value||0),0);
  const gain=state.funds.reduce((s,f)=>s+Number(f.gain||0),0);
  const ytd=state.funds.reduce((s,f)=>s+Number(f.ytd||0),0);
  const cost=state.funds.reduce((s,f)=>s+Number(f.costBasis||0),0);
  return{value,gain,ytd,cost,ret:cost?gain/cost:0}
}}
function render(){
 const t=totals();
 totalValue.textContent=euro.format(t.value);totalGain.textContent=euro.format(t.gain);totalGain.className=t.gain>=0?"positive":"negative";totalGainPct.textContent=pct.format(t.ret);totalYtd.textContent=euro.format(t.ytd);totalYtd.className=t.ytd>=0?"positive":"negative";investedCapital.textContent=euro.format(t.cost);
 const best=[...state.funds].sort((a,b)=>b.ytd-a.ytd)[0];bestFund.textContent="Bester Beitrag: "+best.name;lastUpdated.textContent="Stand "+formatDate(latestDate());statusBadge.textContent=allocationStatus(t.value);
 renderReturns(t.value);renderDailySummary(t.value);renderFunds(t.value);renderDonut(t.value);renderSavings();renderForecast();renderGoals();renderHistory();renderRisk();renderDividends();renderDividendCalendar();renderNextSavings();renderFx();renderAnalytics();renderProgressGoals();renderPeriodSummary();renderDataQuality();renderBenchmark();renderMonthlyReport();renderContributions();renderHealth();renderAutomaticAccounting();renderCloudStatus();renderFire();
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
  benchmarkDialog.showModal();
}
function saveBenchmarkData(){
  state.benchmark={name:benchmarkName.value||"MSCI World",start:Number(benchmarkStart.value||0),current:Number(benchmarkCurrent.value||0),date:benchmarkDate.value};
  persist();render();
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
  contributionAmount.value="";contributionDate.value=isoDate(new Date());contributionNote.value="";contributionDialog.showModal();
}
function saveContributionData(){
  const amount=Number(contributionAmount.value||0);if(amount<=0)return;
  state.contributions=state.contributions||[];
  state.contributions.push({amount,date:contributionDate.value,note:contributionNote.value});
  persist();render();
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
  return Boolean(state.cloud?.url&&state.cloud?.anonKey&&state.cloud?.accessToken&&state.cloud?.userId);
}
function cloudHeaders(auth=true){
  const h={"apikey":state.cloud.anonKey,"Content-Type":"application/json"};
  if(auth&&state.cloud.accessToken)h["Authorization"]="Bearer "+state.cloud.accessToken;
  return h;
}
async function cloudRequest(path,options={}){
  const url=state.cloud.url.replace(/\/$/,"")+path;
  const r=await fetch(url,{...options,headers:{...cloudHeaders(options.auth!==false),...(options.headers||{})}});
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
  cloudDialogMessage.textContent="";
  cloudDialog.showModal();
}
function saveCloudForm(){
  state.cloud.url=supabaseUrl.value.trim();
  state.cloud.anonKey=supabaseAnonKey.value.trim();
  state.cloud.email=cloudEmail.value.trim();
  persist();
}
async function registerCloud(){
  try{
    saveCloudForm();
    cloudDialogMessage.textContent="Konto wird erstellt …";
    const body=await cloudRequest("/auth/v1/signup",{method:"POST",auth:false,body:JSON.stringify({email:state.cloud.email,password:cloudPassword.value})});
    if(body?.access_token){
      storeSession(body);
      cloudDialogMessage.textContent="Konto erstellt und angemeldet.";
      await syncToCloud();
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
    cloudDialogMessage.textContent="Angemeldet. Cloud-Daten werden geladen …";
    await syncFromCloud(true);
    render();
  }catch(e){cloudDialogMessage.textContent="Fehler: "+e.message}
}
function storeSession(body){
  state.cloud.accessToken=body.access_token||"";
  state.cloud.refreshToken=body.refresh_token||"";
  state.cloud.userId=body.user?.id||"";
  state.cloud.email=body.user?.email||state.cloud.email;
  persist();
}
function logoutCloud(){
  state.cloud.accessToken="";state.cloud.refreshToken="";state.cloud.userId="";state.cloud.lastSync="";
  persist();renderCloudStatus();cloudDialogMessage.textContent="Abgemeldet.";
}
function cloudPayload(){
  const copy=JSON.parse(JSON.stringify(state));
  if(copy.cloud){
    copy.cloud.accessToken="";copy.cloud.refreshToken="";copy.cloud.anonKey="";copy.cloud.url="";
  }
  return copy;
}
async function syncToCloud(){
  if(!cloudConfigured())throw new Error("Cloud-Verbindung ist nicht vollständig eingerichtet.");
  const row={user_id:state.cloud.userId,portfolio_data:cloudPayload(),updated_at:new Date().toISOString()};
  await cloudRequest("/rest/v1/portfolio_sync?on_conflict=user_id",{method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(row)});
  state.cloud.lastSync=new Date().toISOString();persist();renderCloudStatus();
}
async function syncFromCloud(preferCloud=false){
  if(!cloudConfigured())throw new Error("Cloud-Verbindung ist nicht vollständig eingerichtet.");
  const rows=await cloudRequest(`/rest/v1/portfolio_sync?user_id=eq.${encodeURIComponent(state.cloud.userId)}&select=portfolio_data,updated_at`);
  if(!rows?.length){
    await syncToCloud();return;
  }
  const remote=rows[0].portfolio_data;
  if(preferCloud&&remote){
    const cloudKeep={...state.cloud};
    state={...state,...remote,cloud:cloudKeep};
  }
  state.cloud.lastSync=rows[0].updated_at||new Date().toISOString();
  persist();renderCloudStatus();
}
async function syncNowHandler(){
  try{
    cloudBadge.textContent="Synchronisiere …";cloudBadge.className="status";
    if(!cloudConfigured()){openCloudDialog();return}
    const rows=await cloudRequest(`/rest/v1/portfolio_sync?user_id=eq.${encodeURIComponent(state.cloud.userId)}&select=portfolio_data,updated_at`);
    if(rows?.length&&rows[0].updated_at){
      const remoteTime=new Date(rows[0].updated_at).getTime();
      const localTime=state.cloud.lastSync?new Date(state.cloud.lastSync).getTime():0;
      if(remoteTime>localTime&&rows[0].portfolio_data){
        const keep={...state.cloud};
        state={...state,...rows[0].portfolio_data,cloud:keep};
        state.cloud.lastSync=rows[0].updated_at;
        persist();render();
        cloudMessage.textContent="Neuere Cloud-Daten wurden geladen.";
        return;
      }
    }
    await syncToCloud();
    cloudMessage.textContent="Lokale Daten wurden in die Cloud gespeichert.";
  }catch(e){
    cloudMessage.textContent="Synchronisation fehlgeschlagen: "+e.message;
    cloudBadge.textContent="Fehler";cloudBadge.className="status cloud-error";
  }
}
function renderCloudStatus(){
  if(cloudConfigured()){
    cloudBadge.textContent="Verbunden";cloudBadge.className="status cloud-on";
    cloudMessage.textContent=`Angemeldet als ${state.cloud.email}. Änderungen können auf iPhone und Mac synchronisiert werden.`;
    cloudLastSync.textContent=state.cloud.lastSync?`Letzte Synchronisation: ${new Date(state.cloud.lastSync).toLocaleString("de-DE")}`:"Noch nie synchronisiert";
  }else{
    cloudBadge.textContent="Nicht verbunden";cloudBadge.className="status cloud-off";
    cloudMessage.textContent="Cloud-Synchronisation ist noch nicht eingerichtet.";
    cloudLastSync.textContent="Noch nie synchronisiert";
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
function renderHistory(){const ctx=historyChart.getContext("2d"),w=historyChart.width,h=historyChart.height,p=48;ctx.clearRect(0,0,w,h);let hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));if(historyRange.value!=="all"){const c=new Date();c.setDate(c.getDate()-Number(historyRange.value));hist=hist.filter(x=>new Date(x.date)>=c)}if(!hist.length)return;const vals=hist.map(x=>Number(x.value)),min=Math.min(...vals),max=Math.max(...vals),span=Math.max(1,max-min);ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--line");ctx.lineWidth=1;for(let i=0;i<5;i++){const y=p+i*(h-2*p)/4;ctx.beginPath();ctx.moveTo(p,y);ctx.lineTo(w-p,y);ctx.stroke()}ctx.strokeStyle=COLORS[0];ctx.lineWidth=5;ctx.beginPath();hist.forEach((pt,i)=>{const x=p+(hist.length===1?0:i*(w-2*p)/(hist.length-1)),y=h-p-((pt.value-min)/span)*(h-2*p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--ink");ctx.font="16px -apple-system";ctx.fillText(euro.format(max),p,22);ctx.fillText(euro.format(min),p,h-14)}
function renderRisk(){const hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));if(!hist.length)return;let peak=Number(hist[0].value),ath=peak,maxDD=0;for(const x of hist){const v=Number(x.value);peak=Math.max(peak,v);ath=Math.max(ath,v);if(peak)maxDD=Math.min(maxDD,(v-peak)/peak)}maxDrawdown.textContent=pct.format(maxDD);maxDrawdown.className=maxDD<0?"negative":"";allTimeHigh.textContent=euro.format(ath);const d=ath?totals().value/ath-1:0;distanceToHigh.textContent=pct.format(d);distanceToHigh.className=d>=0?"positive":"negative"}
function renderDividends(){totalDividends.textContent=euro.format(state.dividends.reduce((s,d)=>s+Number(d.amount||0),0))}
function renderNextSavings(){const now=new Date(),next=new Date(now.getFullYear(),now.getMonth()+1,1),days=Math.ceil((startOfDay(next)-startOfDay(now))/86400000);nextSavingsDate.textContent=`${formatDate(isoDate(next))} · in ${days} Tagen`}
function openEditor(){
  simpleValueRows.innerHTML=state.funds.map((f,i)=>`
    <section class="simple-value-row">
      <div><h3>${f.name}</h3><p>${f.isin} · aktueller Einstand ${euro.format(f.costBasis)}</p></div>
      <label>Aktueller Depotwert €
        <input data-simple-i="${i}" type="number" step="0.01" value="${Number(f.value).toFixed(2)}">
      </label>
    </section>`).join("");
  advancedRows.innerHTML=state.funds.map((f,i)=>`
    <section class="edit-row"><h3>${f.name}</h3>
      <div class="edit-grid">
        <label>Anteile<input data-advanced-i="${i}" data-k="units" type="number" step="0.000001" value="${f.units}"></label>
        <label>Stand<input data-advanced-i="${i}" data-k="date" type="date" value="${f.date}"></label>
        <label>Einstandskapital €<input data-advanced-i="${i}" data-k="costBasis" type="number" step="0.01" value="${f.costBasis}"></label>
        <label>YTD-Basis €<input data-advanced-i="${i}" data-k="ytdBasis" type="number" step="0.01" value="${f.ytdBasis}"></label>
      </div>
    </section>`).join("");
  editDialog.showModal();
}
function applyEditor(){
  simpleValueRows.querySelectorAll("input[data-simple-i]").forEach(inp=>{
    const i=Number(inp.dataset.simpleI);
    state.funds[i].value=Number(inp.value||0);
    state.funds[i].date=isoDate(new Date());
  });
  advancedRows.querySelectorAll("input[data-advanced-i]").forEach(inp=>{
    const i=Number(inp.dataset.advancedI),k=inp.dataset.k;
    state.funds[i][k]=k==="date"?inp.value:Number(inp.value||0);
  });
  recalculateFundMetrics();
  persist();
  render();
  if(cloudConfigured())syncToCloud().catch(()=>{});
});const mode=document.getElementById("vanguardUsdMode");const usd=document.getElementById("vanguardUsdValue");state.vanguardUsdMode=Boolean(mode?.checked);state.vanguardUsdValue=Number(usd?.value||0);applyFxToVanguard();persist();render();if(cloudConfigured())syncToCloud().catch(()=>{})}
function snapshot(){const today=isoDate(new Date()),value=totals().value,f=state.history.find(x=>x.date===today);f?f.value=value:state.history.push({date:today,value});persist();render();if(cloudConfigured())syncToCloud().catch(()=>{});alert("Tagesstand gespeichert.")}
function openDividendDialog(){dividendFund.innerHTML=state.funds.map((f,i)=>`<option value="${i}">${f.name}</option>`).join("");dividendAmount.value="";dividendDate.value=isoDate(new Date());dividendDialog.showModal()}
function saveDividendEntry(){const amount=Number(dividendAmount.value||0);if(amount<=0)return;state.dividends.push({fundIndex:Number(dividendFund.value),amount,date:dividendDate.value});persist();render()}
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
openEdit.onclick=openEditor;syncNow.onclick=syncNowHandler;cloudSettings.onclick=openCloudDialog;cloudRegister.onclick=registerCloud;cloudLogin.onclick=loginCloud;cloudLogout.onclick=logoutCloud;editBenchmark.onclick=openBenchmarkDialog;saveBenchmark.onclick=saveBenchmarkData;addContribution.onclick=openContributionDialog;saveContribution.onclick=saveContributionData;exportCsv.onclick=exportHistoryCsv;refreshFx.onclick=fetchUsdEur;applyEdit.onclick=applyEditor;saveSnapshot.onclick=snapshot;exportBtn.onclick=exportBackup;importInput.onchange=importBackup;themeToggle.onclick=toggleTheme;forecastRate.onchange=()=>{renderForecast();renderGoals();renderFire()};historyRange.onchange=renderHistory;analyticsRange.onchange=renderAnalytics;clearHistory.onclick=clearHistoryData;monthlyExpenses.oninput=renderFire;withdrawalRate.onchange=renderFire;addDividend.onclick=openDividendDialog;saveDividend.onclick=saveDividendEntry;document.documentElement.dataset.theme=state.theme;render();if(!state.fx?.date||state.fx.date!==isoDate(new Date()))fetchUsdEur();

document.title="ETF Depot Andreas · Version 8.0";
