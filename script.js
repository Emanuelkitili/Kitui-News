let me = JSON.parse(localStorage.getItem('kitui_user')||'null');
if(!me){ let n = prompt('Your Name to comment?')||'Reader'; me={name:n,user:'@'+n.toLowerCase().replace(/[^a-z0-9]/g,'')}; localStorage.setItem('kitui_user',JSON.stringify(me)); }
let curCat = 'All';
function getPosts(){ try{ return JSON.parse(localStorage.getItem('kitui_news_posts')||'[]'); }catch(e){ return []; } }
function savePosts(p){ try{ localStorage.setItem('kitui_news_posts',JSON.stringify(p)); return true; }catch(e){ alert('Storage full! Delete old posts'); return false; } }
let newMedia = '';
document.getElementById('pFile').addEventListener('change', function(){
  let f=this.files[0]; if(!f) return;
  let rd=new FileReader();
  rd.onload=e=>{ newMedia=e.target.result; document.getElementById('preview').innerHTML = f.type.startsWith('video') ? '<video src="'+newMedia+'" controls></video>' : '<img src="'+newMedia+'">'; alert('✅ Photo ready! Now tap PUBLISH'); };
  rd.readAsDataURL(f);
});
function setCat(c,el){ curCat=c; document.querySelectorAll('.cat').forEach(b=>b.classList.remove('active')); if(el) el.classList.add('active'); render(); }
function doPost(){
  let title=document.getElementById('pTitle').value.trim();
  let cat=document.getElementById('pCat').value;
  let text=document.getElementById('pText').value.trim();
  if(!title){ alert('Write headline first!'); return; }
  let posts=getPosts();
  posts.unshift({id:'n'+Date.now(),title:title,cat:cat,text:text,media:newMedia,author:'Ken',likes:[],comments:[],views:0,time:Date.now()});
  if(!savePosts(posts)) return;
  document.getElementById('pTitle').value=''; document.getElementById('pText').value=''; document.getElementById('preview').innerHTML=''; newMedia=''; document.getElementById('pFile').value='';
  alert('Published! ✅'); render();
}
function render(){
  let posts=getPosts();
  let q=(document.getElementById('searchInput').value||'').toLowerCase();
  let filtered=posts.filter(p=> (curCat=='All'||p.cat==curCat) && (p.title.toLowerCase().includes(q)||(p.text||'').toLowerCase().includes(q)) );
  let hero=document.getElementById('hero');
  if(filtered.length){
    let h=filtered[0];
    hero.innerHTML='<div class="hero" onclick="viewPost(\''+h.id+'\')">'+(h.media ? (h.media.startsWith('data:video')?'<video src="'+h.media+'" controls></video>':'<img src="'+h.media+'">'):'')+'<div class="hero-body"><span class="badge">🔥 TOP STORY - '+h.cat.toUpperCase()+'</span><h2>'+h.title+'</h2><div class="meta">By '+h.author+' • '+new Date(h.time).toLocaleString()+' • 👁️ '+h.views+' views • ❤️ '+(h.likes?h.likes.length:0)+' • 💬 '+(h.comments?h.comments.length:0)+'</div><p>'+(h.text||'').slice(0,120)+'...</p></div></div>';
  } else hero.innerHTML='';
  let feed=document.getElementById('feed');
  if(!filtered.length){ feed.innerHTML='<div class="card"><div class="card-body">No news yet in '+curCat+' - Ken will post soon! 🔥</div></div>'; return; }
  feed.innerHTML=filtered.map(p=>{
    let media='';
    if(p.media){ media = p.media.startsWith('data:video') ? '<video src="'+p.media+'" controls onclick="viewPost(\''+p.id+'\')"></video>' : '<img src="'+p.media+'" onclick="viewPost(\''+p.id+'\')">'; }
    let liked = p.likes && p.likes.includes(me.user) ? 'liked' : '';
    return '<div class="card"><div onclick="viewPost(\''+p.id+'\')">'+media+'</div><div class="card-body"><span class="badge">'+p.cat.toUpperCase()+'</span><h3 onclick="viewPost(\''+p.id+'\')">'+p.title+'</h3><div class="meta">By '+p.author+' • '+new Date(p.time).toLocaleString()+'</div><p>'+(p.text||'')+'</p><div class="actions"><button class="'+liked+'" onclick="likePost(\''+p.id+'\')">❤️ '+(p.likes?p.likes.length:0)+'</button><button onclick="viewPost(\''+p.id+'\')">👁️ '+(p.views||0)+'</button><button onclick="focusComment(\''+p.id+'\')">💬 '+(p.comments?p.comments.length:0)+'</button><button onclick="sharePost(\''+p.id+'\')">↗️ Share</button></div><div class="comments">'+(p.comments||[]).map(c=>'<div class="c-row"><b>'+c.name+':</b> '+c.text+'</div>').join('')+'<div class="c-input"><input id="c-'+p.id+'" placeholder="Write comment..."><button onclick="addComment(\''+p.id+'\')">Send</button></div></div></div></div>';
  }).join('');
  if(posts.length){ document.getElementById('tickerTrack').innerHTML='<span>⚡ '+posts[0].title+' 🔥</span><span>⚡ '+posts[0].title+' 🔥</span>'; }
}
function viewPost(id){ let posts=getPosts(); let p=posts.find(x=>x.id==id); if(!p) return; p.views=(p.views||0)+1; savePosts(posts); render(); }
function likePost(id){ let posts=getPosts(); let p=posts.find(x=>x.id==id); if(!p.likes) p.likes=[]; let i=p.likes.indexOf(me.user); if(i>=0) p.likes.splice(i,1); else p.likes.push(me.user); savePosts(posts); render(); }
function addComment(id){ let inp=document.getElementById('c-'+id); let t=inp.value.trim(); if(!t) return; let posts=getPosts(); let p=posts.find(x=>x.id==id); if(!p.comments) p.comments=[]; p.comments.push({name:me.name,text:t}); savePosts(posts); render(); }
function focusComment(id){ let el=document.getElementById('c-'+id); if(el) el.focus(); }
function sharePost(id){ let posts=getPosts(); let p=posts.find(x=>x.id==id); let txt='📰 KITUI NEWS: '+p.title+' - Read more on Kitui News'; if(navigator.share){ navigator.share({title:p.title,text:txt}); } else { navigator.clipboard.writeText(txt); alert('Link copied! Share it on WhatsApp ✅'); } }
render();