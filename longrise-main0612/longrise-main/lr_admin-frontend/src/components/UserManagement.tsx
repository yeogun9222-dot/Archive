import { useState, useEffect } from 'react';
import { User, DragonRank } from '../types';
import { cn } from '../lib/utils';
import { Search, Users, Loader } from 'lucide-react';
import { api, isApiError } from '../services';
import { UserData } from '../types/shared';

// Convert UserData from API to User type for UI
function convertApiUserToUIUser(apiUser: UserData): User {
  return {
    ...apiUser,
    usdt: apiUser.balanceUSDT,
    cnyt: apiUser.balanceCNYT,
    pageface: apiUser.pageface === true ? 'Approved' : 'Pending',
    isFrozen: apiUser.restrictions?.isFrozen || false,
    status: apiUser.status === 'active' ? 'Active' : 'Inactive',
    isTradingPasswordVerified: apiUser.isTradingPasswordVerified || false,
    maxOutRatio: 0,
    packages: [],
    permissions: { deposit: true, withdraw: true, swap: true },
    wallets: [],
    tradingPinSet: apiUser.hasSetTradingPassword,
    antiPhishingCode: '',
    totalEarnings: 0,
    directs: apiUser.teamSize,
    bodyValue: apiUser.bodyValue || 0,
    vpx: 'VPX-' + apiUser.id,
    loginHistory: [],
  };
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [activeRank, setActiveRank] = useState<DragonRank | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.getUsers({ page: 1, pageSize: 500, search });

        if (response?.success && response?.data?.data) {
          const uiUsers = (response.data.data as UserData[]).map(convertApiUserToUIUser);
          setUsers(uiUsers);
        } else {
          throw new Error('유효하지 않은 API 응답입니다.');
        }
      } catch (err) {
        console.error('Error fetching users:', err);

        if (isApiError(err)) {
          setError(`API Error: ${err.message}`);
        } else {
          setError('사용자 데이터를 불러올 수 없습니다. 서버 연결을 확인해주세요.');
        }
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchUsers();
  }, [search]);

  const syncSelectedUser = (updatedUser: UserData) => {
    const uiUser = convertApiUserToUIUser(updatedUser);
    setUsers((prev) => prev.map((item) => (item.id === uiUser.id ? uiUser : item)));
    setSelectedUser(uiUser);
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser) return;
    const amountText = window.prompt('조정 금액을 입력하세요. 음수 입력 가능', '0');
    if (amountText === null) return;
    const amount = Number(amountText);
    if (!Number.isFinite(amount)) {
      setError('유효한 숫자를 입력해야 합니다.');
      return;
    }

    try {
      const response = await api.adjustUserBalance(selectedUser.id, 'USDT', amount);
      if (response.success && response.data) {
        syncSelectedUser(response.data);
        setError(null);
        setMessage('잔액 조정이 완료되었습니다.');
      }
    } catch (err) {
      setError(isApiError(err) ? err.message : '잔액 조정에 실패했습니다.');
    }
  };

  const handleToggleRestriction = async (restrictionType: 'withdrawal' | 'account' | 'freeze', enabled: boolean) => {
    if (!selectedUser) return;
    try {
      const response = await api.setUserRestrictions(selectedUser.id, restrictionType, enabled);
      if (response.success && response.data) {
        syncSelectedUser(response.data);
        setError(null);
        setMessage('제한 설정이 반영되었습니다.');
      }
    } catch (err) {
      setError(isApiError(err) ? err.message : '제한 설정에 실패했습니다.');
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`${selectedUser.nickname} 계정을 차단하시겠습니까?`)) return;
    try {
      const response = await api.banUser(selectedUser.id);
      if (response.success && response.data) {
        syncSelectedUser(response.data);
        setError(null);
        setMessage('계정이 차단되었습니다.');
      }
    } catch (err) {
      setError(isApiError(err) ? err.message : '계정 차단에 실패했습니다.');
    }
  };

  const filteredUsers = users
    .filter(u =>
      (activeRank === 'All' || u.rank === activeRank) &&
      (u.nickname.toLowerCase().includes(search.toLowerCase()) ||
       u.id.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => (b.usdt || 0) - (a.usdt || 0));

  const rankOptions: (DragonRank | 'All')[] = ['All', 'Black Dragon', 'Red Dragon', 'Purple Dragon', 'Blue Dragon', 'White Dragon', 'Investor'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader className="animate-spin" size={20} />
          <span className="text-slate-400">사용자 데이터 로드 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">회원 통합 제어 센터</h1>
          <p className="text-slate-400 mt-1">전체 {users.length}명의 회원 관리</p>
        </div>
        <div className="flex items-center gap-4">
          <Users size={24} className="text-blue-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="회원 ID 또는 닉네임 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={activeRank}
            onChange={(e) => setActiveRank(e.target.value as DragonRank | 'All')}
            className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {rankOptions.map(rank => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="admin-card border-red-500/20 bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {message && (
        <div className="admin-card border-green-500/20 bg-green-500/10">
          <p className="text-green-400 text-sm">{message}</p>
        </div>
      )}

      {/* User Table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>회원 정보</th>
                <th>등급</th>
                <th>USDT 잔액</th>
                <th>CNYT 보상</th>
                <th>팀 규모</th>
                <th>상태</th>
                <th>가입일</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-400">
                          {user.nickname.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.nickname}</div>
                        <div className="text-xs text-slate-400">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-bold",
                      user.rank.includes('Black') ? 'bg-slate-800 text-slate-200' :
                      user.rank.includes('Red') ? 'bg-red-500/20 text-red-400' :
                      user.rank.includes('Blue') ? 'bg-blue-500/20 text-blue-400' :
                      user.rank.includes('Purple') ? 'bg-purple-500/20 text-purple-400' :
                      'bg-slate-600/20 text-slate-400'
                    )}>
                      {user.rank}
                    </span>
                  </td>
                  <td>
                    <div className="font-mono font-bold text-green-400">
                      {user.usdt.toLocaleString()} USDT
                    </div>
                  </td>
                  <td>
                    <div className="font-mono font-bold text-amber-400">
                      {user.cnyt.toLocaleString()} CNYT
                    </div>
                  </td>
                  <td>
                    <div className="text-blue-400 font-bold">
                      {user.teamSize}명
                    </div>
                  </td>
                  <td>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-bold border",
                      user.status === 'Active' ? 'status-active' : 'status-banned'
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="text-slate-400 text-sm font-mono">
                      {user.joinDate}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="btn-admin-primary text-xs px-3 py-1"
                      >
                        상세 보기
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="admin-card p-8 text-center">
          <Users size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">검색 조건에 맞는 회원이 없습니다.</p>
        </div>
      )}

      {/* User Detail Modal - Placeholder */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal-content p-6 max-w-2xl mx-auto mt-20" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">회원 상세 정보</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-2">기본 정보</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-slate-400">닉네임:</span> <span className="text-white">{selectedUser.nickname}</span></div>
                  <div><span className="text-slate-400">이메일:</span> <span className="text-white">{selectedUser.email}</span></div>
                  <div><span className="text-slate-400">등급:</span> <span className="text-white">{selectedUser.rank}</span></div>
                  <div><span className="text-slate-400">가입일:</span> <span className="text-white">{selectedUser.joinDate}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-2">자산 정보</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-slate-400">USDT:</span> <span className="text-green-400">{selectedUser.usdt.toLocaleString()}</span></div>
                  <div><span className="text-slate-400">CNYT:</span> <span className="text-amber-400">{selectedUser.cnyt.toLocaleString()}</span></div>
                  <div><span className="text-slate-400">팀 크기:</span> <span className="text-blue-400">{selectedUser.teamSize}명</span></div>
                  <div><span className="text-slate-400">상태:</span>
                    <span className={selectedUser.status === 'Active' ? 'text-green-400' : 'text-red-400'}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={handleAdjustBalance} className="btn-admin-primary px-4 py-2">잔액 조정</button>
              <button onClick={() => handleToggleRestriction('withdrawal', !(selectedUser.restrictions?.isWithdrawalBlocked || false))} className="btn-admin-outline px-4 py-2">출금 제한</button>
              <button onClick={() => handleToggleRestriction('freeze', !(selectedUser.restrictions?.isFrozen || false))} className="btn-admin-outline px-4 py-2">자산 동결</button>
              <button onClick={handleBanUser} className="btn-admin-danger px-4 py-2">계정 차단</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
