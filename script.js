(function(){
var $=function(i){return document.getElementById(i)};
var K='askanything.pro.v1',S={chats:[],cur:null,mode:'general',theme:''},dl=null,ctl=null,busy=false;
var BASE='You are a friendly, knowledgeable assistant. Answer any question clearly and accurately, in the same language the person writes in (including Urdu). Use short paragraphs, lists and fenced code blocks where helpful. If unsure, say so. For medical, legal or financial questions give general information and suggest a professional.';
var MODES={general:['General',''],simple:['Simple','Explain in very simple words with a short everyday example.'],dev:['Developer','You are also an expert web developer: give modern, working code in fenced blocks with brief explanations.'],brief:['Brief','Answer in one to three sentences unless asked for more.']};
var IDEAS=[['Science','How do black holes form?'],['Coding','Build a responsive navbar with HTML and CSS'],['Daily life','Give me a 3-day Lahore travel plan'],['Learn','Explain how the stock market works']];
try{var r=localStorage.getItem(K);if(r)S=Object.assign(S,JSON.parse(r));}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify(S));}catch(e){}}
function cur(){var c=S.chats.filter(function(x){return x.id===S.cur})[0];if(!c){c=mk();}return c;}
function mk(){var c={id:String(Date.now()),title:'New chat',msgs:[]};S.chats.unshift(c);S.cur=c.id;return c;}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function md(t){
 var codes=[];
 t=esc(t).replace(/```(\w*)\n?([\s\S]*?)(```|$)/g,function(_,l,c){codes.push('<div class="code"><div class="ch"><span>'+(l||'code')+'</span><button class="cp" type="button">Copy</button></div><pre><code>'+c.replace(/\n$/,'')+'</code></pre></div>');return '\u0000'+(codes.length-1)+'\u0000';});
 t=t.replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*\n]*)\*/g,'$1<em>$2</em>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
 var out=[],ls=null;
 function end(){if(ls){out.push('</'+ls+'>');ls=null;}}
 t.split('\n').forEach(function(l){
  var m=l.match(/^\s*[-*•]\s+(.*)/),n=l.match(/^\s*\d+[.)]\s+(.*)/),h=l.match(/^#{1,4}\s+(.*)/);
  if(m||n){var k=m?'ul':'ol';if(ls!==k){end();out.push('<'+k+'>');ls=k;}out.push('<li>'+(m||n)[1]+'</li>');return;}
  end();
  if(/^\u0000\d+\u0000$/.test(l.trim()))out.push(l.trim());
  else if(h)out.push('<h4>'+h[1]+'</h4>');
  else if(l.trim()!=='')out.push('<p>'+l+'</p>');
 });
 end();
 return out.join('').replace(/\u0000(\d+)\u0000/g,function(_,i){return codes[i];});
}
function sc(){var c=$('chat');c.scrollTop=c.scrollHeight;}
function side(){
 var L=$('list');L.innerHTML='';
 S.chats.forEach(function(c){
  var b=document.createElement('button');b.type='button';b.className='it'+(c.id===S.cur?' on':'');
  var s=document.createElement('span');s.textContent=c.title;s.dir='auto';
  var x=document.createElement('b');x.textContent='×';x.title='Delete';
  x.onclick=function(e){e.stopPropagation();if(busy)return;S.chats=S.chats.filter(function(z){return z!==c});if(S.cur===c.id)S.cur=S.chats[0]?S.chats[0].id:null;save();draw();};
  b.onclick=function(){if(busy)return;S.cur=c.id;save();document.body.classList.remove('open');draw();};
  b.appendChild(s);b.appendChild(x);L.appendChild(b);
 });
}
function modes(){
 var M=$('modes');M.innerHTML='';
 Object.keys(MODES).forEach(function(k){var b=document.createElement('button');b.type='button';b.textContent=MODES[k][0];if(k===S.mode)b.className='on';b.onclick=function(){S.mode=k;save();modes();};M.appendChild(b);});
}
function draw(){
 var c=cur(),col=$('col');col.innerHTML='';$('ttl').textContent=c.title;$('exp').hidden=!(dl&&c.msgs.length);
 if(!c.msgs.length){
  var h=document.createElement('div');h.className='hero';
  h.innerHTML='<div class="logo">✦</div><h2>What would you like to know?</h2><p>Ask about any topic — science, code, travel, health basics, homework and more.</p><div class="cards"></div>';
  IDEAS.forEach(function(i){var b=document.createElement('button');b.type='button';b.innerHTML='<small></small>';b.firstChild.textContent=i[0];b.appendChild(document.createTextNode(i[1]));b.onclick=function(){ask(i[1]);};h.lastChild.appendChild(b);});
  col.appendChild(h);
 }
 c.msgs.forEach(function(m,i){
  var bot=m.role==='assistant',d=document.createElement('div');d.className='row '+(bot?'bot':'user');
  d.innerHTML=(bot?'<div class="av">AI</div>':'')+'<div class="bub"><div class="body" dir="auto"></div>'+(bot&&m.content&&!(busy&&i===c.msgs.length-1)?'<div class="acts"><button data-a="copy" type="button">Copy</button>'+(i===c.msgs.length-1?'<button data-a="regen" type="button">Regenerate</button>':'')+'</div>':'')+'</div>';
  var b=d.querySelector('.body');if(bot)b.innerHTML=m.content?md(m.content):'<span class="dots"><i></i><i></i><i></i></span>';else b.textContent=m.content;
  col.appendChild(d);
 });
 side();sc();
}
function copy(t,btn){
 function ok(){if(btn){var o=btn.textContent;btn.textContent='Copied';setTimeout(function(){btn.textContent=o;},1200);}}
 try{navigator.clipboard.writeText(t).then(ok,fb);}catch(e){fb();}
 function fb(){try{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();ok();}catch(e){}}
}
$('col').addEventListener('click',function(e){
 var t=e.target;
 if(t.classList.contains('cp')){copy(t.closest('.code').querySelector('code').textContent,t);return;}
 var a=t.getAttribute('data-a');if(!a)return;
 var c=cur();
 if(a==='copy')copy(c.msgs[c.msgs.length-1].content,t);
 if(a==='regen'&&!busy){c.msgs.pop();ask(null);}
});
function setBusy(v){busy=v;$('go').textContent=v?'■':'➤';$('go').setAttribute('aria-label',v?'Stop':'Send');}
async function ask(text){
 if(busy)return;
 var c=cur();
 if(text!==null){c.msgs.push({role:'user',content:text});if(c.title==='New chat')c.title=text.slice(0,42);}
 var m={role:'assistant',content:''};c.msgs.push(m);
 document.body.classList.remove('open');setBusy(true);draw();
 var hist=c.msgs.slice(0,-1).slice(-20);while(hist.length&&hist[0].role!=='user')hist.shift();
 var sys=BASE+(MODES[S.mode][1]?' '+MODES[S.mode][1]:'');
 ctl=new AbortController();
 try{
  var res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},signal:ctl.signal,body:JSON.stringify({system:sys,messages:hist})});
  var data=await res.json();
  if(!res.ok)throw new Error(data.error||'Request failed ('+res.status+').');
  m.content=data.text||'No answer was returned. Please try again.';
 }catch(e){
  if(e&&e.name==='AbortError'){c.msgs.pop();}
  else m.content=(e&&e.message)||'Could not connect to the AI server. Make sure Askwise is running, then try again.';
 }
 setBusy(false);save();draw();
}
$('f').addEventListener('submit',function(e){
 e.preventDefault();
 if(busy){if(ctl)ctl.abort();return;}
 var t=$('q').value.trim();if(!t)return;
 $('q').value='';$('q').style.height='auto';ask(t);
});
$('q').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('f').requestSubmit();}});
$('q').addEventListener('input',function(){var q=$('q');q.style.height='auto';q.style.height=Math.min(q.scrollHeight,150)+'px';});
$('new').onclick=function(){if(busy)return;var c=S.chats[0];if(!(c&&!c.msgs.length))mk();save();document.body.classList.remove('open');draw();$('q').focus();};
$('menu').onclick=function(){document.body.classList.toggle('open');};
$('ov').onclick=function(){document.body.classList.remove('open');};
function theme(){if(S.theme)document.documentElement.setAttribute('data-theme',S.theme);}
$('thm').onclick=function(){var dark=S.theme?S.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;S.theme=dark?'light':'dark';theme();save();};
$('exp').onclick=async function(){
 var c=cur(),t='# '+c.title+'\n\n'+c.msgs.map(function(m){return '**'+(m.role==='user'?'You':'AI')+':**\n\n'+m.content;}).join('\n\n---\n\n');
 try{await dl.save({filename:'chat.md',data:t});}catch(e){}
};
theme();modes();draw();
try{window.claude.use('downloads').then(function(d){dl=d;draw();}).catch(function(){});}catch(e){}
})();
