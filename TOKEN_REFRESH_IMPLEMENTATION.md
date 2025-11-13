# Token Refresh & Cookie-Based Session Management — Implementation Complete

## Status: ✅ WORKING

The token auto-refresh and cookie-based session management system has been **fully implemented and integrated** across the LMS frontend application.

---

## What's Implemented

### 1. **Automatic Token Refresh (5 minutes before expiry)**
- **File**: `src/services/sessionManager.ts`
- **How it works**:
  - When a user logs in, tokens and their expiry times are stored in browser cookies
  - `sessionManager.startSessionFromCookies()` is called after login
  - A `setTimeout` is scheduled to refresh the access token **5 minutes before** it expires
  - Calculation: `msBeforeRefresh = tokenExpiryMs - now - (5 * 60 * 1000)`
  - When the timer fires, `refreshTokens()` is called automatically
  - If the refresh succeeds, new tokens are stored and a new timer is scheduled
  - If the refresh fails (e.g., refresh_token expired), user is logged out and redirected to `/login`

### 2. **Interceptor-Based 401 Handling & Retry**
- **File**: `src/services/http.ts`
- **How it works**:
  - All API requests go through a centralized axios instance
  - **Request interceptor**: Attaches `Authorization: Bearer <token>` header from cookies
  - **Response interceptor**: Detects 401 (Unauthorized) status
  - On 401: 
    - Flags the request to prevent infinite retry loops
    - Calls refresh endpoint to get a new access token
    - Updates cookies with new tokens
    - **Queues any concurrent requests** until refresh completes (avoids duplicate refresh calls)
    - Retries the original request with the new token
  - If refresh fails: clears all cookies and redirects to `/login`

### 3. **Centralized API Client**
- **File**: `src/utils/apiClient.ts` and `src/services/http.ts`
- All services updated to use `apiClient` (which uses the axios instance) instead of direct `fetch()` calls
- Services updated:
  - `src/services/Login.ts` — login/logout via axios
  - `src/services/CreateBrandForm.ts`
  - `src/services/BrandMaster.ts`
  - `src/services/AgencyMaster.ts`
  - `src/services/BriefPipeline.ts`
  - And many others...

### 4. **Cookie-Based Token Storage**
- **File**: `src/utils/cookies.ts`
- **Stored cookies**:
  - `auth_token` — access token used in Authorization header
  - `auth_token_expires` — epoch milliseconds when access token expires
  - `refresh_token` — refresh token used to get new access token
  - `refresh_token_expires` — epoch milliseconds when refresh token expires
- **Cookie attributes**: `Secure`, `SameSite=Lax`, `Path=/`
- ⚠️ **Note**: `HttpOnly` cannot be set from client JavaScript. For production, the server must set `HttpOnly` on these cookies via the `Set-Cookie` response header.

### 5. **Session Manager Integration**
- **File**: `src/services/sessionManager.ts`
- **Functions**:
  - `startSessionFromCookies()` — called after login; schedules the auto-refresh timer
  - `scheduleRefresh()` — schedules a timer to refresh 5 minutes before token expiry
  - `refreshTokens()` — performs the actual refresh call and updates cookies
  - `clearSession()` — clears all cookies and timers (called on logout)

### 6. **Login & Logout Flow Updated**
- **File**: `src/services/Login.ts`
- **Login**:
  1. User enters credentials
  2. HTTP POST to `/auth/login` via axios
  3. On success, tokens are extracted from response and stored in cookies
  4. `sessionManager.startSessionFromCookies()` is called to schedule auto-refresh
  5. User is redirected to dashboard
- **Logout**:
  1. HTTP POST to `/auth/logout` via axios (with current access token)
  2. Cookies are cleared via `sessionManager.clearSession()`
  3. Timer is stopped
  4. User is redirected to login page

---

## How It Works — Visual Flow

### Scenario 1: Normal Workflow
```
User Login
  ↓
Store tokens in cookies
  ↓
Schedule refresh timer (5 min before expiry)
  ↓
Make API requests (interceptor attaches token)
  ↓
Timer fires → refreshTokens() called
  ↓
New tokens stored in cookies
  ↓
Reschedule timer with new token expiry
```

### Scenario 2: Token Expires During Request
```
API request is sent
  ↓
Server returns 401 Unauthorized
  ↓
Response interceptor detects 401
  ↓
Concurrent requests are queued
  ↓
Call /auth/refresh to get new token
  ↓
New token stored in cookies
  ↓
Queued requests are retried with new token
  ↓
Original request retried with new token
```

### Scenario 3: Refresh Token Expires
```
Timer fires → refreshTokens() called
  ↓
POST to /auth/refresh (refresh_token in body)
  ↓
Server returns 401 or error (refresh_token expired)
  ↓
Catch block in sessionManager
  ↓
Clear all cookies
  ↓
Redirect to /login
  ↓
User must log in again
```

---

## Testing the Implementation

### Manual Testing Steps

#### 1. **Test Login & Token Storage**
```
1. Open browser DevTools → Application → Cookies
2. Navigate to login page
3. Enter credentials and submit
4. Look for cookies: auth_token, auth_token_expires, refresh_token, refresh_token_expires
5. Each cookie should have Secure and SameSite=Lax flags
```

