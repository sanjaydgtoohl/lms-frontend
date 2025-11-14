# Quick Console Commands Cheat Sheet

## Copy-Paste Commands to Test Token Refresh

### **1. Check if Auth Token Exists**
```javascript
document.cookie.split('; ').find(c => c.startsWith('auth_token'))
```

### **2. Check Token Expiry Time (Readable Format)**
```javascript
const exp = parseInt(document.cookie.split('; ').find(c => c.startsWith('auth_token_expires')).split('=')[1]);
new Date(exp).toLocaleString() + ' (in ' + ((exp - Date.now()) / 60000).toFixed(2) + ' minutes)'
```

### **3. Check Refresh Token Exists**
```javascript
document.cookie.split('; ').find(c => c.startsWith('refresh_token'))
```

### **4. Check Refresh Token Expiry Time**
```javascript
const exp = parseInt(document.cookie.split('; ').find(c => c.startsWith('refresh_token_expires')).split('=')[1]);
new Date(exp).toLocaleString() + ' (in ' + ((exp - Date.now()) / 3600000).toFixed(2) + ' hours)'
```

### **5. List All Auth Cookies**
```javascript
document.cookie.split('; ').filter(c => c.includes('token')).forEach(c => console.log(c))
```

### **6. Test API Request (Should Automatically Send Token)**
```javascript
fetch('/api/brands').then(r => r.json()).then(d => console.log('Success:', d)).catch(e => console.log('Error:', e))
```

### **7. Decode JWT Token and See Payload**
```javascript
const token = document.cookie.split('; ').find(c => c.startsWith('auth_token')).split('=')[1];
const decoded = JSON.parse(atob(token.split('.')[1]));
console.table(decoded);
```

### **8. Monitor Network Requests for Refresh Calls**
```javascript
// Run this, then make an API call or wait for auto-refresh
window.fetch = ((orig) => function(...args) {
  const [url, opts] = args;
  if (url.includes('/auth/refresh')) console.log('🔄 REFRESH:', url);
  return orig.apply(this, args).then(r => {
    if (url.includes('/auth/refresh')) console.log('✅ REFRESH SUCCESS');
    return r;
  }).catch(e => {
    if (url.includes('/auth/refresh')) console.log('❌ REFRESH FAILED:', e);
    throw e;
  });
})(window.fetch);
```

### **9. Check Current Time vs Token Expiry**
```javascript
const now = Date.now();
const exp = parseInt(document.cookie.split('; ').find(c => c.startsWith('auth_token_expires')).split('=')[1]);
console.log('NOW:', new Date(now).toLocaleTimeString());
console.log('EXPIRES:', new Date(exp).toLocaleTimeString());
console.log('DIFF (minutes):', ((exp - now) / 60000).toFixed(2));
```

### **10. Manually Trigger Refresh (If sessionManager Exposed)**
```javascript
// If sessionManager is available globally
if (typeof sessionManager !== 'undefined') {
  sessionManager.refreshTokens().then(() => console.log('✅ Manual refresh done')).catch(e => console.log('❌ Refresh failed:', e));
}
```

---

## **What to Look For in DevTools**

### **Network Tab**
1. Click **Network** tab
2. Make an API request or wait for auto-refresh
3. Look for `/auth/refresh` request
4. Check:
   - ✅ **Status: 200** (success)
   - ✅ **Headers → Authorization: Bearer <token>** (token sent)
   - ✅ **Response → token, refreshToken** (new tokens in response)

### **Application Tab (Cookies)**
1. Click **Application** tab
2. Click **Cookies** in sidebar
3. Click your domain
4. Look for:
   - ✅ `auth_token` (present, not empty)
   - ✅ `auth_token_expires` (epoch milliseconds)
   - ✅ `refresh_token` (present, not empty)
   - ✅ `refresh_token_expires` (epoch milliseconds)
   - ✅ **Secure** column ✓ (checked)
   - ✅ **SameSite** = Lax or Strict

### **Console Errors**
- Should see **NO errors** related to authentication
- If you see: "Unauthorized", "401", "Token expired" → refresh should handle it automatically
- Check Network tab to see if `/auth/refresh` call succeeded

---

## **One-Liner Test: Is Token Refresh Working?**

```javascript
console.log('✅ Token Refresh Working' + (document.cookie.includes('auth_token') && document.cookie.includes('refresh_token') ? '?' : '❌'));
console.log('Access Token:', document.cookie.split('; ').find(c => c.startsWith('auth_token')).substring(0, 50) + '...');
console.log('Expires in:', ((parseInt(document.cookie.split('; ').find(c => c.startsWith('auth_token_expires')).split('=')[1]) - Date.now()) / 60000).toFixed(0) + ' minutes');
```

**If you see:**
- ✅ Both tokens present
- ✅ Expiry time is positive (minutes remaining)
- ✅ No errors in console
- ✅ API requests show Authorization header in Network tab

**Then token refresh is WORKING!** 🎉

