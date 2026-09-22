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
    bar.append(status,play,retry,link);
    const box=frame.closest('.aec-video-frame') || frame.parentElement;
    box.insertAdjacentElement('afterend',bar);
    play.onclick=()=>{const p=players.get(frame);if(p){p.mute();p.playVideo();}else status.textContent='Use the player or open the publisher link.';};
    retry.onclick=()=>{const p=players.get(frame);if(p){p.mute();p.playVideo();}else frame.src=url.href;status.textContent='Retry requested; publisher availability may vary.';};
    api().then(()=>{
      if (!frame.isConnected) return;
      const p=new YT.Player(frame.id,{events:{
        onReady:e=>{status.textContent='Ready — press Play if autoplay is blocked.';e.target.mute();},
        onStateChange:e=>{status.textContent=({1:'Playing — publisher content',2:'Paused',3:'Buffering…',0:'Video ended',5:'Ready'})[e.data] || 'Waiting for playback';},
        onAutoplayBlocked:()=>{status.textContent='Autoplay blocked — press Play muted.';},
        onError:e=>{status.textContent='Publisher playback unavailable (code '+e.data+'). Try the publisher link.';}
      }}); players.set(frame,p);
    }).catch(()=>{status.textContent='Playback status unavailable — use the player or publisher link.';});
  }
  enhance.count=0;
  function scan(){
    document.querySelectorAll('iframe[src]').forEach(enhance);
    document.querySelectorAll('.tradingview-widget-container').forEach(box=>{
      if(box.dataset.aecFeedNotice)return;box.dataset.aecFeedNotice='1';
      const p=document.createElement('p');p.className='aec-feed-note';
      p.textContent='Third-party market data · may be delayed. Public real-time futures/equity feed not configured. Confirm instrument, venue and timestamp before use.';
      box.insertAdjacentElement('afterend',p);
    });
  }
  const style=document.createElement('style');
  style.textContent='.aec-media-tools{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(150,160,175,.3);border-radius:6px;font:12px/1.5 system-ui,sans-serif;background:#131b24;color:#edf1f5;margin:8px 0 16px}.aec-media-tools span{flex:1 1 180px}.aec-media-tools button,.aec-media-tools a{font:inherit;color:#edf1f5;background:#243243;border:1px solid #61718a;border-radius:4px;padding:6px 10px;text-decoration:none;cursor:pointer}.aec-media-tools :focus-visible{outline:2px solid #f2cf87;outline-offset:3px}.aec-feed-note{font:12px/1.5 system-ui,sans-serif;color:inherit;opacity:.8;padding:8px 0;margin:4px 0 12px;overflow-wrap:anywhere}';
  style.textContent += ':where(a,button,input,select,textarea):focus-visible{outline:2px solid #c9a96e;outline-offset:4px}.aec-media-tools{box-sizing:border-box;max-width:100%}.aec-media-tools button,.aec-media-tools a{min-height:40px;display:inline-flex;align-items:center}.aec-media-tools a:hover,.aec-media-tools button:hover{border-color:#c9a96e;background:#2c3b4d}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}';
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
