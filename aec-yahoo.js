/* AEC Yahoo Finance widgets. Replaces the TradingView embeds.
 * Data comes from Yahoo Finance, written to yahoo_quotes.json by a scheduled GitHub Action (tools/pull_yahoo.py),
 * or from a faster proxy if window.AEC_YAHOO_API is set (see yahoo-worker.js). Yahoo data can be delayed;
 * every widget shows the time of the last update. Not investment advice.
 * Widgets are declared as <script type="application/json" data-aec-yahoo="tape|mini|overview|snapshot|screener">{config}</script>
 * placed after an (empty) <div class="tradingview-widget-container__widget"></div>. */
(function(){
'use strict';
var FILE=(window.AEC_YAHOO_FILE||'yahoo_quotes.json'), API=window.AEC_YAHOO_API||'';
var STATE={q:{},asof:0,ok:false,err:''}, SUBS=[], timer=null;
var CSS='.aecy{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#ececec;width:100%;box-sizing:border-box;font-variant-numeric:tabular-nums}'
+'.aecy *{box-sizing:border-box}.aecy .up{color:#3ddc97}.aecy .dn{color:#ff5f56}.aecy .dim{color:#8a8a8a}'
+'.aecy .pill{display:inline-block;padding:1px 7px;border-radius:3px;font-size:11px;font-weight:600}.aecy .pill.up{background:rgba(61,220,151,.13)}.aecy .pill.dn{background:rgba(255,95,86,.13)}.aecy .pill.fl{background:#1c1c1c;color:#8a8a8a}'
+'.aecy-tape{display:flex;overflow:hidden;white-space:nowrap;background:#0b0b0b;border-top:1px solid #2c2c2c;border-bottom:1px solid #2c2c2c}'
+'.aecy-tape .trk{display:flex;flex:none;width:max-content;animation:aecyscroll 40s linear infinite;will-change:transform}.aecy-tape:hover .trk{animation-play-state:paused}'
+'.aecy-tape .it{display:flex;flex:none;align-items:baseline;gap:9px;padding:10px 22px;border-right:1px solid #1f1f1f}'
+'.aecy-tape .it b{font-weight:600;color:#bdbdbd;font-size:11px;letter-spacing:.06em;text-transform:uppercase}.aecy-tape .it .v{font-size:14px;font-weight:600;color:#fff}'
+'@keyframes aecyscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}'
+'@media (prefers-reduced-motion:reduce){.aecy-tape .trk{animation:none}.aecy-tape{overflow-x:auto}}'
+'.aecy-mini{border:1px solid #2c2c2c;background:linear-gradient(180deg,#121212,#0b0b0b);padding:12px 14px;display:flex;flex-direction:column;justify-content:space-between;min-height:100px}'
+'.aecy-mini .hd{display:flex;justify-content:space-between;gap:8px;align-items:center}.aecy-mini .nm{color:#bdbdbd;letter-spacing:.08em;font-size:11px;text-transform:uppercase}'
+'.aecy-mini .px{font-size:24px;font-weight:600;margin-top:4px;color:#fff;letter-spacing:-.01em}.aecy-mini svg{width:100%;height:48px;display:block;margin-top:8px}'
+'.aecy table{width:100%;border-collapse:collapse}.aecy th,.aecy td{padding:9px 10px;border-bottom:1px solid #1f1f1f;text-align:right;font-weight:400}'
+'.aecy td:nth-child(2){color:#fff;font-weight:600}.aecy th:first-child,.aecy td:first-child{text-align:left}.aecy td:first-child{color:#d6d6d6}.aecy th{color:#8a8a8a;font-size:10px;letter-spacing:.1em;text-transform:uppercase;border-bottom:1px solid #2c2c2c}'
+'.aecy .tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px}.aecy .tabs button{background:transparent;border:1px solid #2c2c2c;color:#bdbdbd;padding:6px 12px;cursor:pointer;font:inherit;min-height:34px;letter-spacing:.04em}'
+'.aecy .tabs button.on{background:#ececec;color:#060606;border-color:#ececec}.aecy td svg{width:90px;height:22px;vertical-align:middle}'
+'.aecy-snap{border:1px solid #2c2c2c;background:linear-gradient(180deg,#121212,#0b0b0b);padding:14px 16px}.aecy-snap svg{width:100%;height:100%;display:block}'
+'.aecy-snap .row{display:flex;gap:26px;flex-wrap:wrap;align-items:flex-end}.aecy-snap .row div{min-width:80px}.aecy-snap .row small{display:block;color:#8a8a8a;font-size:10px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:2px}'
+'.aecy-snap .sp{margin-top:12px}.aecy-foot{display:none!important;color:#7a7a7a;font-size:10px;margin-top:6px;letter-spacing:.02em}.aecy-foot.stale{color:#ff5f56}'
+'@media (max-width:640px){.aecy td svg{display:none}.aecy-tape .it{padding:9px 14px}}';
function inject(){if(document.getElementById('aecy-css'))return;var s=document.createElement('style');s.id='aecy-css';s.textContent=CSS;document.head.appendChild(s)}
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(p,sym){if(p==null||isNaN(p))return '–';var a=Math.abs(p),d=a>=1000?2:a>=10?2:a>=1?3:5;if(/=X$/.test(sym||'')&&a<200&&a>=1)d=4;return p.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})}
function pc(q){if(!q||q.p==null||!q.pc)return null;return (q.p/q.pc-1)*100}
function chg(q){var v=pc(q);if(v==null)return '<span class="pill fl">–</span>';return '<span class="pill '+(v>=0?'up':'dn')+'">'+(v>=0?'▲ ':'▼ ')+Math.abs(v).toFixed(2)+'%</span>'}
function spark(arr,up,w,h){if(!arr||arr.length<2)return '';var mn=Math.min.apply(null,arr),mx=Math.max.apply(null,arr),r=(mx-mn)||1,W=w||100,H=h||30,pts=arr.map(function(v,i){return (i/(arr.length-1)*W).toFixed(1)+','+(H-2-((v-mn)/r)*(H-4)).toFixed(1)}).join(' ');
 var col=up?'#3ddc97':'#ff5f56';return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" aria-hidden="true"><polygon fill="'+col+'" fill-opacity=".10" points="0,'+H+' '+pts+' '+W+','+H+'"/><polyline fill="none" stroke="'+col+'" stroke-width="1.6" vector-effect="non-scaling-stroke" points="'+pts+'"/></svg>'}
function ago(){if(!STATE.asof)return 'no data yet';var m=Math.round((Date.now()-STATE.asof)/60000);
 var t=new Date(STATE.asof).toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit'})+' ET';
 return 'Yahoo Finance · updated '+t+(m>=1?' ('+m+' min ago)':'')}
function foot(el){var f=el.querySelector('.aecy-foot');if(!f)return;var stale=STATE.asof&&Date.now()-STATE.asof>20*60000;
 f.className='aecy-foot'+(stale||!STATE.ok?' stale':'');f.textContent=(STATE.asof?ago()+(stale?' · STALE, prices may be old':'')+' · may be delayed':'Waiting for the first Yahoo Finance update (the data job has not run yet)')}
// ---- renderers: each returns {el, draw()}
function shell(host,cls){var d=document.createElement('div');d.className='aecy '+cls;host.innerHTML='';host.appendChild(d);return d}
function mk(type,host,cfg){
 var root=shell(host,'');
 if(type==='tape'){var items=(cfg.symbols||[]).map(function(s){return [s.y||s.proName,s.title||s.y]});
  root.innerHTML='<div class="aecy-tape"><div class="trk"></div></div><div class="aecy-foot"></div>';var trk=root.querySelector('.trk');
  return function(){var h=items.map(function(it){var q=STATE.q[it[0]];return '<span class="it"><b>'+esc(it[1])+'</b><span class="v">'+fmt(q&&q.p,it[0])+'</span>'+chg(q)+'</span>'}).join('');trk.innerHTML=h+h;foot(root)}}
 if(type==='mini'){var sy=cfg.y||cfg.symbol,nm=cfg.title||sy,ht=parseInt(cfg.height,10)||120;
  root.innerHTML='<div class="aecy-mini" style="min-height:'+ht+'px"><div class="hd"><span class="nm">'+esc(nm)+'</span><span class="ch"></span></div><div class="px"></div><div class="sp"></div></div><div class="aecy-foot"></div>';
  return function(){var q=STATE.q[sy],v=pc(q);root.querySelector('.ch').innerHTML=chg(q);root.querySelector('.px').textContent=fmt(q&&q.p,sy);root.querySelector('.sp').innerHTML=spark(q&&q.spark,v==null||v>=0);foot(root)}}
 if(type==='overview'){var tabs=(cfg.tabs||[]).map(function(t){return {title:t.title,rows:(t.symbols||[]).map(function(s){return [s.y||s.s,s.d||s.s]})}}),cur=0;
  root.innerHTML='<div class="tabs"></div><table><thead><tr><th>Symbol</th><th>Last</th><th>Chg</th><th>1D</th></tr></thead><tbody></tbody></table><div class="aecy-foot"></div>';
  var tb=root.querySelector('.tabs');tabs.forEach(function(t,i){var b=document.createElement('button');b.type='button';b.textContent=t.title;b.onclick=function(){cur=i;draw()};tb.appendChild(b)});
  function draw(){[].forEach.call(tb.children,function(b,i){b.className=i===cur?'on':''});
   root.querySelector('tbody').innerHTML=(tabs[cur]?tabs[cur].rows:[]).map(function(r){var q=STATE.q[r[0]],v=pc(q);return '<tr><td>'+esc(r[1])+'</td><td>'+fmt(q&&q.p,r[0])+'</td><td>'+chg(q)+'</td><td>'+spark(q&&q.spark,v==null||v>=0,90,22)+'</td></tr>'}).join('');foot(root)}
  return draw}
 if(type==='snapshot'){var s2=cfg.y||cfg.symbol,n2=cfg.title||s2,ht2=parseInt(cfg.height,10)||200;
  root.innerHTML='<div class="aecy-snap"><div class="row"><div><small>'+esc(n2)+'</small><b class="px" style="font-size:22px"></b></div><div><small>Change</small><b class="ch"></b></div><div><small>Day high</small><b class="hi"></b></div><div><small>Day low</small><b class="lo"></b></div><div><small>Prev close</small><b class="pv"></b></div></div><div class="sp" style="height:'+Math.max(120,ht2-120)+'px"></div></div><div class="aecy-foot"></div>';
  return function(){var q=STATE.q[s2]||{},v=pc(q);root.querySelector('.px').textContent=fmt(q.p,s2);root.querySelector('.ch').innerHTML=chg(q);root.querySelector('.hi').textContent=fmt(q.h,s2);root.querySelector('.lo').textContent=fmt(q.l,s2);root.querySelector('.pv').textContent=fmt(q.pc,s2);
   var sp=root.querySelector('.sp');sp.innerHTML=spark(q.spark,v==null||v>=0,600,200).replace('<svg ','<svg style="height:100%" ');foot(root)}}
 if(type==='screener'){var rows=(cfg.rows||[]);
  root.innerHTML='<table><thead><tr><th>Market</th><th>Last</th><th>Chg</th><th>High</th><th>Low</th></tr></thead><tbody></tbody></table><div class="aecy-foot"></div>';
  return function(){root.querySelector('tbody').innerHTML=rows.map(function(r){var q=STATE.q[r[0]]||{};return '<tr><td>'+esc(r[1])+'</td><td>'+fmt(q.p,r[0])+'</td><td>'+chg(q)+'</td><td>'+fmt(q.h,r[0])+'</td><td>'+fmt(q.l,r[0])+'</td></tr>'}).join('');foot(root)}}
 return function(){}}
function load(){
 var urls=[];if(API){var all=window.AEC_YAHOO_SYMBOLS||[];urls.push(API+(API.indexOf('?')<0?'?':'&')+'symbols='+encodeURIComponent(all.join(',')))}
 urls.push(FILE+(FILE.indexOf('?')<0?'?':'&')+'t='+Math.floor(Date.now()/15000));
 var i=0;(function next(){if(i>=urls.length){STATE.ok=false;redraw();return}
  fetch(urls[i++],{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
   if(!d||!d.quotes)throw 0;STATE.q=d.quotes;STATE.asof=d.asof?Date.parse(d.asof):Date.now();STATE.ok=true;redraw()}).catch(next)})()}
function redraw(){SUBS.forEach(function(f){try{f()}catch(e){}})}
function boot(){inject();
 document.querySelectorAll('script[data-aec-yahoo]').forEach(function(s){
  var cfg;try{cfg=JSON.parse(s.textContent)}catch(e){return}
  var host=s.previousElementSibling;while(host&&!(host.classList&&host.classList.contains('tradingview-widget-container__widget')))host=host.previousElementSibling;
  if(!host)host=s.parentNode;
  var f=mk(s.getAttribute('data-aec-yahoo'),host,cfg);SUBS.push(f);f()});
 document.querySelectorAll('[data-aec-yahoo-chart]').forEach(function(h){var cfg={y:h.getAttribute('data-aec-yahoo-chart'),title:h.getAttribute('data-title'),height:h.getAttribute('data-height')||400};var f=mk('snapshot',h,cfg);SUBS.push(f);f()});
 load();clearInterval(timer);timer=setInterval(load,API?15000:30000);
 document.addEventListener('visibilitychange',function(){if(!document.hidden)load()})}
window.AECY={reload:load,state:STATE};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
