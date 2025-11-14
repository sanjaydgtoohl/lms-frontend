# Create Role Form - Implementation Guide

## Overview

The **Create Role Form** is a comprehensive React component for managing role creation and editing within the LMS User Management module. It includes an advanced permissions matrix allowing granular control over module and submodule access.

## Files Created/Updated

### 1. **`CreateRole.tsx`** (Updated)
**Location:** `src/pages/UserManagement/Role/CreateRole.tsx`

#### Features:
- **Role Name Input** - Text field with validation
- **Description Dropdown** - SelectField component with predefined role descriptions
- **Parent Permission Selector** - Optional dropdown to inherit permissions from parent role
- **Dynamic Permission Matrix** - Grid-based permission management with checkboxes for CRUD operations

#### Component Structure:
```typescript
interface ModulePermissions {
  [moduleName: string]: {
    [submoduleName: string]: Permission;
  };
}

interface Permission {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  view?: boolean;
}
```

#### Key Functions:
- `handlePermissionToggle(moduleName, submoduleName, permissionType)` - Toggles individual permission checkboxes
- `handleSubmit()` - Validates form and saves role with selected permissions
- `handleChange()` - Updates form state with real-time validation clearing

#### Styling:
- Uses Tailwind CSS with CSS variables (--border-color, --text-primary, etc.)
- Responsive grid layout (1 column on mobile, 2 columns on lg screens)
- Hover effects and smooth transitions
- Error states with red border and background

### 2. **`rolePermissionsData.ts`** (New File)
**Location:** `src/data/rolePermissionsData.ts`

#### Purpose:
Centralized data structure defining all available modules, submodules, and their permission types.

#### Data Structure:
```typescript
export const rolePermissionsData: Module[] = [
  {
    name: 'Dashboard',
    submodules: [
      { name: 'Admin Dash', permissions: { read, create, update, delete } },
      // ... more submodules
    ],
  },
  // ... more modules
];
```

#### Modules & Submodules Included:

| Module | Submodules | Permissions |
|--------|-----------|-------------|
| **Dashboard** | Admin Dash, Finance Dash, Sales Dash, Planner Dash | Read, Create, Update, Delete |
| **Master Data** | Brand Master, Agency Master, Department Master, Designation Master, Industry Master, Lead Source | Read, Create, Update, Delete |
| **Brief** | Brief Pipeline, Create Brief Request, Planning Cycle | Read, Create, Update, Delete |
| **Miss Campaign** | Create Miss Cam | View, Read, Create, Update, Delete |
| **Campaign Management** | All Campaign | Read, Create, Update, Delete |
| **Finance** | All Leads, Pending, Interested, Meeting Scheduled, Meeting Done, Brief Status | Read, Create, Update, Delete |
| **User Management** | Main Permissions | Read, Create, Update, Delete |

## UI Layout

### Form Sections:
1. **Header** - Breadcrumb navigation (User Management > Role > Create Role)
2. **Basic Information**
   - Role Name (required, text input)
   - Description (required, dropdown select)
   - Select Parent Permission (optional)
3. **Role Permission Section**
   - Grid display of modules in 2-column layout
   - Each module card contains submodules with permission checkboxes

### Module Card Design:
```
┌─────────────────────────────────┐
│ Module Name (Gray Header)       │
├─────────────────────────────────┤
│ Submodule 1    ☐ ☐ ☐ ☐        │  (with hover effect)
│ Submodule 2    ☐ ☐ ☐ ☐        │
│ Submodule 3    ☐ ☐ ☐ ☐        │
└─────────────────────────────────┘
```

### Permission Checkboxes:
- **Read** - View access
- **Create** - Add new items
- **Update** - Modify existing items
- **Delete** - Remove items
- **View** - Special case for Miss Campaign module

## State Management

### Form State:
```typescript
const [form, setForm] = useState({
  name: '',              // Role name
  description: '',       // Selected description
  parentPermission: '',  // Optional parent role
});
```

### Permission State:
```typescript
const [modulePermissions, setModulePermissions] = useState<ModulePermissions>(() => {
  // Initialize from rolePermissionsData with all permissions set to false
});
```

