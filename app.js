window.addEventListener("error",event=>{
 const box=document.createElement("div");
 box.className="runtime-error";
 box.textContent="App-Fehler: "+(event.message||"Unbekannter Fehler");
 document.body.appendChild(box);
});
const KEY="etfDepotAndreas.v1.5.8.cache";
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
 preferences:{reportTitle:"ETF Depot Andreas",autoPullSeconds:15},otherAssets:{cashAccount:{name:"FNZ Flexkonto",balance:4289.97,include:true}},benchmarks:{msci_world:[],acwi:[],sp500:[]},syncLog:[],syncMeta:{lastSuccess:"",lastAttempt:"",lastError:"",state:"offline"},metricChange:{gain:0,ytd:0,hasValue:false,updatedAt:""}
};
const old=localStorage.getItem("etfDepotAndreas.v1.5.7.cache")||localStorage.getItem("etfDepotAndreas.v1.5.6.cache")||localStorage.getItem("etfDepotAndreas.v1.5.5.cache")||localStorage.getItem("etfDepotAndreas.v1.5.4.cache")||localStorage.getItem("etfDepotAndreas.v1.5.3.cache")||localStorage.getItem("etfDepotAndreas.v1.5.2.cache")||localStorage.getItem("etfDepotAndreas.v1.5.1.safeupdate.cache")||localStorage.getItem("etfDepotAndreas.v1.5.safeupdate.cache")||localStorage.getItem("etfDepotAndreas.v1.4.autoupdate.cache")||localStorage.getItem("etfDepotAndreas.v1.3.persistentlogin.cache")||localStorage.getItem("etfDepotAndreas.v1.2.wealth.cache")||localStorage.getItem("etfDepotAndreas.v1.1.refined.cache")||localStorage.getItem("etfDepotAndreas.v1.0.ultimate.cache")||localStorage.getItem("etfDepotAndreas.v14pro.final.cache")||localStorage.getItem("etfDepotAndreas.v14pro.dashboard2.cache")||localStorage.getItem("etfDepotAndreas.v14pro.cache")||localStorage.getItem("etfDepotAndreas.v13.cache")||localStorage.getItem("etfDepotAndreas.v10_2.cache")||localStorage.getItem("etfDepotAndreas.v10_1.cache")||localStorage.getItem("etfDepotAndreas.v10.cache")||localStorage.getItem("etfDepotAndreas.v9_1.cache")||localStorage.getItem("etfDepotAndreas.v9")||localStorage.getItem("etfDepotAndreas.v8")||localStorage.getItem("etfDepotAndreas.v7")||localStorage.getItem("etfDepotAndreas.v6")||localStorage.getItem("etfDepotAndreas.v5_1")||localStorage.getItem("etfDepotAndreas.v5")||localStorage.getItem("etfDepotAndreas.v4")||localStorage.getItem("etfDepotAndreas.v3")||localStorage.getItem("etfDepotAndreas.v1");
let syncTimer=null;
let syncInFlight=false;
let applyingRemote=false;

const CLOUD_SESSION_KEY="etfDepotAndreas.supabase.session.v1";
let cloudSessionRefreshTimer=null;

function saveCloudSession(session){
  try{
    if(session?.access_token&&session?.refresh_token){
      localStorage.setItem(CLOUD_SESSION_KEY,JSON.stringify({
        access_token:session.access_token,
        refresh_token:session.refresh_token,
        expires_at:session.expires_at||0,
        user:session.user||null
      }));
    }
  }catch(e){}
}
function loadCloudSession(){
  try{
    const raw=localStorage.getItem(CLOUD_SESSION_KEY);
    return raw?JSON.parse(raw):null;
  }catch(e){return null}
}
function clearCloudSession(){
  try{localStorage.removeItem(CLOUD_SESSION_KEY)}catch(e){}
  if(cloudSessionRefreshTimer){clearTimeout(cloudSessionRefreshTimer);cloudSessionRefreshTimer=null}
}
function scheduleCloudSessionRefresh(){
  if(cloudSessionRefreshTimer)clearTimeout(cloudSessionRefreshTimer);
  const s=loadCloudSession();
  if(!s?.refresh_token)return;
  const expiresMs=(Number(s.expires_at||0)*1000)-Date.now();
  const delay=Math.max(60_000,expiresMs-5*60_000);
  cloudSessionRefreshTimer=setTimeout(()=>refreshCloudSession().catch(()=>{}),delay);
}
async function refreshCloudSession(){
  const s=loadCloudSession();
  if(!s?.refresh_token||!cloudConfigured())return false;
  const res=await fetch(`${state.cloud.url}/auth/v1/token?grant_type=refresh_token`,{
    method:"POST",
    headers:{"apikey":state.cloud.key,"Content-Type":"application/json"},
    body:JSON.stringify({refresh_token:s.refresh_token})
  });
  if(!res.ok){
    if(res.status===400||res.status===401){clearCloudSession();renderCloudAccountSummary()}
    return false;
  }
  const data=await res.json();
  saveCloudSession(data);
  state.cloud.userId=data.user?.id||state.cloud.userId||"";
  state.cloud.email=data.user?.email||state.cloud.email||"";
  persist({cloud:false});
  renderCloudAccountSummary();
  scheduleCloudSessionRefresh();
  return true;
}
function authHeaders(){
  const s=loadCloudSession();
  return s?.access_token?{"Authorization":`Bearer ${s.access_token}`}:{};
}
function renderCloudAccountSummary(){
  const s=loadCloudSession(),logged=Boolean(s?.access_token);
  const set=(id,text)=>{const e=document.getElementById(id);if(e)e.textContent=text};
  set("cloudAccountState",logged?"Angemeldet ✓":"Nicht angemeldet");
  set("cloudAccountEmail",s?.user?.email||state.cloud?.email||"–");
  set("cloudAccountLastSync",state.cloud?.lastSync?new Date(state.cloud.lastSync).toLocaleString("de-DE"):"–");
}
async function restoreCloudSession(){
  const s=loadCloudSession();
  if(!s?.access_token||!cloudConfigured()){renderCloudAccountSummary();return false}
  const expiresSoon=(Number(s.expires_at||0)*1000)-Date.now()<5*60_000;
  if(expiresSoon){
    const ok=await refreshCloudSession();
    if(!ok)return false;
  }else{
    state.cloud.userId=s.user?.id||state.cloud.userId||"";
    state.cloud.email=s.user?.email||state.cloud.email||"";
    persist({cloud:false});
    scheduleCloudSessionRefresh();
    renderCloudAccountSummary();
  }
  return true;
}


const APP_VERSION="1.5.8";
const APP_SHELL_VERSION="1.5.8";
const APP_UPDATE_CHECK_INTERVAL=60*60*1000;
const APP_UPDATE_DISMISS_KEY="etfDepotAndreas.update.dismissed";
let appUpdateCheckTimer=null;
let latestAvailableVersion=null;
let updateInstallInProgress=false;

