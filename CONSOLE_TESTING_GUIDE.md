# How to Check Token Refresh in Browser Console

## Step-by-Step Console Testing Guide

### **Step 1: Open Browser Developer Tools**

**Windows/Linux:**
- Press `F12` or `Ctrl + Shift + I`

**Mac:**
- Press `Cmd + Option + I`

Or right-click on page → **Inspect** → **Console** tab

---

## **Step 2: Check if Tokens are Stored (After Login)**

In the console, paste and run these commands one by one:

### **Check auth_token**
```javascript
document.cookie.split('; ').find(c => c.startsWith('auth_token'))
```

**Expected output:**
```
"auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Check auth_token_expires**
```javascript
document.cookie.split('; ').find(c => c.startsWith('auth_token_expires'))
```

**Expected output:**
```
"auth_token_expires=1731458123456"  // (epoch milliseconds)
```

### **Check refresh_token**
```javascript
document.cookie.split('; ').find(c => c.startsWith('refresh_token'))
```

**Expected output:**
```
"refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Check refresh_token_expires**
```javascript
document.cookie.split('; ').find(c => c.startsWith('refresh_token_expires'))
```

**Expected output:**
```
"refresh_token_expires=1731544523456"  // (epoch milliseconds - usually 7 days from now)
```

---

## **Step 3: Check Token Expiry Time**

See when your access token will expire:

```javascript
const expiresMs = parseInt(document.cookie.split('; ').find(c => c.startsWith('auth_token_expires')).split('=')[1]);
const expiresDate = new Date(expiresMs);
console.log('Access token expires at:', expiresDate.toLocaleString());
console.log('Minutes until expiry:', ((expiresMs - Date.now()) / 60000).toFixed(2));
```

**Expected output:**
```
Access token expires at: 11/13/2025, 2:15:23 PM
Minutes until expiry: 59.98
```

---

## **Step 4: Check if Session Manager is Scheduled**

The session manager schedules a refresh timer. To check if it's active:

```javascript
// Check the internal refresh timer state
// (This requires access to sessionManager, which should be exposed)
console.log('Session manager loaded');

// If you see no errors, timer is scheduled
```

---

## **Step 5: Watch Network Requests for Token Refresh**

Open **DevTools → Network tab** and watch for refresh calls:

1. **Go to Network tab** (next to Console)
2. **Filter for `/auth/refresh`** in the search box
3. **Wait for auto-refresh** (or make an API call that returns 401)
4. You should see a POST request to `/auth/refresh`

**What to look for:**
- **Request headers**: Should have `Authorization: Bearer <old_token>`
- **Request body**: Should contain `refreshToken: <refresh_token>`
- **Response headers**: May include new `Set-Cookie` headers (if HttpOnly is set by server)
- **Response body**: Should contain `success: true` and new `token` value

---

## **Step 6: Test Auto-Refresh Triggering (Simulated)**

To simulate token refresh without waiting 5 minutes before expiry:

```javascript
// Manually trigger refresh (simulates what happens automatically)
import { refreshTokens } from './services/sessionManager.ts';

// Call refresh directly
refreshTokens().then(() => {
  console.log('✅ Refresh successful!');
  console.log('New token:', document.cookie.split('; ').find(c => c.startsWith('auth_token')));
}).catch(err => {
  console.error('❌ Refresh failed:', err.message);
});
```

