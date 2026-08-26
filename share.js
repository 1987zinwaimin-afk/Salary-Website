(function(){
'use strict';

const STORE='salary_manager_v3';
const SHARE_PATH='/share.html#';
const SHARE_MAP='salary_live_share_tokens_v1';
const OWNER_KEY='salary_live_owner_token_v1';
const SUPABASE_URL='https://lsnmcdzupctwizxldjhc.supabase.co';
const SUPABASE_KEY='sb_publishable_iJQ9BpS19OtdaYXM31J3ag_Mhljn8Xi';

function readState(){try{return JSON.parse(localStorage.getItem(STORE)||'null')||{};}catch(e){return {};}}
function personName(l){return String(l?.name||l?.person||l?.employee||l?.borrower||l?.customer||l?.owner||'').trim();}
function cleanName(s){return String(s||'').replace(/^[^\p{L}\p{N}]+/u,'').trim();}
function loansFor(name){
  const s=readState();
  const arr=Array.isArray(s.debts)?s.debts:[];
  const target=cleanName(name);
  return arr.filter(l=>cleanName(personName(l))===target).map(l=>JSON.parse(JSON.stringify(l)));
}
function mapRead(){try{return JSON.parse(localStorage.getItem(SHARE_MAP)||'{}')||{};}catch(e){return {};}}
function mapWrite(x){try{localStorage.setItem(SHARE_MAP,JSON.stringify(x));}catch(e){}}
function ownerToken(){let t=localStorage.getItem(OWNER_KEY);if(!t){t=crypto.randomUUID();localStorage.setItem(OWNER_KEY,t)}return t;}
function tokenFor(name){const m=mapRead();const key=cleanName(name);if(!m[key]){m[key]=crypto.randomUUID();mapWrite(m)}return m[key];}
function shareUrl(name){return location.origin+SHARE_PATH+tokenFor(name);}

async function publish(name){
  const clean=cleanName(name);
  const token=tokenFor(clean);
  const payload={name:clean,loans:loansFor(clean),updatedAt:new Date().toISOString()};
  try{
    const r=await fetch(SUPABASE_URL+'/rest/v1/rpc/upsert_salary_share',{
      method:'POST',
      headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({p_owner_token:ownerToken(),p_share_token:token,p_person_name:clean,p_payload:payload})
    });
    if(!r.ok) throw new Error(await r.text());
    return true;
  }catch(e){console.warn('Live Share sync failed',e);return false;}
}

async function doShare(name){
  await publish(name);
  const url=shareUrl(name);
  try{
    if(navigator.share) await navigator.share({title:name+' - အကြွေးစာရင်း',text:name+' ရဲ့ Live အကြွေးစာရင်း',url});
    else {await navigator.clipboard.writeText(url);alert('Live Share Link ကို Copy လုပ်ပြီးပါပြီ။');}
  }catch(e){
    if(e&&e.name==='AbortError')return;
    try{await navigator.clipboard.writeText(url);alert('Live Share Link ကို Copy လုပ်ပြီးပါပြီ။');}
    catch(_){prompt('Live Share Link',url)}
  }
}

function addButtons(){
  document.querySelectorAll('.person').forEach(card=>{
    if(card.dataset.shareReady)return;
    const raw=(card.querySelector('b')?.textContent||card.textContent||'').trim().split('\n')[0].trim();
    const name=cleanName(raw);
    if(!name)return;
    const btn=document.createElement('button');
    btn.type='button';btn.className='sharePersonBtn';btn.textContent='↗ Live Share';
    btn.onclick=e=>{e.preventDefault();e.stopPropagation();doShare(name)};
    card.appendChild(btn);card.dataset.shareReady='1';
  });
}

function syncExisting(){
  const m=mapRead();
  Object.keys(m).forEach(name=>publish(name));
}
function watchState(){
  let last='';
  setInterval(()=>{
    try{
      const raw=localStorage.getItem(STORE)||'{}';
      if(raw!==last){last=raw;syncExisting();}
    }catch(e){}
  },1500);
}
function style(){
  if(document.getElementById('shareFeatureStyle'))return;
  const st=document.createElement('style');st.id='shareFeatureStyle';
  st.textContent='.sharePersonBtn{display:block;width:100%;margin-top:9px;padding:8px 10px;border-radius:11px;background:linear-gradient(135deg,#6948ff,#9a4dff);color:#fff;font-weight:800;font-size:11px;cursor:pointer}.sharePersonBtn:active{transform:scale(.98)}';
  document.head.appendChild(st);
}
function boot(){
  style();addButtons();
  const main=document.getElementById('main');
  if(main)new MutationObserver(()=>setTimeout(addButtons,0)).observe(main,{childList:true,subtree:true});
  syncExisting();watchState();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