function versionParts(v){
  return String(v||"0").replace(/[^0-9.].*$/,"").split(".").map(x=>Number(x)||0);
}
function compareVersions(a,b){
  const A=versionParts(a),B=versionParts(b),n=Math.max(A.length,B.length);
  for(let i=0;i<n;i++){const x=A[i]||0,y=B[i]||0;if(x>y)return 1;if(x<y)return-1}
  return 0;
}
function setUpdateStatus(text){
  const e=document.getElementById("appUpdateStatus");
  if(e)e.textContent=text;
}
function showUpdateBanner(meta){
  latestAvailableVersion=meta?.version||null;
  const b=document.getElementById("updateBanner");
  const t=document.getElementById("updateBannerTitle");
  const x=document.getElementById("updateBannerText");
  if(!b)return;
  if(t)t.textContent=`Version ${meta.version} verfügbar`;
  if(x)x.textContent=meta.message||`Version ${meta.version} kann jetzt installiert werden.`;
  b.hidden=false;
}
function hideUpdateBanner(){
  const b=document.getElementById("updateBanner");if(b)b.hidden=true;
}
async function registerAppServiceWorker(){
  if(!("serviceWorker" in navigator))return null;
  try{
    const reg=await navigator.serviceWorker.register("./sw.js?v=1.5.8",{scope:"./",updateViaCache:"none"});
    await reg.update().catch(()=>{});
    return reg;
  }catch(e){
    setUpdateStatus("Update-Dienst konnte nicht registriert werden.");
    return null;
  }
}
async function checkForAppUpdate({manual=false}={}){
  if(!navigator.onLine){
    if(manual)setUpdateStatus("Offline – Update-Prüfung momentan nicht möglich.");
    return null;
  }
  try{
    if(manual)setUpdateStatus("Suche nach neuer Version …");
    const r=await fetch(`./version.json?t=${Date.now()}`,{cache:"no-store",headers:{"Cache-Control":"no-cache"}});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const meta=await r.json();
    const newer=compareVersions(meta.version,APP_VERSION)>0;
    if(newer){
      const dismissed=localStorage.getItem(APP_UPDATE_DISMISS_KEY);
      if(manual||dismissed!==meta.version)showUpdateBanner(meta);
      setUpdateStatus(`Neue Version ${meta.version} verfügbar.`);
      const reg=await registerAppServiceWorker();
      if(reg)await reg.update().catch(()=>{});
    }else{
      latestAvailableVersion=null;
      if(manual)hideUpdateBanner();
      setUpdateStatus(`Version ${APP_VERSION} ist aktuell.`);
    }
    return meta;
  }catch(e){
    if(manual)setUpdateStatus(`Update-Prüfung fehlgeschlagen: ${e.message}`);
    return null;
  }
}
async function applyAppUpdate(){
  if(updateInstallInProgress)return;
  updateInstallInProgress=true;
  const btn=document.getElementById("applyUpdate");
  if(btn){btn.disabled=true;btn.textContent="Bereite Update vor …"}
  setUpdateStatus("Neue Version wird vollständig vorbereitet …");
  try{
    persist({cloud:false});

    // Ask the service worker to pre-cache the full new app shell first.
    const reg=await registerAppServiceWorker();
    if(!reg)throw new Error("Update-Dienst nicht verfügbar");

    await reg.update().catch(()=>{});

    const targetVersion=latestAvailableVersion||APP_VERSION;
    const ready=await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error("Update-Vorbereitung dauerte zu lange")),20000);
      const ch=new MessageChannel();
      ch.port1.onmessage=e=>{
        clearTimeout(timeout);
        if(e.data?.ok)resolve(true);
        else reject(new Error(e.data?.error||"Update konnte nicht vorbereitet werden"));
      };
      const worker=reg.waiting||reg.installing||reg.active;
      if(!worker){clearTimeout(timeout);reject(new Error("Kein Service Worker verfügbar"));return}
      worker.postMessage({type:"PREPARE_UPDATE",version:targetVersion},[ch.port2]);
    });

    if(!ready)throw new Error("Update nicht vollständig vorbereitet");

    setUpdateStatus("Update vollständig geladen. App wird neu gestartet …");
    if(btn)btn.textContent="Starte neu …";

    // Only now activate the waiting worker. This avoids mixed old/new app files.
    if(reg.waiting)reg.waiting.postMessage({type:"SKIP_WAITING"});
    else if(reg.installing){
      await new Promise(resolve=>{
        reg.installing.addEventListener("statechange",()=>{
          if(reg.waiting){reg.waiting.postMessage({type:"SKIP_WAITING"});resolve()}
          else if(reg.installing?.state==="activated")resolve();
        });
        setTimeout(resolve,5000);
      });
    }

    localStorage.removeItem(APP_UPDATE_DISMISS_KEY);

    // Wait briefly for the new controller; fallback reload after 1.5s.
    let reloaded=false;
    const doReload=()=>{
      if(reloaded)return;
      reloaded=true;
      const url=new URL(location.href);
      url.searchParams.set("_appv",targetVersion);
      location.replace(url.toString());
    };
    navigator.serviceWorker?.addEventListener?.("controllerchange",doReload,{once:true});
    setTimeout(doReload,1500);

  }catch(e){
    updateInstallInProgress=false;
    if(btn){btn.disabled=false;btn.textContent="Jetzt aktualisieren"}
    setUpdateStatus(`Update konnte nicht sicher installiert werden: ${e.message}`);
  }
}
function dismissAppUpdate(){
  if(latestAvailableVersion)localStorage.setItem(APP_UPDATE_DISMISS_KEY,latestAvailableVersion);
  hideUpdateBanner();
  setUpdateStatus(`Version ${latestAvailableVersion||""} später aktualisieren.`.trim());
}
function scheduleAppUpdateChecks(){
  if(appUpdateCheckTimer)clearInterval(appUpdateCheckTimer);
  appUpdateCheckTimer=setInterval(()=>{if(document.visibilityState==="visible")checkForAppUpdate().catch(()=>{})},APP_UPDATE_CHECK_INTERVAL);
}

let localDirty=false;
let lastCloudError="";
let pendingConflict=null;
const DEVICE_KEY="etfDepotAndreas.device.v10";
function getDevice(){
  try{
    const x=JSON.parse(localStorage.getItem(DEVICE_KEY)||"null");
    if(x?.id)return x;
  }catch{}
  const platform=/iPhone|iPad|iPod/i.test(navigator.userAgent)?"iPhone / iPad":/Mac/i.test(navigator.platform||"")?"Mac":"Browser";
  const d={id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+"-"+Math.random().toString(36).slice(2)),name:platform};
  localStorage.setItem(DEVICE_KEY,JSON.stringify(d));return d;
}
const DEVICE=getDevice();
let state=load();
initializeAutomaticAccounting();
applyScheduledContributions();
const euro=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"});
const pct=new Intl.NumberFormat("de-DE",{style:"percent",minimumFractionDigits:2,maximumFractionDigits:2});
const num=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:6});
function clone(x){return JSON.parse(JSON.stringify(x))}
function load(){try{const raw=localStorage.getItem(KEY)||old;if(!raw)return clone(DEFAULTS);const x=JSON.parse(raw);return{...clone(DEFAULTS),...x,dividends:x.dividends||[],benchmark:{...DEFAULTS.benchmark,...(x.benchmark||{})},contributions:x.contributions||[],autoAccounting:{...DEFAULTS.autoAccounting,...(x.autoAccounting||{})},cloud:{...DEFAULTS.cloud,...(x.cloud||{})},fx:{...DEFAULTS.fx,...(x.fx||{})},targets:Array.isArray(x.targets)?x.targets:[40,40,20],audit:Array.isArray(x.audit)?x.audit:[],preferences:{...DEFAULTS.preferences,...(x.preferences||{})},otherAssets:{...DEFAULTS.otherAssets,...(x.otherAssets||{}),cashAccount:{...DEFAULTS.otherAssets.cashAccount,...(x.otherAssets?.cashAccount||{})}},benchmarks:{...DEFAULTS.benchmarks,...(x.benchmarks||{})},syncLog:Array.isArray(x.syncLog)?x.syncLog:[],syncMeta:{...DEFAULTS.syncMeta,...(x.syncMeta||{})}}}catch{return clone(DEFAULTS)}}
function persist(options={}){
  localStorage.setItem(KEY,JSON.stringify(state));
  if(options.cloud===false||applyingRemote)return;
  localDirty=true;
  if(cloudConfigured()&&navigator.onLine){
    setSyncState("idle");
    scheduleCloudSave();
  }else{
    setSyncState("offline");
  }
  renderSyncStatus();
}
function totals(){
  recalculateFundMetrics();
  const value=state.funds.reduce((s,f)=>s+Number(f.value||0),0);
  const gain=state.funds.reduce((s,f)=>s+Number(f.gain||0),0);
  const ytd=state.funds.reduce((s,f)=>s+Number(f.ytd||0),0);
  const cost=state.funds.reduce((s,f)=>s+Number(f.costBasis||0),0);
  return{value,gain,ytd,cost,ret:cost?gain/cost:0}
}


function getCashAccount(){
  const a=state.otherAssets?.cashAccount||{name:"FNZ Flexkonto",balance:4289.97,include:true};
  return{name:a.name||"FNZ Flexkonto",balance:Number(a.balance||0),include:a.include!==false};
}
function renderWealthOverview(){
  const t=totals(),cash=getCashAccount(),cashValue=cash.include?cash.balance:0,total=t.value+cashValue;
  const cashShare=total?cashValue/total:0,investedShare=total?t.value/total:0;

  const set=(id,text)=>{const e=document.getElementById(id);if(e)e.textContent=text};
  set("heroCashValue",euro.format(cash.balance));
  set("heroCashShare",`${pct.format(cashShare)} Cash`);
  set("heroTotalWealth",euro.format(total));
  set("heroInvestedShare",`${pct.format(investedShare)} investiert`);

  set("wealthDepotValue",euro.format(t.value));
  set("wealthDepotShare",`${pct.format(investedShare)} des Gesamtvermögens`);
  set("wealthCashValue",euro.format(cash.balance));
  set("wealthCashShare",`${pct.format(cashShare)} Cashquote`);
  set("wealthTotalValue",euro.format(total));
  set("wealthInvestedShare",`${pct.format(investedShare)} Investitionsgrad`);
}
function openCashAccountDialog(){
  const a=getCashAccount();
  cashAccountName.value=a.name;
  cashAccountBalance.value=a.balance.toFixed(2);
  cashIncludeInWealth.checked=a.include;
  cashAccountDialog.showModal();
}
function saveCashAccountSettings(){
  state.otherAssets=state.otherAssets||{};
  state.otherAssets.cashAccount={
    name:(cashAccountName.value||"FNZ Flexkonto").trim(),
    balance:Math.max(0,Number(cashAccountBalance.value||0)),
    include:Boolean(cashIncludeInWealth.checked)
  };
  persist();renderWealthOverview();cashAccountDialog.close();
  if(cloudConfigured())syncToCloud().catch(()=>{});
}

function renderHeroDashboard(){
  const t=totals();
  const valueEl=document.getElementById("heroDepotValue");
  const gainEl=document.getElementById("heroGainValue");
  const pctEl=document.getElementById("heroGainPct");
  if(valueEl)valueEl.textContent=euro.format(t.value);
  if(gainEl){gainEl.textContent=euro.format(t.gain);gainEl.className=t.gain>=0?"positive":"negative";}
  if(pctEl)pctEl.textContent=t.cost?pct.format(t.gain/t.cost):"–";
}

function render(){renderCloudAccountSummary();renderWealthOverview();renderHeroDashboard();
 const t=totals();
 totalValue.textContent=euro.format(t.value);totalGain.textContent=euro.format(t.gain);totalGain.className=t.gain>=0?"positive":"negative";totalGainPct.textContent=pct.format(t.ret);totalYtd.textContent=euro.format(t.ytd);totalYtd.className=t.ytd>=0?"positive":"negative";investedCapital.textContent=euro.format(t.cost);
 renderMetricChanges();
 const best=[...state.funds].sort((a,b)=>b.ytd-a.ytd)[0];bestFund.textContent="Bester Beitrag: "+best.name;lastUpdated.textContent="Stand "+formatDate(latestDate());statusBadge.textContent=allocationStatus(t.value);
 renderReturns(t.value);renderDailySummary(t.value);renderFunds(t.value);renderDonut(t.value);renderSavings();renderForecast();renderGoals();renderHistory();renderV13Charts();renderV14Pro();renderRisk();renderDividends();renderDividendCalendar();renderNextSavings();renderFx();renderAnalytics();renderProgressGoals();renderPeriodSummary();renderDataQuality();renderBenchmark();renderMonthlyReport();renderContributions();renderHealth();renderAutomaticAccounting();renderCloudStatus();renderFire();renderV10Intelligence();renderAudit();renderReportPreview();renderSyncStatus();renderSystemSummary();
}

