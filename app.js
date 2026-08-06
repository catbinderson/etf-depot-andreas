const KEY="etfDepotAndreas.v5_1";
const COLORS=["#5B9BD5","#14b8a6","#f59e0b"];
const DEFAULTS={
 funds:[
  {name:"Vanguard FTSE Developed World",isin:"IE00BKX55T58",units:384.222758,value:48374.61,gain:15492.27,ytd:6396.34,monthly:600,date:"2026-08-04"},
  {name:"Dimensional World Equity",isin:"IE00B53RD369",units:1191.018192,value:46652.18,gain:13652.18,ytd:6672.54,monthly:600,date:"2026-08-04"},
  {name:"Amundi Robotics & AI",isin:"LU1861132840",units:179.753899,value:26136.49,gain:9665.62,ytd:5692.59,monthly:300,date:"2026-08-04"}
 ],
 history:[{date:"2026-08-04",value:121163.28}],dividends:[],theme:"light",fx:{usdEur:0.87,date:"",source:""},vanguardUsdMode:false,vanguardUsdValue:0
};
const old=localStorage.getItem("etfDepotAndreas.v5")||localStorage.getItem("etfDepotAndreas.v4")||localStorage.getItem("etfDepotAndreas.v3")||localStorage.getItem("etfDepotAndreas.v1");
let state=load();
const euro=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"});
const pct=new Intl.NumberFormat("de-DE",{style:"percent",minimumFractionDigits:2,maximumFractionDigits:2});
const num=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:6});
function clone(x){return JSON.parse(JSON.stringify(x))}
function load(){try{const raw=localStorage.getItem(KEY)||old;if(!raw)return clone(DEFAULTS);const x=JSON.parse(raw);return{...clone(DEFAULTS),...x,dividends:x.dividends||[],fx:{...DEFAULTS.fx,...(x.fx||{})}}}catch{return clone(DEFAULTS)}}
function persist(){localStorage.setItem(KEY,JSON.stringify(state))}
function totals(){const value=state.funds.reduce((s,f)=>s+Number(f.value||0),0),gain=state.funds.reduce((s,f)=>s+Number(f.gain||0),0),ytd=state.funds.reduce((s,f)=>s+Number(f.ytd||0),0),cost=value-gain;return{value,gain,ytd,cost,ret:cost?gain/cost:0}}
function render(){
 const t=totals();
 totalValue.textContent=euro.format(t.value);totalGain.textContent=euro.format(t.gain);totalGain.className=t.gain>=0?"positive":"negative";totalGainPct.textContent=pct.format(t.ret);totalYtd.textContent=euro.format(t.ytd);totalYtd.className=t.ytd>=0?"positive":"negative";investedCapital.textContent=euro.format(t.cost);
 const best=[...state.funds].sort((a,b)=>b.ytd-a.ytd)[0];bestFund.textContent="Bester Beitrag: "+best.name;lastUpdated.textContent="Stand "+formatDate(latestDate());statusBadge.textContent=allocationStatus(t.value);
 renderReturns(t.value);renderDailySummary(t.value);renderFunds(t.value);renderDonut(t.value);renderSavings();renderForecast();renderGoals();renderHistory();renderRisk();renderDividends();renderDividendCalendar();renderNextSavings();renderFx();renderAnalytics();renderProgressGoals();renderPeriodSummary();renderDataQuality();renderFire();
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

function renderFunds(total){fundList.innerHTML=state.funds.map(f=>{const cost=Number(f.value)-Number(f.gain),avg=f.units?cost/f.units:0;return`<div class="fund"><div><div class="fund-name">${f.name}</div><div class="fund-sub">${f.isin} · ${num.format(f.units)} Anteile · Ø Kauf ${euro.format(avg)}</div></div><div><div class="metric-label">Depotwert</div><div class="metric-value">${euro.format(f.value)}</div></div><div><div class="metric-label">Gewichtung</div><div class="metric-value">${pct.format(total?f.value/total:0)}</div></div><div><div class="metric-label">Seit Kauf</div><div class="metric-value ${f.gain>=0?"positive":"negative"}">${euro.format(f.gain)}</div></div><div><div class="metric-label">GuV YTD</div><div class="metric-value ${f.ytd>=0?"positive":"negative"}">${euro.format(f.ytd)}</div></div></div>`}).join("")}
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
function openEditor(){editRows.innerHTML=state.funds.map((f,i)=>`<section class="edit-row"><h3>${f.name}</h3><div class="edit-grid"><label>Depotwert €<input data-i="${i}" data-k="value" type="number" step="0.01" value="${f.value}"></label><label>GuV seit Kauf €<input data-i="${i}" data-k="gain" type="number" step="0.01" value="${f.gain}"></label><label>GuV YTD €<input data-i="${i}" data-k="ytd" type="number" step="0.01" value="${f.ytd}"></label><label>Anteile<input data-i="${i}" data-k="units" type="number" step="0.000001" value="${f.units}"></label><label>Stand<input data-i="${i}" data-k="date" type="date" value="${f.date}"></label></div>${i===0?`<div class="fx-mode"><label><input id="vanguardUsdMode" type="checkbox" ${state.vanguardUsdMode?"checked":""}> Vanguard-Depotwert in USD eingeben</label><label>USD-Depotwert <input id="vanguardUsdValue" type="number" step="0.01" value="${state.vanguardUsdValue||""}"></label></div>`:""}</section>`).join("");editDialog.showModal()}
function applyEditor(){editRows.querySelectorAll("input[data-i]").forEach(i=>{const n=Number(i.dataset.i),k=i.dataset.k;state.funds[n][k]=k==="date"?i.value:Number(i.value)});const mode=document.getElementById("vanguardUsdMode");const usd=document.getElementById("vanguardUsdValue");state.vanguardUsdMode=Boolean(mode?.checked);state.vanguardUsdValue=Number(usd?.value||0);applyFxToVanguard();persist();render()}
function snapshot(){const today=isoDate(new Date()),value=totals().value,f=state.history.find(x=>x.date===today);f?f.value=value:state.history.push({date:today,value});persist();render();alert("Tagesstand gespeichert.")}
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
openEdit.onclick=openEditor;refreshFx.onclick=fetchUsdEur;applyEdit.onclick=applyEditor;saveSnapshot.onclick=snapshot;exportBtn.onclick=exportBackup;importInput.onchange=importBackup;themeToggle.onclick=toggleTheme;forecastRate.onchange=()=>{renderForecast();renderGoals();renderFire()};historyRange.onchange=renderHistory;analyticsRange.onchange=renderAnalytics;clearHistory.onclick=clearHistoryData;monthlyExpenses.oninput=renderFire;withdrawalRate.onchange=renderFire;addDividend.onclick=openDividendDialog;saveDividend.onclick=saveDividendEntry;document.documentElement.dataset.theme=state.theme;render();if(!state.fx?.date||state.fx.date!==isoDate(new Date()))fetchUsdEur();

document.title="ETF Depot Andreas · Version 5.1";
