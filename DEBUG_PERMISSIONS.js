// Quick test to verify permission system in browser console
// Copy and paste these commands to test:

// 1. Check what permissions are loaded
console.table(window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.['__reactInternals'] || 'Use Context to check');

// 2. Or manually check localStorage/session
console.log('Current Path:', window.location.pathname);

// 3. Test path matching logic (copy this function and run it)
const testPathMatching = (permittedPath, currentPath) => {
  const normalizePath = (p) => {
    if (!p.startsWith('/')) p = '/' + p;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  };
  
  const normPermitted = normalizePath(permittedPath);
  const normCurrent = normalizePath(currentPath);
  
  // Exact match first
  if (normPermitted === normCurrent) return true;
  
  // Regex match for dynamic segments
  const regexStr = '^' + normPermitted
    .replace(/\//g, '\\/')
    .replace(/:[^/]+/g, '[^/]+') + '$';
  const regex = new RegExp(regexStr);
  return regex.test(normCurrent);
};

// Test examples:
console.log('Test /dashboard:', testPathMatching('/dashboard', '/dashboard')); // true
console.log('Test /brief/:id/edit with /brief/123/edit:', testPathMatching('/brief/:id/edit', '/brief/123/edit')); // true
console.log('Test /master/brand with /master/brand/5/edit:', testPathMatching('/master/brand', '/master/brand/5/edit')); // false
console.log('Test /master/brand/:id with /master/brand/5:', testPathMatching('/master/brand/:id', '/master/brand/5')); // true
