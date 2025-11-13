# Step-by-Step Visual Guide: Check Token Refresh in Console

## **🎯 Quick 5-Minute Test**

### **Step 1: Login to Your App**
```
1. Open the LMS frontend in your browser
2. Go to login page
3. Enter your credentials and click Login
4. Wait for redirect to dashboard
```

---

### **Step 2: Open Browser Developer Tools**

**Option A: Keyboard Shortcut**
- **Windows/Linux**: Press `F12`
- **Mac**: Press `Cmd + Option + I`

**Option B: Right-Click Menu**
- Right-click on the page
- Click **"Inspect"** or **"Inspect Element"**

**You should see:**
```
┌─────────────────────────────────┐
│  Elements | Console | Sources   │ ← Click "Console"
│                                 │
│  > Type commands here            │
│                                 │
└─────────────────────────────────┘
```

---

### **Step 3: Copy-Paste This Command in Console**

Click in the **Console input area** (where you see `>`), then paste:

```javascript
console.log('Tokens:', document.cookie.split('; ').filter(c => c.includes('token')).length > 0 ? '✅ Found' : '❌ Not found');
console.log('Auth Token:', document.cookie.split('; ').find(c => c.startsWith('auth_token')) ? '✅ Present' : '❌ Missing');
console.log('Refresh Token:', document.cookie.split('; ').find(c => c.startsWith('refresh_token')) ? '✅ Present' : '❌ Missing');
const exp = parseInt(document.cookie.split('; ').find(c => c.startsWith('auth_token_expires'))?.split('=')[1] || 0);
console.log('Expires in:', exp ? ((exp - Date.now()) / 60000).toFixed(2) + ' minutes' : 'No expiry found');
```

**Press Enter**

---

### **Step 4: What You Should See**

If everything is working:
```
Tokens: ✅ Found
Auth Token: ✅ Present
Refresh Token: ✅ Present
Expires in: 59.95 minutes
```

---

## **🔍 Detailed Console Tests**

### **Test A: Check Individual Tokens**

**Type in console:**
```javascript
document.cookie
```

**Expected output (sample):**
```
"auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; auth_token_expires=1731458123456; refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; refresh_token_expires=1731544523456"
```

---

### **Test B: Check Token Expiry in Human-Readable Format**

**Type in console:**
```javascript
const exp = parseInt(document.cookie.split('; ').find(c => c.startsWith('auth_token_expires')).split('=')[1]);
console.log('Expires:', new Date(exp).toLocaleString());
console.log('In minutes:', ((exp - Date.now()) / 60000).toFixed(2));
```

**Expected output:**
```
Expires: 11/13/2025, 2:15:23 PM
In minutes: 59.85
```

---

### **Test C: Check Refresh Token Expiry**

**Type in console:**
```javascript
const exp = parseInt(document.cookie.split('; ').find(c => c.startsWith('refresh_token_expires')).split('=')[1]);
console.log('Refresh expires:', new Date(exp).toLocaleString());
console.log('In days:', ((exp - Date.now()) / (24 * 3600000)).toFixed(1));
```

**Expected output:**
```
Refresh expires: 11/20/2025, 2:15:23 PM
In days: 7.0
```

---

### **Test D: Make an API Request**

**Type in console:**
```javascript
fetch('/api/brands').then(r => r.json()).then(d => console.log('✅ Success:', d)).catch(e => console.log('❌ Error:', e.message))
```

**Expected output:**
```
✅ Success: {success: true, data: [...], ...}
```

---

## **📊 Check Network Requests**

### **Step 1: Open Network Tab**
```
1. Click "Network" tab (next to Console)
2. Make sure recording is ON (red dot in top-left)
3. Clear previous requests (trash icon)
```

### **Step 2: Make an API Request**
```javascript
fetch('/api/brands')
```

### **Step 3: Look for Request in Network Tab**

You should see a request like:
```
GET /api/brands → Status: 200
```

**Click on it to see details:**

### **Step 4: Check Request Headers**

Click **Headers** tab under the request, scroll down to see:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ If you see this, token is being sent correctly!

---

## **🍪 Check Cookies in Application Tab**

### **Step 1: Click Application Tab**
```
At the top of DevTools, click "Application" (or "Storage" in Firefox)
```

### **Step 2: Click Cookies in Sidebar**
```
Left sidebar → Cookies → click your domain (e.g., localhost:5173)
```

### **Step 3: You Should See Cookies Table**

```
┌──────────────────┬─────────┬──────────────┬────────────┐
│ Name             │ Value   │ Domain       │ Secure     │
├──────────────────┼─────────┼──────────────┼────────────┤
│ auth_token       │ eyJ...  │ localhost    │ ✓          │
│ auth_token_ex... │ 173...  │ localhost    │ ✓          │
│ refresh_token    │ eyJ...  │ localhost    │ ✓          │
│ refresh_token... │ 173...  │ localhost    │ ✓          │
└──────────────────┴─────────┴──────────────┴────────────┘
```

