/**
 * User Management Page - Main page for user management
 */

import React, { useState } from 'react';
import { DashboardPage } from '../../../layouts/DashboardLayout';
import { DataTable, Column } from '../../../components/shared/DataTable';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { UserFilterBar } from '../../../components/shared/FilterBar';
import { CrudActions } from '../../../components/shared/ActionButtonGroup';
import { LoadingButton } from '../../../components/shared/LoadingStates';
import { Modal, ConfirmModal } from '../../../components/shared/Modal';
import { User, UserFilters } from '../types';
import { useUsers } from '../hooks/useUsers';
import { formatDate, formatCurrency } from '../../../utils/format';
import { Plus } from 'lucide-react';

export function UserManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    users,
    totalCount,
    loading,
    filters,
    pagination,
    updateFilters,
    updatePagination,
    resetFilters,
    refetch,
  } = useUsers();

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    // Navigate to edit page or open edit modal
    console.log('Edit user:', user);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      // Call delete API
      console.log('Delete user:', selectedUser);
      setShowDeleteModal(false);
      setSelectedUser(null);
      refetch();
    }
  };

  const handleBlockUser = async (user: User) => {
    // Call block API
    console.log('Block user:', user);
    refetch();
  };

  const handleUnblockUser = async (user: User) => {
    // Call unblock API
    console.log('Unblock user:', user);
    refetch();
  };

  const columns: Column<User>[] = [
    {
      key: 'username',
      title: '사용자명',
      sortable: true,
      render: (username, user) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">{username}</span>
          <span className="text-sm text-text-secondary">{user.email}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: '상태',
      align: 'center',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      key: 'rank',
      title: '등급',
      align: 'center',
      render: (rank) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
          {rank}
        </span>
      ),
    },
    {
      key: 'balance',
      title: '잔액',
      align: 'right',
      render: (balance) => formatCurrency(balance, 'USD'),
    },
    {
      key: 'total_investment',
      title: '총 투자금',
      align: 'right',
      render: (amount) => formatCurrency(amount, 'USD'),
    },
    {
      key: 'verification_status',
      title: '인증',
      align: 'center',
      render: (verified) => (
        <StatusBadge status={verified ? 'verified' : 'unverified'} variant="dot" size="sm" />
      ),
    },
    {
      key: 'created_at',
      title: '가입일',
      render: (date) => formatDate(date, 'YYYY-MM-DD'),
    },
  ];

  return (
    <DashboardPage
      title="사용자 관리"
      subtitle="회원 계정 관리 및 설정"
      actions={
        <LoadingButton
          variant="primary"
          onClick={handleCreateUser}
        >
          <Plus className="w-4 h-4 mr-2" />
          새 사용자 생성
        </LoadingButton>
      }
    >
      {/* Filters */}
      <UserFilterBar
        searchConfig={{
          placeholder: '사용자명 또는 이메일 검색...',
          value: filters.search || '',
          onChange: (value) => updateFilters({ search: value }),
        }}
        statusFilter={true}
        rankFilter={true}
        dateRangeFilter={true}
        onReset={resetFilters}
        className="mb-6"
      />

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        pagination={{
          current: pagination.page || 1,
          pageSize: pagination.page_size || 20,
          total: totalCount,
          onChange: (page, pageSize) => updatePagination({ page, page_size: pageSize }),
        }}
        actions={{
          title: '작업',
          items: [
            {
              key: 'view',
              label: '보기',
              onClick: (user) => console.log('View user:', user),
            },
            {
              key: 'edit',
              label: '수정',
              onClick: handleEditUser,
            },
            {
              key: 'block',
              label: '차단',
              onClick: handleBlockUser,
              disabled: (user) => user.status === 'blocked',
            },
            {
              key: 'unblock',
              label: '차단해제',
              onClick: handleUnblockUser,
              disabled: (user) => user.status !== 'blocked',
            },
            {
              key: 'delete',
              label: '삭제',
              onClick: handleDeleteUser,
              danger: true,
            },
          ],
        }}
        emptyText="등록된 사용자가 없습니다"
      />

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="새 사용자 생성"
        size="lg"
      >
        {/* User creation form would go here */}
        <div className="py-8 text-center text-text-secondary">
          사용자 생성 폼 구현 예정
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="사용자 삭제"
        message={`정말로 "${selectedUser?.username}" 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        type="danger"
      />
    </DashboardPage>
  );
}