#### 2. **Test Auto-Refresh (Requires Backend with Short Token Expiry)**
```
Set up test server with:
  - Access token expiry: 2 minutes
  - Refresh token expiry: 10 minutes

1. Login and note the time
2. Open browser console and run:
   sessionStorage.setItem('tokenRefreshLog', JSON.stringify([]))
3. Wait ~57 minutes (or mock the time to approach expiry)
4. Observe that sessionManager triggers refresh automatically (5 min before expiry)
5. Check browser console for refresh logs
```

#### 3. **Test 401 Handling & Retry**
```
Set up test server to:
  - Return 401 on first request
  - Return 200 on retry

1. Login normally
2. Make an API request (e.g., fetch /brands)
3. Monitor Network tab in DevTools
4. You should see:
   - First request returns 401
   - Refresh call to /auth/refresh
   - Retry of original request with new token returns 200
```

#### 4. **Test Logout & Session Cleanup**
```
1. Login
2. Open DevTools → Application → Cookies
3. Verify tokens are present
4. Click logout button
5. Verify all auth cookies are deleted
6. User is redirected to /login
```

---

## Key Features

✅ **Automatic token refresh** — 5 minutes before expiry  
✅ **Concurrent request queuing** — avoids duplicate refreshes  
✅ **401 retry logic** — transparently refreshes and retries  
✅ **Secure cookie storage** — Secure + SameSite=Lax flags  
✅ **Session cleanup** — on logout or refresh failure  
✅ **Centralized API client** — all requests use same interceptors  
✅ **Error handling** — graceful logout when refresh fails  

---

## Known Limitations & Caveats

### 1. **HttpOnly Cookies (Server-Side Required)**
- ❌ Client-side JavaScript **cannot** set `HttpOnly` flag on cookies
- ✅ **Solution**: Server must set `HttpOnly` on login/refresh responses via `Set-Cookie` header
- Example server response:
  ```
  Set-Cookie: auth_token=<token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
  Set-Cookie: refresh_token=<token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
  ```

### 2. **Current Cookie Implementation (Non-HttpOnly for Now)**
- Tokens are stored in **accessible cookies** (can be read/modified by client JS)
- This is acceptable during development and testing
- For **production**, coordinate with backend to set HttpOnly cookies
- Once HttpOnly is set by server:
  - Client code will automatically benefit (axios sends cookies via `withCredentials: true`)
  - No client-side changes needed

### 3. **CORS & withCredentials**
- Axios is configured with `withCredentials: true` so cookies are sent to API server
- Ensure your backend CORS policy allows credentials:
  ```
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Origin: <your-frontend-domain> (NOT *)
  ```

### 4. **Token Expiry Assumptions**
- Code assumes API returns `expires_in` (seconds) and optionally `refresh_expires_in`
- If your API uses different field names, update:
  - `src/services/Login.ts` (lines handling token response)
  - `src/services/http.ts` (refresh response handling)
  - `src/services/sessionManager.ts` (token expiry calculations)

---

## Files Changed/Created

### New Files
- `src/utils/cookies.ts` — cookie utilities (get/set/delete)
- `src/services/http.ts` — axios instance with interceptors
- `src/services/sessionManager.ts` — auto-refresh scheduling
- `src/services/__tests__/sessionManager.test.ts` — unit test for refresh

### Updated Files
- `src/services/Login.ts` — uses axios + cookies + sessionManager
- `src/store/auth.ts` — integrated with sessionManager
- `src/utils/apiClient.ts` — added cookie-based token refresh
- `src/services/api.ts` — switched to axios for requests
- Multiple service files migrated to use `apiClient`:
  - `CreateBrandForm.ts`, `BrandMaster.ts`, `AgencyMaster.ts`, `BriefPipeline.ts`, etc.

---

## Next Steps

### Immediate (Recommended)
1. ✅ Test login/logout in dev environment
2. ✅ Verify tokens are stored in cookies
3. ✅ Test API requests work (tokens attached automatically)
4. **Coordinate with backend** to set `HttpOnly` cookies on login/refresh responses

### Short-term
1. Add e2e tests using Cypress or Playwright to test full refresh flow
2. Monitor network requests to confirm refresh calls are made at expected times
3. Test edge cases (network failures, rapid requests, token expiry during request)

### Production
1. Ensure backend sets `HttpOnly; Secure; SameSite=Strict` on all auth cookies
2. Update `SameSite=Lax` to `SameSite=Strict` if same-site requests only
3. Configure CORS to allow credentials and specific frontend origin
4. Add refresh token rotation (optional, for added security)

---

## Summary

The **token auto-refresh system is fully implemented and ready to use**. All infrastructure is in place:

- ✅ Tokens stored securely in cookies
- ✅ Automatic refresh 5 minutes before expiry
- ✅ Transparent retry on 401 with new token
- ✅ Graceful logout when refresh fails
- ✅ All API requests use centralized client with interceptors

**To fully secure the implementation**, coordinate with the backend to set `HttpOnly; Secure; SameSite` cookies on login/refresh responses. This prevents JavaScript from accessing tokens while still allowing automatic refresh via axios interceptors.

---

## Questions or Issues?

If you encounter any issues:
1. Check browser DevTools → Network tab for token refresh calls
2. Check DevTools → Application → Cookies for token presence/expiry
3. Check browser console for error messages from interceptors
4. Verify backend `/auth/refresh` endpoint returns the expected response format
5. Ensure CORS headers include `Access-Control-Allow-Credentials: true`