function renderMetricChanges(){
  const change={...DEFAULTS.metricChange,...(state.metricChange||{})};
  const setChange=(id,value)=>{
    const el=document.getElementById(id);if(!el)return;
    el.classList.remove("positive","negative","neutral");
    if(!change.hasValue){el.textContent="Änderung erscheint nach der nächsten Werteübernahme";el.classList.add("neutral");return}
    const arrow=value>0?"↑":value<0?"↓":"→";
    el.textContent=`${arrow} Seit letzter Werteübernahme ${value>0?"+":""}${euro.format(value)}`;
    el.classList.add(value>0?"positive":value<0?"negative":"neutral");
  };
  setChange("totalGainChange",Number(change.gain||0));
  setChange("totalYtdChange",Number(change.ytd||0));
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


async function fetchUsdEur({manual=false}={}){
 fxStatus.textContent="Kurs wird geladen …";
 try{
   const previousManualRate=manual?Number(state.fx?.manualUsdEur||state.fx?.usdEur||0):0;
   const r=await fetch("https://api.frankfurter.dev/v2/rate/USD/EUR",{cache:"no-store"});
   if(!r.ok)throw new Error("HTTP "+r.status);
   const j=await r.json();
   const rate=Number(j.rate);
   if(!Number.isFinite(rate))throw new Error("Ungültiger Kurs");
   const nextFx={...state.fx,usdEur:rate,date:j.date||isoDate(new Date()),source:"Frankfurter"};
   if(manual){
     const previousEurUsd=previousManualRate>0?1/previousManualRate:0;
     const currentEurUsd=1/rate;
     nextFx.manualUsdEur=rate;
     nextFx.manualEurUsdChange=previousEurUsd>0?currentEurUsd/previousEurUsd-1:null;
     nextFx.manualComparedAt=new Date().toISOString();
   }
   state.fx=nextFx;
   persist();applyFxToVanguard();render();fxStatus.textContent=manual?"Manuell aktualisiert":"Automatischer Tageskurs";
 }catch(e){
   fxStatus.textContent="Letzter gespeicherter Kurs";
   renderFx();
 }
}
function renderFx(){
 const rate=Number(state.fx?.usdEur||0);
 usdEurRate.textContent=rate?`1 USD = ${rate.toLocaleString("de-DE",{minimumFractionDigits:4,maximumFractionDigits:4})} EUR`:"Kein Kurs";
 usdEurDate.textContent=state.fx?.date?`Stand ${formatDate(state.fx.date)} · ${state.fx.source||"gespeichert"}`:"Noch nicht geladen";
 const change=Number(state.fx?.manualEurUsdChange);
 const hasComparison=state.fx?.manualEurUsdChange!==null&&state.fx?.manualEurUsdChange!==undefined&&Number.isFinite(change);
 const changeBox=document.getElementById("eurUsdChange");
 const changeArrow=document.getElementById("eurUsdChangeArrow");
 const changeValue=document.getElementById("eurUsdChangeValue");
 const eurUsdRate=document.getElementById("eurUsdRate");
 if(eurUsdRate)eurUsdRate.textContent=rate?`1 EUR = ${(1/rate).toLocaleString("de-DE",{minimumFractionDigits:4,maximumFractionDigits:4})} USD`:"–";
 if(changeBox&&changeArrow&&changeValue){
   changeBox.classList.remove("positive","negative","neutral");
   if(!hasComparison){changeBox.classList.add("neutral");changeArrow.textContent="→";changeValue.textContent="Noch kein Vergleich"}
   else if(change>0){changeBox.classList.add("positive");changeArrow.textContent="↑";changeValue.textContent=`+${pct.format(change)}`}
   else if(change<0){changeBox.classList.add("negative");changeArrow.textContent="↓";changeValue.textContent=pct.format(change)}
   else{changeBox.classList.add("neutral");changeArrow.textContent="→";changeValue.textContent=pct.format(0)}
 }
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



function renderBenchmarkStrip(){
  const el=document.getElementById("benchmarkStripText");
  if(!el)return;
  const hist=filteredHistoryByRange();
  const bench=benchmarkSeries();
  if(hist.length<2||bench.length<2){
    el.textContent="Noch keine Benchmarkdaten importiert";
    return;
  }
  const bmap=new Map(bench.map(x=>[x.date,Number(x.value)]));
  const paired=hist.map(h=>({date:h.date,p:Number(h.value),b:bmap.get(h.date)})).filter(x=>x.b);
  if(paired.length<2){
    el.textContent="Keine gemeinsamen Datumswerte im aktuellen Zeitraum";
    return;
  }
  const p0=paired[0].p,b0=paired[0].b;
  const pr=paired.at(-1).p/p0-1,br=paired.at(-1).b/b0-1,alpha=pr-br;
  const name=benchmarkSelect?.options?.[benchmarkSelect.selectedIndex]?.text || "Benchmark";
  el.textContent=`Depot ${pct.format(pr)} · ${name} ${pct.format(br)} · ${alpha>=0?"Vorsprung ":"Rückstand "}${pct.format(Math.abs(alpha))}`;
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



function pushSyncLog(type,message){
  state.syncLog=Array.isArray(state.syncLog)?state.syncLog:[];
  state.syncLog.unshift({ts:new Date().toISOString(),type,message});
  state.syncLog=state.syncLog.slice(0,60);
  localStorage.setItem(KEY,JSON.stringify(state));
  renderSyncStatus();
}
function setSyncState(next,message=""){
  state.syncMeta={...DEFAULTS.syncMeta,...(state.syncMeta||{}),state:next,lastAttempt:new Date().toISOString()};
  if(next==="synced"){
    state.syncMeta.lastSuccess=new Date().toISOString();
    state.syncMeta.lastError="";
  }
  if(next==="error") state.syncMeta.lastError=message||"Unbekannter Fehler";
  localStorage.setItem(KEY,JSON.stringify(state));
  renderSyncStatus();
}
function renderSyncStatus(){
  const configured=cloudConfigured();
  const online=navigator.onLine;
  const st=state.syncMeta?.state || (configured&&online?"idle":"offline");
  const map={
    synced:["Synchronisiert","synced"],
    syncing:["Synchronisiere …","syncing"],
    conflict:["Konflikt erkannt","conflict"],
    error:["Fehler","error"],
    offline:["Offline","offline"],
    idle:["Bereit","idle"]
  };
  const [label,cls]=map[st]||map.idle;
  if(typeof liveCloudStatus!=="undefined"){
    liveCloudStatus.className=`live-cloud-status ${cls}`;
    liveCloudLabel.textContent=label;
    liveCloudTime.textContent=state.syncMeta?.lastSuccess?new Date(state.syncMeta.lastSuccess).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"–";
  }
  if(typeof syncStateText!=="undefined") syncStateText.textContent=configured?label:"Nicht angemeldet";
  if(typeof syncLastSuccess!=="undefined") syncLastSuccess.textContent=state.syncMeta?.lastSuccess?new Date(state.syncMeta.lastSuccess).toLocaleString("de-DE"):"Noch nie";
  if(typeof syncPendingState!=="undefined") syncPendingState.textContent=localDirty?"Ja – wird automatisch übertragen":"Nein";
  if(typeof syncCloudSchema!=="undefined") syncCloudSchema.textContent=state.syncMeta?.cloudSchema||"–";
  if(typeof cloudWriteProof!=="undefined"){
    const ok=Boolean(state.syncMeta?.writeVerified);
    cloudWriteProof.textContent=ok?"Bestätigt ✓":"Noch nicht bestätigt";
    cloudWriteProof.className=ok?"positive":"";
    cloudWriteProofDetail.textContent=ok
      ?`Supabase hat den Schreibvorgang bestätigt · ${new Date(state.syncMeta.writeVerifiedAt).toLocaleString("de-DE")}`
      :"Nach der nächsten Änderung wird der Cloud-Schreibvorgang automatisch verifiziert.";
  }
  if(typeof syncLogList!=="undefined"){
    const rows=(state.syncLog||[]).slice(0,16);
    syncLogList.innerHTML=rows.length?rows.map(x=>`<div class="sync-log-row ${x.type||""}"><time>${new Date(x.ts).toLocaleString("de-DE")}</time><span>${x.message}</span></div>`).join(""):'<div class="calendar-empty">Noch keine Synchronisationsereignisse.</div>';
  }
}
function clearSyncLogFn(){
  state.syncLog=[];persist({cloud:false});renderSyncStatus();
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
    ?"Dieses Gerät ist angemeldet. Auto-Sync und Konfliktschutz sind aktiv."
    :"Gib nur E-Mail und Passwort ein. Die Supabase-Verbindung ist bereits vorkonfiguriert.";
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
    addAudit("Supabase verbunden",state.cloud.email);pushSyncLog("success","Bei Supabase angemeldet.");persist();cloudDialogMessage.textContent="Verbunden. Künftige Änderungen werden automatisch synchronisiert.";
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
  localDirty=false;setSyncState("offline");pushSyncLog("info","Von Supabase abgemeldet.");
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
  copy.schemaVersion="1.5.8";
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

async function heartbeatDevice(){
  if(!cloudConfigured())return;
  const row={user_id:state.cloud.userId,device_id:DEVICE.id,device_name:DEVICE.name,last_seen:new Date().toISOString()};
  await cloudRequest("/rest/v1/portfolio_devices?on_conflict=user_id,device_id",{method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(row)});
}
async function loadDevices(){
  if(!cloudConfigured()){deviceList.innerHTML='<div class="calendar-empty">Noch nicht mit Supabase verbunden.</div>';return}
  try{
    await heartbeatDevice();
    const rows=await cloudRequest(`/rest/v1/portfolio_devices?user_id=eq.${encodeURIComponent(state.cloud.userId)}&select=device_id,device_name,last_seen&order=last_seen.desc`);
    deviceList.innerHTML=(rows||[]).length?(rows||[]).map(d=>`<div class="device-row"><div><strong>${d.device_name||"Gerät"}</strong><small>${d.device_id===DEVICE.id?"Dieses Gerät · ":""}zuletzt ${new Date(d.last_seen).toLocaleString("de-DE")}</small></div><span class="status ${d.device_id===DEVICE.id?"cloud-on":""}">${d.device_id===DEVICE.id?"Aktiv":"Bekannt"}</span></div>`).join(""):'<div class="calendar-empty">Noch keine Geräte registriert.</div>';
  }catch(e){deviceList.innerHTML=`<div class="calendar-empty">Geräteliste nicht verfügbar: ${e.message}</div>`}
}
async function createCloudVersion(reason="Auto-Sicherung"){
  if(!cloudConfigured())return;
  const row={user_id:state.cloud.userId,portfolio_data:cloudPayload(),reason,created_at:new Date().toISOString()};
  await cloudRequest("/rest/v1/portfolio_sync_versions",{method:"POST",headers:{"Prefer":"return=minimal"},body:JSON.stringify(row)});
}
async function loadVersions(){
  if(!cloudConfigured()){versionList.innerHTML='<div class="calendar-empty">Noch nicht mit Supabase verbunden.</div>';return}
  try{
    const rows=await cloudRequest(`/rest/v1/portfolio_sync_versions?user_id=eq.${encodeURIComponent(state.cloud.userId)}&select=id,reason,created_at&order=created_at.desc&limit=8`);
    versionList.innerHTML=(rows||[]).length?(rows||[]).map(v=>`<div class="version-row"><div><strong>${v.reason||"Cloud-Version"}</strong><small>${new Date(v.created_at).toLocaleString("de-DE")}</small></div><button class="secondary" data-restore-version="${v.id}">Wiederherstellen</button></div>`).join(""):'<div class="calendar-empty">Noch keine Cloud-Versionen vorhanden.</div>';
    versionList.querySelectorAll("[data-restore-version]").forEach(b=>b.onclick=()=>restoreCloudVersion(b.dataset.restoreVersion));
  }catch(e){versionList.innerHTML=`<div class="calendar-empty">Versionshistorie nicht verfügbar: ${e.message}</div>`}
}
async function restoreCloudVersion(id){
  if(!confirm("Diesen Cloud-Wiederherstellungspunkt laden? Der aktuelle Stand wird vorher gesichert."))return;
  try{
    await createCloudVersion("Vor Wiederherstellung");
    const rows=await cloudRequest(`/rest/v1/portfolio_sync_versions?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(state.cloud.userId)}&select=portfolio_data,created_at`);
    const row=rows?.[0];if(!row?.portfolio_data)throw new Error("Version nicht gefunden.");
    mergeRemoteState(row.portfolio_data,row.created_at);
    addAudit("Cloud-Version wiederhergestellt",new Date(row.created_at).toLocaleString("de-DE"));
    localDirty=true;await syncToCloud({force:true,reason:"Wiederherstellung"});render();await loadVersions();
  }catch(e){handleCloudError(e)}
}
function showConflict(row){
  pendingConflict=row;
  state.cloud.conflictAt=row.updated_at||new Date().toISOString();
  persist({cloud:false});
  conflictText.textContent=`Cloud-Stand vom ${new Date(row.updated_at).toLocaleString("de-DE")} ist neuer als der letzte bekannte Stand dieses Geräts.`;
  conflictBanner.classList.remove("hidden");
  cloudBadge.textContent="Konflikt";cloudBadge.className="status cloud-error";setSyncState("conflict");pushSyncLog("conflict","Konflikt zwischen lokalem und Cloud-Stand erkannt.");
}
function clearConflict(){
  pendingConflict=null;state.cloud.conflictAt="";persist({cloud:false});conflictBanner.classList.add("hidden");
}
async function useCloudConflict(){
  if(!pendingConflict)return;
  mergeRemoteState(pendingConflict.portfolio_data,pendingConflict.updated_at);
  clearConflict();addAudit("Konflikt gelöst","Cloud-Version übernommen");setSyncState("synced");pushSyncLog("success","Konflikt gelöst: Cloud-Version übernommen.");persist();render();
}
async function keepLocalConflict(){
  if(!pendingConflict)return;
  try{
    await createCloudVersion("Konflikt – vorheriger Cloud-Stand");
    clearConflict();
    localDirty=true;await syncToCloud({force:true,reason:"Konflikt – lokaler Stand"});
    addAudit("Konflikt gelöst","Lokalen Stand hochgeladen");setSyncState("synced");pushSyncLog("success","Konflikt gelöst: lokaler Stand hochgeladen.");persist();render();
  }catch(e){handleCloudError(e)}
}

function scheduleCloudSave(){
  if(!cloudConfigured()||applyingRemote)return;
  clearTimeout(syncTimer);
  setSyncState("syncing");
  cloudBadge.textContent="Synchronisiere …";cloudBadge.className="status";
  syncTimer=setTimeout(()=>syncToCloud({reason:"Automatische Änderung"}).catch(handleCloudError),1200);
}
function handleCloudError(e){
  lastCloudError=e?.message||String(e);
  cloudMessage.textContent="Cloud-Synchronisation wartet: "+lastCloudError;
  cloudBadge.textContent=navigator.onLine?"Fehler":"Offline";
  cloudBadge.className="status cloud-error";
  setSyncState(navigator.onLine?"error":"offline",lastCloudError);
  pushSyncLog("error",`Synchronisation fehlgeschlagen: ${lastCloudError}`);
}
async function syncToCloud(options={}){
  if(!cloudConfigured())throw new Error("Cloud-Verbindung ist nicht vollständig eingerichtet.");
  if(syncInFlight)return;
  syncInFlight=true;
  try{
    if(!options.force){
      const remote=await getCloudRow();
      const remoteTime=remote?.updated_at?new Date(remote.updated_at).getTime():0;
      const knownTime=state.cloud.lastSync?new Date(state.cloud.lastSync).getTime():0;
      if(remote?.portfolio_data&&remoteTime>knownTime&&localDirty){
        showConflict(remote);return;
      }
    }
    try{await createCloudVersion(options.reason||"Automatische Sicherung")}catch{}
    const now=new Date().toISOString();
    const row={user_id:state.cloud.userId,portfolio_data:cloudPayload(),updated_at:now,schema_version:"1.5.8"};
    await cloudRequest("/rest/v1/portfolio_sync?on_conflict=user_id",{method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(row)});
    const verify=await getCloudRow();
    const verified=Boolean(verify?.updated_at && new Date(verify.updated_at).getTime() >= new Date(now).getTime()-1500 && verify?.schema_version==="1.5.8");
    state.cloud.lastSync=verify?.updated_at||now;
    state.syncMeta={...DEFAULTS.syncMeta,...(state.syncMeta||{}),cloudSchema:verify?.schema_version||"",writeVerified:verified,writeVerifiedAt:new Date().toISOString()};
    localDirty=false;
    lastCloudError="";
    clearConflict();
    persist({cloud:false});
    renderCloudStatus();
    heartbeatDevice().catch(()=>{});setSyncState("synced");pushSyncLog("success",`Supabase-Schreibtest bestätigt · Schema 1.5.8 · ${euro.format(totals().value)}`);
  }finally{syncInFlight=false}
}
async function getCloudRow(){
  const rows=await cloudRequest(`/rest/v1/portfolio_sync?user_id=eq.${encodeURIComponent(state.cloud.userId)}&select=portfolio_data,updated_at,schema_version`);
  return rows?.[0]||null;
}
async function syncFromCloud(preferCloud=true){
  if(!cloudConfigured())throw new Error("Cloud-Verbindung ist nicht vollständig eingerichtet.");
  if(syncInFlight)return false;
  syncInFlight=true;
  try{
    const row=await getCloudRow();
    if(row?.schema_version){state.syncMeta={...DEFAULTS.syncMeta,...(state.syncMeta||{}),cloudSchema:row.schema_version};persist({cloud:false})}
    if(!row){
      syncInFlight=false;
      await syncToCloud({force:true,reason:"Erster Cloud-Stand"});
      return true;
    }
    const remoteTime=row.updated_at?new Date(row.updated_at).getTime():0;
    const localTime=state.cloud.lastSync?new Date(state.cloud.lastSync).getTime():0;
    if(localDirty&&remoteTime>localTime){
      showConflict(row);return false;
    }
    if(preferCloud&&row.portfolio_data&&(remoteTime>localTime||!state.cloud.lastSync)){
      mergeRemoteState(row.portfolio_data,row.updated_at);
      initializeAutomaticAccounting();
      applyScheduledContributions();
      render();setSyncState("synced");pushSyncLog("success","Neueren Cloud-Stand geladen.");
      return true;
    }
    state.cloud.lastSync=row.updated_at||state.cloud.lastSync;
    persist({cloud:false});renderCloudStatus();return false;
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
    heartbeatDevice().catch(()=>{});loadDevices().catch(()=>{});loadVersions().catch(()=>{});setSyncState("synced");pushSyncLog("success","Cloud-Verbindung initialisiert.");
  }catch(e){
    handleCloudError(e);
    if(firstLogin)throw e;
  }
}
async function syncNowHandler(){
  try{
    if(!cloudConfigured()){openCloudDialog();return}
    cloudBadge.textContent="Gleiche ab …";cloudBadge.className="status";setSyncState("syncing");pushSyncLog("info","Manuelle Synchronisation gestartet.");
    if(localDirty)await syncToCloud();
    else await syncFromCloud(true);
    cloudMessage.textContent="Cloud und dieses Gerät sind auf demselben Stand.";
  }catch(e){handleCloudError(e)}
}
function renderCloudStatus(){
  if(cloudConfigured()){
    cloudBadge.textContent=localDirty?"Änderung ausstehend":"Auto-Sync aktiv";
    cloudBadge.className="status cloud-on";
    cloudMessage.textContent=`Supabase ist der Master-Datenstand. Angemeldet als ${state.cloud.email}. Auto-Sync, Konfliktschutz und Versionshistorie sind aktiv.`;
    cloudLastSync.textContent=state.cloud.lastSync?`Cloud-Stand: ${new Date(state.cloud.lastSync).toLocaleString("de-DE")} · Gerät: ${DEVICE.name}`:"Cloud wird initialisiert …";
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
 const hist=filteredHistoryByRange();
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

let gainChartPoints=[];
let fundChartHitAreas=[];

function filteredHistoryByRange(){
  let hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));
  if(historyRange.value!=="all"){
    const c=new Date();c.setDate(c.getDate()-Number(historyRange.value));
    hist=hist.filter(x=>new Date(x.date)>=c);
  }
  return hist;
}

function canvasSetup(canvas){
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
  const w=Math.max(320,rect.width||canvas.parentElement.clientWidth||900),h=Math.max(260,rect.height||360);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);
  return{ctx,w,h};
}

function chartTheme(){
  const dark=document.documentElement.dataset.theme==="dark";
  return{ink:dark?"#e7eef7":"#172033",muted:dark?"#93a4b8":"#64748b",grid:dark?"rgba(148,163,184,.18)":"rgba(100,116,139,.16)",card:dark?"#172433":"#fff"};
}

function drawEmptyChart(canvas,text){
  const {ctx,w,h}=canvasSetup(canvas),th=chartTheme();
  ctx.clearRect(0,0,w,h);ctx.fillStyle=th.muted;ctx.font="600 14px -apple-system,BlinkMacSystemFont,sans-serif";ctx.textAlign="center";
  ctx.fillText(text,w/2,h/2);
}

function drawGrid(ctx,w,h,p,min,max,formatter){
  const th=chartTheme();ctx.strokeStyle=th.grid;ctx.fillStyle=th.muted;ctx.lineWidth=1;ctx.font="11px -apple-system,BlinkMacSystemFont,sans-serif";ctx.textAlign="right";
  for(let i=0;i<=4;i++){
    const y=p+i*(h-2*p)/4,val=max-(max-min)*i/4;
    ctx.beginPath();ctx.moveTo(p,y);ctx.lineTo(w-p,y);ctx.stroke();
    ctx.fillText(formatter(val),p-8,y+4);
  }
}

function renderV13ChartKPIs(hist){
  const current=totals().value;
  chartCurrentValue.textContent=euro.format(current);
  if(hist.length>=2){
    const first=Number(hist[0].value||0),last=Number(hist.at(-1).value||0),change=last-first;
    chartPeriodChange.textContent=(change>=0?"+":"")+euro.format(change);chartPeriodChange.className=change>=0?"positive":"negative";
    const vals=hist.map(x=>Number(x.value||0));chartRangeValue.textContent=euro.format(Math.max(...vals)-Math.min(...vals));
  }else{
    chartPeriodChange.textContent=chartRangeValue.textContent="–";chartPeriodChange.className="";
  }
  v13SnapshotCount.textContent=state.history.length.toLocaleString("de-DE");
  v13GainSnapshotCount.textContent=state.history.filter(x=>Number.isFinite(Number(x.gain))).length.toLocaleString("de-DE");
  v13FundSnapshotCount.textContent=state.history.filter(x=>Array.isArray(x.funds)&&x.funds.length).length.toLocaleString("de-DE");
}

function renderChartRangeInfo(hist){
  const el=document.getElementById("chartRangeInfo");if(!el)return;
  const labels={"1":"1 Tag","3":"3 Tage","7":"7 Tage","30":"30 Tage","90":"90 Tage","365":"1 Jahr",all:"Gesamt"};
  const selected=labels[historyRange.value]||"Zeitraum";
  if(!hist.length){el.textContent=`${selected} · keine Tagesstände`;return}
  el.textContent=`${selected} · ${hist.length} ${hist.length===1?"Tagesstand":"Tagesstände"} · ${formatDate(hist[0].date)} bis ${formatDate(hist.at(-1).date)}`;
}

function renderGainHistory(){
  const canvas=document.getElementById("gainHistoryChart");
  if(!canvas)return;
  const hist=filteredHistoryByRange().filter(x=>Number.isFinite(Number(x.gain)));
  const currentGain=totals().gain;
  gainChartCurrent.textContent=euro.format(currentGain);gainChartCurrent.className=currentGain>=0?"positive":"negative";
  gainChartPoints.textContent=hist.length.toLocaleString("de-DE");
  if(hist.length){
    const d=currentGain-Number(hist[0].gain||0);gainChartDelta.textContent=(d>=0?"+":"")+euro.format(d);gainChartDelta.className=d>=0?"positive":"negative";
  }else{gainChartDelta.textContent="–";gainChartDelta.className=""}
  if(!hist.length){gainChartPoints=[];drawEmptyChart(canvas,"Gewinnhistorie startet mit dem nächsten gespeicherten Tagesstand");return}
  const {ctx,w,h}=canvasSetup(canvas),th=chartTheme(),p=54;
  ctx.clearRect(0,0,w,h);
  const vals=hist.map(x=>Number(x.gain)),min=Math.min(0,...vals),max=Math.max(0,...vals),span=Math.max(1,max-min);
  drawGrid(ctx,w,h,p,min,max,v=>`${Math.round(v/1000)} T€`);
  const zeroY=h-p-((0-min)/span)*(h-2*p);
  ctx.strokeStyle=th.muted;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(p,zeroY);ctx.lineTo(w-p,zeroY);ctx.stroke();ctx.setLineDash([]);
  gainChartPoints=hist.map((pt,i)=>({x:p+(hist.length===1?(w-2*p)/2:i*(w-2*p)/(hist.length-1)),y:h-p-((Number(pt.gain)-min)/span)*(h-2*p),date:pt.date,gain:Number(pt.gain)}));
  const grad=ctx.createLinearGradient(0,p,0,h-p);grad.addColorStop(0,"rgba(34,197,94,.28)");grad.addColorStop(1,"rgba(34,197,94,0)");
  ctx.beginPath();ctx.moveTo(gainChartPoints[0].x,zeroY);gainChartPoints.forEach(q=>ctx.lineTo(q.x,q.y));ctx.lineTo(gainChartPoints.at(-1).x,zeroY);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  ctx.beginPath();gainChartPoints.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.strokeStyle=currentGain>=0?"#22c55e":"#ef4444";ctx.lineWidth=3;ctx.lineJoin="round";ctx.stroke();
}

function showGainTooltip(event){
  if(!gainChartPoints.length)return;const canvas=gainHistoryChart,r=canvas.getBoundingClientRect(),x=(event.touches?.[0]?.clientX??event.clientX)-r.left;
  const q=gainChartPoints.reduce((a,b)=>Math.abs(b.x-x)<Math.abs(a.x-x)?b:a);gainChartTooltip.textContent=`${formatDate(q.date)} · ${euro.format(q.gain)}`;gainChartTooltip.style.left=q.x+"px";gainChartTooltip.style.top=q.y+"px";gainChartTooltip.hidden=false;
}

function fundReturns(){
  return state.funds.map((f,i)=>{
    const cost=Number(f.costBasis||0),ytdBase=Number(f.ytdBasis||0),value=Number(f.value||0),gain=Number(f.gain||0),ytd=Number(f.ytd||0);
    return{index:i,name:f.name,since:cost?gain/cost:0,ytdRate:ytdBase?ytd/ytdBase:0,value,weight:totals().value?value/totals().value:0,gain,ytd};
  });
}

function renderFundPerformance(){
  const canvas=document.getElementById("fundPerformanceChart");if(!canvas)return;
  const data=fundReturns(),{ctx,w,h}=canvasSetup(canvas),th=chartTheme();
  ctx.clearRect(0,0,w,h);fundChartHitAreas=[];
  const left=Math.min(250,Math.max(130,w*.25)),right=28,top=36,rowH=(h-top-24)/Math.max(1,data.length),barH=Math.min(22,rowH*.25);
  const vals=data.flatMap(d=>[d.since,d.ytdRate]),maxAbs=Math.max(.01,...vals.map(Math.abs));
  const scale=(w-left-right)/(maxAbs*2),zero=left+(w-left-right)/2;
  ctx.strokeStyle=th.grid;ctx.beginPath();ctx.moveTo(zero,top-10);ctx.lineTo(zero,h-20);ctx.stroke();
  ctx.font="700 13px -apple-system,BlinkMacSystemFont,sans-serif";ctx.textAlign="right";ctx.fillStyle=th.ink;
  data.forEach((d,i)=>{
    const cy=top+i*rowH+rowH/2;ctx.fillText(d.name,left-14,cy+4);
    [["since","#5B9BD5",-barH*.65],["ytdRate","#14b8a6",barH*.65]].forEach(([key,color,dy])=>{
      const val=d[key],bw=Math.abs(val)*scale,x=val>=0?zero:zero-bw,y=cy+dy-barH/2;
      ctx.fillStyle=color;ctx.globalAlpha=.88;ctx.fillRect(x,y,Math.max(2,bw),barH);ctx.globalAlpha=1;
      fundChartHitAreas.push({x,y,w:Math.max(8,bw),h:barH,data:d,key,val});
    });
  });
  ctx.fillStyle=th.muted;ctx.font="11px -apple-system,BlinkMacSystemFont,sans-serif";ctx.textAlign="center";
  ctx.fillText(`−${(maxAbs*100).toFixed(0)} %`,left,18);ctx.fillText("0 %",zero,18);ctx.fillText(`+${(maxAbs*100).toFixed(0)} %`,w-right,18);
}

function showFundTooltip(event){
  const canvas=fundPerformanceChart,r=canvas.getBoundingClientRect(),px=(event.touches?.[0]?.clientX??event.clientX)-r.left,py=(event.touches?.[0]?.clientY??event.clientY)-r.top;
  const hit=fundChartHitAreas.find(a=>px>=a.x&&px<=a.x+a.w&&py>=a.y&&py<=a.y+a.h);
  if(!hit){fundChartTooltip.hidden=true;return}
  fundChartTooltip.textContent=`${hit.data.name} · ${hit.key==="since"?"Seit Kauf":"YTD"}: ${pct.format(hit.val)}`;fundChartTooltip.style.left=Math.min(px,r.width-150)+"px";fundChartTooltip.style.top=Math.max(20,py-20)+"px";fundChartTooltip.hidden=false;
}

function heatClass(rate){
  const a=Math.abs(rate);if(a<.01)return"heat-neutral";const level=a>.25?4:a>.15?3:a>.07?2:1;return`${rate>=0?"heat-pos":"heat-neg"}-${level}`;
}
function renderFundHeatmap(){
  if(typeof fundHeatmap==="undefined")return;
  const data=fundReturns();
  fundHeatmap.innerHTML=data.map(d=>`<article class="heat-tile ${heatClass(d.since)}">
    <div class="heat-name">${d.name}</div>
    <strong>${pct.format(d.since)}</strong>
    <div class="heat-meta"><span>YTD ${pct.format(d.ytdRate)}</span><span>Gewicht ${pct.format(d.weight)}</span></div>
    <small>${euro.format(d.value)} · Gewinn ${euro.format(d.gain)}</small>
  </article>`).join("");
}

function renderV13Charts(){
  const hist=filteredHistoryByRange();
  renderV13ChartKPIs(hist);renderChartRangeInfo(hist);renderGainHistory();renderFundPerformance();renderFundHeatmap();
}

function refreshPerformanceRange(){
  renderHistory();renderV13Charts();renderBenchmark();renderBenchmarkStrip();
}

function setupChartTabs(){
  document.querySelectorAll(".chart-tab").forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll(".chart-tab").forEach(x=>x.classList.toggle("active",x===btn));
    document.querySelectorAll(".chart-panel").forEach(p=>p.classList.toggle("active",p.dataset.chartPanel===btn.dataset.chartTab));
    setTimeout(()=>{renderHistory();renderV13Charts()},30);
  });
}


function dailyReturnSeries(){
  const hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date)).filter(x=>Number(x.value)>0);
  const out=[];
  for(let i=1;i<hist.length;i++){
    const prev=Number(hist[i-1].value),cur=Number(hist[i].value);
    if(prev>0&&cur>0)out.push({date:hist[i].date,r:cur/prev-1});
  }
  return out;
}
function advancedRiskMetrics(){
  const rs=dailyReturnSeries();
  if(!rs.length)return{vol:null,sharpe:null,winRate:null,best:null,worst:null,n:0};
  const arr=rs.map(x=>x.r),avg=arr.reduce((a,b)=>a+b,0)/arr.length;
  const variance=arr.length>1?arr.reduce((s,x)=>s+(x-avg)**2,0)/(arr.length-1):0;
  const sd=Math.sqrt(variance),vol=sd*Math.sqrt(252),rfDaily=.02/252;
  const sharpe=sd>0?((avg-rfDaily)/sd)*Math.sqrt(252):null;
  const best=rs.reduce((a,b)=>b.r>a.r?b:a),worst=rs.reduce((a,b)=>b.r<a.r?b:a);
  return{vol,sharpe,winRate:arr.filter(x=>x>0).length/arr.length,best,worst,n:arr.length};
}
function renderProRisk(){
  const m=advancedRiskMetrics();
  annualVolatility.textContent=m.vol==null?"–":pct.format(m.vol);
  proSharpeRatio.textContent=m.sharpe==null?"–":m.sharpe.toFixed(2);
  winDayRate.textContent=m.winRate==null?"–":pct.format(m.winRate);
  proBestDay.textContent=m.best?`${pct.format(m.best.r)} · ${formatDate(m.best.date)}`:"–";
  proWorstDay.textContent=m.worst?`${pct.format(m.worst.r)} · ${formatDate(m.worst.date)}`:"–";
  riskDataPoints.textContent=String(m.n);
}
function insightData(){
  const t=totals(),returns=fundReturns(),best=[...returns].sort((a,b)=>b.since-a.since)[0],worst=[...returns].sort((a,b)=>a.since-b.since)[0];
  const m=advancedRiskMetrics(),weights=returns.map(x=>x.weight),maxWeight=Math.max(...weights,0),maxFund=returns.find(x=>x.weight===maxWeight);
  const insights=[];
  if(best)insights.push({type:"positive",title:"Stärkste Position",text:`${best.name} liegt seit Kauf bei ${pct.format(best.since)} und ist aktuell deine stärkste Position.`});
  if(worst)insights.push({type:worst.since<0?"warning":"neutral",title:"Schwächste Position",text:`${worst.name} liegt seit Kauf bei ${pct.format(worst.since)}.`});
  if(maxFund&&maxWeight>.45)insights.push({type:"warning",title:"Hohe Gewichtung",text:`${maxFund.name} macht ${pct.format(maxWeight)} des Depots aus. Das ist eine deutliche Einzelgewichtung.`});
  else if(maxFund)insights.push({type:"neutral",title:"Größte Position",text:`${maxFund.name} ist mit ${pct.format(maxWeight)} aktuell die größte Depotposition.`});
  if(m.vol!=null)insights.push({type:m.vol>.25?"warning":"neutral",title:"Schwankungsbreite",text:`Die annualisierte Volatilität aus deinen Tagesständen liegt bei ${pct.format(m.vol)}${m.sharpe!=null?`; Sharpe Ratio ${m.sharpe.toFixed(2)}`:""}.`});
  const ytdRate=t.cost? t.ytd/t.cost:0;insights.push({type:ytdRate>=0?"positive":"warning",title:"Jahresverlauf",text:`Der GuV seit Jahresbeginn beträgt ${euro.format(t.ytd)} (${pct.format(ytdRate)} bezogen auf dein Einstandskapital).`});
  return insights.slice(0,6);
}
function renderSmartInsights(){
  if(typeof smartInsights==="undefined")return;
  smartInsights.innerHTML=insightData().map(x=>`<article class="insight-item ${x.type}"><div class="insight-icon">${x.type==="positive"?"↗":x.type==="warning"?"!":"•"}</div><div><strong>${x.title}</strong><p>${x.text}</p></div></article>`).join("");
}
function assistantReply(q){
  const s=(q||"").toLowerCase(),t=totals(),fr=fundReturns(),m=advancedRiskMetrics();
  const best=[...fr].sort((a,b)=>b.since-a.since)[0],worst=[...fr].sort((a,b)=>a.since-b.since)[0];
  if(/best|beste|stärk|staerk|gewinner/.test(s)&&best)return `${best.name} ist seit Kauf aktuell am stärksten: ${pct.format(best.since)} bzw. ${euro.format(best.gain)} Gewinn.`;
  if(/schlecht|schwäch|schwaech|verlier/.test(s)&&worst)return `${worst.name} ist seit Kauf aktuell am schwächsten: ${pct.format(worst.since)} bzw. ${euro.format(worst.gain)}.`;
  if(/rendite|performance|gewinn/.test(s))return `Dein Gesamtgewinn beträgt ${euro.format(t.gain)}. Bezogen auf dein Einstandskapital von ${euro.format(t.cost)} sind das ${t.cost?pct.format(t.gain/t.cost):"–"}.`;
  if(/drawdown|rückgang|rueckgang/.test(s))return `Der maximale Drawdown deiner gespeicherten Depotstände beträgt ${maxDrawdown.textContent||"–"}. Der aktuelle Abstand zum Allzeithoch liegt bei ${distanceToHigh.textContent||"–"}.`;
  if(/volatil|schwank/.test(s))return m.vol==null?`Für eine belastbare Volatilität brauche ich mehrere gespeicherte Tagesstände.`:`Die annualisierte Volatilität aus deinen vorhandenen Tagesständen beträgt ${pct.format(m.vol)}.`;
  if(/sharpe/.test(s))return m.sharpe==null?`Für die Sharpe Ratio sind noch nicht genügend Tagesstände vorhanden.`:`Die aktuelle Sharpe Ratio aus deinen Tagesständen beträgt ${m.sharpe.toFixed(2)} (mit 2 % risikofreiem Jahreszins als Rechenannahme).`;
  if(/eingezahlt|kapital|einstand/.test(s))return `Dein erfasstes Einstandskapital beträgt ${euro.format(t.cost)}.`;
  if(/500.?000|500000/.test(s)){const goal=500000,rate=Number(forecastRate.value||.07),monthly=state.savings.reduce((a,b)=>a+Number(b.amount||0),0);let v=t.value,months=0,rm=(1+rate)**(1/12)-1;while(v<goal&&months<1200){v=v*(1+rm)+monthly;months++}const d=new Date();d.setMonth(d.getMonth()+months);return `Bei ${pct.format(rate)} angenommener Jahresrendite und ${euro.format(monthly)} monatlicher Sparrate würdest du 500.000 € rechnerisch etwa im ${d.toLocaleDateString("de-DE",{month:"long",year:"numeric"})} erreichen.`}
  if(/ziel|wann erreiche/.test(s))return `Deine Zielprognosen findest du im Bereich „Wann erreichst du deine Ziele?“. Die Berechnung verwendet die aktuell gewählte Renditeannahme und deine Sparraten.`;
  return `Ich kann aktuell Fragen zu Rendite, bestem/schwächstem ETF, Drawdown, Volatilität, Sharpe Ratio, Einstandskapital und Zielprognosen beantworten.`;
}
function askDepotAssistant(question){
  const q=(question||assistantInput.value||"").trim();if(!q)return;
  assistantConversation.innerHTML+=`<div class="assistant-question">${q}</div><div class="assistant-answer">${assistantReply(q)}</div>`;
  assistantInput.value="";assistantConversation.scrollTop=assistantConversation.scrollHeight;
}
function benchmarkSeries(){
  const key=benchmarkSelect.value,data=state.benchmarks?.[key]||[];
  return [...data].filter(x=>x.date&&Number.isFinite(Number(x.value))&&Number(x.value)>0).sort((a,b)=>a.date.localeCompare(b.date));
}
function parseBenchmarkCsv(text){
  const lines=(text||"").trim().split(/\r?\n/).filter(Boolean),out=[];
  for(const raw of lines){
    const parts=raw.split(/[;,]/).map(x=>x.trim());
    if(parts[0]?.toLowerCase()==="date")continue;
    const date=parts[0],value=Number((parts[1]||"").replace(",","."));
    if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(value)&&value>0)out.push({date,value});
  }
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}
function renderBenchmark(){
  const canvas=document.getElementById("benchmarkChart");if(!canvas)return;
  const hist=filteredHistoryByRange(),bench=benchmarkSeries();
  if(hist.length<2||bench.length<2){
    drawEmptyChart(canvas,"Benchmarkdaten importieren, um den Vergleich zu aktivieren");
    proPortfolioBenchmarkReturn.textContent=proBenchmarkReturn.textContent=benchmarkAlpha.textContent="–";
    benchmarkHint.textContent="Für einen echten Vergleich importierst du Benchmarkdaten als CSV mit den Spalten date,value. Die App erfindet keine historischen Indexwerte.";
    return;
  }
  const bmap=new Map(bench.map(x=>[x.date,Number(x.value)]));
  const paired=hist.map(h=>({date:h.date,p:Number(h.value),b:bmap.get(h.date)})).filter(x=>x.b);
  if(paired.length<2){drawEmptyChart(canvas,"Keine gemeinsamen Datumswerte zwischen Depot und Benchmark");return}
  const p0=paired[0].p,b0=paired[0].b;
  const norm=paired.map(x=>({date:x.date,p:x.p/p0*100,b:x.b/b0*100}));
  const pr=norm.at(-1).p/100-1,br=norm.at(-1).b/100-1,alpha=pr-br;
  proPortfolioBenchmarkReturn.textContent=pct.format(pr);proBenchmarkReturn.textContent=pct.format(br);benchmarkAlpha.textContent=(alpha>=0?"+":"")+pct.format(alpha);benchmarkAlpha.className=alpha>=0?"positive":"negative";
  benchmarkHint.textContent=`Vergleich ab ${formatDate(norm[0].date)} · Startwert beider Reihen = 100`;
  const {ctx,w,h}=canvasSetup(canvas),th=chartTheme(),p=54,vals=norm.flatMap(x=>[x.p,x.b]),min=Math.min(...vals),max=Math.max(...vals),span=Math.max(1,max-min);
  ctx.clearRect(0,0,w,h);drawGrid(ctx,w,h,p,min,max,v=>v.toFixed(0));
  [["p","#5B9BD5"],["b","#f59e0b"]].forEach(([k,c])=>{ctx.beginPath();norm.forEach((q,i)=>{const x=p+i*(w-2*p)/(norm.length-1),y=h-p-((q[k]-min)/span)*(h-2*p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=c;ctx.lineWidth=3;ctx.stroke()});
}
function saveBenchmarkCsv(){
  const data=parseBenchmarkCsv(benchmarkCsvInput.value);
  if(data.length<2){benchmarkImportMessage.textContent="Bitte mindestens zwei gültige Zeilen im Format date,value einfügen.";return}
  state.benchmarks[benchmarkSelect.value]=data;persist();benchmarkImportMessage.textContent=`${data.length} Benchmarkwerte importiert.`;renderBenchmark();
}
function renderV14Pro(){
  renderProRisk();renderSmartInsights();renderBenchmark();renderBenchmarkStrip();
}

function renderRisk(){const hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));if(!hist.length)return;let peak=Number(hist[0].value),ath=peak,maxDD=0;for(const x of hist){const v=Number(x.value);peak=Math.max(peak,v);ath=Math.max(ath,v);if(peak)maxDD=Math.min(maxDD,(v-peak)/peak)}maxDrawdown.textContent=pct.format(maxDD);maxDrawdown.className=maxDD<0?"negative":"";allTimeHigh.textContent=euro.format(ath);const d=ath?totals().value/ath-1:0;distanceToHigh.textContent=pct.format(d);distanceToHigh.className=d>=0?"positive":"negative"}
function renderDividends(){totalDividends.textContent=euro.format(state.dividends.reduce((s,d)=>s+Number(d.amount||0),0))}
function renderNextSavings(){const now=new Date(),next=new Date(now.getFullYear(),now.getMonth()+1,1),days=Math.ceil((startOfDay(next)-startOfDay(now))/86400000);nextSavingsDate.textContent=`${formatDate(isoDate(next))} · in ${days} Tagen`}

function openHistoryManager(){
 const rows=[...state.history].sort((a,b)=>b.date.localeCompare(a.date));historyManagerList.innerHTML=rows.length?rows.map(x=>`<div class="history-manage-row"><label>Datum<input data-hdate="${x.date}" type="date" value="${x.date}"></label><label>Depotwert €<input data-hvalue="${x.date}" type="number" step="0.01" value="${Number(x.value).toFixed(2)}"></label><button type="button" data-hdelete="${x.date}">Löschen</button></div>`).join(""):'<div class="calendar-empty">Keine Tagesstände vorhanden.</div>';
 historyManagerList.querySelectorAll("input").forEach(inp=>inp.onchange=()=>{const key=inp.dataset.hdate||inp.dataset.hvalue,row=state.history.find(x=>x.date===key);if(!row)return;if(inp.dataset.hdate){row.date=inp.value}else row.value=Number(inp.value||0);state.history=state.history.filter((x,i,a)=>a.findIndex(y=>y.date===x.date)===i);persist();render();openHistoryManager()});
 historyManagerList.querySelectorAll("button[data-hdelete]").forEach(btn=>btn.onclick=()=>{if(!confirm("Diesen Tagesstand löschen?"))return;state.history=state.history.filter(x=>x.date!==btn.dataset.hdelete);persist();render();openHistoryManager()});historyDialog.showModal();
}
function renderSystemSummary(){const age=state.history.length?Math.floor((new Date(isoDate(new Date()))-new Date([...state.history].sort((a,b)=>a.date.localeCompare(b.date)).at(-1).date))/86400000):999;const cloud=cloudConfigured()?"Supabase Master · Auto-Sync":"Offline-Cache · Supabase nicht angemeldet";systemSummary.textContent=`${state.history.length} Tagesstände · letzter Stand ${age===0?"heute":age===1?"gestern":`vor ${age} Tagen`} · ${cloud}`}
async function forceVersionRefresh(){const meta=await checkForAppUpdate({manual:true});if(meta&&compareVersions(meta.version,APP_VERSION)<=0)setUpdateStatus(`Version ${APP_VERSION} ist aktuell.`)}
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
  const today=isoDate(new Date());
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
        <label>Stand<input data-advanced-i="${i}" data-k="date" type="date" value="${today}"></label>
        <label>Einstandskapital €<input data-advanced-i="${i}" data-k="costBasis" type="number" step="0.01" value="${f.costBasis}"></label>
        <label>YTD-Basis €<input data-advanced-i="${i}" data-k="ytdBasis" type="number" step="0.01" value="${f.ytdBasis}"></label>
      </div>
    </section>`).join("");
  document.getElementById("editDialog").showModal();
}
function applyEditor(){
  const before=totals();
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
  const after=totals();
  state.metricChange={gain:after.gain-before.gain,ytd:after.ytd-before.ytd,hasValue:true,updatedAt:new Date().toISOString()};
  const dailySnapshot=upsertDailySnapshot();
  addAudit("Depotwerte aktualisiert",`${euro.format(after.value)} · Gewinn ${after.gain-before.gain>=0?"+":""}${euro.format(after.gain-before.gain)} · GuV YTD ${after.ytd-before.ytd>=0?"+":""}${euro.format(after.ytd-before.ytd)} · Tagesstand ${dailySnapshot.replaced?"aktualisiert":"erstellt"}`);
  persist();
  render();
  if(cloudConfigured())syncToCloud().catch(()=>{});
}
function upsertDailySnapshot(){
 const today=isoDate(new Date()),t=totals();
 const snap={
   date:today,
   value:t.value,
   gain:t.gain,
   costBasis:t.cost,
   ytd:t.ytd,
   funds:state.funds.map(f=>({
     name:f.name,
     value:Number(f.value||0),
     gain:Number(f.gain||0),
     ytd:Number(f.ytd||0),
     costBasis:Number(f.costBasis||0),
     ytdBasis:Number(f.ytdBasis||0)
   }))
 };
 const existing=state.history.find(x=>x.date===today);
 if(existing)Object.assign(existing,snap);else state.history.push(snap);
 return{date:today,replaced:Boolean(existing)};
}
function openDividendDialog(){dividendFund.innerHTML=state.funds.map((f,i)=>`<option value="${i}">${f.name}</option>`).join("");dividendAmount.value="";dividendDate.value=isoDate(new Date());document.getElementById("dividendDialog").showModal()}
function saveDividendEntry(){const amount=Number(dividendAmount.value||0);if(amount<=0)return;state.dividends.push({fundIndex:Number(dividendFund.value),amount,date:dividendDate.value});addAudit("Ausschüttung erfasst",euro.format(amount));persist();render()}
function exportBackup(){const b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="ETF-Depot-Andreas-Backup.json";a.click();URL.revokeObjectURL(a.href)}
function importBackup(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);persist();render()}catch{alert("Ungültige Backup-Datei")}};r.readAsText(f)}
function toggleTheme(){state.theme=state.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=state.theme;
registerAppServiceWorker().then(()=>checkForAppUpdate()).catch(()=>{});
scheduleAppUpdateChecks();
navigator.serviceWorker?.addEventListener?.("controllerchange",()=>{if(updateInstallInProgress)location.reload()});
persist();renderHistory()}
function allocationStatus(total){return state.funds.some(f=>f.value/total>.5)?"Gewichtung prüfen":"Depot läuft planmäßig"}
function latestDate(){return state.funds.map(f=>f.date).sort().at(-1)}
function formatDate(s){if(!s)return"–";const[y,m,d]=s.split("-");return`${d}.${m}.${y}`}
function startOfDay(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function startOfWeek(d){const x=startOfDay(d),day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return x}
function isoDate(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function bindElement(id,event,handler,options){
  const element=document.getElementById(id);
  if(!element){console.warn(`Bedienelement #${id} ist in dieser App-Shell nicht vorhanden.`);return null}
  element.addEventListener(event,handler,options);
  return element;
}
bindElement("openEdit","click",openEditor);
bindElement("syncNow","click",syncNowHandler);
bindElement("cloudSettings","click",openCloudDialog);
bindElement("cloudRegister","click",registerCloud);
bindElement("cloudLogin","click",loginCloud);
bindElement("cloudLogout","click",logoutCloud);
bindElement("editBenchmark","click",openBenchmarkDialog);
bindElement("saveBenchmark","click",saveBenchmarkData);
bindElement("addContribution","click",openContributionDialog);
bindElement("saveContribution","click",saveContributionData);
bindElement("exportCsv","click",exportHistoryCsv);
bindElement("refreshFx","click",()=>fetchUsdEur({manual:true}));
bindElement("applyEdit","click",applyEditor);
bindElement("exportBtn","click",exportBackup);
bindElement("importInput","change",importBackup);

