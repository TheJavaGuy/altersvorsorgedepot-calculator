(function(){
  // ---------- theme ----------
  var root=document.documentElement, toggle=document.getElementById('themeToggle');
  function prefersDark(){ return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }
  var saved=null; try{ saved=localStorage.getItem('avd-theme'); }catch(e){}
  if(saved==='dark'||saved==='light'){ root.setAttribute('data-theme',saved); }
  function isDark(){ var t=root.getAttribute('data-theme'); return t ? t==='dark' : prefersDark(); }
  toggle.checked=isDark();
  toggle.addEventListener('change',function(){ var t=toggle.checked?'dark':'light'; root.setAttribute('data-theme',t); try{ localStorage.setItem('avd-theme',t); }catch(e){} restyleCharts(); });

  // ---------- mobile section menu ----------
  var mobileNav=document.getElementById('mobileNav');
  mobileNav.addEventListener('click',function(e){ if(e.target.closest('a')) mobileNav.hidePopover(); });

  // ---------- persisted inputs ----------
  // every control in <main>: sliders/numbers by value, checkboxes by state, radios per group by the checked value; segmented buttons store their own keys
  var STATE_KEY='avd-inputs', state={}, persisted='main input';
  try{ state=JSON.parse(localStorage.getItem(STATE_KEY))||{}; }catch(e){}
  // the reset button only shows once something has been saved
  var resetBtn=document.getElementById('resetInputs');
  function syncResetBtn(){ resetBtn.hidden=!Object.keys(state).length; }
  syncResetBtn();
  function saveState(){ try{ localStorage.setItem(STATE_KEY,JSON.stringify(state)); }catch(e){} syncResetBtn(); }
  function stateKey(el){ return el.type==='radio'?el.name:el.id; }
  document.querySelectorAll(persisted).forEach(function(el){
    var v=state[stateKey(el)]; if(v==null) return;
    if(el.type==='radio'){ if(v===el.value) el.checked=true; }
    else if(el.type==='checkbox'){ el.checked=!!v; }
    else { el.value=v; }
  });
  function remember(e){
    var el=e.target; if(!el.matches(persisted)||!stateKey(el)) return;
    state[stateKey(el)]=el.type==='checkbox'?el.checked:el.value; saveState();
  }
  document.addEventListener('input',remember); document.addEventListener('change',remember);
  // defaults live in the markup, so a reset is: forget the state, reload
  // (controls are put back to their defaults first so Firefox's form restore on reload cannot bring the old values back)
  document.getElementById('resetConfirmBtn').addEventListener('click',function(){
    try{ localStorage.removeItem(STATE_KEY); }catch(e){}
    document.querySelectorAll(persisted).forEach(function(el){ if(el.type==='radio'||el.type==='checkbox') el.checked=el.defaultChecked; else el.value=el.defaultValue; });
    location.reload();
  });
  function restoreButton(attr){ var b=state[attr]!=null&&document.querySelector('[data-'+attr+'="'+state[attr]+'"]'); if(b) b.click(); }

  var fmt=function(n){ return Math.round(n).toLocaleString('en-US'); };
  var cssVar=function(n){ return getComputedStyle(root).getPropertyValue(n).trim(); };
  var reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- hero subsidy meter ----------
  var own=document.getElementById('own'), rate=document.getElementById('rate'), young=document.getElementById('young');
  var soli=document.getElementById('soli'), church=document.getElementById('church');
  var kids=0, kist=9;
  var meter=document.getElementById('meter'), meterOwn=document.getElementById('mOwn'), measureCtx=document.createElement('canvas').getContext('2d');
  // s, ch: Soli and church-tax rates in %; both are levied on the income tax, so they shrink with the income-tax refund
  function calc(c,k,y,r,s,ch){
    var grund=0,kind=0,bonus=0;
    if(c>=120){ grund=0.5*Math.min(c,360)+0.25*Math.max(0,Math.min(c,1800)-360); kind=k*Math.min(c,300); bonus=y?200:0; }
    var zul=grund+kind+bonus;
    var deduction=Math.min(c,1800)+zul;
    var incomeTax=Math.max(0,deduction*r/100-zul), soliTax=incomeTax*s/100, churchTax=incomeTax*ch/100;
    return {grund:grund,kind:kind,bonus:bonus,zul:zul,incomeTax:incomeTax,soliTax:soliTax,churchTax:churchTax,refund:incomeTax+soliTax+churchTax,deduction:deduction};
  }
  function renderMeter(){
    var c=+own.value, r=+rate.value, y=young.checked, o=calc(c,kids,y,r,soli.checked?5.5:0,church.checked?kist:0);
    document.getElementById('ownOut').textContent=fmt(c); document.getElementById('ownMonthOut').textContent=fmt(c/12); document.getElementById('rateOut').textContent=r;
    var total=c+o.zul; var cap=Math.max(total,2400);
    var pct=function(v){ return (total?(v/cap*100):0).toFixed(2)+'%'; };
    // pick the longest label that fits the segment's final pixel width (flex-basis is still animating)
    var cs=getComputedStyle(meterOwn); measureCtx.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
    var fits=function(text,w){ return measureCtx.measureText(text).width+16<=w; };
    var set=function(id,v,label){ var el=document.getElementById(id), w=total?meter.clientWidth*v/cap:0, full=label+' '+fmt(v); el.style.flexBasis=pct(v); el.textContent=fits(full,w)?full:(fits(fmt(v),w)?fmt(v):''); };
    set('mOwn',c,'you'); set('mGrund',o.grund,'Grund'); set('mKind',o.kind,'Kinder'); set('mBonus',o.bonus,'bonus');
    document.getElementById('zOut').textContent=fmt(o.zul);
    document.getElementById('tOut').textContent=fmt(o.refund);
    document.getElementById('rOut').textContent=c?Math.round((o.zul+o.refund)/c*100):0;
    var note=document.getElementById('meterNote');
    if(c<120){ note.textContent='Below 120 € a year there is no Zulage at all, not even pro rata.'; }
    else if(c>1800){ note.textContent=fmt(c)+' € in → '+fmt(total)+' € in the depot. The '+fmt(c-1800)+' € above 1,800 € get no Zulage and no deduction, but still grow tax-deferred; they are locked until 65 and taxed later only on the earnings share.'; }
    else { note.textContent=fmt(c)+' € in → '+fmt(total)+' € in the depot plus a '+fmt(o.refund)+' € refund on your account. Deduction: '+fmt(Math.min(c,1800))+' € + '+fmt(o.zul)+' € Zulage = '+fmt(o.deduction)+' € × '+r+' % = '+fmt(o.deduction*r/100)+' €, minus the '+fmt(o.zul)+' € already paid as Zulage'+surcharges(o)+'.'; }
  }
  function surcharges(o){
    var parts=[];
    if(soli.checked) parts.push(fmt(o.soliTax)+' € Soli');
    if(church.checked) parts.push(fmt(o.churchTax)+' € church tax');
    return parts.length?' = '+fmt(o.incomeTax)+' € income tax, plus '+parts.join(' and '):'';
  }
  own.addEventListener('input',renderMeter); rate.addEventListener('input',renderMeter); young.addEventListener('change',renderMeter);
  soli.addEventListener('change',renderMeter); church.addEventListener('change',renderMeter);
  new ResizeObserver(renderMeter).observe(meter);
  if(document.fonts) document.fonts.ready.then(renderMeter);
  document.querySelectorAll('[data-kids]').forEach(function(b){ b.addEventListener('click',function(){ kids=+b.dataset.kids; document.querySelectorAll('[data-kids]').forEach(function(x){ x.setAttribute('aria-pressed',x===b); }); state.kids=kids; saveState(); renderMeter(); }); });
  restoreButton('kids');
  document.querySelectorAll('[data-kist]').forEach(function(b){ b.addEventListener('click',function(){ if(b.getAttribute('aria-disabled')==='true') return; kist=+b.dataset.kist; document.querySelectorAll('[data-kist]').forEach(function(x){ x.setAttribute('aria-pressed',x===b); }); state.kist=kist; saveState(); renderMeter(); }); });
  restoreButton('kist');
  // the rate only matters with church tax on; the hint explains the disabled state (group title for mouse, aria-describedby for screen readers)
  var kistSeg=document.getElementById('kistSeg'), kistHint=document.getElementById('kistHint');
  function syncKist(){ var off=!church.checked; kistHint.textContent=kistSeg.title=off?'Turn on church tax to choose a rate':''; kistSeg.querySelectorAll('[data-kist]').forEach(function(x){ x.setAttribute('aria-disabled',off); }); }
  church.addEventListener('change',syncKist); syncKist();
  // one orchestrated load moment: the slider sweeps 0 -> its (default or restored) value
  if(reduced){ renderMeter(); } else {
    var ownTarget=+own.value; own.value=0; renderMeter();
    var t0=null; var dur=1100;
    requestAnimationFrame(function step(ts){ if(!t0) t0=ts; var p=Math.min(1,(ts-t0)/dur); var e=1-Math.pow(1-p,3); own.value=Math.round(ownTarget*e/10)*10; renderMeter(); if(p<1) requestAnimationFrame(step); });
  }

  // ---------- timeline reveal ----------
  var items=document.querySelectorAll('.tl-item');
  if('IntersectionObserver' in window && !reduced){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{threshold:.2});
    items.forEach(function(i){ io.observe(i); });
  } else { items.forEach(function(i){ i.classList.add('in'); }); }

  // ---------- providers filter ----------
  var onlyFree=document.getElementById('onlyFree');
  function filterProviders(){ document.querySelectorAll('#provTable tbody tr').forEach(function(tr){ tr.style.display=(onlyFree.checked && tr.dataset.free!=='1')?'none':''; }); }
  onlyFree.addEventListener('change',filterProviders); filterProviders();

  // ---------- work situation ----------
  var workData={
    emp:['ok','Directly eligible','Full Grundzulage (up to 540 €), Kinderzulage, youth bonus and the Sonderausgabenabzug. Your employer is not involved at any point; a job change needs no action.'],
    self:['ok','Directly eligible since the 2026 amendments','Business or freelance income plus a filed tax return makes you eligible; Versorgungswerk members must consent to a data report to the ZfA. Switching from employment to freelancing does not cut you off.'],
    alg:['ok','Still eligible','Time on ALG I or Bürgergeld counts as Anrechnungszeit (§ 58 SGB VI) if you were eligible immediately before. 120 € a year keeps the Zulage flowing: 60 € Grundzulage plus 120 € per child.'],
    care:['ok','Still eligible','Child-raising periods (first 3 years, applied for at the DRV) and unpaid care of a relative with Pflegegrad ≥ 2 for 10+ hours a week keep you in the eligible group.'],
    gap:['warn','Not eligible from the following year','No Zulage and no deduction for that year. You may keep paying unsubsidised (taxed later only on the earnings share) or pause the contract. Nothing is clawed back; the capital stays invested.'],
    spouse:['warn','Indirectly eligible via your partner','Open your own contract, pay at least 120 € a year and receive a Grundzulage of up to 175 € (depends on the partner\'s contributions). No own Sonderausgabenabzug. Both contracts must be in the same system — old Riester plus new AVD does not work.'],
    ret:['bad','Not eligible','Recipients of a full old-age pension cannot get the subsidy. An existing contract moves into its payout phase instead.']
  };
  function renderWork(){
    var d=workData[document.querySelector('input[name="work"]:checked').value]; var box=document.getElementById('workOut'); box.className='card bg-base-200 border hairline shadow-none outcome '+d[0]; box.querySelector('.status').className='status status-'+(d[0]==='ok'?'success':d[0]==='warn'?'warning':'error'); document.getElementById('workTitle').textContent=d[1]; document.getElementById('workBody').textContent=d[2];
  }
  document.querySelectorAll('input[name="work"]').forEach(function(r){ r.addEventListener('change',renderWork); });
  renderWork();

  // ---------- cost chart ----------
  function series(cost){ var v=0,a=[]; for(var i=1;i<=40;i++){ v=(v+2340)*(1+0.06-cost); a.push(Math.round(v)); } return a; }
  var labels=[]; for(var i=1;i<=40;i++) labels.push(i);
  var bench=series(0.002);
  var costEl=document.getElementById('cost'), chart;
  function chartColors(){ return {p:cssVar('--color-primary'), e:cssVar('--color-error'), g:cssVar('--hairline'), t:cssVar('--ink-soft')}; }
  Chart.defaults.font.family=getComputedStyle(document.body).fontFamily;
  Chart.defaults.font.size=parseFloat(cssVar('--text-sm'))*parseFloat(getComputedStyle(root).fontSize);
  function buildChart(){
    var c=chartColors();
    chart=new Chart(document.getElementById('costChart'),{type:'line',data:{labels:labels,datasets:[
      {label:'0.2 % benchmark',data:bench,borderColor:c.p,backgroundColor:c.p,borderWidth:2,pointRadius:0,tension:.3},
      {label:'your cost',data:series(+costEl.value/100),borderColor:c.e,backgroundColor:c.e,borderWidth:2.5,pointRadius:0,tension:.3,borderDash:[6,4]}
    ]},options:{responsive:true,maintainAspectRatio:false,animation:reduced?false:{duration:500},interaction:{mode:'index',intersect:false},
      scales:{x:{title:{display:true,text:'years saved',color:c.t},grid:{color:c.g},ticks:{color:c.t,maxTicksLimit:9}},y:{ticks:{color:c.t,callback:function(v){return (v/1000)+' k€';}},grid:{color:c.g}}},
      plugins:{legend:{labels:{color:c.t,boxWidth:12}},tooltip:{callbacks:{label:function(ctx){ return ctx.dataset.label+': '+fmt(ctx.parsed.y)+' €'; }}}}}});
  }
  function renderCost(){
    var cost=+costEl.value; document.getElementById('costOut').textContent=cost.toFixed(2);
    var s=series(cost/100), cap=s[39], loss=bench[39]-cap;
    document.getElementById('capOut').textContent=fmt(cap)+' €';
    document.getElementById('lossOut').textContent=(loss>=0?'−':'+')+fmt(Math.abs(loss))+' €';
    document.getElementById('lossBar').style.width=Math.max(0,Math.min(100,loss/bench[39]*100*2))+'%';
    document.getElementById('lossNote').textContent=loss>0?('That is '+(loss/21600).toFixed(1)+'× the entire lifetime Zulage of 21,600 €.'):'Cheaper than a 0.2 % world-ETF setup — only introductory offers get here.';
    document.querySelectorAll('[data-cost]').forEach(function(b){ b.setAttribute('aria-pressed',+b.dataset.cost===cost); });
    if(chart){ chart.data.datasets[1].data=s; chart.data.datasets[1].label='your cost '+cost.toFixed(2)+' %'; chart.update(); }
  }
  function restyleCharts(){ if(chart){ chart.destroy(); buildChart(); renderCost(); } }
  costEl.addEventListener('input',renderCost);
  document.querySelectorAll('[data-cost]').forEach(function(b){ b.addEventListener('click',function(){ costEl.value=b.dataset.cost; costEl.dispatchEvent(new Event('input',{bubbles:true})); }); });
  buildChart(); renderCost();

  // ---------- payout ----------
  var capP=document.getElementById('capP'), lump=document.getElementById('lump'), endAge=document.getElementById('endAge'), rf=document.getElementById('rf');
  function renderPayout(){
    var P=+capP.value, l=+lump.value, end=+endAge.value, f=+rf.value;
    var lumpE=P*l/100, rest=P-lumpE; var n=(end-67)*12, r=0.03/12;
    var planM=rest*r/(1-Math.pow(1+r,-n)); var annM=rest/10000*f;
    var breakeven=67+(planM*n)/annM/12;
    document.getElementById('capPOut').textContent=fmt(P); document.getElementById('lumpOut').textContent=l; document.getElementById('endOut').textContent=end; document.getElementById('rfOut').textContent=f;
    document.getElementById('lumpEur').textContent=fmt(lumpE)+' €';
    document.getElementById('planM').textContent=fmt(planM)+' €';
    document.getElementById('planNote').textContent='for '+(end-67)+' years, 3 % return during payout, capital exhausted at '+end+', remainder inheritable';
    document.getElementById('annM').textContent=fmt(annM)+' €';
    document.getElementById('annNote').textContent='for life; equals the plan\'s total only if you reach '+Math.round(breakeven)+'. Rentenfaktor '+f+' = '+f+' € per month per 10,000 €.';
  }
  [capP,lump,endAge,rf].forEach(function(e){ e.addEventListener('input',renderPayout); }); renderPayout();

  // ---------- death ----------
  var heir='spouse';
  var deathData={
    spouse:{
      save:['ok','Transfer to her contract, no deductions','The whole balance moves into a certified Altersvorsorgevertrag in her name — her existing AVD or a new one. No claw-back, no income tax now, no contribution limits consumed.',['Taxed only when she draws it, at her retirement rate','Inheritance tax: 500,000 € spouse allowance','Her own Zulage and payout window are unchanged']],
      plan:['ok','Remaining plan capital transfers to her','Unpaid remainder of the payout plan is inheritable and can be moved into her contract without deductions, or paid out (then with claw-back).',['She may continue a plan or annuitise later','Still taxed only at her payout']],
      annG:['warn','Payments continue until the guarantee period ends','Your annuity keeps being paid to her for the rest of the 10- or 20-year guarantee period, then stops. Nothing transfers to her depot.',['Choose 20 years at annuitisation if this matters','Payments are taxed as her income']],
      ann:['bad','Payments stop, capital stays in the insurer pool','A lifelong annuity without guarantee period ends with your death. The remaining capital finances other annuitants.',['The reason most advisers suggest a plan or a guarantee period','Nothing to inherit, nothing to tax']]
    },
    son:{
      save:['bad','Paid out after a full claw-back','The ZfA reclaims every Zulage and every Sonderausgaben tax advantage from the capital, the accumulated earnings are taxed as income, and the net is paid to him. He cannot roll it into his own AVD — that privilege is for spouses only.',['Then inheritance tax, 400,000 € allowance per child','Money meant for him is better kept in a normal Depot']],
      plan:['bad','Remainder paid out after claw-back','The unpaid remainder of the payout plan is inheritable, but subsidies on it are reclaimed and earnings taxed before he receives the net.',['A plan at least leaves something; an annuity may not','Inheritance tax allowance 400,000 €']],
      annG:['warn','Payments continue until the guarantee period ends','He receives the annuity payments for the rest of the guarantee period, taxed as his income. Nothing transfers to a depot.',['20-year guarantee = up to 20 years of payments','No lump sum']],
      ann:['bad','Nothing','A lifelong annuity without guarantee period ends with your death.',['Nothing to inherit']]
    }
  };
  function renderDeath(){
    var ph=document.querySelector('input[name="phase"]:checked').value, d=deathData[heir][ph];
    var box=document.getElementById('deathOut'); box.className='card bg-base-200 border hairline shadow-none outcome '+d[0];
    document.getElementById('deathStatus').className='status status-'+(d[0]==='ok'?'success':d[0]==='warn'?'warning':'error');
    document.getElementById('deathTitle').textContent=d[1]; document.getElementById('deathBody').textContent=d[2];
    document.getElementById('deathList').innerHTML=d[3].map(function(x){ return '<li>'+x+'</li>'; }).join('');
  }
  document.querySelectorAll('#heirSeg [data-heir]').forEach(function(b){ b.addEventListener('click',function(){ heir=b.dataset.heir; document.querySelectorAll('#heirSeg [data-heir]').forEach(function(x){ x.setAttribute('aria-pressed',x===b); }); state.heir=heir; saveState(); renderDeath(); }); });
  document.querySelectorAll('input[name="phase"]').forEach(function(r){ r.addEventListener('change',renderDeath); });
  renderDeath(); restoreButton('heir');

  // ---------- son ----------
  var sonYear=document.getElementById('sonYear');
  function renderSon(){
    var y=+sonYear.value, age=2027-y, out=document.getElementById('sonOut');
    if(y>=2020){ out.innerHTML='<div class="alert alert-success alert-soft"><span><b>Frühstart-Rente</b> (law in parliament, planned start 1 Jan 2027): the state pays 10 € a month from age 6 to 18 into a Standarddepot in his name — 1,440 € total; you may add up to 6,840 € a year; no acquisition costs before 18; earnings tax-free; payout not before 65. Born 2020: the 2026 months are paid retroactively. If you open nothing, the Bundesbank invests the money collectively and it can be claimed until age 35.</span></div>'; }
    else if(age<16){ out.innerHTML='<div class="alert alert-warning alert-soft"><span>Born '+y+': <b>no state 10 €</b> (only cohorts from 2020). You may open an unsubsidised Standarddepot for him (tax-free growth, same lock-up until 65), but a normal Junior-Depot with free access at 18 is usually more useful.</span></div>'; }
    else { out.innerHTML='<div class="alert alert-info alert-soft"><span>Born '+y+', '+age+' in 2027: once he is in an apprenticeship or job with GRV membership he can open <b>his own AVD</b> with full Zulage (50 % on the first 360 €) and the 200 € youth bonus if the contract starts before 25. No Frühstart-Rente for his cohort.</span></div>'; }
  }
  sonYear.addEventListener('input',renderSon); renderSon();
})();
