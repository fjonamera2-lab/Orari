/* Njoftimet e orarit: (1) kallëzim brenda aplikacionit kur orari ndryshon, (2) njoftim i vërtetë me OneSignal (opsional) */
(function(){
  var C=window.ORARI_CILESIMET||{};
  if(C.mbyllur)return;
  var FILES=['orari_dita.html','orari_kp.html'];
  var $=function(id){return document.getElementById(id);};
  function get(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function set(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  var css=document.createElement('style');
  css.textContent='.nj{display:none;margin:0 0 12px;padding:12px 14px;border-radius:14px;border:1px solid var(--gold-glow,rgba(240,180,41,.35));background:var(--gold-dim,rgba(240,180,41,.12));color:var(--text,#f2f0f8);font-size:14px;line-height:1.4;text-align:center}'
   +'.nj.show{display:block}.nj b{color:var(--gold,#f0b429)}.nj small{display:block;margin-top:2px;color:var(--text-dim,#b4b1c4);font-size:12px}'
   +'.nj button{margin-top:10px;width:100%;padding:10px;border:0;border-radius:10px;background:var(--gold,#f0b429);color:#1a1300;font-family:inherit;font-weight:700;font-size:14px;cursor:pointer}'
   +'.njbtn{display:none;width:100%;margin-top:10px;padding:11px 14px;border-radius:14px;border:1px solid var(--gold-glow,rgba(240,180,41,.35));background:transparent;color:var(--gold,#f0b429);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer}'
   +'.njbtn.show{display:block}.njok{display:none;margin-top:10px;text-align:center;color:var(--text-dim,#b4b1c4);font-size:12px}.njok.show{display:block}';
  document.head.appendChild(css);
  function fmt(d){var m=['janar','shkurt','mars','prill','maj','qershor','korrik','gusht','shtator','tetor','nëntor','dhjetor'];return d.getDate()+' '+m[d.getMonth()]+' '+d.getFullYear()+', '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}

  /* 1. Kallëzimi brenda aplikacionit (pa llogari, pa shërbim të jashtëm) */
  function checkUpdate(){
    if(!window.fetch)return;
    var LABELS={'orari_dita.html':'Orari i ditës','orari_kp.html':'Orari i kohës së pjesshme'};
    Promise.all(FILES.map(function(f){
      return fetch(f,{cache:'no-cache'}).then(function(r){
        if(!r.ok)return {sig:'',txt:''};
        var sig=r.headers.get('last-modified')||r.headers.get('etag')||'';
        return r.text().then(function(t){
          var m=t.match(/class="upd">\s*Përditësuar:\s*([^<]+?)\s*</);   // data e gjenerimit brenda orarit
          return {sig:sig,txt:m?m[1]:''};
        });
      }).catch(function(){return {sig:'',txt:''};});
    })).then(function(res){
      var cur={};FILES.forEach(function(f,i){cur[f]=res[i].txt;});   // krahasohet vetëm data e gjenerimit brenda orarit
      if(!FILES.some(function(f){return cur[f];}))return;
      var old=null;try{old=JSON.parse(get('orari_dt')||'null');}catch(e){old=null;}
      if(!old){set('orari_dt',JSON.stringify(cur));return;}   // hapja e parë: vetëm ruaj, pa mesazh
      var changed=FILES.filter(function(f){return cur[f]&&old[f]!==cur[f];});
      if(!changed.length)return;
      var lines=changed.map(function(f){
        var t=res[FILES.indexOf(f)].txt;var when=t?' <small style="display:inline">('+t+')</small>':'';
        return '<div>'+(LABELS[f]||f)+when+'</div>';
      }).join('');
      var box=document.createElement('div');box.className='nj show';box.id='njUpdate';
      box.innerHTML='<b>&#128276; '+'Orari u përditësua'+'</b><small style="margin:4px 0">'+lines+'</small><button type="button">Në rregull</button>';
      var cards=document.querySelector('.cards');if(cards)cards.parentNode.insertBefore(box,cards);
      box.querySelector('button').onclick=function(){var sv={};FILES.forEach(function(f){sv[f]=cur[f]||old[f]||'';});set('orari_dt',JSON.stringify(sv));box.className='nj';};
    });
  }

  /* 2. Njoftimi i vërtetë (OneSignal) - vetëm nëse në cilesimet.js është vendosur onesignal */
  function initPush(){
    var id=String(C.onesignal||'').trim(); if(!id)return;
    if(!('Notification' in window)||!('serviceWorker' in navigator))return;
    var ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
    var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone;
    if(ios&&!standalone)return;                              // në iPhone njoftimet punojnë vetëm në aplikacionin e instaluar
    var cards=document.querySelector('.cards');if(!cards)return;
    var wasOn=get('orari_push')==='1';                        // mban mend që njoftimet janë aktive, që banera të mos dalë kot

    var st=document.createElement('style');
    st.textContent='@keyframes njpulse{0%,100%{box-shadow:0 0 0 0 rgba(240,180,41,.55)}70%{box-shadow:0 0 0 14px rgba(240,180,41,0)}}'
     +'@keyframes njring{0%,100%{transform:rotate(0)}10%,30%,50%{transform:rotate(-16deg)}20%,40%,60%{transform:rotate(16deg)}70%{transform:rotate(0)}}'
     +'.njb{display:none;margin:0 0 16px;padding:20px 18px 18px;border-radius:20px;border:2px solid var(--gold,#f0b429);background:linear-gradient(160deg,rgba(240,180,41,.26),rgba(240,180,41,.08));color:var(--text,#f2f0f8);text-align:center;animation:njpulse 2s infinite}'
     +'.njb.show{display:block}.njb .bell{font-size:44px;line-height:1;display:inline-block;transform-origin:50% 10%;animation:njring 2.4s ease-in-out infinite}'
     +'.njb h3{margin:8px 0 6px;font-size:21px;font-weight:800;color:var(--gold,#f0b429);line-height:1.2}'
     +'.njb p{margin:0 0 14px;font-size:15px;line-height:1.45;color:var(--text,#f2f0f8)}'
     +'.njb button{width:100%;padding:15px 14px;border:0;border-radius:14px;background:var(--gold,#f0b429);color:#1a1300;font-family:inherit;font-weight:800;font-size:17px;cursor:pointer}'
     +'.njb button:active{transform:scale(.98)}.njb .msg{display:none;margin-top:10px;font-size:13px;line-height:1.4}.njb .msg.show{display:block}'
     +'.njb.err{animation:none;border-color:#ff8a8a}.njb.err h3{color:#ff8a8a}'
     +'.njdone{display:none;margin:0 0 12px;text-align:center;color:var(--text-dim,#b4b1c4);font-size:12px}.njdone.show{display:block}';
    document.head.appendChild(st);

    var box=document.createElement('div');box.className='njb';box.id='njBanner';
    box.innerHTML='<div class="bell">&#128276;</div><h3>Aktivizo njoftimet!</h3>'
      +'<p>Merr njoftim në telefon sa të ndryshojë orari, që të mos humbasësh asnjë ndryshim.</p>'
      +'<button type="button" id="njBtn">&#128276; Aktivizo njoftimet</button><div class="msg" id="njMsg"></div>';
    cards.parentNode.insertBefore(box,cards);
    var ok=document.createElement('div');ok.className='njdone';ok.id='njOk';ok.innerHTML='&#10003; Njoftimet janë aktive';
    var anchor=$('installHint')||cards;anchor.parentNode.insertBefore(ok,anchor.nextSibling);
    var btn=$('njBtn'),msg=$('njMsg');
    var OSref=null,pending=false;

    function show(on,denied){
      if(on){set('orari_push','1');box.className='njb';ok.className='njdone show';return;}
      set('orari_push','0');ok.className='njdone';
      if(denied){
        box.className='njb show err';btn.style.display='none';box.querySelector('h3').innerHTML='&#128277; Njoftimet janë bllokuar';
        box.querySelector('p').innerHTML='Për t’i aktivizuar: te cilësimet e telefonit (ose shfletuesit) për Orari / këtë faqe zgjidh <b>Lejo njoftimet</b>, pastaj rihape aplikacionin.';
      }else{box.className='njb show';btn.style.display='';}
    }
    function refresh(){
      var denied=Notification.permission==='denied';
      var on=false;
      if(OSref){try{on=!!OSref.User.PushSubscription.optedIn;}catch(e){}}
      else if(Notification.permission==='granted'){
        /* leja është e dhënë por OneSignal s'ka përfunduar ende (p.sh. pas fshirjes së historikut):
           mos shfaq banerën, prit përgjigjen e SDK-së, pa e ndryshuar gjendjen e ruajtur */
        box.className='njb';
        if(wasOn)ok.className='njdone show';
        return;
      }
      show(on,denied);
    }
    refresh();    // BANERA SHFAQET MENJËHERË, pa pritur OneSignal

    btn.onclick=function(){
      /* kërkesa e lejes bëhet drejtpërdrejt te shtypja (kërkohet nga iPhone/Chrome), pa pritur SDK-në */
      btn.disabled=true;btn.style.opacity='.7';
      var p;
      try{
        if(OSref){p=Notification.permission==='granted'?OSref.User.PushSubscription.optIn():OSref.Notifications.requestPermission();}
        else{pending=true;p=Notification.requestPermission();}
      }catch(e){p=Promise.resolve();}
      Promise.resolve(p).then(function(){btn.disabled=false;btn.style.opacity='';refresh();},function(){btn.disabled=false;btn.style.opacity='';refresh();});
    };

    window.OneSignalDeferred=window.OneSignalDeferred||[];
    window.OneSignalDeferred.push(function(OS){
      var dir=location.pathname.replace(/[^\/]*$/,'');
      return OS.init({appId:id,serviceWorkerPath:dir+'sw.js',serviceWorkerParam:{scope:dir},notifyButton:{enable:false},welcomeNotification:{disable:true}}).then(function(){
        OSref=OS;
        if(pending&&Notification.permission==='granted'){try{OS.User.PushSubscription.optIn();}catch(e){}}
        refresh();
        try{OS.User.PushSubscription.addEventListener('change',refresh);}catch(e){}
      }).catch(function(err){
        try{console.error('OneSignal init error:',err);}catch(e){}
        box.className='njb show err';btn.style.display='none';
        box.querySelector('h3').textContent='Njoftimet nuk u aktivizuan';
        box.querySelector('p').textContent=(err&&err.message)||err||'gabim i panjohur';
      });
    });
    var s=document.createElement('script');s.src='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';s.defer=true;document.head.appendChild(s);
  }
  /* 3. Rrethi i kuq në ikonë: vendoset nga sw.js kur vjen njoftim; pastrohet sa hapet aplikacioni */
  function clearBadge(){
    try{if(navigator.clearAppBadge)navigator.clearAppBadge();else if(navigator.setAppBadge)navigator.setAppBadge(0);}catch(e){}
    try{if(window.caches)caches.open('orari-badge').then(function(c){return c.delete(new URL('__badge',location.href).href);}).catch(function(){});}catch(e){}
  }
  clearBadge();
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')clearBadge();});
  window.addEventListener('pageshow',clearBadge);
  window.addEventListener('focus',clearBadge);
  function ready(f){if(document.readyState!=='loading')f();else document.addEventListener('DOMContentLoaded',f);}
  ready(function(){initPush();checkUpdate();});
})();