**Expected output:**
```
✅ Refresh successful!
New token: auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## **Step 7: Check Authorization Header on API Requests**

Make any API request and check if token is attached:

```javascript
// Make a test API request
fetch('/api/brands', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <check_if_token_here>'
  }
}).then(r => r.json()).then(d => console.log(d));
```

Or just **look in Network tab**:
1. Click on any API request
2. Go to **Headers** section
3. Look for **Authorization** header
4. Should show: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## **Step 8: Monitor Token Refresh in Console (Advanced)**

Add logging to see when refresh happens:

```javascript
// Add this to see refresh attempts
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;
  if (url.includes('/auth/refresh')) {
    console.log('🔄 [REFRESH] Calling /auth/refresh...', options?.body);
  }
  return originalFetch.apply(this, args)
    .then(r => {
      if (url.includes('/auth/refresh')) {
        console.log('✅ [REFRESH] Success! New token obtained');
      }
      return r;
    })
    .catch(e => {
      if (url.includes('/auth/refresh')) {
        console.log('❌ [REFRESH] Failed!', e);
      }
      throw e;
    });
};
```

Now when refresh happens, you'll see:
```
🔄 [REFRESH] Calling /auth/refresh...
✅ [REFRESH] Success! New token obtained
```

---

## **Step 9: Check 401 Retry Behavior**

To test if the interceptor detects 401 and retries:

1. **Make an API request** in console:
```javascript
fetch('/api/brands').then(r => r.json()).then(d => console.log(d));
```

2. **Look in Network tab** for this sequence:
   - First request to `/api/brands` → **401 response** (if token invalid)
   - Request to `/auth/refresh` → **200 response** (new token obtained)
   - Retry of `/api/brands` → **200 response** (success with new token)

3. **In Console**, you should see no error — the data is returned successfully

---

## **Step 10: Verify Cookies Are Secure**

Check cookie security flags:

```javascript
// List all cookies with their attributes
document.cookie.split('; ').forEach(c => {
  const [name, value] = c.split('=');
  console.log(`${name}: ${value.substring(0, 20)}...`);
});
```

**Expected output:**
```
auth_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
auth_token_expires: 1731458123456
refresh_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
refresh_token_expires: 1731544523456
```

To see **Secure, HttpOnly, SameSite flags**:
1. Open **DevTools → Application tab**
2. Click **Cookies** in left sidebar
3. Click your domain
4. Look at **Secure**, **HttpOnly**, **SameSite** columns
5. **Secure** and **SameSite=Lax** should be checked ✅
6. **HttpOnly** depends on server (may not be checked if server isn't setting it)

---

## **Checklist: Is Token Refresh Working?**

After login, verify all of these in console:

- [ ] `auth_token` cookie exists
- [ ] `auth_token_expires` shows future date
- [ ] `refresh_token` cookie exists  
- [ ] `refresh_token_expires` shows future date (7+ days)
- [ ] **Network tab** shows Authorization header on API requests
- [ ] API requests succeed (200 response)
- [ ] No 401 errors in Network tab (unless intentionally testing)
- [ ] Cookies have **Secure** and **SameSite=Lax** flags

---

## **Troubleshooting: What If Something's Wrong?**

### **Problem: No auth_token cookie**
```
❌ Cookie not found
```
**Solution:**
- Make sure you're logged in
- Check if login was successful (no error message)
- Check Network tab → login request → response contains token

### **Problem: Token is invalid/expired**
```javascript
// Decode token to check expiry
const token = document.cookie.split('; ').find(c => c.startsWith('auth_token')).split('=')[1];
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires at:', new Date(payload.exp * 1000).toLocaleString());
```

### **Problem: API requests fail with 401**
1. Check if token is attached to request (Network tab → Headers)
2. If attached but still 401, token may be invalid → refresh should trigger
3. Check if `/auth/refresh` call succeeds (Network tab → Response shows new token)

### **Problem: Refresh never happens**
1. Check if `sessionManager` is initialized (should happen on login)
2. Check browser console for any errors
3. Check if refresh timer is scheduled:
```javascript
// Run this right after login
setTimeout(() => {
  console.log('If you see this, page is still responsive');
}, 5000);
```

---

## **Real-World Example: Complete Test**

```javascript
// 1. Check tokens exist
console.log('=== TOKEN CHECK ===');
const cookies = document.cookie.split('; ');
console.log('Tokens found:', cookies.filter(c => c.includes('token')).length);

// 2. Check expiry times
console.log('\n=== EXPIRY TIMES ===');
const expiresMs = parseInt(cookies.find(c => c.includes('auth_token_expires')).split('=')[1]);
const refreshExpiresMs = parseInt(cookies.find(c => c.includes('refresh_token_expires')).split('=')[1]);
console.log('Access token expires in:', ((expiresMs - Date.now()) / 60000).toFixed(2), 'minutes');
console.log('Refresh token expires in:', ((refreshExpiresMs - Date.now()) / 3600000).toFixed(2), 'hours');

// 3. Make an API call to verify token is sent
console.log('\n=== API REQUEST TEST ===');
fetch('/api/brands')
  .then(r => r.json())
  .then(data => {
    console.log('✅ API call successful');
    console.log('Response:', data);
  })
  .catch(err => {
    console.log('❌ API call failed:', err.message);
  });
```

**Expected output:**
```
=== TOKEN CHECK ===
Tokens found: 4

=== EXPIRY TIMES ===
Access token expires in: 59.95 minutes
Refresh token expires in: 168.50 hours

=== API REQUEST TEST ===
✅ API call successful
Response: { success: true, data: [...], ... }
```

---

## **Summary**

To verify token refresh is working:

1. ✅ **Login** and see tokens in cookies
2. ✅ **Check Network tab** for Authorization header on requests
3. ✅ **Make API requests** and confirm they succeed
4. ✅ **Watch for /auth/refresh** call in Network tab (happens 5 min before expiry or on 401)
5. ✅ **Verify new token** is stored in cookies after refresh

If all checks pass, **token refresh is working correctly!** 🎉