function openVersionInfoDialog(){
  if(typeof versionInfoDialog!=="undefined") versionInfoDialog.showModal();
}
function closeVersionInfoDialog(){
  if(typeof versionInfoDialog!=="undefined") versionInfoDialog.close();
}

bindElement("themeToggle","click",toggleTheme);
bindElement("forecastRate","change",()=>{renderForecast();renderGoals();renderFire()});
bindElement("historyRange","change",refreshPerformanceRange);
bindElement("analyticsRange","change",renderAnalytics);
bindElement("clearHistory","click",clearHistoryData);
bindElement("monthlyExpenses","input",renderFire);
bindElement("withdrawalRate","change",renderFire);
bindElement("addDividend","click",openDividendDialog);
bindElement("saveDividend","click",saveDividendEntry);
bindElement("openHistoryManager","click",openHistoryManager);
bindElement("forceRefresh","click",forceVersionRefresh);
document.getElementById("applyUpdate")?.addEventListener("click",applyAppUpdate);
document.getElementById("dismissUpdate")?.addEventListener("click",dismissAppUpdate);
bindElement("installApp","click",installPwa);
bindElement("editTargets","click",openTargetsDialog);
bindElement("saveTargets","click",saveTargetWeights);
bindElement("clearAudit","click",clearAuditLog);
bindElement("printReport","click",printDepotReport);
bindElement("printReportCard","click",printDepotReport);
bindElement("refreshDevices","click",loadDevices);
bindElement("refreshVersions","click",loadVersions);
bindElement("useCloudVersion","click",useCloudConflict);
bindElement("keepLocalVersion","click",keepLocalConflict);
bindElement("clearSyncLog","click",clearSyncLogFn);
document.getElementById("openVersionInfo")?.addEventListener("click",openVersionInfoDialog);
document.getElementById("refreshInsights")?.addEventListener("click",renderSmartInsights);
document.getElementById("askAssistant")?.addEventListener("click",()=>askDepotAssistant());
document.getElementById("assistantInput")?.addEventListener("keydown",e=>{if(e.key==="Enter")askDepotAssistant()});
document.querySelectorAll(".assistant-chips button").forEach(b=>b.addEventListener("click",()=>askDepotAssistant(b.dataset.question)));
document.getElementById("benchmarkSelect")?.addEventListener("change",()=>{renderBenchmark();renderBenchmarkStrip()});
document.getElementById("benchmarkStripButton")?.addEventListener("click",()=>document.getElementById("benchmarkSection")?.scrollIntoView({behavior:"smooth",block:"start"}));
document.getElementById("editCashAccount")?.addEventListener("click",openCashAccountDialog);
document.getElementById("closeCashAccountDialog")?.addEventListener("click",()=>cashAccountDialog.close());
document.getElementById("saveCashAccount")?.addEventListener("click",saveCashAccountSettings);
document.getElementById("cashAccountDialog")?.addEventListener("click",e=>{if(e.target===cashAccountDialog)cashAccountDialog.close()});
document.getElementById("openBenchmarkImport")?.addEventListener("click",()=>benchmarkDialog.showModal());
document.getElementById("closeBenchmarkDialog")?.addEventListener("click",()=>benchmarkDialog.close());
document.getElementById("saveBenchmarkCsv")?.addEventListener("click",saveBenchmarkCsv);
document.getElementById("clearBenchmarkData")?.addEventListener("click",()=>{state.benchmarks[benchmarkSelect.value]=[];persist();benchmarkCsvInput.value="";benchmarkImportMessage.textContent="Benchmarkdaten gelöscht.";renderBenchmark()});
document.querySelectorAll(".mobile-bottom-nav button").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.action==="cloud"){cloudDialog.showModal();return}const id=b.dataset.scrollTarget;if(id==="top")window.scrollTo({top:0,behavior:"smooth"});else document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"})}));
document.getElementById("closeVersionInfo")?.addEventListener("click",closeVersionInfoDialog);
document.getElementById("closeVersionInfoBottom")?.addEventListener("click",closeVersionInfoDialog);
document.getElementById("versionInfoDialog")?.addEventListener("click",e=>{if(e.target===versionInfoDialog)closeVersionInfoDialog()});
bindElement("historyChart","mousemove",showChartTooltip);
bindElement("historyChart","mouseleave",hideChartTooltip);
bindElement("historyChart","touchmove",showChartTooltip,{passive:true});
bindElement("historyChart","touchend",hideChartTooltip);
bindElement("gainHistoryChart","mousemove",showGainTooltip);
bindElement("gainHistoryChart","mouseleave",()=>gainChartTooltip.hidden=true);
bindElement("gainHistoryChart","touchmove",showGainTooltip,{passive:true});
bindElement("gainHistoryChart","touchend",()=>gainChartTooltip.hidden=true);
bindElement("fundPerformanceChart","mousemove",showFundTooltip);
bindElement("fundPerformanceChart","mouseleave",()=>fundChartTooltip.hidden=true);
bindElement("fundPerformanceChart","touchmove",showFundTooltip,{passive:true});
bindElement("fundPerformanceChart","touchend",()=>fundChartTooltip.hidden=true);
setupChartTabs();
if(!state.cloud.url)state.cloud.url="https://dgrulyvrxmughqgzherg.supabase.co";
if(!state.cloud.anonKey)state.cloud.anonKey="sb_publishable_6TeNYQRBAqDpysVgKUJ0Jw_7KqDvgc2";
persist();

