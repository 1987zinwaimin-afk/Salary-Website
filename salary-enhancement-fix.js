(function(){
'use strict';
try{if(typeof S!=='undefined')window.S=S}catch(e){}
if(location.pathname.includes('/share.html')){
  if(!document.getElementById('salaryShareLayoutFixScript')){const s=document.createElement('script');s.id='salaryShareLayoutFixScript';s.src='salary-share-layout-fix.js?v=20260826-2';s.async=false;document.head.appendChild(s)}
  if(!document.getElementById('sharePaymentCaptureFixScript')){const s=document.createElement('script');s.id='sharePaymentCaptureFixScript';s.src='share-payment-capture-fix.js?v=20260826-1';s.async=false;document.head.appendChild(s)}
}
if(!location.pathname.includes('/share.html')&&!document.getElementById('ownerNotificationBellV2Script')){const s=document.createElement('script');s.id='ownerNotificationBellV2Script';s.src='owner-notification-bell.js?v=20260826-2';s.async=false;document.head.appendChild(s)}
if(!document.getElementById('salaryPaymentNotificationScript')){const s=document.createElement('script');s.id='salaryPaymentNotificationScript';s.src='payment-notification.js?v=20260826-3';s.async=false;document.head.appendChild(s)}
})();
