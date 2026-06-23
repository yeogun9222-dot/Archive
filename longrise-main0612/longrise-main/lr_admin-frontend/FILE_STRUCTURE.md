# Longrise Admin Frontend - File Structure Guide

## Overview

This document describes the systematic file structure and modularization approach implemented in the Longrise Admin Frontend. The architecture follows feature-based organization principles to ensure maintainability, scalability, and consistency.

## Directory Structure

```
src/
├── components/           # Legacy and global components
│   ├── shared/          # Reusable UI components
│   │   ├── Modal.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── DataTable.tsx
│   │   ├── FormControls.tsx
│   │   ├── FilterBar.tsx
│   │   ├── LoadingStates.tsx
│   │   ├── ActionButtonGroup.tsx
│   │   └── index.ts
│   └── [legacy components]
├── features/            # Feature-based modules
│   ├── users/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useUsers.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── constants/
│   │   ├── utils/
│   │   └── api.ts
│   ├── transactions/
│   │   ├── types/
│   │   └── [similar structure]
│   ├── withdrawals/
│   │   ├── hooks/
│   │   │   └── useWithdrawals.ts
│   │   ├── types/
│   │   └── api.ts
│   └── [other features...]
├── layouts/             # Layout components
│   └── DashboardLayout.tsx
├── pages/               # Page components
├── services/            # API and external services
│   ├── base-api.ts     # Base API client
│   ├── api.ts          # Legacy API (to be refactored)
│   ├── config.ts       # API configuration
│   ├── tokenManager.ts # Authentication tokens
│   └── index.ts
├── types/               # Global type definitions
│   ├── api.ts          # Common API types
│   ├── shared.ts       # Shared types
│   └── index.ts        # Type exports
├── utils/               # Utility functions
│   ├── format.ts       # Formatting utilities
│   ├── validation.ts   # Validation utilities
│   ├── permissions.ts  # Permission utilities
│   └── index.ts
├── constants/           # Application constants
│   └── index.ts
├── contexts/            # React contexts
├── hooks/               # Global hooks
├── lib/                 # Third-party integrations
└── [config files]
```

## Feature-Based Architecture

### Core Principles

1. **Feature Isolation**: Each feature is self-contained with its own components, hooks, types, and API services
2. **Consistent Structure**: Every feature follows the same internal organization pattern
3. **Clear Dependencies**: Dependencies flow from features to shared modules, not vice versa
4. **Scalability**: New features can be added without affecting existing code

### Feature Module Structure

Each feature module contains:

```
feature/
├── components/     # Feature-specific components
├── hooks/          # Custom hooks for state management
├── types/          # TypeScript interfaces and types
├── constants/      # Feature-specific constants
├── utils/          # Feature-specific utilities
└── api.ts         # API service for the feature
```

### Example: User Management Feature

```typescript
// features/users/types/index.ts
export interface User { ... }
export enum UserStatus { ... }

// features/users/hooks/useUsers.ts
export function useUsers() { ... }
export function useUser(id: string) { ... }

// features/users/api.ts
export const userApi = new UserApiService();
```

## Shared Components System

### Component Categories

1. **Modal Components**: Dialog boxes and confirmation modals
2. **Status Components**: Status badges and indicators
3. **Data Components**: Tables, lists, and data displays
4. **Form Components**: Input fields, forms, and validation
5. **Filter Components**: Search and filter interfaces
6. **Loading Components**: Spinners, skeletons, and loading states
7. **Action Components**: Buttons, dropdowns, and action groups

### Usage Examples

```typescript
import { DataTable, StatusBadge, Modal } from '@/components/shared';
import { useUsers } from '@/features/users';

function UserManagementPage() {
  const { users, loading } = useUsers();
  
  return (
    <DataTable
      data={users}
      columns={[
        {
          key: 'status',
          title: 'Status',
          render: (status) => <StatusBadge status={status} />
        }
      ]}
      loading={loading}
    />
  );
}
```

## API Service Architecture

### Base API Client

The `BaseApiClient` provides common functionality:
- Authentication token management
- Request/response interceptors
- Error handling and retry logic
- Request logging and debugging

### Feature-Specific APIs

Each feature has its own API service that extends the base client:

```typescript
class UserApiService extends BaseApiClient {
  async getUsers(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    return this.get<User[]>('/admin/users', filters);
  }
  
  async updateUser(id: string, data: UserUpdateData): Promise<ApiResponse<User>> {
    return this.patch<User>(`/admin/users/${id}`, data);
  }
}
```