document.documentElement.dataset.theme=state.theme;
registerAppServiceWorker().then(()=>checkForAppUpdate()).catch(()=>{});
scheduleAppUpdateChecks();
navigator.serviceWorker?.addEventListener?.("controllerchange",()=>{if(updateInstallInProgress)location.reload()});
restoreCloudSession().then(ok=>{if(ok&&navigator.onLine)syncFromCloud().catch(()=>{});renderCloudAccountSummary()}).catch(()=>{renderCloudAccountSummary()});
render();if(!state.fx?.date||state.fx.date!==isoDate(new Date()))fetchUsdEur();

document.title="ETF Depot Andreas · Version 1.5.8 Header-Signatur";

let chartResizeTimer;
window.addEventListener("resize",()=>{clearTimeout(chartResizeTimer);chartResizeTimer=setTimeout(()=>{renderHistory();renderV13Charts()},120)});
async function resumeCloudSync(){
  if(!state.fx?.date||state.fx.date!==isoDate(new Date()))fetchUsdEur();
  if(!cloudConfigured())return;
  if(!navigator.onLine){setSyncState("offline");return}
  try{
    setSyncState("syncing");
    if(localDirty)await syncToCloud({reason:"Wieder online / App aktiv"});
    await syncFromCloud(true);
    if(!pendingConflict)setSyncState("synced");
  }catch(e){handleCloudError(e)}
}
window.addEventListener("focus",()=>{resumeCloudSync();checkForAppUpdate().catch(()=>{})});
window.addEventListener("online",()=>{pushSyncLog("info","Internetverbindung wiederhergestellt.");resumeCloudSync()});
window.addEventListener("offline",()=>{setSyncState("offline");pushSyncLog("info","Offline – Änderungen bleiben lokal in der Warteschlange.")});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){resumeCloudSync();checkForAppUpdate().catch(()=>{})}});
window.addEventListener("storage",e=>{if(e.key===KEY&&!localDirty){state=load();render()}});
setInterval(()=>{if(document.visibilityState==="visible"&&navigator.onLine&&cloudConfigured()&&!localDirty)syncFromCloud(true).catch(handleCloudError)},Math.max(10,Number(state.preferences?.autoPullSeconds||15))*1000);
setInterval(()=>{if(document.visibilityState==="visible"&&navigator.onLine&&cloudConfigured())heartbeatDevice().catch(()=>{})},60000);
renderSyncStatus();bootstrapCloud(false);
