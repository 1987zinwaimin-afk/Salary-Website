(function(){
'use strict';
const STORE='salary_manager_v3';
const SHARE_PATH='/share.html#';
function readState(){try{return JSON.parse(localStorage.getItem(STORE)||'null')||{};}catch(e){return {};}}
function personName(l){return String(l?.name||l?.person||l?.employee||l?.borrower||l?.customer||l?.owner||'').trim();}
function loansFor(name){const s=readState();const arr=Array.isArray(s.debts)?s.debts:[];return arr.filter(l=>personName(l)===name).map(l=>JSON.parse(JSON.stringify(l)));}
function b64(obj){const raw=encodeURIComponent(JSON.stringify(obj));return btoa(unescape(raw)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function shareUrl(name){return location.origin+SHARE_PATH+b64({name,loans:loansFor(name),createdAt:new Date().toISOString()});}
async function doShare(name){const url=shareUrl(name);try{if(navigator.share){await navigator.share({title:name+' - အကြွေးစာရင်း',text:name+' ရဲ့ အကြွေးစာရင်း',url});}else{await navigator.clipboard.writeText(url);alert('Share Link ကို Copy လုပ်ပြီးပါပြီ။');}}catch(e){if(e&&e.name==='AbortError')return;try{await navigator.clipboard.writeText(url);alert('Share Link ကို Copy လုပ်ပြီးပါပြီ။');}catch(_){prompt('Share Link',url);}}}
function addButtons(){document.querySelectorAll('.person').forEach(card=>{if(card.dataset.shareReady)return;const name=(card.querySelector('b')?.textContent||card.textContent||'').trim().split('\n')[0].trim();if(!name)return;const btn=document.createElement('button');btn.type='button';btn.className='sharePersonBtn';btn.textContent='↗ Share';btn.onclick=e=>{e.preventDefault();e.stopPropagation();doShare(name)};card.appendChild(btn);card.dataset.shareReady='1';});}
function style(){if(document.getElementById('shareFeatureStyle'))return;const st=document.createElement('style');st.id='shareFeatureStyle';st.textContent='.sharePersonBtn{display:block;width:100%;margin-top:9px;padding:8px 10px;border-radius:11px;background:linear-gradient(135deg,#6948ff,#9a4dff);color:#fff;font-weight:800;font-size:11px;cursor:pointer}.sharePersonBtn:active{transform:scale(.98)}';document.head.appendChild(st);}
function boot(){style();addButtons();const main=document.getElementById('main');if(main)new MutationObserver(()=>setTimeout(addButtons,0)).observe(main,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
