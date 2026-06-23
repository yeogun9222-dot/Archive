/**
 * Shared Components - Reusable UI components for the admin panel
 * All common components are centralized here for consistent usage
 */

// Existing components
export { StatsCard } from './StatsCard';

// Modal components
export { Modal, ConfirmModal, SuccessModal } from './Modal';
export type { ModalProps } from './Modal';

// Status components
export {
  StatusBadge,
  UserStatusBadge,
  TransactionStatusBadge,
  InvestmentStatusBadge,
  SystemStatusBadge,
  AlertSeverityBadge,
} from './StatusBadge';
export type { StatusBadgeProps } from './StatusBadge';

// Data table components
export { DataTable } from './DataTable';
export type { DataTableProps, Column } from './DataTable';

// Form controls
export {
  Input,
  TextArea,
  Select,
  Checkbox,
  Radio,
  DateInput,
  SearchInput,
} from './FormControls';
export type {
  BaseInputProps,
  InputProps,
  TextAreaProps,
  SelectProps,
  CheckboxProps,
  RadioProps,
  DateInputProps,
  SearchInputProps,
} from './FormControls';

// Filter components
export {
  FilterBar,
  UserFilterBar,
  TransactionFilterBar,
} from './FilterBar';
export type { FilterBarProps, FilterOption } from './FilterBar';

// Loading states
export {
  Spinner,
  LoadingButton,
  PageLoader,
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,
  DashboardSkeleton,
  EmptyState,
} from './LoadingStates';
export type {
  SpinnerProps,
  LoadingButtonProps,
  PageLoaderProps,
  SkeletonProps,
  TableSkeletonProps,
  CardSkeletonProps,
  ListSkeletonProps,
  DashboardSkeletonProps,
  EmptyStateProps,
} from './LoadingStates';

// Action components
export {
  ActionButtonGroup,
  ApprovalActions,
  CrudActions,
  UserManagementActions,
  ActionDropdown,
  commonActions,
} from './ActionButtonGroup';
export type {
  ActionButtonGroupProps,
  ActionButton,
  ApprovalActionsProps,
  CrudActionsProps,
  UserManagementActionsProps,
  ActionDropdownProps,
  DropdownAction,
} from './ActionButtonGroup';