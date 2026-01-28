# Troubleshooting Guide - Data Collection Issues

## Common Issues & Solutions

### Issue 1: Table Shows "Tiada permohonan" (No Data Appears)

**Checklist:**
1. Are you logged in as admin? (Username: admin, Password: admin123)
2. Is localStorage enabled in your browser?
3. Is JavaScript enabled?

**Debug Steps:**
1. Open browser console (F12)
2. Type: `DataStore.get()` - Should show array of stored data
3. Type: `allData` - Should show in-memory data copy
4. Type: `renderPermohonan()` - Manually trigger render
5. Check console for any error messages (red text)

**Solution:**
- If `DataStore.get()` returns empty array:
  - Data not saved - Check form submission
  - Try submitting form again
  
- If `DataStore.get()` has data but table is empty:
  - Try: `localStorage.removeItem('dewanData'); location.reload();`
  - Then submit form again

### Issue 2: Form Submits But Data Doesn't Appear in Table

**Checklist:**
1. Is success message shown? (Green checkmark)
2. Does form reset after submission?
3. Are filter inputs empty? (Not filtering out your data)

**Debug Steps:**
1. Open console (F12)
2. Type: `allData.filter(d => d.type === 'permohonan')` 
3. Check if your data is in the results
4. Check filter values: 
   - `document.getElementById('permohonan-filter-tarikh-mula').value`
   - `document.getElementById('permohonan-filter-tarikh-akhir').value`

**Solutions:**
- **Data exists but not shown:** Clear filters by clicking "Reset" button
- **No data at all:** Check if form has required fields filled
- **Wrong date format:** Ensure dates are in YYYY-MM-DD format

### Issue 3: Date Filter Not Working

**Checklist:**
1. Are filter dates set correctly?
2. Are data dates in valid format?
3. Is "Filter" button clicked?

**Debug Steps:**
1. Click "Reset" button first
2. Set "Tarikh Mula" to today's date
3. Set "Tarikh Akhir" to tomorrow
4. Click "Filter"
5. Check console for `getPermohonan()` results

**Solution:**
- Use "Reset" button to clear filters
- Ensure date format: YYYY-MM-DD

### Issue 4: Specific Data Row Won't Delete/Update

**Checklist:**
1. Did you click "Urus" or "Padam" button correctly?
2. Is modal dialog showing?
3. Is there an error message in console?

**Debug Steps:**
1. Open console (F12)
2. Click "Urus" on problem row
3. Look for error in console
4. Type: `allData.find(d => d.__backendId === 'XXXXX')` (use actual ID)
5. Check if data exists

**Solution:**
- Refresh page: `location.reload()`
- Clear and resave data: Clear localStorage and re-enter data

### Issue 5: Multiple "DOMContentLoaded" Events

**Info:** Application has two DOMContentLoaded listeners (intentional for compatibility)
- This is fine and won't cause issues
- Both call `DataStore.notify()` which is safe to call multiple times

## Advanced Debug Commands

```javascript
// View all stored data
DataStore.get()

// View only permohonan data
allData.filter(d => d.type === 'permohonan')

// Count permohonan entries
allData.filter(d => d.type === 'permohonan').length

// Check specific entry
allData.find(d => d.__backendId === 'YOUR_ID_HERE')

// Clear all data (WARNING: irreversible)
localStorage.removeItem('dewanData'); 
location.reload();

// Force re-render
renderPermohonan()

// Force complete UI update
DataStore.notify()

// Check if filters are blocking data
document.getElementById('permohonan-filter-tarikh-mula').value
document.getElementById('permohonan-filter-tarikh-akhir').value

// Check localStorage limit (in bytes)
new Blob([localStorage.getItem('dewanData')]).size
```

## Browser Console Tips

1. **Open Console:** Press F12 or Right-click → Inspect → Console tab
2. **Clear Messages:** Type `clear()` or click clear button
3. **Copy Values:** Right-click on object → Store as global variable
4. **Search Logs:** Use browser's search in console (Ctrl+F)

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `Cannot read property 'innerHTML' of null` | DOM element not found | Check element IDs match HTML |
| `Uncaught SyntaxError` | JavaScript syntax error | Check browser console for line number |
| `localStorage is not defined` | Private/Incognito mode | Use normal browser mode |
| `Data is null or undefined` | No data in storage | Submit form first |

## Performance Tips

1. **Too much data?** (>1000 entries)
   - Browser localStorage has ~5MB limit
   - Consider archiving old data
   - Export to Excel and clear old entries

2. **Page running slowly?**
   - Try: `location.reload()`
   - Clear filters
   - Close other browser tabs

3. **Storage full?**
   - Check: `new Blob([localStorage.getItem('dewanData')]).size`
   - Export important data to Excel first
   - Then: `localStorage.removeItem('dewanData')`

## Support Checklist

Before contacting support, verify:
- [ ] JavaScript is enabled
- [ ] localStorage is enabled (not private/incognito mode)
- [ ] Using modern browser (Chrome, Firefox, Safari, Edge)
- [ ] Cleared browser cache
- [ ] Tried different browser
- [ ] No conflicting browser extensions
- [ ] Form has all required fields
- [ ] Filters don't block data

## Quick Recovery

If everything fails:

```javascript
// Complete reset
localStorage.clear();
location.reload();
```

Then:
1. Login again
2. Re-enter required data
3. Test again

---

**Last Updated:** 28 January 2026  
**Version:** 1.0
