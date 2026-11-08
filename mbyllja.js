/* Lexon cilesimet.js: ndryshon vitin në faqen kryesore dhe shfaq mesazhin kur orari është mbyllur. */
(function(){
  var C=window.ORARI_CILESIMET||{};
  var viti=String(C.viti||'').trim();
  function nextYear(v){var m=/(\d{4})\D+(\d{4})/.exec(v||'');return m?m[2]+'–'+(parseInt(m[2],10)+1):'';}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function card(){
    var next=nextYear(viti);
    var title=String(C.titulli||'').trim()||'Orari është mbyllur';
    var msg=String(C.mesazhi||'').trim();
    var def=!msg;
    if(def){
      msg=(viti?'Faleminderit për vitin shkollor '+viti+'.\n':'Faleminderit për këtë vit shkollor.\n')+'Orari i ri shfaqet këtu në vitin e ri.';
    }
    var pill=(def&&next)?'<div style="display:inline-block;margin-top:18px;padding:8px 18px;border-radius:999px;background:rgba(240,180,41,.12);border:1px solid rgba(240,180,41,.32);color:#f0b429;font-size:13px;font-weight:700;letter-spacing:.4px">Shihemi në '+next+'</div>':'';
    return '<div style="box-sizing:border-box;width:100%;max-width:420px;margin:0 auto;padding:26px 20px 24px;text-align:center;color:#eceaf4;font-family:Outfit,\'Segoe UI\',Arial,sans-serif;background:linear-gradient(180deg,#1a1e2c 0%,#141720 100%);border:1px solid rgba(240,180,41,.26);border-radius:22px;box-shadow:0 16px 50px rgba(0,0,0,.45)">'+
      '<div style="width:74px;height:74px;margin:0 auto 14px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;line-height:1;background:radial-gradient(circle at 35% 30%,rgba(240,180,41,.32),rgba(240,180,41,.08));border:1px solid rgba(240,180,41,.4);box-shadow:0 0 30px rgba(240,180,41,.18)">&#127891;</div>'+
      '<div style="font-size:22px;font-weight:800;color:#f0b429;line-height:1.2;letter-spacing:-.2px">'+esc(title)+'</div>'+
      '<div style="font-size:15px;line-height:1.65;color:#b4b1c4;margin-top:10px;text-wrap:balance">'+esc(msg).replace(/\n/g,'<br>')+'</div>'+
      pill+'</div>';
  }
  window.ORARI_MBYLLJA_CARD=card;
  function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn);}
  ready(function(){
    if(viti){
      var els=document.querySelectorAll('[data-viti]');
      for(var i=0;i<els.length;i++)els[i].textContent=viti;
    }
    if(!C.mbyllur)return;
    var cards=document.querySelector('.cards');
    if(cards&&document.getElementById('installBtn')){
      cards.innerHTML=card();
      cards.style.display='block';
      var p=document.querySelector('.hdr p');if(p)p.style.display='none';
    }else{
      var o=document.createElement('div');
      o.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483000;background:#0c0e14;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto';
      o.innerHTML=card();
      document.body.appendChild(o);
      document.documentElement.style.overflow='hidden';
    }
  });
})();
