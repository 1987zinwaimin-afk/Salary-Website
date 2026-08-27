(function(){
'use strict';
const U='https://lsnmcdzupctwizxldjhc.supabase.co';
const K='sb_publishable_iJQ9BpS19OtdaYXM31J3ag_Mhljn8Xi';
const SHARE_MAP='salary_live_share_tokens_v1';
const STORE='salary_manager_v3';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>(+n||0).toLocaleString('en-US');
const money=(n,c)=>fmt(n)+' '+(c==='MMK'?'MMK':'THB');
function shareTokens(){
  const out=new Set();
  try{const m=JSON.parse(localStorage.getItem(SHARE_MAP)||'{}')||{};Object.values(m).forEach(v=>{if(v)out.add(String(v));});}catch(e){}
  try{const s=JSON.parse(localStorage.getItem(STORE)||'{}')||{};const m=s._shareTokens||{};Object.values(m).forEach(v=>{if(v)out.add(String(v));});}catch(e){}
  return [...out];
}
async function rpc(name,body){
  const r=await fetch(U+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:K,Authorization:'Bearer '+K,'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok)throw new Error(await r.text());
  return r.json();
}
let notifications=[];
let initialized=false;
let lastSig='';
function css(){
  if($('ownerRepairStyle'))return;
  const s=document.createElement('style');s.id='ownerRepairStyle';
  s.textContent=`
  .orBell{position:relative;width:45px;height:45px;border-radius:15px;background:#fff;box-shadow:0 8px 20px #34217a18;font-size:21px;cursor:pointer;color:#6540dc}
  .orBadge{position:absolute;right:4px;top:3px;min-width:18px;height:18px;padding:0 4px;border-radius:99px;background:#ef4760;color:#fff;font-size:9px;font-weight:900;display:grid;place-items:center;border:2px solid #fff}
  .orOverlay{position:fixed;inset:0;background:#10112077;z-index:10050;display:grid;place-items:end;padding:0}
  .orSheet{width:min(680px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:28px 28px 0 0;padding:18px;box-shadow:0 -20px 60px #0004}
  .orHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.orHead h2{margin:0;font-size:21px}.orClose{width:42px;height:42px;border-radius:14px;background:#f0f1f6;font-size:22px;color:#526078}
  .orTabs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:8px 0 12px}.orTab{padding:10px 6px;border-radius:13px;background:#f4f5f9;color:#657087;font-weight:900;font-size:11px}.orTab.on{background:#eee7ff;color:#6540dc}
  .orSection{margin-top:12px}.orSection h3{margin:0 0 7px;font-size:14px}.orItem{padding:12px;border-radius:16px;background:#f8f9fc;border:1px solid #e5e8ef;margin:7px 0}.orItem.pending{border-color:#a58cff;background:#fbf9ff}.orItem b{font-size:13px}.orSmall{display:block;color:#71809a;font-size:10px;margin-top:3px;line-height:1.4}.orAmount{font-size:16px;font-weight:950;color:#d83d54;margin-top:5px}.orBtns{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}.orApprove,.orReject{padding:11px;border:0;border-radius:12px;color:#fff;font-weight:900}.orApprove{background:linear-gradient(135deg,#12a66b,#22c98b)}.orReject{background:#ef4760}.orEmpty{padding:22px;text-align:center;color:#71809a}.orToast{position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:10100;width:min(520px,calc(100% - 24px));padding:13px 15px;border-radius:16px;background:#fff;box-shadow:0 15px 45px #0003;border-left:5px solid #18b978;font-size:12px;font-weight:850}
  `;document.head.appendChild(s);
}
function toast(msg,ok=true){css();const old=$('orToast');if(old)old.remove();const d=document.createElement('div');d.id='orToast';d.className='orToast';d.style.borderLeftColor=ok?'#18b978':'#ef4760';d.textContent=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),4500)}
function unreadCount(){const seen=new Set(JSON.parse(localStorage.getItem('salary_owner_seen_notification_ids_v2')||'[]'));return notifications.filter(n=>!seen.has(String(n.id))&&n.type!=='payment_approved'&&n.type!=='payment_rejected').length}
function setBellBadge(){const b=$('orBellV2');if(!b)return;const n=unreadCount();b.innerHTML='🔔'+(n?`<span class="orBadge">${n>99?'99+':n}</span>`:'')}
function markSeen(){localStorage.setItem('salary_owner_seen_notification_ids_v2',JSON.stringify(notifications.map(n=>String(n.id)).slice(0,300)));setBellBadge()}
function typeTitle(n){if(n.type==='view')return '👀 စာရင်းဝင်ကြည့်သူ';if(n.type==='payment_request')return '💸 ငွေပေးချေ Request';if(n.type==='payment_approved')return '✅ ငွေပေးချေပြီး';if(n.type==='payment_rejected')return '❌ Request ငြင်းပယ်ပြီး';return '🔔 Notification'}
function item(n){
  const pending=n.type==='payment_request'&&n.status==='pending';
  const amount=n.amount!=null?`<div class="orAmount">${money(n.amount,n.currency||'MMK')}</div>`:'';
  const person=esc(n.person_name||'');
  const payer=n.payer_name?`<span class="orSmall">👤 ငွေပေးသူ — ${esc(n.payer_name)}</span>`:'';
  const viewer=n.viewer_name?`<span class="orSmall">👀 ကြည့်သူ — ${esc(n.viewer_name)}</span>`:'';
  const time=n.created_at?new Date(n.created_at).toLocaleString():'';
  const actions=pending?`<div class="orBtns"><button class="orApprove" data-approve="${esc(n.id)}">✅ လက်ခံမည်</button><button class="orReject" data-reject="${esc(n.id)}">❌ ငြင်းမည်</button></div>`:'';
  return `<div class="orItem ${pending?'pending':''}"><b>${typeTitle(n)}</b><span class="orSmall">${person}</span>${payer}${viewer}${amount}<span class="orSmall">${esc(n.message||'')} · ${esc(time)}</span>${actions}</div>`;
}
function openPanel(){
  css();
  const old=$('orOverlay');if(old)old.remove();
  const views=notifications.filter(n=>n.type==='view');
  const req=notifications.filter(n=>n.type==='payment_request'&&n.status==='pending');
  const done=notifications.filter(n=>n.type==='payment_approved'||n.type==='payment_rejected');
  const d=document.createElement('div');d.id='orOverlay';d.className='orOverlay';
  d.innerHTML=`<div class="orSheet"><div class="orHead"><h2>🔔 Owner Notification</h2><button class="orClose" id="orClose">×</button></div><div class="orTabs"><button class="orTab on">👀 ကြည့်သူ ${views.length}</button><button class="orTab">💸 Request ${req.length}</button><button class="orTab">✅ History ${done.length}</button></div><div class="orSection"><h3>👀 စာရင်းဝင်ကြည့်သူ</h3>${views.length?views.slice(0,30).map(item).join(''):'<div class="orEmpty">စာရင်းဝင်ကြည့်သူ မရှိသေးပါ။</div>'}</div><div class="orSection"><h3>💸 ငွေပေးချေ Request</h3>${req.length?req.map(item).join(''):'<div class="orEmpty">Pending Request မရှိသေးပါ။</div>'}</div><div class="orSection"><h3>📋 ငွေပေးချေ History</h3>${done.length?done.slice(0,30).map(item).join(''):'<div class="orEmpty">History မရှိသေးပါ။</div>'}</div></div>`;
  document.body.appendChild(d);
  $('orClose').onclick=()=>d.remove();
  d.onclick=e=>{if(e.target===d)d.remove()};
  d.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>processRequest(b.dataset.approve,'approve'));
  d.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>processRequest(b.dataset.reject,'reject'));
  markSeen();
}
async function processRequest(id,action){
  const n=notifications.find(x=>String(x.id)===String(id));
  if(!n)return;
  const tokens=shareTokens();
  try{
    if(!tokens.length)throw new Error('share_tokens_missing');
    // The notification id is intentionally mapped to the payment request by the
    // server-side v2 RPCs; first try the existing request id, then locate the
    // matching pending request by its notification fields.
    const candidates=await rpc('get_salary_payment_request_by_notification',{p_notification_id:id,p_share_token:n.share_token});
    const requestId=Array.isArray(candidates)&&candidates[0]?.id?candidates[0].id:id;
    const ownerToken=await rpc('get_salary_owner_token_for_share',{p_share_token:n.share_token});
    const ot=Array.isArray(ownerToken)?ownerToken[0]?.owner_token:ownerToken?.owner_token;
    if(!ot)throw new Error('owner_token_missing');
    const fn=action==='approve'?'approve_salary_payment_request_v2':'reject_salary_payment_request_v2';
    await rpc(fn,{p_owner_token:ot,p_request_id:requestId});
    toast(action==='approve'?'✅ ငွေပေးချေမှုကို လက်ခံပြီးပါပြီ။':'❌ Payment Request ကို ငြင်းပယ်ပြီးပါပြီ။');
    await poll(true);openPanel();
  }catch(e){console.error(e);toast('❌ လုပ်ဆောင်မရသေးပါ။ '+String(e.message||'').slice(0,120),false)}
}
async function poll(force=false){
  try{
    const tokens=shareTokens();if(!tokens.length)return;
    const next=await rpc('get_salary_owner_notifications_by_share_tokens',{p_share_tokens:tokens});
    const arr=Array.isArray(next)?next:[];
    const sig=arr.slice(0,30).map(n=>String(n.id)+':'+String(n.status)).join('|');
    const old=notifications;notifications=arr;setBellBadge();
    if(!force&&sig&&sig!==lastSig&&initialized){const fresh=arr.find(n=>!old.some(o=>String(o.id)===String(n.id)));if(fresh)toast((fresh.type==='payment_request'?'💸 ':'👀 ')+(fresh.payer_name||fresh.viewer_name||fresh.person_name||'Notification')+' အသစ်ရရှိပါပြီ');}
    lastSig=sig;initialized=true;
  }catch(e){console.warn('owner notification repair',e)}
}
function installBell(){
  css();
  let b=$('orBellV2');
  if(!b){
    const pn=$('pnBell');
    if(pn){
      pn.id='orBellV2';b=pn;b.classList.add('orBell');
      b.onclick=null;
      b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openPanel()},true);
    }else{
      const row=document.querySelector('.toprow');const menu=row?.querySelector('.menuBtn');
      if(!row)return;
      b=document.createElement('button');b.id='orBellV2';b.type='button';b.className='orBell';b.title='Owner Notification';b.onclick=openPanel;
      row.insertBefore(b,menu||null);
    }
  }
  setBellBadge();
}
function boot(){
  css();installBell();
  const mo=new MutationObserver(()=>installBell());mo.observe(document.body,{childList:true,subtree:true});
  poll();setInterval(()=>poll(),3500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
