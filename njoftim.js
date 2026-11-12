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
    var anchor=$('installBtn')||document.querySelector('.cards');if(!anchor)return;
    var btn=document.createElement('button');btn.type='button';btn.className='njbtn';btn.id='njBtn';btn.innerHTML='&#128276; Më njofto kur ndryshon orari';
    var ok=document.createElement('div');ok.className='njok';ok.id='njOk';ok.innerHTML='&#10003; Njoftimet janë aktive';
    var hint=$('installHint')||anchor;
    hint.parentNode.insertBefore(btn,hint.nextSibling);btn.parentNode.insertBefore(ok,btn.nextSibling);
    function refresh(OS){
      var on=false;try{on=!!(OS.User.PushSubscription.optedIn);}catch(e){}
      var denied=Notification.permission==='denied';
      btn.className='njbtn'+((on||denied)?'':' show');
      if(on){ok.className='njok show';ok.style.color='';ok.innerHTML='&#10003; Njoftimet janë aktive';}
      else if(denied){ok.className='njok show';ok.style.color='';ok.innerHTML='&#128277; Njoftimet janë bllokuar. Për t\u2019i aktivizuar: te cilësimet e telefonit (ose shfletuesit) për Orari/ këtë faqe zgjidh <b>Lejo njoftimet</b>, pastaj rihape aplikacionin.';}
      else ok.className='njok';
    }
    window.OneSignalDeferred=window.OneSignalDeferred||[];
    window.OneSignalDeferred.push(function(OS){
      var dir=location.pathname.replace(/[^\/]*$/,'');
      return OS.init({appId:id,serviceWorkerPath:dir+'sw.js',serviceWorkerParam:{scope:dir},notifyButton:{enable:false},welcomeNotification:{disable:true}}).then(function(){
        refresh(OS);
        try{OS.User.PushSubscription.addEventListener('change',function(){refresh(OS);});}catch(e){}
        btn.onclick=function(){
          var p=Promise.resolve();
          try{ if(Notification.permission==='granted'){p=OS.User.PushSubscription.optIn();} else {p=OS.Notifications.requestPermission();} }catch(e){}
          Promise.resolve(p).then(function(){refresh(OS);},function(){refresh(OS);});
        };
      }).catch(function(err){
        /* init dështoi (p.sh. Site URL në OneSignal nuk përputhet me domenin): trego gabimin që të dallohet */
        try{console.error('OneSignal init error:',err);}catch(e){}
        ok.className='njok show';ok.style.color='#ff8a8a';ok.textContent='Njoftimet nuk u aktivizuan: '+((err&&err.message)||err||'gabim i panjohur');
      });
    });
    var s=document.createElement('script');s.src='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';s.defer=true;document.head.appendChild(s);
  }
  function ready(f){if(document.readyState!=='loading')f();else document.addEventListener('DOMContentLoaded',f);}
  ready(function(){checkUpdate();initPush();});
})();