**Look for:**
- ✅ 4 cookies present (auth_token, auth_token_expires, refresh_token, refresh_token_expires)
- ✅ Each has a value (not empty)
- ✅ Secure column has checkmark ✓

---

## **⏱️ Monitor Refresh Happening (Advanced)**

### **Step 1: Set Up Monitoring in Console**

**Type this:**
```javascript
window._refreshLog = [];

const origFetch = window.fetch;
window.fetch = function(...args) {
  const [url] = args;
  if (url.includes('/auth/refresh')) {
    const log = `🔄 ${new Date().toLocaleTimeString()} - REFRESH called`;
    window._refreshLog.push(log);
    console.log(log);
  }
  return origFetch.apply(this, args)
    .then(r => {
      if (url.includes('/auth/refresh')) {
        const log = `✅ ${new Date().toLocaleTimeString()} - REFRESH success`;
        window._refreshLog.push(log);
        console.log(log);
      }
      return r;
    })
    .catch(e => {
      if (url.includes('/auth/refresh')) {
        const log = `❌ ${new Date().toLocaleTimeString()} - REFRESH failed: ${e.message}`;
        window._refreshLog.push(log);
        console.log(log);
      }
      throw e;
    });
};
console.log('✅ Refresh monitor enabled - watch this space!');
```

### **Step 2: Wait or Trigger Refresh**

Now when refresh happens, you'll see in console:
```
🔄 2:14:45 PM - REFRESH called
✅ 2:14:46 PM - REFRESH success
```

---

## **🚀 Complete Verification Checklist**

Use this checklist to verify everything is working:

```
BEFORE LOGIN:
[ ] No auth_token cookie
[ ] No refresh_token cookie

AFTER LOGIN:
[ ] auth_token cookie present
[ ] auth_token_expires cookie present (future date)
[ ] refresh_token cookie present
[ ] refresh_token_expires cookie present (7 days from now)
[ ] Console shows 4 tokens found
[ ] No errors in console

API REQUESTS:
[ ] Network tab shows Authorization header on requests
[ ] API requests return 200 OK
[ ] No 401 errors
[ ] Response data shows expected results

REFRESH BEHAVIOR:
[ ] Network tab shows /auth/refresh call (wait 5 min before expiry, or trigger via console)
[ ] /auth/refresh returns 200 OK
[ ] New token is different from old token (check in console)
[ ] Cookies are updated with new token (check Application tab)

SECURITY:
[ ] All auth cookies have Secure flag ✓
[ ] All auth cookies have SameSite flag (Lax or Strict)
[ ] HttpOnly flag may or may not be present (depends on server setup)
```

---

## **❌ Troubleshooting: What If Tests Fail?**

### **Problem: No tokens after login**
```
❌ auth_token cookie missing
```
**Debug:**
1. Check if login succeeded (no error message, redirected to dashboard)
2. Network tab → login request → check response has token
3. Check browser console for JavaScript errors
4. Verify `/auth/login` endpoint is correct in `src/constants/index.ts`

### **Problem: Tokens exist but API requests fail**
```
❌ API request returns 401
```
**Debug:**
1. Network tab → API request → Headers tab
2. Check if Authorization header is present
3. If present but still 401: token might be invalid
4. Console: Check token expiry time
5. If expired, refresh should have been called → check /auth/refresh call

### **Problem: Refresh never called**
```
❌ /auth/refresh not showing in Network tab
```
**Debug:**
1. Token might not be near expiry (need to wait ~5 min before expiry)
2. Manually trigger: `sessionManager.refreshTokens()` in console
3. Check console for errors
4. Verify `/auth/refresh` endpoint is correct

---

## **📝 Summary: Key Commands to Remember**

| What to Check | Command |
|---------------|---------|
| All cookies | `document.cookie` |
| Auth token exists | `document.cookie.includes('auth_token')` |
| Token expiry time | `new Date(parseInt(document.cookie.split('; ').find(c => c.startsWith('auth_token_expires')).split('=')[1])).toLocaleString()` |
| Make API request | `fetch('/api/brands').then(r => r.json()).then(d => console.log(d))` |
| Manually refresh | `sessionManager.refreshTokens()` |
| Monitor refresh | See Advanced section above |

---

## **✅ Success Indicators**

You'll know token refresh is **WORKING** when you see:

1. ✅ Tokens present in cookies after login
2. ✅ Authorization header visible in Network tab
3. ✅ API requests succeed (200 OK)
4. ✅ No 401 errors in Network tab
5. ✅ `/auth/refresh` call happens automatically (if waiting 5 min before expiry)
6. ✅ New tokens stored in cookies after refresh

If all 6 are ✅, **you're good to go!** 🎉

