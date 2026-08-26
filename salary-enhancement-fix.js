(function(){
'use strict';
try{if(typeof S!=='undefined')window.S=S}catch(e){}

// Share links in this project use the main root page with a #<share-token>
// rather than /share.html. Load the share/payment capture layer for BOTH forms.
const isSharePage = location.pathname.includes('/share.html') || !!location.hash.slice(1).trim();
if(isSharePage){
  if(!document.getElementById('salaryShareLayoutFixScript')){
    const s=document.createElement('script');
    s.id='salaryShareLayoutFixScript';
    s.src='salary-share-layout-fix.js?v=20260826-3';
    s.async=false;
    document.head.appendChild(s);
  }
  if(!document.getElementById('sharePaymentCaptureFixScript')){
    const s=document.createElement('script');
    s.id='sharePaymentCaptureFixScript';
    s.src='share-payment-capture-fix.js?v=20260826-2';
    s.async=false;
    document.head.appendChild(s);
  }
}

// Owner notification UI remains available on the normal owner page.
if(!isSharePage&&!document.getElementById('ownerNotificationBellV2Script')){
  const s=document.createElement('script');
  s.id='ownerNotificationBellV2Script';
  s.src='owner-notification-bell.js?v=20260826-3';
  s.async=false;
  document.head.appendChild(s);
}
if(!document.getElementById('salaryPaymentNotificationScript')){
  const s=document.createElement('script');
  s.id='salaryPaymentNotificationScript';
  s.src='payment-notification.js?v=20260826-4';
  s.async=false;
  document.head.appendChild(s);
}
})();
