const API='https://script.google.com/macros/s/AKfycby1bF3MPsietWUGy9WZFv18R3xY8tPAl4tiuSOul9gDZHETJVBfwP-5Vab0kVow2nZz/exec';
const $=s=>document.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const S={get:()=>JSON.parse(localStorage.getItem('s')||'null'),set:v=>localStorage.setItem('s',JSON.stringify(v)),out(){localStorage.removeItem('s');location.href='index.html'}};
async function api(a,d={}){const s=S.get(),r=await fetch(API,{method:'POST',body:JSON.stringify({a,token:s&&s.token,...d})}),j=await r.json();if(!j.ok){if(/Sesi/.test(j.msg))S.out();throw Error(j.msg)}return j}
const guard=r=>{const s=S.get();if(!s||s.role!=r)location.href='index.html';return s};
const go=fn=>async e=>{try{await fn(e)}catch(x){alert(x.message)}};
const badge=t=>`<span class="b ${t}">${esc(t)}</span>`;
const card=(o,x='')=>`<div class="card">${badge(o.status)} <b>${esc(o.layanan)}</b><p>${esc(o.jemput)} → ${esc(o.tujuan)}</p>${o.catatan?`<small>${esc(o.catatan)}</small><br>`:''}${x}</div>`;
const P={};
P.index=()=>{let role='pelanggan',mode='login';
 const draw=()=>{document.querySelectorAll('.reg').forEach(e=>e.hidden=mode!='daftar');document.querySelectorAll('.drv').forEach(e=>e.hidden=mode!='daftar'||role!='driver');$('#go').textContent=mode=='login'?'Masuk':'Daftar'};
 document.querySelectorAll('.seg').forEach(g=>g.onclick=e=>{const v=e.target.dataset.v;if(!v)return;g.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b==e.target));g.id=='roleSeg'?role=v:mode=v;draw()});
 $('#f').onsubmit=go(async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.role=role;
  if(mode=='login'){S.set(await api('login',d));location.href=role+'.html'}
  else{alert((await api('register',d)).msg);mode='login';document.querySelector('#modeSeg button').click()}});draw()};
P.pelanggan=()=>{const s=guard('pelanggan');$('#hi').textContent='Halo, '+s.nama;
 const load=go(async()=>{const j=await api('mine');$('#list').innerHTML=j.list.map(o=>card(o,`<small>Driver: ${esc(o.dn)||'belum ada'} ${esc(o.dwa)}</small>`)).join('')||'<p>Belum ada pesanan.</p>'});
 $('#f').onsubmit=go(async e=>{e.preventDefault();await api('order',Object.fromEntries(new FormData(e.target)));e.target.reset();load()});
 load();setInterval(load,15000)};
P.driver=()=>{const s=guard('driver');$('#hi').textContent='Halo, '+s.nama;
 const A={Ditugaskan:[['Diterima','Terima'],['Ditolak','Tolak']],Diterima:[['Dijemput','Sudah dijemput']],Dijemput:[['Selesai','Selesaikan']]};
 const load=go(async()=>{const j=await api('dlist');$('#st').textContent=j.online;$('#tg').textContent=j.online=='Online'?'Jadi offline':'Jadi online';$('#tg').dataset.v=j.online=='Online'?'Offline':'Online';
  $('#list').innerHTML=j.list.map(o=>card(o,`<small>${esc(o.pn)} ${esc(o.cwa)}</small><div class="row">${(A[o.status]||[]).map(([v,t])=>`<button class="btn" data-id="${o.id}" data-st="${v}">${t}</button>`).join('')}</div>`)).join('')||'<p>Belum ada order.</p>'});
 $('#tg').onclick=go(async e=>{await api('online',{v:e.target.dataset.v});load()});
 $('#list').onclick=go(async e=>{const b=e.target.closest('button');if(b){await api('dstatus',{id:b.dataset.id,st:b.dataset.st});load()}});
 load();setInterval(load,10000)};
P.admin=()=>{const s=S.get();
 if(!s||s.role!='admin'){$('#app').hidden=true;$('#lg').onsubmit=go(async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.role='admin';S.set(await api('login',d));location.reload()});return}
 $('#lgbox').hidden=true;
 const load=go(async()=>{const j=await api('alist'),on=j.drivers.filter(d=>d.akun=='Aktif'&&d.online=='Online');
  $('#orders').innerHTML=j.list.map(o=>card(o,`<small>${esc(o.pn)} ${esc(o.cwa)}</small>`+(o.status=='Baru'?`<div class="row"><select>${on.map(d=>`<option value="${d.id}">${esc(d.nama)}</option>`).join('')||'<option value="">Tidak ada driver online</option>'}</select><button class="btn" data-assign="${o.id}">Assign</button></div>`:`<br><small>Driver: ${esc(o.dn)}</small>`))).join('')||'<p>Belum ada pesanan.</p>';
  $('#drivers').innerHTML=j.drivers.map(d=>`<div class="card"><b>${esc(d.nama)}</b> ${badge(d.akun)} ${badge(d.online)}<p>${esc(d.wa)} ${esc(d.kendaraan)} ${esc(d.plat)}</p>${d.akun!='Aktif'?`<button class="btn" data-verify="${d.id}">Verifikasi</button>`:''}</div>`).join('')});
 $('#app').onclick=go(async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.assign){await api('assign',{id:b.dataset.assign,driver:b.previousElementSibling.value});load()}
  if(b.dataset.verify){await api('verify',{id:b.dataset.verify});load()}});
 load();setInterval(load,15000)};
const out=$('#out');if(out)out.onclick=S.out;
P[document.body.dataset.page]();