### UI State:
```typescript
const [showSuccessToast, setShowSuccessToast] = useState(false);
const [errors, setErrors] = useState<Record<string, string>>({});
const [saving, setSaving] = useState(false);
```

## Validation

### Required Fields:
- **Role Name** - Must not be empty; error: "Please Enter Role Name"
- **Description** - Must not be empty; error: "Please Enter Description"

### Error Display:
- Red border around field
- Light red background (#FEE2E2)
- Error message with warning icon
- Clears when user starts typing

## Form Submission

### Payload Structure:
```typescript
{
  name: string;
  description: string;
  parentPermission: string;
  permissions: {
    [moduleName]: {
      [submoduleName]: {
        read: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
        view?: boolean;
      }
    }
  };
  id?: string; // Only when editing
}
```

### Success Flow:
1. Validation passes
2. API call triggers (currently mocked)
3. Success toast displays for 1.2 seconds
4. Navigation redirects to `/user-management/role`

## Integration Points

### Dependencies:
```typescript
import { ROUTES } from '../../../constants';
import { MasterFormHeader, NotificationPopup, SelectField } from '../../../components/ui';
import { rolePermissionsData } from '../../../data/rolePermissionsData';
```

### Routes:
- **Create:** `/user-management/role/create`
- **Edit:** `/user-management/role/edit/:id`
- **List:** `/user-management/role`

### Props:
```typescript
type Props = {
  mode?: 'create' | 'edit';           // Form mode
  initialData?: Record<string, any>;  // Pre-filled data for edit mode
};
```

## Usage Examples

### Create Mode:
```tsx
<CreateRole mode="create" />
```

### Edit Mode:
```tsx
const editData = {
  id: '1',
  name: 'Admin',
  description: 'Full system access...',
  parentPermission: '',
  permissions: { /* ... */ }
};

<CreateRole mode="edit" initialData={editData} />
```

## Styling Details

### Color Variables Used:
- `--border-color` - Component borders
- `--text-primary` - Main text
- `--text-secondary` - Secondary/label text

### Tailwind Classes:
- Module cards: `grid grid-cols-1 lg:grid-cols-2 gap-6`
- Checkboxes: `w-4 h-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500`
- Hover states: `hover:bg-[#F9FAFB] transition-colors`

## Error Handling

### Client-side Validation:
- Empty field checks
- Real-time error clearing on input
- Visual feedback with red styling

### API Integration:
```typescript
try {
  setSaving(true);
  // TODO: Replace with actual API call
  console.log('Saving role:', payload);
  
  // Mock success
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Show success and redirect
} catch (err) {
  console.error('Error saving role:', err);
}
```

## Accessibility

### Features:
- ARIA labels and descriptions for error states
- Semantic HTML with proper label associations
- Keyboard navigation support on checkboxes
- Focus rings on interactive elements
- Error alerts with role="alert"

## Future Enhancements

### Potential Improvements:
1. **Select All/Deselect All** - Button to toggle all permissions for a module
2. **Permission Templates** - Quick load common permission sets (Admin, User, Viewer)
3. **Bulk Operations** - Select multiple submodules and apply permissions
4. **Permission History** - Audit log showing permission changes
5. **Role Hierarchy** - Visualize role inheritance chain
6. **API Integration** - Replace mock API with real endpoints
7. **Drag & Drop** - Reorder modules or create custom layouts
8. **Search/Filter** - Find specific modules or submodules

## Testing Checklist

- [ ] Form renders without errors
- [ ] Role name validation works
- [ ] Description dropdown shows all options
- [ ] Parent permission selector functions
- [ ] Permission checkboxes toggle correctly
- [ ] Multiple permissions can be selected per submodule
- [ ] Form submission with valid data
- [ ] Success toast displays
- [ ] Navigation redirects to role list
- [ ] Edit mode pre-fills data correctly
- [ ] Cancel button navigates back
- [ ] Error messages display properly
- [ ] Responsive layout on mobile/tablet

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Notes

- Component uses React.memo for optimization ready
- Permission state updates use functional updates to handle stale closures
- Memoization candidates: Permission checkbox rows