## Type System Organization

### Type Categories

1. **API Types**: Common API response and request structures
2. **Feature Types**: Domain-specific interfaces and enums
3. **Shared Types**: Cross-feature type definitions
4. **Component Types**: Props and component-specific interfaces

### Type Import Strategy

```typescript
// Import from centralized index
import { User, Transaction, ApiResponse } from '@/types';

// Import feature-specific types
import { UserFilters, UserStats } from '@/features/users';

// Import shared component types
import { ModalProps, DataTableProps } from '@/components/shared';
```

## Utility System

### Utility Categories

1. **Format Utilities**: Date, currency, and text formatting
2. **Validation Utilities**: Form validation and data validation
3. **Permission Utilities**: Role-based access control
4. **Common Utilities**: General helper functions

### Usage Examples

```typescript
import { formatCurrency, validateEmail, usePermissions } from '@/utils';

const amount = formatCurrency(1234.56, 'USD'); // "$1,234.56"
const emailValid = validateEmail('test@example.com'); // { isValid: true }
const { hasPermission } = usePermissions(userRole);
```

## Constants Management

### Centralized Configuration

All application constants are centralized for easy maintenance:

```typescript
// constants/index.ts
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL,
  timeout: 30000,
};

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
};

export const CURRENCY = {
  primary: 'USD',
  decimalPlaces: { USD: 2, BTC: 8 },
};
```

## Layout System

### Layout Components

1. **DashboardLayout**: Main authenticated layout with sidebar and header
2. **DashboardPage**: Page wrapper with common layout patterns
3. **NestedPage**: Simplified layout for nested content

### Usage Example

```typescript
import { DashboardPage } from '@/layouts/DashboardLayout';
import { LoadingButton } from '@/components/shared';

function UsersPage() {
  return (
    <DashboardPage
      title="사용자 관리"
      subtitle="회원 계정 관리 및 설정"
      actions={
        <LoadingButton variant="primary">
          새 사용자 생성
        </LoadingButton>
      }
    >
      {/* Page content */}
    </DashboardPage>
  );
}
```

## Migration Strategy

### Phase 1: Foundation (Completed)
- ✅ Create feature directory structure
- ✅ Implement shared component system
- ✅ Create base API client
- ✅ Establish type system organization
- ✅ Create utility system
- ✅ Implement layout system

### Phase 2: Feature Migration (In Progress)
- ✅ User management feature
- ✅ Withdrawal management feature
- 🔄 Transaction management feature
- 🔄 Payout management feature
- 🔄 Investment management feature

### Phase 3: Legacy Cleanup (Pending)
- 🔄 Migrate remaining components to feature modules
- 🔄 Remove legacy API client
- 🔄 Update component imports
- 🔄 Clean up unused files

## Best Practices

### File Naming
- Use PascalCase for components: `UserManagement.tsx`
- Use camelCase for hooks: `useUsers.ts`
- Use kebab-case for utilities: `format-currency.ts`
- Use lowercase for directories: `user-management/`

### Import Organization
```typescript
// 1. External libraries
import React, { useState } from 'react';
import axios from 'axios';

// 2. Internal utilities
import { formatCurrency, validateEmail } from '@/utils';

// 3. Internal types
import { User, ApiResponse } from '@/types';

// 4. Internal components
import { DataTable, StatusBadge } from '@/components/shared';

// 5. Feature imports
import { useUsers } from '@/features/users';
```

### Component Organization
- Keep components small and focused
- Extract complex logic into custom hooks
- Use TypeScript for all components
- Include proper error handling
- Follow accessibility guidelines

### API Integration
- Use feature-specific API services
- Handle errors consistently
- Implement proper loading states
- Include request/response logging
- Follow RESTful conventions

## Performance Considerations

1. **Code Splitting**: Features can be lazy-loaded
2. **Tree Shaking**: Modular exports enable better tree shaking
3. **Bundle Analysis**: Each feature can be analyzed independently
4. **Caching**: API responses cached at the service level

## Testing Strategy

1. **Unit Tests**: Test individual components and utilities
2. **Integration Tests**: Test feature modules as complete units
3. **API Tests**: Use feature-specific services for integration-oriented verification
4. **E2E Tests**: Test complete user workflows

## Conclusion

This modular architecture provides:
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features
- **Reusability**: Shared components across features
- **Consistency**: Standardized patterns and conventions
- **Developer Experience**: Clear file organization and predictable structure

The architecture follows industry best practices while being tailored to the specific needs of the Longrise Admin Panel.
