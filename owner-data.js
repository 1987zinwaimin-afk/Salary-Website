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
        /* Do not persist the Owner session in localStorage/cookies. */
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
  s.textContent=`
    .ownerBtn{background:linear-gradient(135deg,#fff7e8,#fff)!important;border:1px solid #f1dfb5!important}
    .ownerCard{background:#fff;border-radius:22px;padding:18px;box-shadow:0 12px 30px #34217a14}
    .ownerAvatar{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:#f0eaff;font-size:28px;margin:auto}
    .ownerHint{font-size:11px;color:#71809a;line-height:1.45;text-align:center}
    .ownerGoogle{width:100%;padding:14px 16px;border:1px solid #d8dcef;border-radius:14px;background:#fff;color:#1f2937;font-weight:800;font-size:16px;margin-top:14px;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;box-sizing:border-box}
    .ownerGoogle:active{transform:scale(.99)}
    .ownerGoogleIcon{width:20px;height:20px;display:inline-block}
    .ownerSuccess{padding:10px;border-radius:12px;background:#e8f8f0;color:#16805a;font-size:12px;font-weight:700;margin-top:10px;text-align:center}
    .ownerError{padding:10px;border-radius:12px;background:#ffe7eb;color:#d83d54;font-size:12px;font-weight:700;margin-top:10px;text-align:center}
    .ownerWait{padding:10px;border-radius:12px;background:#fff7df;color:#9a6b00;font-size:12px;font-weight:700;margin-top:10px;text-align:center}
  `;
  document.head.appendChild(s);
}

function closeOwnerData(){
  const m=document.getElementById('modal');
  if(m){m.classList.add('hidden');m.innerHTML=''}
}

function showMsg(html){
  const x=document.getElementById('ownerLoginMsg');
  if(x)x.innerHTML=html;
}

function waitMsg(t){showMsg('<div class="ownerWait">⏳ '+t+'</div>')}

async function handleOwnerOAuthReturn(){
  try{
    const c=await loadSupabase();
    const {data:{session}}=await c.auth.getSession();
    if(!session?.user)return false;

    const email=String(session.user.email||'').trim().toLowerCase();
    if(email!==OWNER_EMAIL){
      await c.auth.signOut();
      showMsg('<div class="ownerError">❌ ဒီ Google Gmail ကို Owner အဖြစ် အသုံးပြုခွင့်မရှိပါ။</div>');
      return false;
    }

    sessionStorage.setItem(OWNER_INTENT_KEY,'1');
    try{
      const meta=session.user.user_metadata||{};
      await c.from(OWNER_TABLE).upsert({
        user_id:session.user.id,
        owner_name:meta.full_name||meta.name||'Owner',
        owner_email:email,
        avatar_url:meta.avatar_url||meta.picture||'',
        updated_at:new Date().toISOString()
      },{onConflict:'user_id'});
    }catch(e){console.warn('owner_data upsert:',e)}

    showMsg('<div class="ownerSuccess">✅ Google Owner Login အောင်မြင်ပါပြီ။</div>');
    setTimeout(()=>closeOwnerData(),700);
    return true;
  }catch(e){
    console.error('Owner OAuth return:',e);
    showMsg('<div class="ownerError">❌ Google Login စစ်ဆေးရာတွင် ပြဿနာရှိနေပါသည်။</div>');
    return false;
  }
}

async function ownerGoogleLogin(){
  try{
    const c=await loadSupabase();
    waitMsg('Google Login ဖွင့်နေသည်...');
    const {error}=await c.auth.signInWithOAuth({
      provider:'google',
      options:{
        redirectTo:redirectUrl(),
        queryParams:{prompt:'select_account'}
      }
    });
    if(error)throw error;
  }catch(e){
    console.error('Owner Google Login:',e);
    showMsg('<div class="ownerError">❌ Google Login မဖွင့်နိုင်သေးပါ။ Supabase ထဲမှာ Google Provider ကို Enable လုပ်ထားကြောင်း စစ်ပါ။</div>');
  }
}

function openOwnerData(){
  const m=document.getElementById('modal');
  if(!m)return;
  m.className='modal';
  m.classList.remove('hidden');
  m.innerHTML=`
    <div class="sheet">
      <div class="sheethead">
        <h2>👑 Owner Data</h2>
        <button class="close" onclick="closeOwnerData()">×</button>
      </div>
      <div class="ownerCard">
        <div class="ownerAvatar">👤</div>
        <div style="font-weight:800;text-align:center;margin:8px 0;font-size:20px">Owner Account</div>
        <div class="ownerHint">Pattaya Dinosaur Kingdom မှာသုံးထားတဲ့ပုံစံအတိုင်း Google Gmail နဲ့ Owner Login ဝင်ပါ။</div>
        <button class="ownerGoogle" type="button" onclick="ownerGoogleLogin()">
          <span class="ownerGoogleIcon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M21.35 12.27c0-.78-.07-1.53-.2-2.25H12v4.26h5.24a4.47 4.47 0 0 1-1.95 2.94v2.45h3.15c1.85-1.7 2.91-4.2 2.91-7.4z"/><path fill="#34A853" d="M12 21.5c2.64 0 4.85-.87 6.47-2.36l-3.15-2.45c-.87.58-1.98.92-3.32.92-2.55 0-4.71-1.72-5.49-4.03H3.25v2.53A9.77 9.77 0 0 0 12 21.5z"/><path fill="#FBBC05" d="M6.51 13.58A5.87 5.87 0 0 1 6.2 12c0-.55.1-1.09.31-1.58V7.89H3.25A9.76 9.76 0 0 0 2.22 12c0 1.57.38 3.05 1.03 4.11l3.26-2.53z"/><path fill="#EA4335" d="M12 6.39c1.44 0 2.73.5 3.75 1.48l2.81-2.81C16.85 3.42 14.64 2.5 12 2.5a9.77 9.77 0 0 0-8.75 5.39l3.26 2.53C7.29 8.11 9.45 6.39 12 6.39z"/></svg>
          </span>
          <span>Continue with Google</span>
        </button>
        <div id="ownerLoginMsg" class="ownerHint" style="margin-top:10px"></div>
      </div>
    </div>`;
  handleOwnerOAuthReturn();
}

function addMenu(){
  const drawer=document.querySelector('.drawer');
  if(!drawer||drawer.dataset.ownerReady)return;
  const b=document.createElement('button');
  b.className='mi ownerBtn';
  b.type='button';
  b.innerHTML='👑 Owner Data';
  b.onclick=function(){if(typeof closeMenu==='function')closeMenu();openOwnerData()};
  drawer.insertBefore(b,drawer.lastElementChild);
  drawer.dataset.ownerReady='1';
}

function boot(){
  style();
  loadSupabase().then(()=>handleOwnerOAuthReturn()).catch(()=>{});
  addMenu();
  const menu=document.getElementById('menu');
  if(menu)new MutationObserver(()=>setTimeout(addMenu,0)).observe(menu,{childList:true,subtree:true});
}

window.openOwnerData=openOwnerData;
window.closeOwnerData=closeOwnerData;
window.ownerGoogleLogin=ownerGoogleLogin;

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
