(function(){
'use strict';

const SUPABASE_URL='https://lsnmcdzupctwizxldjhc.supabase.co';
const SUPABASE_KEY='sb_publishable_iJQ9BpS19OtdaYXM31J3ag_Mhljn8Xi';
const OWNER_TABLE='owner_data';
const OWNER_EMAIL='1987zinwaimin@gmail.com';
const OWNER_INTENT_KEY='salary_owner_login_intent';
const OWNER_SITE_URL='https://waimin.vercel.app/';
let sb=null;
let sdkPromise=null;

function ensureSupabase(){
  if(window.supabase&&window.supabase.createClient){
    if(!sb) sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{
      auth:{
        /* Never persist the Owner session in localStorage/cookies.
           A shared URL therefore cannot reuse the Owner's session. */
        persistSession:false,
        autoRefreshToken:true,
        detectSessionInUrl:true,
        storageKey:'salary_owner_supabase_auth'
      }
    });
    return sb;
  }
  return null;
}

function loadSupabase(){
  if(ensureSupabase()) return Promise.resolve(sb);
  if(sdkPromise) return sdkPromise;
  sdkPromise=new Promise((resolve,reject)=>{
    let s=document.getElementById('supabaseOwnerSdk');
    if(!s){
      s=document.createElement('script');
      s.id='supabaseOwnerSdk';
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.async=true;
      document.head.appendChild(s);
    }
    s.addEventListener('load',()=>{const c=ensureSupabase();c?resolve(c):reject(new Error('Supabase SDK unavailable'))},{once:true});
    s.addEventListener('error',()=>reject(new Error('Supabase SDK load failed')),{once:true});
  });
  return sdkPromise;
}

function redirectUrl(){
  return location.origin===new URL(OWNER_SITE_URL).origin
    ? location.origin+location.pathname
    : OWNER_SITE_URL;
}

function style(){
  if(document.getElementById('ownerDataStyle'))return;
  const s=document.createElement('style');
  s.id='ownerDataStyle';
  s.textContent='.ownerBtn{background:linear-gradient(135deg,#fff7e8,#fff)!important;border:1px solid #f1dfb5!important}.ownerCard{background:#fff;border-radius:22px;padding:18px;box-shadow:0 12px 30px #34217a14}.ownerAvatar{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:#f0eaff;font-size:28px;margin:auto}.ownerField{width:100%;padding:13px;border:1px solid #dfe3ef;border-radius:13px;background:#fff;outline:0;margin-top:10px;box-sizing:border-box;font-size:16px}.ownerBtnMain{width:100%;padding:13px;border:0;border-radius:13px;background:linear-gradient(135deg,#6948ff,#9a4dff);color:#fff;font-weight:800;margin-top:10px}.ownerBtnAlt{width:100%;padding:12px;border:1px solid #d8dcef;border-radius:13px;background:#fff;color:#5946c7;font-weight:800;margin-top:9px}.ownerHint{font-size:11px;color:#71809a;line-height:1.45;text-align:center}.ownerSuccess{padding:10px;border-radius:12px;background:#e8f8f0;color:#16805a;font-size:12px;font-weight:700;margin-top:9px;text-align:center}.ownerError{padding:10px;border-radius:12px;background:#ffe7eb;color:#d83d54;font-size:12px;font-weight:700;margin-top:9px;text-align:center}.ownerTabs{display:flex;gap:8px;margin:12px 0}.ownerTab{flex:1;padding:10px;border:1px solid #ddd;border-radius:12px;background:#fff;font-weight:800;color:#64748b}.ownerTab.active{background:#eee9ff;border-color:#9a7cff;color:#6045d8}.ownerWait{padding:10px;border-radius:12px;background:#fff7df;color:#9a6b00;font-size:12px;font-weight:700;margin-top:9px;text-align:center}';
  document.head.appendChild(s);
}

function closeOwnerData(){const m=document.getElementById('modal');if(m){m.classList.add('hidden');m.innerHTML=''}}
function showMsg(html){const x=document.getElementById('ownerLoginMsg');if(x)x.innerHTML=html}
function waitMsg(t){showMsg('<div class="ownerWait">⏳ '+t+'</div>')}
function switchOwnerMode(mode){
  const reg=mode==='register';
  const a=document.getElementById('ownerRegisterBox'),b=document.getElementById('ownerLoginBox');
  if(a)a.style.display=reg?'block':'none';
  if(b)b.style.display=reg?'none':'block';
  document.getElementById('ownerTabReg')?.classList.toggle('active',reg);
  document.getElementById('ownerTabLogin')?.classList.toggle('active',!reg);
  showMsg('');
}

function ownerEmailValue(){
  return String(document.getElementById('ownerEmailInput')?.value||'').trim().toLowerCase();
}

async function ownerRegister(){
  try{
    const c=await loadSupabase();
    const email=ownerEmailValue();
    const p=String(document.getElementById('ownerPasswordInput')?.value||'');
    const cp=String(document.getElementById('ownerPasswordConfirm')?.value||'');
    if(email!==OWNER_EMAIL){showMsg('<div class="ownerError">❌ Owner Gmail မမှန်ပါ။</div>');return}
    if(p.length<6){showMsg('<div class="ownerError">❌ Password အနည်းဆုံး 6 လုံး ထည့်ပါ။</div>');return}
    if(p!==cp){showMsg('<div class="ownerError">❌ Password နှစ်ခု မတူပါ။</div>');return}
    waitMsg('Owner Register လုပ်နေသည်...');
    const {data,error}=await c.auth.signUp({email,password:p,options:{emailRedirectTo:redirectUrl()}});
    if(error){
      const em=String(error.message||'').toLowerCase();
      if(em.includes('already registered')||em.includes('already exists')||em.includes('user already registered')){
        showMsg('<div class="ownerError">⚠️ ဒီ Gmail နဲ့ Account ရှိပြီးသားပါ။ Gmail ကို Verify ပြီး Login ဝင်ပါ။</div>');
        switchOwnerMode('login');
        return;
      }
      throw error;
    }
    if(data?.user){
      if(data.session) await c.auth.signOut();
      showMsg('<div class="ownerSuccess">📧 Register အောင်မြင်ပါပြီ။ Gmail ထဲက Verification Email ကိုဖွင့်ပြီး Verify လုပ်ပါ။ ပြီးမှ Login ဝင်ပါ။</div>');
      setTimeout(()=>switchOwnerMode('login'),1200);
    }
  }catch(e){
    showMsg('<div class="ownerError">❌ Register မအောင်မြင်ပါ။ Supabase Gmail Verification setting နဲ့ Redirect URL ကိုစစ်ပါ။</div>');
    console.error('Owner Register:',e);
  }
}

async function ownerPasswordLogin(){
  try{
    const c=await loadSupabase();
    const email=ownerEmailValue();
    const password=String(document.getElementById('ownerPasswordInputLogin')?.value||'');
    if(email!==OWNER_EMAIL){showMsg('<div class="ownerError">❌ Owner Gmail မမှန်ပါ။</div>');return}
    if(!password){showMsg('<div class="ownerError">❌ Owner Password ထည့်ပါ။</div>');return}
    waitMsg('Owner Login စစ်နေသည်...');
    const {data,error}=await c.auth.signInWithPassword({email,password});
    if(error||!data?.user){
      const em=String(error?.message||'').toLowerCase();
      if(em.includes('email not confirmed')){showMsg('<div class="ownerError">📧 Gmail ကို အရင် Verify လုပ်ပါ။ Verification Email ကို ပြန်ပို့နိုင်ပါတယ်။</div>');return}
      showMsg('<div class="ownerError">❌ Gmail သို့မဟုတ် Password မမှန်ပါ။</div>');return;
    }
    sessionStorage.setItem(OWNER_INTENT_KEY,'1');
    try{
      const meta=data.user.user_metadata||{};
      await c.from(OWNER_TABLE).upsert({user_id:data.user.id,owner_name:meta.full_name||meta.name||'Owner',owner_email:OWNER_EMAIL,avatar_url:meta.avatar_url||meta.picture||'',updated_at:new Date().toISOString()},{onConflict:'user_id'});
    }catch(e){console.warn('owner_data upsert:',e)}
    showMsg('<div class="ownerSuccess">✅ Owner Login အောင်မြင်ပါပြီ။</div>');
    setTimeout(()=>closeOwnerData(),700);
  }catch(e){
    showMsg('<div class="ownerError">❌ Owner Login မအောင်မြင်ပါ။ Internet နဲ့ Supabase ကိုစစ်ပါ။</div>');
    console.error('Owner Login:',e);
  }
}

async function resendOwnerVerification(){
  try{
    const c=await loadSupabase();
    const email=ownerEmailValue();
    if(email!==OWNER_EMAIL){showMsg('<div class="ownerError">❌ Owner Gmail မမှန်ပါ။</div>');return}
    waitMsg('Gmail Verification Email ပြန်ပို့နေသည်...');
    const {error}=await c.auth.resend({type:'signup',email:OWNER_EMAIL,options:{emailRedirectTo:redirectUrl()}});
    if(error)throw error;
    showMsg('<div class="ownerSuccess">📧 Verification Email ပြန်ပို့ပြီးပါပြီ။ Gmail Inbox / Spam ထဲမှာ စစ်ပါ။</div>');
  }catch(e){
    showMsg('<div class="ownerError">❌ Verification Email မပို့နိုင်သေးပါ။ ခဏစောင့်ပြီး ထပ်စမ်းပါ။</div>');
    console.error('Owner resend:',e);
  }
}

function openOwnerData(){
  const m=document.getElementById('modal');if(!m)return;
  m.className='modal';m.classList.remove('hidden');
  m.innerHTML='<div class="sheet"><div class="sheethead"><h2>👑 Owner Data</h2><button class="close" onclick="closeOwnerData()">×</button></div><div class="ownerCard"><div class="ownerAvatar">👤</div><div style="font-weight:800;text-align:center;margin:8px 0;font-size:20px">Owner Account</div><div class="ownerHint">Owner Gmail ကို ကိုယ်တိုင်ထည့်ပြီး Register / Verify / Login လုပ်ပါ။ Link ရရုံနဲ့ Auto Login မဖြစ်ပါ။</div><div class="ownerTabs"><button id="ownerTabReg" class="ownerTab active" onclick="switchOwnerMode(\'register\')">📝 Register</button><button id="ownerTabLogin" class="ownerTab" onclick="switchOwnerMode(\'login\')">🔐 Login</button></div><input id="ownerEmailInput" class="ownerField" type="email" autocomplete="username" inputmode="email" value="" placeholder="Owner Gmail"><div id="ownerRegisterBox"><input id="ownerPasswordInput" class="ownerField" type="password" autocomplete="new-password" placeholder="Password"><input id="ownerPasswordConfirm" class="ownerField" type="password" autocomplete="new-password" placeholder="Confirm Password"><button class="ownerBtnMain" onclick="ownerRegister()">📝 Owner Register</button><button class="ownerBtnAlt" onclick="resendOwnerVerification()">📧 Gmail Verification ပြန်ပို့ရန်</button></div><div id="ownerLoginBox" style="display:none"><input id="ownerPasswordInputLogin" class="ownerField" type="password" autocomplete="current-password" placeholder="Owner Password"><button class="ownerBtnMain" onclick="ownerPasswordLogin()">🔐 Owner Login</button><button class="ownerBtnAlt" onclick="resendOwnerVerification()">📧 Verification Email ပြန်ပို့ရန်</button></div><div id="ownerLoginMsg" class="ownerHint" style="margin-top:10px"></div></div></div>';
}

function addMenu(){
  const drawer=document.querySelector('.drawer');
  if(!drawer||drawer.dataset.ownerReady)return;
  const b=document.createElement('button');b.className='mi ownerBtn';b.type='button';b.innerHTML='👑 Owner Data';
  b.onclick=function(){if(typeof closeMenu==='function')closeMenu();openOwnerData()};
  drawer.insertBefore(b,drawer.lastElementChild);drawer.dataset.ownerReady='1';
}
function boot(){
  style();
  loadSupabase().catch(()=>{});
  addMenu();
  const menu=document.getElementById('menu');
  if(menu)new MutationObserver(()=>setTimeout(addMenu,0)).observe(menu,{childList:true,subtree:true});
}

window.openOwnerData=openOwnerData;
window.closeOwnerData=closeOwnerData;
window.ownerPasswordLogin=ownerPasswordLogin;
window.ownerRegister=ownerRegister;
window.resendOwnerVerification=resendOwnerVerification;
window.switchOwnerMode=switchOwnerMode;

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
