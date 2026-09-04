/* ══════════════════════════════════════════════════════════════════════
   السلوك المشترك بين صفحات سُفرة التسويقية — الرئيسية (/) والاستلام (/pickup)
   ══════════════════════════════════════════════════════════════════════

   روابط الواتساب، وقائمة الجوال، وقائمة «حلول سُفرة»، ومفتاح مدّة
   الاشتراك، والأسئلة الإضافية، والظهور التدريجي، وقياس الحملات.
   وما يخصّ صفحةً بعينها (عارض شاشات المطاعم، نموذج الاستلام المتحرّك)
   يبقى في <script> داخل صفحته.

   نصّ الواتساب يُقرأ من data-wa-text على <body>: كل صفحة تقول للمهتمّ
   ماذا يسأل — «لمطعمي» هنا و«لمقهاي» هناك — والرقم واحد.
*/
var WHATSAPP_NUMBER = "966557884367";   // ← رقم واتساب دولي بدون + أو أصفار
(function(){var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();})();

/* روابط الواتساب — رقمٌ واحد في مكانٍ واحد يملأ كل زرّ يحمل الصنف. */
(function(){
  var txt=(document.body&&document.body.getAttribute('data-wa-text'))||"السلام عليكم، مهتم بخدمة سُفرة.";
  var base="https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(txt);
  document.querySelectorAll('.wa-link').forEach(function(a){a.href=base;});
})();

/* قائمة الجوال */
(function(){
  var h=document.getElementById('hdr'),b=h&&h.querySelector('.menu-btn');
  if(!h||!b)return;
  function set(open){h.classList.toggle('menu-open',open);b.setAttribute('aria-expanded',open?'true':'false');}
  b.addEventListener('click',function(){set(!h.classList.contains('menu-open'));});
  h.querySelectorAll('.nav-links a').forEach(function(a){a.addEventListener('click',function(){set(false);});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
})();

/* قائمة «حلول سُفرة» — على الكمبيوتر قائمة منسدلة بالنقر (لا بالتحويم:
   اللمس لا يحوّم، ولوحة المفاتيح لا تحوّم)، تُغلق بالنقر خارجها أو بـEscape.
   وعلى الجوال لا زرّ أصلًا: البندان ظاهران داخل قائمة الجوال (CSS). */
(function(){
  var sol=document.querySelector('.sol'),btn=sol&&sol.querySelector('.sol-btn');
  if(!sol||!btn)return;
  function set(open){sol.classList.toggle('open',open);btn.setAttribute('aria-expanded',open?'true':'false');}
  btn.addEventListener('click',function(e){e.stopPropagation();set(!sol.classList.contains('open'));});
  document.addEventListener('click',function(e){if(!sol.contains(e.target))set(false);});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&sol.classList.contains('open')){set(false);btn.focus();}
  });
  sol.addEventListener('focusout',function(){
    setTimeout(function(){if(!sol.contains(document.activeElement))set(false);},0);
  });
})();

/* مفتاح المدّة — القيم في سمات data، وأزرار «اشترك مباشرة» تحمل المدّة
   (والباقة إن كانت في data-sub) إلى صفحة الاشتراك. */
(function(){
  var period='y';
  function apply(){
    var p=(period==='y'?'annual':'monthly');
    document.querySelectorAll('#pricing [data-y]').forEach(function(el){
      el.textContent=el.getAttribute(period==='y'?'data-y':'data-m');
    });
    document.querySelectorAll('.billing button').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-period')===period);
    });
    document.querySelectorAll('a[data-sub]').forEach(function(a){
      var plan=a.getAttribute('data-sub');
      a.href='https://app.alsufr.com/subscribe?'+(plan?'plan='+plan+'&':'')+'period='+p;
    });
  }
  document.querySelectorAll('.billing button').forEach(function(b){
    b.addEventListener('click',function(){period=b.getAttribute('data-period');apply();});
  });
  apply();
})();

/* الأسئلة الإضافية — الفتح لا يقفز بالصفحة: نقيس موضع الزرّ قبل وبعد ونعوّض. */
(function(){
  var btn=document.getElementById('faqToggle'), box=document.getElementById('faqExtra');
  if(!btn||!box)return;
  btn.addEventListener('click',function(){
    var open=box.hasAttribute('hidden');
    var before=btn.getBoundingClientRect().top;
    if(open){box.removeAttribute('hidden');}else{box.setAttribute('hidden','');}
    btn.setAttribute('aria-expanded',open?'true':'false');
    btn.textContent=open?'عرض أسئلة أقل':'عرض أسئلة أكثر';
    window.scrollBy(0, btn.getBoundingClientRect().top - before);
    if(open){var d=box.querySelector('details summary');if(d)d.focus({preventScroll:true});}
  });
})();

/* ظهور تدريجي */
(function(){
  if(!('IntersectionObserver'in window)){document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('in');});return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{threshold:.1,rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll('.reveal').forEach(function(e){io.observe(e);});
})();

