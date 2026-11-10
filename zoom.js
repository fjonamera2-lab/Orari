/* Zmadhim / zvogëlim i pamjes (telefon). Butonat A− / % / A+ ruajnë zgjedhjen në pajisje.
   Pinch-zoom me dy gishta punon gjithashtu (nuk është më i bllokuar nga viewport). */
(function(){
  var KEY='orari-zoom', MIN=0.7, MAX=2, STEP=0.1;
  function load(){
    try{var v=parseFloat(localStorage.getItem(KEY));if(v>=MIN&&v<=MAX)return v}catch(e){}
    return 1;
  }
  function save(v){try{localStorage.setItem(KEY,String(v))}catch(e){}}
  var z=load();

  function ready(fn){
    if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn);
  }

  ready(function(){
    var page=document.querySelector('.page');
    if(!page||!('zoom' in document.documentElement.style))return;

    var css=document.createElement('style');
    css.textContent=
      '.zoom-ctl{position:fixed;right:max(12px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:900;display:flex;align-items:center;gap:2px;padding:4px;border-radius:999px;background:rgba(20,23,32,.92);border:1px solid rgba(240,180,41,.35);box-shadow:0 6px 24px rgba(0,0,0,.5);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font-family:Outfit,sans-serif;user-select:none;-webkit-user-select:none;touch-action:manipulation}'+
      '.zoom-ctl button{border:0;background:transparent;color:#f0b429;font-family:inherit;font-weight:700;cursor:pointer;height:38px;min-width:38px;border-radius:999px;font-size:18px;line-height:1;-webkit-tap-highlight-color:transparent}'+
      '.zoom-ctl button:active{background:rgba(240,180,41,.2)}'+
      '.zoom-ctl button:disabled{opacity:.3}'+
      '.zoom-ctl .zv{font-size:13px;min-width:52px;color:#eceaf4;font-family:"JetBrains Mono",monospace}';
    document.head.appendChild(css);

    var box=document.createElement('div');
    box.className='zoom-ctl';
    box.setAttribute('role','group');
    box.setAttribute('aria-label','Zmadhimi i pamjes');
    box.innerHTML=
      '<button type="button" class="zm" aria-label="Zvogëlo">A&minus;</button>'+
      '<button type="button" class="zv" aria-label="Rikthe madhësinë 100%">100%</button>'+
      '<button type="button" class="zp" aria-label="Zmadho">A+</button>';
    document.body.appendChild(box);

    var bm=box.querySelector('.zm'), bp=box.querySelector('.zp'), bv=box.querySelector('.zv');

    function apply(v){
      z=Math.round(Math.min(MAX,Math.max(MIN,v))*100)/100;
      page.style.zoom=(z===1)?'':z;
      bv.textContent=Math.round(z*100)+'%';
      bm.disabled=z<=MIN+0.001;
      bp.disabled=z>=MAX-0.001;
      save(z);
    }
    bm.addEventListener('click',function(){apply(z-STEP)});
    bp.addEventListener('click',function(){apply(z+STEP)});
    bv.addEventListener('click',function(){apply(1)});
    apply(z);
  });
})();
