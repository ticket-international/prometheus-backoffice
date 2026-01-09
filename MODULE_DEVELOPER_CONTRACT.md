# Module Developer Contract (Paste into Prompts)

**For developers adding new pages/modules to this cinema backoffice application.**

---

## 1. Required Imports & Context Hooks

```typescript
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/SiteContext';

// In your component:
const { session } = useAuth();           // session.apiKey, session.username
const { selectedSiteId } = useSite();    // selectedSiteId (number | null)
```

**Evidence**: `app/kampagnen/mailings/page.tsx:19-20`, `app/zahlungen/page.tsx:10-11,19-20`

---

## 2. Standard API Call Pattern (MANDATORY)

**Use direct Supabase Edge Function calls** (this is the project standard):

```typescript
const fetchData = async () => {
  // MANDATORY GUARD: Always check both values exist
  if (!session?.apiKey || selectedSiteId === null) {
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    // Build URL with query params
    const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/YOUR-ENDPOINT?apikey=${encodeURIComponent(session.apiKey)}&siteID=${selectedSiteId}`;

    // Fetch with MANDATORY headers
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Handle data
    setYourData(data.items || []);
  } catch (error) {
    console.error('Error:', error);
    setError('Fehler beim Laden der Daten');
  } finally {
    setIsLoading(false);
  }
};
```

**Evidence**: `app/kampagnen/mailings/page.tsx:35-72`, `app/zahlungen/page.tsx:28-63`

---

## 3. Required useEffect Pattern (NO LOOPS)

```typescript
// Refetch when session or site changes
useEffect(() => {
  fetchData();
}, [selectedSiteId, session]);  // Dependencies trigger refetch
```

**CRITICAL**: The guard `if (!session?.apiKey || selectedSiteId === null) return;` inside `fetchData()` prevents infinite loops.

**Evidence**: `app/kampagnen/mailings/page.tsx:31-33`, `app/zahlungen/page.tsx:22-26`

---

## 4. Mandatory Page Structure

**File**: `app/YOUR-ROUTE/page.tsx`

**Required**:
- `'use client';` directive at top
- State: `data`, `isLoading`, `error`
- Three UI states: loading → error → data
- Return plain JSX (layout auto-wrapped)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/SiteContext';

export default function YourPage() {
  const { session } = useAuth();
  const { selectedSiteId } = useSite();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedSiteId, session]);

  const fetchData = async () => {
    if (!session?.apiKey || selectedSiteId === null) return;
    // ... fetch logic from section 2
  };

  // MANDATORY: Handle loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <Card className="p-12">
          <p className="text-center text-muted-foreground">Lade Daten...</p>
        </Card>
      </div>
    );
  }

  // MANDATORY: Handle error state
  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 border-destructive/50">
          <div className="flex items-center gap-3 text-destructive">
            <FiAlertCircle size={20} />
            <span>{error}</span>
          </div>
        </Card>
      </div>
    );
  }

  // Render your data
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Page</h1>
      {/* Your content */}
    </div>
  );
}
```

**Evidence**:
- Client directive: `app/kampagnen/mailings/page.tsx:1`
- Loading state: `app/kampagnen/mailings/page.tsx:136-144`
- Error state: `app/zahlungen/page.tsx:129-136`
- Auto-wrapped: No manual `<DashboardLayout>` in any page file

---

## 5. Navigation Integration (2 files)

### File 1: `components/Sidebar.tsx` (lines 54-99)

Add to `navItems` array:

```typescript
// Top-level menu:
{ name: 'Your Module', href: '/your-route', icon: FiStar },

// OR nested submenu:
{
  name: 'Parent',
  icon: FiFolder,
  subItems: [
    { name: 'Your Module', href: '/parent/your-route', icon: FiStar }
  ]
}
```

**Evidence**: `components/Sidebar.tsx:54-99`

### File 2: `lib/permissionMapping.ts` (lines 1-26)

Add to `PERMISSION_MAP`:

```typescript
export const PERMISSION_MAP: Record<string, string[]> = {
  // ... existing entries
  'Your Module': ['Required Permission Name'],  // or [] for public access
};
```

**Evidence**: `lib/permissionMapping.ts:1-26`

**Permission behavior**:
- Empty array `[]` = public access (no permission check)
- Admin users see everything
- Regular users need at least one matching permission with `read: true`

**Evidence**: `lib/permissionMapping.ts:28-45`

---

## 6. Environment Variables (Pre-configured)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**DO NOT** add these to your code. They are already configured.

**Evidence**: Used in `lib/SiteContext.tsx:124`, `app/kampagnen/mailings/page.tsx:44`

---

## 7. Common Mistakes (AVOID)

❌ Missing `'use client'` directive
❌ No guard in fetch function (`if (!session?.apiKey || selectedSiteId === null)`)
❌ Wrong useEffect dependencies
❌ Missing loading/error states
❌ Manually wrapping with `<DashboardLayout>` (auto-applied)
❌ Using ApiClient class (not the standard, use direct fetch)

---

## Summary Checklist

- [ ] File: `app/YOUR-ROUTE/page.tsx` with `'use client'`
- [ ] Imports: `useAuth()` and `useSite()`
- [ ] State: `data`, `isLoading`, `error`
- [ ] Guard: `if (!session?.apiKey || selectedSiteId === null) return;`
- [ ] useEffect deps: `[selectedSiteId, session]`
- [ ] UI states: loading → error → data
- [ ] Navigation: Added to `components/Sidebar.tsx` navItems
- [ ] Permissions: Added to `lib/permissionMapping.ts` PERMISSION_MAP

**Total Lines**: 120 lines

---

**Last Updated**: 2026-01-06
**All patterns validated against source code**