/* ══════════════════════════════════════════════════════════════════════
   قياس زيارة جاءت من حملة تسويق — يرسل إلى app.alsufr.com/api/track
   ══════════════════════════════════════════════════════════════════════

   **بلا رمز إحالة لا يفعل شيئًا.** الزائر العادي — من بحث أو من رابط
   مشارَك — لا يُقاس ولا يُنشأ له صف. والرمز يصل في الـfragment (يلتقطه
   سكربت <head>) أو في كوكي sufra_adv الذي يضعه مسار /r/CODE على النطاق
   الأم فيصل الصفحتين معًا.

   **وكل شيء هنا داخل try:** فشل القياس — شبكة مقطوعة، مانع إعلانات،
   متصفح قديم — لا يعطل زرًا ولا يوقف انتقالًا. الصفحة صفحة بيع أولًا.

   والوقت **النشط** لا الفرق بين الفتح والإغلاق: يقف حين يُخفى التبويب أو
   يُدفع إلى الخلفية أو يخمل الزائر دقيقتين، ويستأنف حين يعود. وإلا لبدا
   من ترك الصفحة مفتوحة ليلة كاملة أشد المهتمين.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
try{
  var API='https://app.alsufr.com/api/track';
  var sv='';
  try{sv=sessionStorage.getItem('sufra_sv')||'';}catch(e){}
  if(!sv){var m=document.cookie.match(/(?:^|;\s*)sufra_adv=([^;]+)/);if(m&&m[1])sv=decodeURIComponent(m[1]);}
  if(!sv)return;

  var active=0,scroll=0,running=false,since=0,lastAct=Date.now(),sent={};

  /* sendBeacon بجسم text/plain: طلب «بسيط» في عرف CORS فيمضي عبر النطاقين
     بلا OPTIONS تمهيدي. والبديل fetch يرسل النوع نفسه لئلا ينقلب بسيطًا
     إلى تمهيدي فيُحجب بصمت. */
  function send(o){
    try{
      o.sv=sv;o.surface='landing';
      var b=new Blob([JSON.stringify(o)],{type:'text/plain'});
      if(!(navigator.sendBeacon&&navigator.sendBeacon(API,b))){
        fetch(API,{method:'POST',body:b,keepalive:true}).catch(function(){});
      }
    }catch(e){}
  }

  function mark(k){if(sent[k])return;sent[k]=1;send({op:'event',kind:k,activeSeconds:active,scroll:scroll});}

  function tick(){
    if(!running)return;
    var n=Date.now();active+=Math.round((n-since)/1000);since=n;
    if(active>=10)mark('engaged_10s');
    if(active>=30)mark('engaged_30s');
    if(active>=60)mark('engaged_60s');
    if(active>=120)mark('engaged_120s');
  }
  function resume(){if(running)return;running=true;since=Date.now();}
  function pause(){if(!running)return;tick();running=false;}

  function onScroll(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    if(h<=0)return;
    var p=Math.min(100,Math.round((window.scrollY/h)*100));
    if(p>scroll)scroll=p;
    if(scroll>=25)mark('scroll_25');
    if(scroll>=50)mark('scroll_50');
    if(scroll>=75)mark('scroll_75');
    if(scroll>=90)mark('scroll_90');
  }
  var raf=0;
  function onScrollThrottled(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;onScroll();});
  }

  document.addEventListener('visibilitychange',function(){
    if(document.visibilityState==='visible')resume();
    else{pause();send({op:'activity',activeSeconds:active,scroll:scroll});}
  });
  window.addEventListener('focus',resume);
  window.addEventListener('blur',pause);
  window.addEventListener('scroll',onScrollThrottled,{passive:true});
  ['mousemove','keydown','touchstart','click'].forEach(function(e){
    window.addEventListener(e,function(){lastAct=Date.now();resume();},{passive:true});
  });
  setInterval(function(){if(running&&Date.now()-lastAct>120000)pause();},5000);
  setInterval(function(){tick();if(active>0)send({op:'activity',activeSeconds:active,scroll:scroll});},30000);
  window.addEventListener('pagehide',function(){pause();send({op:'activity',activeSeconds:active,scroll:scroll});});

  /* ═══ الأزرار: نوع الحدث من data-ad-events لا من الصنف البصري ═══

     الصنف يتغير لأسباب تصميمية — يُبدَّل btn-gold بـbtn-line في تجربة
     شكل، فينقلب «ضغط التجربة» إلى «انتقال» بلا أن ينتبه أحد، وتنهار مقارنة
     الحملات على شيء لا علاقة له بها. والسمة تقول ما تعنيه.

     ويمرّ sv إلى **كل** رابط يخرج إلى app.alsufr.com حتى ما لا يحمل سمة —
     استمرار الإحالة شيء، وتسجيل الحدث شيء آخر.

     ولا preventDefault ولا await: sendBeacon يضع الطلب في طابور المتصفح
     ويعود فورًا، والانتقال يمضي. زر يتأخر ثلث ثانية لأجل قياس هو زر معطوب. */
  document.addEventListener('click',function(ev){
    try{
      var a=ev.target&&ev.target.closest?ev.target.closest('a[href]'):null;
      if(!a)return;
      var href=a.getAttribute('href')||'';
      if(href.indexOf('app.alsufr.com')<0)return;

      var kinds=(a.getAttribute('data-ad-events')||'').split(/\s+/);
      for(var i=0;i<kinds.length;i++){
        if(kinds[i])send({op:'event',kind:kinds[i],activeSeconds:active,scroll:scroll});
      }

      /* يُبنى بـURL لا بسلسلة: الوجهة قد تحمل ?period= (يضعه زر التسعير)
         أو fragment، وإلحاق '#sv=' نصًا يدهسهما بصمت. */
      var u=new URL(href,location.href);
      var hs=new URLSearchParams(u.hash.replace(/^#/,''));
      hs.set('sv',sv);u.hash=hs.toString();
      a.setAttribute('href',u.toString());
    }catch(e){}
  },true);

  resume();onScroll();
}catch(e){}
})();
