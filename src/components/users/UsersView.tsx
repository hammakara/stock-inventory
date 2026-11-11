import React, { useState } from 'react';
import { User, UserRole } from '../../types/inventory';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { UserCog, Plus, ShieldCheck, Check, Edit2, Trash2, Shield, Lock } from 'lucide-react';

interface UsersViewProps {
  users: User[];
  currentUser: User;
  onSaveUser: (user: Omit<User, 'id'> & { id?: string }) => void;
  onDeleteUser: (id: string) => void;
  onSwitchUser: (user: User) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onSaveUser,
  onDeleteUser,
  onSwitchUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Staff');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('Staff');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUser({
      ...(editingUser ? { id: editingUser.id } : {}),
      name: name.trim(),
      email: email.trim(),
      role,
      status,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">User Accounts & Role Permissions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-Based Access Control (RBAC): Administrators, Inventory Managers, and Warehouse Staff.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add User Account</span>
        </button>
      </div>

      {/* Current Active Session Card */}
      <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs text-blue-700 font-semibold uppercase tracking-wider text-[10px]">
              Active User Session
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {currentUser.name} ({currentUser.email})
            </div>
            <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
              <span>Assigned Role: <strong className="text-blue-700">{currentUser.role}</strong></span>
              <span>·</span>
              <span>Permissions verified via server-side AuthService.gs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 text-sm">Authorized Warehouse Personnel</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Switch Session</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] text-blue-600 font-bold px-1.5 py-0.2 bg-blue-50 rounded">
                          (You)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isCurrent ? (
                        <span className="text-[11px] text-emerald-600 font-medium">Active</span>
                      ) : (
                        <button
                          onClick={() => onSwitchUser(u)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                        >
                          Simulate Login
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingUser(u)}
                        disabled={isCurrent || users.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permission Matrix Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-slate-500" />
          <span>Role Permissions Matrix</span>
        </h3>
        <p className="text-xs text-slate-500">Security enforcement matrix applied across all operations</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-2">
            <div className="font-bold text-slate-900 text-xs">Admin</div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>✓ Full catalog CRUD</li>
              <li>✓ Stock In, Out, & Adjustments</li>
              <li>✓ Valuation & reorder reports</li>
              <li>✓ User & permission management</li>
              <li>✓ Google Sheets connection & sync</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-2">
            <div className="font-bold text-slate-900 text-xs">Inventory Manager</div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>✓ Full catalog management</li>
              <li>✓ Stock In & Stock Out operations</li>
              <li>✓ Physical stock audit adjustments</li>
              <li>✓ View valuation and reorder reports</li>
              <li>✗ Cannot modify user accounts</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 space-y-2">
            <div className="font-bold text-slate-900 text-xs">Staff</div>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>✓ Record Stock Inward shipments</li>
              <li>✓ Record Stock Outward dispatches</li>
              <li>✓ View catalog items & stock counts</li>
              <li>✗ Cannot perform stock write-offs</li>
              <li>✗ Cannot delete products or edit settings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Account' : 'Register New Warehouse User'}
        subtitle="Configure personnel credentials and role permissions"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@enterprise-ops.internal"
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              >
                <option value="Admin">Admin</option>
                <option value="Inventory Manager">Inventory Manager</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              {editingUser ? 'Update User' : 'Save User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => {
          if (deletingUser) onDeleteUser(deletingUser.id);
        }}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${deletingUser?.name}" (${deletingUser?.email})?`}
        confirmLabel="Delete User"
      />
    </div>
  );
};
