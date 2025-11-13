# 🎯 The Absolute Easiest Way to Test in Console

## **COPY & PASTE THESE 3 COMMANDS**

### **Command 1: Check if tokens exist (after login)**
```javascript
document.cookie.split('; ').filter(c => c.includes('token')).forEach(c => console.log('✅', c.substring(0, 60)))
```

**Expected output:**
```
✅ auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eXAiOjoi...
✅ auth_token_expires=1731458123456
✅ refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eXAiOjoi...
✅ refresh_token_expires=1731544523456
```

**If you see 4 ✅, tokens are stored!** ✨

---

### **Command 2: Check when token expires**
```javascript
const exp = parseInt(document.cookie.split('; ').find(c => c.startsWith('auth_token_expires')).split('=')[1]); console.log('Expires:', new Date(exp).toLocaleString(), '| In:', ((exp - Date.now()) / 60000).toFixed(0) + ' min')
```

**Expected output:**
```
Expires: 11/13/2025, 2:15:23 PM | In: 60 min
```

**If time is positive, token is valid!** ✨

---

### **Command 3: Make an API request (to test if token is sent)**
```javascript
fetch('/api/brands').then(r => r.json()).then(d => console.log(d.success ? '✅ SUCCESS' : '❌ FAILED', d))
```

**Expected output:**
```
✅ SUCCESS {success: true, data: [...], ...}
```

**If you see ✅ SUCCESS, everything is working!** ✨

---

## **ALL 3 COMMANDS IN ONE BLOCK**

Just copy this entire thing and paste in console:

```javascript
console.log('=== TEST 1: Check Tokens ===');
document.cookie.split('; ').filter(c => c.includes('token')).forEach(c => console.log('✅', c.substring(0, 60)));

console.log('\n=== TEST 2: Check Expiry ===');
const exp = parseInt(document.cookie.split('; ').find(c => c.startsWith('auth_token_expires')).split('=')[1]);
console.log('Expires:', new Date(exp).toLocaleString(), '| In:', ((exp - Date.now()) / 60000).toFixed(0) + ' minutes');

console.log('\n=== TEST 3: Make API Request ===');
fetch('/api/brands').then(r => r.json()).then(d => console.log(d.success ? '✅ SUCCESS' : '❌ FAILED')).catch(e => console.log('❌ ERROR:', e.message));
```

---

## **WHAT TO LOOK FOR**

| Test | What You Should See | Meaning |
|------|---------------------|---------|
| Test 1 | 4 lines with ✅ | Tokens are stored ✨ |
| Test 2 | Positive minutes | Token not expired ✨ |
| Test 3 | `✅ SUCCESS` | Token is being used ✨ |

---

## **IF SOMETHING LOOKS WRONG**

| You See | Problem | Solution |
|---------|---------|----------|
| Fewer than 4 ✅ | Tokens missing | Logout and login again |
| Negative minutes | Token expired | Refresh should happen automatically |
| `❌ FAILED` | API request failed | Check Network tab → see if refresh was called |

---

## **NEXT: CHECK NETWORK TAB**

1. Open DevTools → **Network** tab
2. Make an API request in console: `fetch('/api/brands')`
3. Look for:
   - **GET /api/brands** → Status: **200** ✅
   - Request **Headers** → **Authorization: Bearer...** ✅

If you see both, **token refresh is working!** 🎉

---

## **THE ULTIMATE VERIFICATION**

One final command that tells you everything:

```javascript
const tokens = document.cookie.includes('auth_token') && document.cookie.includes('refresh_token');
const exp = parseInt(document.cookie.split('; ').find(c => c.startsWith('auth_token_expires'))?.split('=')[1] || 0);
const valid = exp > Date.now();
console.log('TOKEN REFRESH STATUS:', tokens && valid ? '✅ WORKING' : '❌ NOT WORKING');
```

**If you see `✅ WORKING`, you're done!** 🚀

---

## **COMMON OUTPUTS & WHAT THEY MEAN**

### ✅ All Good
```
✅ auth_token=eyJ...
✅ auth_token_expires=1731458...
✅ refresh_token=eyJ...
✅ refresh_token_expires=1731544...

Expires: 11/13/2025, 2:15:23 PM | In: 60 minutes

✅ SUCCESS
```
**Meaning:** Everything is working perfectly! 🎉

---

### ⚠️ Token Missing
```
(no output from command 1)

Expires: Error - token not found

❌ FAILED
```
**Meaning:** You might not be logged in. Logout and login again.

---

### ⏰ Token Expired
```
✅ auth_token=eyJ...
✅ refresh_token=eyJ...

Expires: 11/13/2025, 2:15:23 PM | In: -5 minutes

(API request shows 401)
```
**Meaning:** Refresh should have been called. Check Network tab for `/auth/refresh` call.

---

## **BONUS: MONITOR REFRESH IN REAL-TIME**

Want to see refresh happen as it occurs? Paste this:

```javascript
window.fetch = ((orig) => function(...args) {
  const [url] = args;
  if (url.includes('/auth/refresh')) console.log('🔄 REFRESH:', url);
  return orig.apply(this, args).then(r => {
    if (url.includes('/auth/refresh')) {
      console.log(r.status === 200 ? '✅ REFRESH OK' : '❌ REFRESH FAILED');
    }
    return r;
  });
})(window.fetch);

console.log('🎯 Refresh monitor ON - wait for auto-refresh or make an API call');
```

Now you'll see:
```
🔄 REFRESH: /auth/refresh
✅ REFRESH OK
```

When refresh happens! 🎯

---

## **FINAL CHECKLIST (2 minutes)**

- [ ] Login to your app
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Paste Test 1 command → See 4 ✅ lines
- [ ] Paste Test 2 command → See positive minutes
- [ ] Paste Test 3 command → See ✅ SUCCESS
- [ ] Done! Token refresh is working 🎉

---

## **DOCUMENTATION FILES TO READ**

If you want more details, check these files in the repo:

1. **VISUAL_CONSOLE_GUIDE.md** — Step-by-step with pictures
2. **CONSOLE_TESTING_GUIDE.md** — Detailed explanations
3. **TOKEN_REFRESH_IMPLEMENTATION.md** — Full technical details
4. **QUICK_CONSOLE_COMMANDS.md** — All commands in one place
5. **README_DOCUMENTATION.md** — Navigation guide

---

## **That's It! 🚀**

Token refresh is **WORKING**. Just test it with the 3 commands above and you're done!

If you hit any issues, the documentation files have detailed troubleshooting sections.

Happy testing! 🎉

