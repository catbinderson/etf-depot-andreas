const STORAGE_KEY="etfDepotAndreas.v1";
const COLORS=["#5B9BD5","#14b8a6","#f59e0b"];
const DEFAULTS={
  funds:[
    {name:"Vanguard FTSE Developed World",isin:"IE00BKX55T58",units:384.222758,value:48374.61,gain:15492.27,ytd:6396.34,monthly:600,date:"2026-08-04"},
    {name:"Dimensional World Equity",isin:"IE00B53RD369",units:1191.018192,value:46652.18,gain:13652.18,ytd:6672.54,monthly:600,date:"2026-08-04"},
    {name:"Amundi Robotics & AI",isin:"LU1861132840",units:179.753899,value:26136.49,gain:9665.62,ytd:5692.59,monthly:300,date:"2026-08-04"}
  ],
  history:[{date:"2026-08-04",value:121163.28}],
  theme:"system",
  dividends:[]
};
let state=load();
const euro=new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"});
const pct=new Intl.NumberFormat("de-DE",{style:"percent",minimumFractionDigits:2,maximumFractionDigits:2});
const num=new Intl.NumberFormat("de-DE",{minimumFractionDigits:2,maximumFractionDigits:6});

function clone(x){return JSON.parse(JSON.stringify(x))}
function load(){try{return {...clone(DEFAULTS),...JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")}}catch{return clone(DEFAULTS)}}
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function totals(){
  const value=state.funds.reduce((s,f)=>s+Number(f.value||0),0);
  const gain=state.funds.reduce((s,f)=>s+Number(f.gain||0),0);
  const ytd=state.funds.reduce((s,f)=>s+Number(f.ytd||0),0);
  const cost=value-gain;
  return{value,gain,ytd,cost,ret:cost?gain/cost:0}
}
function render(){
  const t=totals();
  totalValue.textContent=euro.format(t.value);
  totalGain.textContent=euro.format(t.gain);
  totalGain.className=t.gain>=0?"positive":"negative";
  totalGainPct.textContent=pct.format(t.ret);
  totalYtd.textContent=euro.format(t.ytd);
  totalYtd.className=t.ytd>=0?"positive":"negative";
  const best=[...state.funds].sort((a,b)=>(b.ytd/(b.value-b.ytd))-(a.ytd/(a.value-a.ytd)))[0];
  bestFund.textContent="Bester Beitrag: "+best.name;
  lastUpdated.textContent="Stand "+formatDate(latestDate());
  statusBadge.textContent=allocationStatus(t.value);
  renderShortTermReturns(t.value);
  investedCapital.textContent=euro.format(t.cost);
  renderV3(t.value);

  fundList.innerHTML=state.funds.map((f,i)=>`
    <div class="fund">
      <div><div class="fund-name">${f.name}</div><div class="fund-sub">${f.isin} · ${num.format(f.units)} Anteile</div></div>
      <div><div class="metric-label">Depotwert</div><div class="metric-value">${euro.format(f.value)}</div></div>
      <div><div class="metric-label">Gewichtung</div><div class="metric-value">${pct.format(t.value?f.value/t.value:0)}</div></div>
      <div><div class="metric-label">Seit Kauf</div><div class="metric-value ${f.gain>=0?"positive":"negative"}">${euro.format(f.gain)}</div></div>
      <div><div class="metric-label">GuV YTD</div><div class="metric-value ${f.ytd>=0?"positive":"negative"}">${euro.format(f.ytd)}</div></div>
    </div>`).join("");

  let start=0,parts=[];
  state.funds.forEach((f,i)=>{const share=t.value?f.value/t.value*100:0;parts.push(`${COLORS[i]} ${start}% ${start+share}%`);start+=share});
  donut.style.background=`conic-gradient(${parts.join(",")})`;
  donutValue.textContent=euro.format(t.value);
  legend.innerHTML=state.funds.map((f,i)=>`<div class="legend-row"><span><i class="legend-dot" style="background:${COLORS[i]}"></i>${f.name}</span><strong>${pct.format(t.value?f.value/t.value:0)}</strong></div>`).join("");
  savingsList.innerHTML=state.funds.map(f=>`<div class="saving-row"><span>${f.name}</span><strong>${euro.format(f.monthly)}</strong></div>`).join("");
  renderForecast();
  renderHistory();
}

function renderShortTermReturns(currentValue){
  const today=startOfDay(new Date());
  const periods=[
    {valueEl:returnToday,infoEl:returnTodayInfo,start:addDays(today,-1),fallback:"Benötigt einen Stand von gestern"},
    {valueEl:returnYear,infoEl:returnYearInfo,start:new Date(today.getFullYear(),0,1),fallback:"Benötigt einen Stand zum Jahresbeginn"},
    {
      valueEl:return7d,
      infoEl:return7dInfo,
      start:addDays(today,-7),
      fallback:"Benötigt einen Stand von vor 7 Tagen"
    },
    {
      valueEl:returnWeek,
      infoEl:returnWeekInfo,
      start:startOfWeek(today),
      fallback:"Benötigt einen Stand vom Wochenbeginn"
    },
    {
      valueEl:returnMonth,
      infoEl:returnMonthInfo,
      start:new Date(today.getFullYear(),today.getMonth(),1),
      fallback:"Benötigt einen Stand zum Monatsbeginn"
    }
  ];
  for(const p of periods){
    const result=periodReturn(p.start,today,currentValue);
    if(!result){
      p.valueEl.textContent="–";
      p.valueEl.className="";
      p.infoEl.textContent=p.fallback;
      continue;
    }
    p.valueEl.textContent=pct.format(result.rate);
    p.valueEl.className=result.rate>=0?"positive":"negative";
    const cashText=result.cashflows>0?` · ${euro.format(result.cashflows)} Sparrate herausgerechnet`:"";
    p.infoEl.textContent=`Vergleich mit ${formatDate(result.baseline.date)}${cashText}`;
  }
}
function periodReturn(startDate,endDate,currentValue){
  const hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));
  const startIso=isoDate(startDate);
  const candidates=hist.filter(x=>x.date<=startIso);
  if(!candidates.length)return null;
  const baseline=candidates.at(-1);
  const baseValue=Number(baseline.value||0);
  if(!baseValue)return null;
  const cashflows=scheduledContributionsAfter(baseline.date,isoDate(endDate));
  return{
    baseline,
    cashflows,
    rate:(currentValue-baseValue-cashflows)/baseValue
  };
}
function scheduledContributionsAfter(startIso,endIso){
  const monthly=state.funds.reduce((s,f)=>s+Number(f.monthly||0),0);
  if(!monthly)return 0;
  let cursor=new Date(startIso+"T12:00:00");
  cursor=new Date(cursor.getFullYear(),cursor.getMonth(),1);
  if(isoDate(cursor)<=startIso)cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);
  let total=0;
  while(isoDate(cursor)<=endIso){
    total+=monthly;
    cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);
  }
  return total;
}
function startOfDay(d){return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function startOfWeek(d){const x=startOfDay(d),day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return x}
function isoDate(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}

function renderV3(currentValue){renderGoals(currentValue);renderRisk(currentValue);renderDividends();renderNextSavings()}
function renderGoals(currentValue){const rate=Number(forecastRate.value),monthly=state.funds.reduce((s,f)=>s+Number(f.monthly||0),0),goals=[250000,500000,1000000];goalGrid.innerHTML=goals.map(goal=>`<div class="goal-item"><span>${euro.format(goal)}</span><strong>${goalTime(currentValue,monthly,rate,goal)}</strong></div>`).join("")}
function goalTime(start,monthly,annual,goal){if(start>=goal)return"bereits erreicht";const r=annual/12;for(let m=1;m<=1200;m++){const fv=start*Math.pow(1+r,m)+monthly*((Math.pow(1+r,m)-1)/r);if(fv>=goal){const y=Math.floor(m/12),mo=m%12;return`${y?y+" J. ":""}${mo?mo+" Mon.":""}`.trim()}}return"nicht erreichbar"}
function renderRisk(currentValue){const hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));if(!hist.length)return;let peak=Number(hist[0].value||0),ath=peak,maxDD=0;for(const h of hist){const v=Number(h.value||0);peak=Math.max(peak,v);ath=Math.max(ath,v);if(peak)maxDD=Math.min(maxDD,(v-peak)/peak)}maxDrawdown.textContent=pct.format(maxDD);maxDrawdown.className=maxDD<0?"negative":"";allTimeHigh.textContent=euro.format(ath);const dist=ath?currentValue/ath-1:0;distanceToHigh.textContent=pct.format(dist);distanceToHigh.className=dist>=0?"positive":"negative"}
function renderDividends(){totalDividends.textContent=euro.format((state.dividends||[]).reduce((s,d)=>s+Number(d.amount||0),0))}
function renderNextSavings(){const now=new Date();let next=new Date(now.getFullYear(),now.getMonth()+1,1);const days=Math.ceil((startOfDay(next)-startOfDay(now))/86400000);nextSavingsDate.textContent=`${formatDate(isoDate(next))} · in ${days} Tagen`}
function openDividendDialog(){dividendFund.innerHTML=state.funds.map((f,i)=>`<option value="${i}">${f.name}</option>`).join("");dividendAmount.value="";dividendDate.value=isoDate(new Date());dividendDialog.showModal()}
function saveDividendEntry(){const amount=Number(dividendAmount.value||0);if(amount<=0)return;state.dividends=state.dividends||[];state.dividends.push({fundIndex:Number(dividendFund.value),amount,date:dividendDate.value});persist();render()}

