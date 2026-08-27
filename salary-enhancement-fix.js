(function(){
'use strict';
try{if(typeof S!=='undefined')window.S=S}catch(e){}
const hash=location.hash.slice(1).trim();
const isAppRoute=/^(dashboard|attendance|salary|debt|settings|login)$/i.test(hash);
const isSharePage = location.pathname.includes('/share.html') || (!!hash && !isAppRoute);
if(isSharePage){
  if(!document.getElementById('salaryShareLayoutFixScript')){const s=document.createElement('script');s.id='salaryShareLayoutFixScript';s.src='salary-share-layout-fix.js?v=20260827-2';s.async=false;document.head.appendChild(s)}
  if(!document.getElementById('sharePaymentCaptureFixScript')){const s=document.createElement('script');s.id='sharePaymentCaptureFixScript';s.src='share-payment-capture-fix.js?v=20260827-2';s.async=false;document.head.appendChild(s)}
  if(!document.getElementById('sharePaymentApprovalV3Script')){const s=document.createElement('script');s.id='sharePaymentApprovalV3Script';s.src='share-payment-approval-v3.js?v=20260827-1';s.async=false;document.head.appendChild(s)}
}
if(!isSharePage&&!document.getElementById('ownerNotificationBellV2Script')){const s=document.createElement('script');s.id='ownerNotificationBellV2Script';s.src='owner-notification-bell.js?v=20260827-2';s.async=false;document.head.appendChild(s)}
if(!isSharePage&&!document.getElementById('salaryPaymentNotificationScript')){const s=document.createElement('script');s.id='salaryPaymentNotificationScript';s.src='payment-notification.js?v=20260827-6';s.async=false;document.head.appendChild(s)}
})();
