(function(){
  'use strict';
  // Replace the iPhone/Android system alert used after payment approval
  // with the app's existing in-page toast. Keep real error/login alerts.
  const nativeAlert = window.alert.bind(window);
  window.alert = function(message){
    const text = String(message ?? '');
    const isApprovalSuccess = /Approval.*(?:အောင်မြင်|ပြီးပါပြီ)|(?:Approval|အတည်ပြု).*ပေးချေ(?:မှု)?(?:ကို)?.*(?:အောင်မြင်|ပြီးပါပြီ)|ငွေပေးချေ.*(?:အောင်မြင်|ပြီးပါပြီ)/i.test(text);
    if (!isApprovalSuccess) return nativeAlert(message);

    try {
      if (typeof window.toast === 'function') {
        window.toast('✅ Approval အောင်မြင်ပါပြီ။ ငွေပေးချေမှုကို စာရင်းထဲ ထည့်ပြီးပါပြီ။');
        return;
      }
      const old = document.getElementById('approvalSuccessToast');
      if (old) old.remove();
      const el = document.createElement('div');
      el.id = 'approvalSuccessToast';
      el.textContent = '✅ Approval အောင်မြင်ပါပြီ။ ငွေပေးချေမှုကို စာရင်းထဲ ထည့်ပြီးပါပြီ။';
      el.style.cssText = 'position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:100000;width:min(430px,calc(100% - 24px));padding:14px 16px;border-radius:16px;background:#ffffff;color:#172033;box-shadow:0 15px 45px rgba(0,0,0,.22);border-left:5px solid #18b978;font-weight:800;font-size:13px;text-align:center;';
      document.body.appendChild(el);
      setTimeout(function(){ el.remove(); }, 4500);
    } catch (_) {
      // Do not interrupt the already-completed approval action.
    }
  };
})();
