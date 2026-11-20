/* Ascenda media resilience. Existing content and consent gates are preserved. */
(() => {
  'use strict';
  const seen = new WeakSet(), players = new Map();
  let apiPromise;
  function api() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (typeof previous === 'function') previous(); resolve(); };
      const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = () => reject(new Error('Video controls unavailable')); document.head.appendChild(s);
      setTimeout(() => { if (!(window.YT && window.YT.Player)) reject(new Error('Video controls timed out')); }, 15000);
    });
    return apiPromise;
  }
  function enhance(frame) {
    if (seen.has(frame) || frame.dataset.aecEnhanced === '1') return;
    let url;
    try { url = new URL(frame.getAttribute('src') || '', location.href); } catch (_) { return; }
    if (!['www.youtube.com','www.youtube-nocookie.com'].includes(url.hostname) || !url.pathname.startsWith('/embed/')) return;
    seen.add(frame); frame.dataset.aecEnhanced = '1';
    frame.title ||= 'Publisher video player'; frame.allowFullscreen = true;
    frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    url.searchParams.set('enablejsapi','1'); url.searchParams.set('origin',location.origin);
    url.searchParams.set('playsinline','1'); url.searchParams.set('controls','1');
    frame.src = url.href;
    if (!frame.id) frame.id = 'aec-player-' + (++enhance.count);
    const bar = document.createElement('div'); bar.className = 'aec-media-tools';
    const status = document.createElement('span'); status.textContent = 'Connecting to publisher…'; status.setAttribute('role','status');
    const play = document.createElement('button'); play.type='button'; play.textContent='Play muted';
    const retry = document.createElement('button'); retry.type='button'; retry.textContent='Retry';
    const link = document.createElement('a'); link.textContent='Open on YouTube ↗'; link.target='_blank'; link.rel='noopener noreferrer';
    const channel=url.searchParams.get('channel'), id=url.pathname.split('/').pop();
    link.href=channel ? 'https://www.youtube.com/channel/'+encodeURIComponent(channel)+'/live' : 'https://www.youtube.com/watch?v='+encodeURIComponent(id);
    bar.append(status,play,retry,link);frame._aecBar=bar;if(!frame.dataset.aecCh){const c0=chanOf(frame);if(c0)frame.dataset.aecCh=c0}if(!frame.dataset.aecOrig)frame.dataset.aecOrig=nameOf(frame);
    const box=frame.closest('.aec-video-frame') || frame.parentElement;
    box.insertAdjacentElement('afterend',bar);
    play.onclick=()=>{const p=players.get(frame);if(p){p.mute();p.playVideo();}else status.textContent='Use the player or open the publisher link.';};
    retry.onclick=()=>{const p=players.get(frame);if(p){p.mute();p.playVideo();}else frame.src=url.href;status.textContent='Retry requested; publisher availability may vary.';};
    api().then(()=>{
      if (!frame.isConnected) return;
      const p=new YT.Player(frame.id,{events:{
        onReady:e=>{status.textContent='Ready — press Play if autoplay is blocked.';e.target.mute();},
        onStateChange:e=>{stamp(frame,e.data);status.textContent=({1:'Playing — publisher content',2:'Paused',3:'Buffering…',0:'Video ended',5:'Ready'})[e.data] || 'Waiting for playback';},
        onAutoplayBlocked:()=>{status.textContent='Autoplay blocked — press Play muted.';},
        onError:e=>{status.textContent='Feed unavailable (code '+e.data+'), loading another live feed…';rotate(frame,'error '+e.data);}
      }}); players.set(frame,p);
    }).catch(()=>{status.textContent='Playback status unavailable — use the player or publisher link.';});
  }

  /* ---- video guard: when a feed is blocked, ended, or stuck, load a replacement live feed automatically ---- */
  const POOL=[['Bloomberg TV','UCIALMKvObZNtJ6AmdCLP7Lg'],['CNBC','UCrp_UI8XtuYfpiqluWLD1Lw'],['Yahoo Finance','UCEAZeUIeJs0IjQiqTCdVSIg'],['Sky News','UCoMdktPbSTixAyNGwb-UYkQ'],['Al Jazeera English','UCNye-wNBqNL5ZzHSJj3l8Bg'],['DW News','UCknLrEdhRCp1aegoMqRaCZg'],['France 24 English','UCQfwfsi5VrQ8yKZ-UWmAEFg'],['Euronews English','UCSrZ3UV4jOidv8ppoVuvW9Q'],['ABC News Live','UCBi2mrWuNuyYy4gbM6fU18Q'],['NBC News','UCeY0bbntWzzVIaj2z3QigXg'],['CBS News','UC8p1vwvWtl6T73JiExfWs1g'],['WION','UC_gUM8rL-Lrg6O3adPW9K1g'],['TRT World','UC7fWeaHhqgM4Ry-RMpM2YYw'],['LiveNOW from FOX','UCJg9wBPyKMNA5sRDnvzmkdg'],['CGTN','UCgrNz-aDmcr2uuto8_DL2jg'],['ABC News Australia','UCVgO39Bk5sMo66-6o6Spn6Q'],['Al Arabiya English','UCaEKnVtSxcTh-bZhuqwAuUw'],['NBC News NOW','UCdUCBzZCacPI61FdL7x9yvQ'],['Fox Business','UC7UQyQ1NRIAIDMKn75WYwlw'],['Reuters','UCjTMxYSAvQ9DNPYjtxNgkCw'],['CNA (Channel NewsAsia)','UC83jt4dlz1Gjl58fzQrrKZg']];
  const ALIAS={'bloomberg':'bloomberg tv','livenow':'livenow from fox','livenow (fox)':'livenow from fox','cna':'cna (channel newsasia)'};
  const BYNAME=new Map(POOL.map(x=>[x[0].toLowerCase(),x]));
  const BAD=new Map();
  const norm=n=>{n=(n||'').toLowerCase().trim();return ALIAS[n]||n};
  function cardOf(f){return f.closest('.aec-feed-card,.panel')}
  function labelEl(f){const c=cardOf(f);return c?c.querySelector('header span:not(.aec-live-dot):last-of-type,.tag'):null}
  function nameOf(f){if(f.dataset.aecName)return f.dataset.aecName;const e=labelEl(f);return e?e.textContent.replace(/\s+/g,' ').trim():''}
  function chanOf(f){try{const u=new URL(f.getAttribute('src'),location.href);const c=u.searchParams.get('channel');if(c)return c}catch(_){}const e=BYNAME.get(norm(nameOf(f)));return e?e[1]:''}
  function shown(){const set=new Set();document.querySelectorAll('iframe[data-aec-ch]').forEach(f=>set.add(f.dataset.aecCh));return set}
  function pick(f){
    const tried=new Set((f.dataset.aecTried||'').split(',').filter(Boolean)), now=Date.now(), on=shown();
    const own=BYNAME.get(norm(f.dataset.aecOrig||nameOf(f)));
    const cands=[]; if(own)cands.push(own);
    const rest=POOL.filter(x=>!(own&&x[1]===own[1])).sort(()=>Math.random()-.5);
    rest.forEach(x=>cands.push(x));
    for(const c of cands){ if(tried.has(c[1]))continue; if(BAD.has(c[1])&&now-BAD.get(c[1])<15*60000)continue; if(on.has(c[1])&&!(own&&c[1]===own[1]))continue; return c; }
    tried.clear(); f.dataset.aecTried=''; return rest[0];
  }
  function rotate(f,why){
    if(!f.isConnected||f._rot)return; const now=Date.now();
    f._hist=(f._hist||[]).filter(t=>now-t<10*60000); if(f._hist.length>=4&&why.indexOf('error')<0)return; f._hist.push(now);
    f._rot=1; const cur=chanOf(f); let viaCh=false; try{viaCh=!!new URL(f.getAttribute('src'),location.href).searchParams.get('channel')}catch(_){} if(cur&&viaCh)BAD.set(cur,now);
    const c=pick(f); if(!c){f._rot=0;return}
    const n=document.createElement('iframe');
    n.src='https://www.youtube.com/embed/live_stream?channel='+encodeURIComponent(c[1])+'&autoplay=1&mute=1&playsinline=1';
    n.className=f.className; n.style.cssText=f.style.cssText; if(f.width)n.width=f.width; if(f.height)n.height=f.height;
    n.title='Live feed: '+c[0]; n.allowFullscreen=true;
    n.dataset.aecName=c[0]; n.dataset.aecOrig=f.dataset.aecOrig||nameOf(f); n.dataset.aecCh=c[1];
    n.dataset.aecTried=((f.dataset.aecTried||'')+','+(cur||'')+','+c[1]).replace(/^,+/,'');
    try{const p=players.get(f);if(p&&p.destroy)p.destroy()}catch(_){}
    players.delete(f); if(f._aecBar)f._aecBar.remove();
    const el=labelEl(f); if(el)el.textContent=c[0];
    const card=cardOf(f); if(card){const a=card.querySelector('a[href*="youtube.com"]');if(a)a.href='https://www.youtube.com/channel/'+c[1]+'/live'}
    f.replaceWith(n);
  }
  function stamp(f,state){f._st=state;f._since=Date.now();if(state===1){f._played=Date.now();f._kick=0;if(f._hist&&Date.now()-f._played>0)f.dataset.aecTried=''}if(state===0)rotate(f,'ended')}
  setInterval(()=>{
    players.forEach((p,f)=>{
      if(!f.isConnected){players.delete(f);return}
      let st;try{st=p.getPlayerState()}catch(_){return}
      const age=Date.now()-(f._since||Date.now());
      if(st===0){rotate(f,'ended');return}
      if(st===3&&age>90000){rotate(f,'stuck buffering');return}
      if((st===-1||st===5)&&age>20000&&!f._kick){f._kick=1;try{p.mute();p.playVideo()}catch(_){}}
      if((st===-1||st===5)&&age>60000){rotate(f,'never started')}
    });
  },10000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)return;players.forEach((p,f)=>{try{if(p.getPlayerState()!==1){p.mute();p.playVideo()}}catch(_){}})});
  enhance.count=0;
  function scan(){
    document.querySelectorAll('iframe[src]').forEach(enhance);
    document.querySelectorAll('.tradingview-widget-container').forEach(box=>{
      if(box.dataset.aecFeedNotice)return;box.dataset.aecFeedNotice='1';return;
      const p=document.createElement('p');p.className='aec-feed-note';
      p.textContent='Market data: Yahoo Finance free feed. It can be delayed and is not a trading feed. Confirm instrument, venue and timestamp before use.';
      box.insertAdjacentElement('afterend',p);
    });
  }
  const style=document.createElement('style');
  style.textContent='.aec-media-tools{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(150,160,175,.3);border-radius:6px;font:12px/1.5 system-ui,sans-serif;background:#1b1b1b;color:#edf1f5;margin:8px 0 16px}.aec-media-tools span{flex:1 1 180px}.aec-media-tools button,.aec-media-tools a{font:inherit;color:#edf1f5;background:#333333;border:1px solid #747474;border-radius:4px;padding:6px 10px;text-decoration:none;cursor:pointer}.aec-media-tools :focus-visible{outline:2px solid #f2cf87;outline-offset:3px}.aec-feed-note{font:12px/1.5 system-ui,sans-serif;color:inherit;opacity:.8;padding:8px 0;margin:4px 0 12px;overflow-wrap:anywhere}';
  style.textContent += ':where(a,button,input,select,textarea):focus-visible{outline:2px solid #c9a96e;outline-offset:4px}.aec-media-tools{box-sizing:border-box;max-width:100%}.aec-media-tools button,.aec-media-tools a{min-height:40px;display:inline-flex;align-items:center}.aec-media-tools a:hover,.aec-media-tools button:hover{border-color:#c9a96e;background:#3c3c3c}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}';
  document.head.appendChild(style);
  const market=document.createElement('section');
  market.className='aec-media-tools';market.style.margin='24px';
  const intro=document.createElement('div');intro.style.flex='1 1 100%';
  const heading=document.createElement('h2');heading.textContent='Crypto market snapshot';heading.style.font='600 18px/1.4 system-ui';
  const disclosure=document.createElement('p');disclosure.textContent='Bitcoin / USD · CoinMarketCap-hosted data. Provider controls pricing and refresh frequency; this is not a CME futures or equities feed. Loading connects to CoinMarketCap and shares normal browser/network information under its privacy terms.';
  const privacy=document.createElement('a');privacy.href='https://coinmarketcap.com/privacy/';privacy.textContent='Provider privacy policy';privacy.target='_blank';privacy.rel='noopener noreferrer';
  const load=document.createElement('button');load.type='button';load.textContent='Load Bitcoin market card';
  const fallback=document.createElement('a');fallback.href='https://coinmarketcap.com/currencies/bitcoin/';fallback.textContent='View Bitcoin on CoinMarketCap ↗';fallback.target='_blank';fallback.rel='noopener noreferrer';
  const state=document.createElement('span');state.setAttribute('role','status');state.textContent='Not connected';
  const slot=document.createElement('div');slot.style.cssText='flex:1 1 100%;min-width:0';
  intro.append(heading,disclosure);market.append(intro,load,fallback,privacy,state,slot);
  const footer=document.querySelector('footer');if(footer)footer.before(market);else document.body.append(market);
  load.onclick=()=>{
    load.disabled=true;state.textContent='Requesting provider widget…';
    const card=document.createElement('div');card.className='coinmarketcap-currency-widget';
    Object.entries({currencyid:'1',base:'USD',secondary:'',ticker:'true',rank:'true',marketcap:'true',volume:'true',statsticker:'true',stats:'USD'}).forEach(([k,v])=>card.setAttribute('data-'+k,v));
    slot.append(card);
    const script=document.createElement('script');script.src='https://files.coinmarketcap.com/static/widget/currency.js';
    script.onload=()=>{state.textContent='Provider script loaded; if no quote appears, use the provider link. Refresh timing is provider-controlled.';};
    script.onerror=()=>{state.textContent='Provider unavailable — use the CoinMarketCap link.';};
    document.head.append(script);
  };
  scan();
  let pending=false;
  new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;scan();});}}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
})();
