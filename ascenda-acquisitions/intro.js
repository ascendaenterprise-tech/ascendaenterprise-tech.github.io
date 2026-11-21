/* Opening intro: diamond layers drop into place, then the curtain sweeps away.
   Plays on a visit if not seen in the last 30 minutes. Skip button, click or any key skips it.
   Configure with data-* on the script tag. */
(function(){
  var s=document.currentScript||{getAttribute:function(){return null}};
  function a(k,d){return (s.getAttribute&&s.getAttribute('data-'+k))||d}
  var KEY='aecIntro_'+a('key','site'), GAP=30*60*1000, now=Date.now();
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var last=0; try{last=+localStorage.getItem(KEY)||0}catch(e){}
  if(reduce||/[?&]nointro/.test(location.search)||location.hash||(now-last)<GAP) return;
  try{localStorage.setItem(KEY,String(now))}catch(e){}
  var bg=a('bg','#100826'),bg2=a('bg2','#2a1666'),fg=a('fg','#f4f2fb'),ac=a('accent','#ffd60a'),mut=a('mut','#b9b2d6');
  var css='#aecI{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:radial-gradient(ellipse at 50% 42%,'+bg2+','+bg+' 68%);color:'+fg+';cursor:pointer;transition:transform 1.1s cubic-bezier(.7,0,.2,1)}'
  +'#aecI.go{transform:translateX(108%) skewX(-14deg)}'
  +'#aecI .rule{position:absolute;left:50%;top:0;width:1px;height:0;background:linear-gradient('+ac+',transparent);animation:aiR 1s .05s cubic-bezier(.3,.7,.2,1) forwards}'
  +'@keyframes aiR{to{height:100%}}'
  +'#aecI .stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.15rem}'
  +'#aecI svg{width:min(32vw,160px);min-width:104px;height:auto;overflow:visible;filter:drop-shadow(0 18px 26px rgba(0,0,0,.45))}'
  +'#aecI polygon{fill:none;stroke:'+ac+';stroke-linejoin:miter;transform-box:fill-box;transform-origin:center;opacity:0;animation:aiD .85s cubic-bezier(.22,.9,.24,1.1) forwards}'
  +'#aecI polygon:nth-child(1){animation-delay:.2s}#aecI polygon:nth-child(2){animation-delay:.34s}#aecI polygon:nth-child(3){animation-delay:.48s}#aecI polygon:nth-child(4){animation-delay:.62s}#aecI polygon:nth-child(5){animation-delay:.76s}'
  +'@keyframes aiD{0%{opacity:0;transform:translateY(-140px) scale(1.5) rotate(-24deg)}60%{opacity:1}100%{opacity:1;transform:none}}'
  +'#aecI .w{font:700 clamp(.8rem,2.1vw,1.1rem)/1 "Chakra Petch","Helvetica Neue",Arial,sans-serif;letter-spacing:.44em;text-transform:uppercase;padding-left:.44em;opacity:0;transform:translateY(12px);animation:aiU .7s 1.5s forwards;text-align:center}'
  +'#aecI .u{font:400 clamp(.6rem,1.5vw,.76rem)/1.6 ui-monospace,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase;color:'+mut+';opacity:0;animation:aiU .7s 1.85s forwards;text-align:center;padding:0 16px}'
  +'@keyframes aiU{to{opacity:1;transform:none}}'
  +'#aecI .k{position:absolute;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));background:none;border:1px solid '+mut+';color:'+fg+';font:11px ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;padding:8px 12px;cursor:pointer;opacity:0;animation:aiU .4s .6s forwards}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var el=document.createElement('div');el.id='aecI';el.setAttribute('role','presentation');el.setAttribute('aria-hidden','true');
  el.innerHTML='<div class="rule"></div><div class="stage"><svg viewBox="-72 -72 144 144" stroke-width="3"><polygon points="0,-66 66,0 0,66 -66,0"/><polygon points="0,-51 51,0 0,51 -51,0"/><polygon points="0,-37 37,0 0,37 -37,0"/><polygon points="0,-23 23,0 0,23 -23,0"/><polygon points="0,-9 9,0 0,9 -9,0"/></svg><div class="w"></div><div class="u"></div></div><button class="k" type="button">Skip</button>';
  el.querySelector('.w').textContent=a('word','Ascenda Acquisitions');
  el.querySelector('.u').textContent=a('sub','');
  document.body.appendChild(el);
  var de=document.documentElement,prev=de.style.overflow;de.style.overflow='hidden';var done=false;
  function open(){if(done)return;done=true;el.classList.add('go');setTimeout(function(){de.style.overflow=prev;el.remove()},1200)}
  setTimeout(open,3300);el.addEventListener('click',open);document.addEventListener('keydown',open,{once:true});
})();