function allocationStatus(total){
  const shares=state.funds.map(f=>f.value/total);
  if(shares.some(x=>x>0.5))return"Gewichtung prüfen";
  return"Depot läuft planmäßig";
}
function latestDate(){return state.funds.map(f=>f.date).sort().at(-1)}
function formatDate(s){if(!s)return"–";const[y,m,d]=s.split("-");return`${d}.${m}.${y}`}
function renderForecast(){
  const t=totals(),rate=Number(forecastRate.value),monthly=state.funds.reduce((s,f)=>s+f.monthly,0);
  const years=[5,10,20,30];
  forecastGrid.innerHTML=years.map(y=>{
    const months=y*12,r=rate/12;
    const fv=t.value*Math.pow(1+r,months)+monthly*((Math.pow(1+r,months)-1)/r);
    return`<div class="forecast-item"><span>In ${y} Jahren</span><strong>${euro.format(fv)}</strong></div>`;
  }).join("");
}
function renderHistory(){
  const ctx=historyChart.getContext("2d"),w=historyChart.width,h=historyChart.height,p=48;
  ctx.clearRect(0,0,w,h);
  const range=historyRange.value;
  let hist=[...state.history].sort((a,b)=>a.date.localeCompare(b.date));
  if(range!=="all"){const cutoff=new Date();cutoff.setDate(cutoff.getDate()-Number(range));hist=hist.filter(x=>new Date(x.date)>=cutoff)}
  if(!hist.length)return;
  const vals=hist.map(x=>Number(x.value)),min=Math.min(...vals),max=Math.max(...vals),span=Math.max(1,max-min);
  ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--line");ctx.lineWidth=1;
  for(let i=0;i<5;i++){const y=p+i*(h-2*p)/4;ctx.beginPath();ctx.moveTo(p,y);ctx.lineTo(w-p,y);ctx.stroke()}
  ctx.strokeStyle=COLORS[0];ctx.lineWidth=5;ctx.lineJoin="round";ctx.beginPath();
  hist.forEach((pt,i)=>{const x=p+(hist.length===1?0:i*(w-2*p)/(hist.length-1)),y=h-p-((pt.value-min)/span)*(h-2*p);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
  ctx.stroke();
  ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--ink");ctx.font="16px -apple-system";
  ctx.fillText(euro.format(max),p,22);ctx.fillText(euro.format(min),p,h-14);
}
function openEditor(){
  editRows.innerHTML=state.funds.map((f,i)=>`
    <section class="edit-row"><h3>${f.name}</h3>
      <div class="edit-grid">
        <label>Depotwert €<input data-i="${i}" data-k="value" type="number" step="0.01" value="${f.value}"></label>
        <label>GuV seit Kauf €<input data-i="${i}" data-k="gain" type="number" step="0.01" value="${f.gain}"></label>
        <label>GuV YTD €<input data-i="${i}" data-k="ytd" type="number" step="0.01" value="${f.ytd}"></label>
        <label>Anteile<input data-i="${i}" data-k="units" type="number" step="0.000001" value="${f.units}"></label>
        <label>Stand<input data-i="${i}" data-k="date" type="date" value="${f.date}"></label>
      </div>
    </section>`).join("");
  editDialog.showModal();
}
function applyEditor(){
  editRows.querySelectorAll("input").forEach(inp=>{
    const i=Number(inp.dataset.i),k=inp.dataset.k;
    state.funds[i][k]=k==="date"?inp.value:Number(inp.value);
  });
  persist();render();
}
function snapshot(){
  const today=isoDate(new Date()),value=totals().value;
  const found=state.history.find(x=>x.date===today);
  found?found.value=value:state.history.push({date:today,value});
  persist();render();
}
function exportBackup(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download="ETF-Depot-Andreas-Backup.json";a.click();URL.revokeObjectURL(a.href);
}
function toggleTheme(){
  const current=document.documentElement.dataset.theme;
  const next=current==="dark"?"light":"dark";
  document.documentElement.dataset.theme=next;state.theme=next;persist();renderHistory();
}
function applyTheme(){if(state.theme==="dark"||state.theme==="light")document.documentElement.dataset.theme=state.theme}
openEdit.onclick=openEditor;addDividend.onclick=openDividendDialog;saveDividend.onclick=saveDividendEntry;applyEdit.onclick=applyEditor;saveSnapshot.onclick=snapshot;exportBtn.onclick=exportBackup;themeToggle.onclick=toggleTheme;
forecastRate.onchange=()=>{renderForecast();renderGoals(totals().value)};historyRange.onchange=renderHistory;
importInput.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);persist();render()}catch{alert("Ungültige Backup-Datei")}};r.readAsText(f)};
exportBtn.addEventListener("contextmenu",e=>{e.preventDefault();importInput.click()});
applyTheme();render();
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js");
