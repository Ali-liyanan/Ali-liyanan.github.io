// 《Agent 开发工程师修炼手册》在线版 交互脚本
(function(){
  // 主题切换
  var root=document.documentElement;
  var saved=localStorage.getItem('handbook-theme');
  if(saved) root.setAttribute('data-theme',saved);
  var btn=document.getElementById('themeBtn');
  if(btn){btn.addEventListener('click',function(){
    var cur=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',cur);
    localStorage.setItem('handbook-theme',cur);
  });}

  // 阅读进度条
  var bar=document.getElementById('progress');
  function onScroll(){
    if(!bar) return;
    var h=document.documentElement;
    var max=h.scrollHeight-h.clientHeight;
    bar.style.width=(max>0?(h.scrollTop/max*100):0)+'%';
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // 侧边目录高亮（scroll spy）
  var links=Array.prototype.slice.call(document.querySelectorAll('.side-toc a'));
  if(links.length){
    var map={};
    links.forEach(function(a){var id=a.getAttribute('href').slice(1);var el=document.getElementById(id);
      if(el) map[id]=a;});
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          links.forEach(function(x){x.classList.remove('active')});
          var a=map[en.target.id]; if(a) a.classList.add('active');
        }
      });
    },{rootMargin:'-15% 0px -75% 0px',threshold:0});
    Object.keys(map).forEach(function(id){obs.observe(document.getElementById(id));});
  }

  // 搜索页
  var form=document.getElementById('searchForm');
  if(form && window.SEARCH_DATA){
    var input=document.getElementById('searchInput');
    var meta=document.getElementById('searchMeta');
    var res=document.getElementById('searchResults');
    function esc(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
    function run(q){
      q=q.trim();
      if(!q){res.innerHTML='';meta.textContent='';return;}
      var terms=q.toLowerCase().split(/\s+/).filter(Boolean);
      var hits=[];
      for(var i=0;i<window.SEARCH_DATA.length;i++){
        var e=window.SEARCH_DATA[i]; // [卷, page, secId, 标题路径, 文本]
        var hay=(e[3]+'\n'+e[4]).toLowerCase();
        var score=0, ok=true;
        for(var t=0;t<terms.length;t++){
          var k=hay.indexOf(terms[t]);
          if(k<0){ok=false;break;}
          score+=1; // 基础分
        }
        if(!ok) continue;
        // 提高命中次数的排序
        var first=hay.indexOf(terms[0]);
        score+=Math.max(0,3-first/400);
        hits.push([score,e,first]);
      }
      hits.sort(function(a,b){return b[0]-a[0]});
      var top=hits.slice(0,80);
      meta.textContent='共 '+hits.length+' 条结果'+(hits.length>80?'（显示前 80 条）':'');
      var out=[];
      top.forEach(function(h){
        var e=h[1]; var text=e[4]; var idx=h[2];
        var start=Math.max(0,idx-40), snip=text.slice(start,start+180);
        var safe=esc(snip);
        terms.forEach(function(t){
          if(!t) return;
          var re=new RegExp('('+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
          safe=safe.replace(re,'<mark>$1</mark>');
        });
        out.push('<div class="hit"><div class="hit-vol">'+esc(e[0])+'</div>'+
          '<a class="hit-path" href="'+e[1]+'#'+e[2]+'">'+esc(e[3])+'</a>'+
          '<p>'+(start>0?'…':'')+safe+(text.length>start+180?'…':'')+'</p></div>');
      });
      res.innerHTML=out.join('');
    }
    function doSearch(){
      run(input.value);
      history.replaceState(null,'','search.html?q='+encodeURIComponent(input.value));
    }
    form.addEventListener('submit',function(ev){ev.preventDefault();doSearch();});
    // 稳健性：部分内嵌/沙箱环境会拦截表单提交默认动作，直接接管按钮点击
    var submitBtn=form.querySelector('button[type="submit"]');
    if(submitBtn){submitBtn.addEventListener('click',function(ev){ev.preventDefault();doSearch();});}
    var m=location.search.match(/[?&]q=([^&]+)/);
    if(m){var q=decodeURIComponent(m[1].replace(/\+/g,' '));input.value=q;run(q);}
  }
})();
