# Troubleshooting Guide

## Can't Login with Demo Credentials

If you're unable to login with the demo accounts, try these steps:

### Solution 1: Use the Reset Demo Data Button
1. On the login page, scroll down to see the demo credentials box
2. Click the **"Reset Demo Data"** button below the demo credentials
3. Confirm the reset when prompted
4. Try logging in again with:
   - **Admin**: admin@dayflow.com / admin123
   - **Employee**: employee@dayflow.com / employee123

### Solution 2: Clear Browser Data Manually
1. Open browser developer tools (F12 or Right-click → Inspect)
2. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** in the left sidebar
4. Click on your domain
5. Click "Clear All" or delete individual items
6. Refresh the page

### Solution 3: Use Incognito/Private Mode
1. Open a new incognito/private browsing window
2. Navigate to the application
3. The demo accounts will be freshly initialized
4. Login with the demo credentials

## Console Errors

If you see errors in the browser console:

### Check for localStorage Access
- Some browsers block localStorage in certain modes
- Make sure you're not blocking cookies/storage
- Try a different browser

### Verify Data Structure
Open the browser console and run:
```javascript
console.log(JSON.parse(localStorage.getItem('users')));
```

You should see an array with two users (admin and employee).

## Common Issues

### "Invalid email or password" Error
- Check for typos in email/password
- Email: `admin@dayflow.com` (all lowercase)
- Password: `admin123` (all lowercase, no spaces)
- Try the "Reset Demo Data" button

### Data Not Persisting
- Check if browser is blocking localStorage
- Verify you're not in private/incognito mode (for persistent data)
- Check browser storage quota

### Changes Not Showing
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check if multiple tabs are open (data might be stale)

## Reset Everything

To completely reset the application:

1. Click **"Reset Demo Data"** button on login page, OR
2. Open browser console and run:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

## Still Having Issues?

1. Check browser console for error messages (F12)
2. Verify you're using a modern browser (Chrome, Firefox, Safari, Edge)
3. Make sure JavaScript is enabled
4. Try a different browser

## Demo Account Credentials

Always use these exact credentials:

**Admin Account:**
```
Email: admin@dayflow.com
Password: admin123
```

**Employee Account:**
```
Email: employee@dayflow.com
Password: employee123
```

Note: All lowercase, no spaces, no special characters.
