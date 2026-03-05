'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Globe, 
  Database, 
  Cpu, 
  ShieldAlert, 
  Settings, 
  LogOut,
  Plus,
  MoreVertical,
  Activity,
  Zap,
  FileText,
  Newspaper,
  BarChart3,
  MessageSquare,
  Mail,
  Users,
  ArrowLeft,
  ArrowRight,
  X,
  Edit,
  Trash2,
  Building2,
  Brain,
  Target,
  Phone,
  DollarSign,
  Calendar,
  User,
  Camera,
  Save,
  Mail as MailIcon,
  Lock,
  Eye,
  EyeOff,
  Link2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AnalyticsForm from './analytics';
import ClientAnalyticsView from '@/components/ClientAnalyticsView';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import ActionFeedback from '@/components/ActionFeedback';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
import AdminSettings from '@/components/AdminSettings';
import { useAdminTranslation } from '@/hooks/useAdminTranslation';
import Image from 'next/image';

// Modal Component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-700 z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// User Management Section Component
function StaffManagementSection({
  users,
  setUsers,
  setAssignments,
  currentUserId,
  startActionFeedback,
  finishActionSuccess,
  finishActionError,
}: {
  users: any[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  setAssignments: React.Dispatch<React.SetStateAction<any[]>>;
  currentUserId?: string;
  startActionFeedback: (loadingText: string) => void;
  finishActionSuccess: (successMessage: string) => void;
  finishActionError: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'premium' | 'admin' | 'free'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
  });
  const [statusMessage, setStatusMessage] = useState<{ type: 'warning' | 'error'; text: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    email: '',
    role: 'client',
    password: '',
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: '',
    userName: '',
    isLoading: false,
  });

  const normalizePlanBadge = (listedUser: any) => {
    const planId = String(listedUser?.planId || '').toLowerCase();
    const plan = String(listedUser?.plan || '').toLowerCase();

    if (planId === 'premium' || plan.includes('scale elite') || plan === 'premium') return 'Scale Elite';
    if (planId === 'gold' || plan.includes('growth pro') || plan === 'gold') return 'Growth Pro';
    if (planId === 'silver' || plan.includes('starter care') || plan === 'silver') return 'Starter Care';
    return 'Free';
  };

  const isPremiumClient = (listedUser: any) => {
    if (listedUser?.role !== 'client') return false;
    const badge = normalizePlanBadge(listedUser);
    return badge !== 'Free';
  };

  // Filter users by search query
  const searchFilteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  // Group users by type
  const premiumClients = searchFilteredUsers.filter((listedUser) => isPremiumClient(listedUser));
  const adminUsers = searchFilteredUsers.filter((listedUser) => listedUser.role === 'admin' || listedUser.role === 'super_admin');
  const freeUsers = searchFilteredUsers.filter((listedUser) => listedUser.role === 'client' && !isPremiumClient(listedUser));

  // Determine which users to display based on active filter
  const getDisplayedUsers = () => {
    switch (activeFilter) {
      case 'premium':
        return premiumClients;
      case 'admin':
        return adminUsers;
      case 'free':
        return freeUsers;
      case 'all':
      default:
        return searchFilteredUsers;
    }
  };

  const displayedUsers = getDisplayedUsers();

  const getPlanPillClasses = (label: string) => {
    if (label === 'Scale Elite') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400';
    if (label === 'Growth Pro') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
    if (label === 'Starter Care') return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400';
    return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
  };

  const renderUserTable = (sectionTitle: string, sectionUsers: any[]) => (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
        <h4 className="font-bold text-slate-900 dark:text-slate-100">{sectionTitle}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Role</th>
              <th className="px-4 py-4">Membership</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {sectionUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  No users in this section.
                </td>
              </tr>
            ) : (
              sectionUsers.map((listedUser) => {
                const planBadge = normalizePlanBadge(listedUser);
                return (
                  <tr key={listedUser.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-4 py-4 font-bold">{listedUser.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{listedUser.email}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        listedUser.role === 'admin' || listedUser.role === 'super_admin'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {listedUser.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${getPlanPillClasses(planBadge)}`}>
                        {planBadge}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">
                        {listedUser.subscriptionStatus || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(listedUser)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          aria-label={`Edit ${listedUser.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => requestDeleteUser(listedUser)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          aria-label={`Delete ${listedUser.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!createForm.name || !createForm.email || !createForm.password) {
      setStatusMessage({ type: 'warning', text: 'Please complete all required fields to create a user.' });
      return;
    }

    try {
      startActionFeedback('Creating user...');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setUsers((prev) => [data, ...prev]);
      setCreateForm({ name: '', email: '', password: '', role: 'client' });
      setShowCreateModal(false);
      finishActionSuccess('User created successfully.');
    } catch (error: any) {
      finishActionError();
      setStatusMessage({ type: 'error', text: error?.message || 'Failed to create user.' });
    }
  };

  const openEditModal = (selectedUser: any) => {
    setStatusMessage(null);
    setEditForm({
      id: selectedUser.id,
      name: selectedUser.name || '',
      email: selectedUser.email || '',
      role: selectedUser.role || 'client',
      password: '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setStatusMessage(null);

    if (!editForm.id || !editForm.name || !editForm.email) {
      setStatusMessage({ type: 'warning', text: 'Name and email are required to update a user.' });
      return;
    }

    try {
      startActionFeedback('Saving user changes...');
      const payload: Record<string, string> = {
        id: editForm.id,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      setUsers((prev) => prev.map((u) => (u.id === data.id ? { ...u, ...data } : u)));
      setShowEditModal(false);
      finishActionSuccess('User updated successfully.');
    } catch (error: any) {
      finishActionError();
      setStatusMessage({ type: 'error', text: error?.message || 'Failed to update user.' });
    }
  };

  const requestDeleteUser = (selectedUser: any) => {
    if (selectedUser.id === currentUserId) {
      setStatusMessage({ type: 'warning', text: 'You cannot delete your own account.' });
      return;
    }

    setDeleteModal({
      isOpen: true,
      userId: selectedUser.id,
      userName: selectedUser.name || selectedUser.email,
      isLoading: false,
    });
  };

  const handleConfirmDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      startActionFeedback('Deleting user...');
      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(deleteModal.userId)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.userId));
      setAssignments((prev) => prev.filter((a) => a.userId !== deleteModal.userId));
      setDeleteModal({ isOpen: false, userId: '', userName: '', isLoading: false });
      finishActionSuccess('User deleted successfully.');
    } catch (error: any) {
      finishActionError();
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      setStatusMessage({ type: 'error', text: error?.message || 'Failed to delete user.' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">User Management</h2>
        <p className="text-slate-600 dark:text-slate-400">Create, edit, and delete users. Updates are saved to the database and reflected instantly.</p>
      </div>

      {statusMessage && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            statusMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          {/* Search Bar */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Users ({searchFilteredUsers.length})
            </button>
            <button
              onClick={() => setActiveFilter('premium')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === 'premium'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Premium ({premiumClients.length})
            </button>
            <button
              onClick={() => setActiveFilter('admin')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === 'admin'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Admin ({adminUsers.length})
            </button>
            <button
              onClick={() => setActiveFilter('free')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeFilter === 'free'
                  ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md shadow-slate-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Free ({freeUsers.length})
            </button>
          </div>

          {/* Create User Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-opacity hover:opacity-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Create User
          </button>
        </div>
      </div>

      {/* User Table Display */}
      <div className="space-y-6">
        {activeFilter === 'all' ? (
          <>
            {renderUserTable('Premium Clients', premiumClients)}
            {renderUserTable('Admin Users', adminUsers)}
            {renderUserTable('Free Users', freeUsers)}
          </>
        ) : activeFilter === 'premium' ? (
          renderUserTable('Premium Clients', premiumClients)
        ) : activeFilter === 'admin' ? (
          renderUserTable('Admin Users', adminUsers)
        ) : (
          renderUserTable('Free Users', freeUsers)
        )}
      </div>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
              placeholder="Enter full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
              placeholder="Enter password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-opacity hover:opacity-95"
            >
              <Plus className="h-4 w-4" />
              Create User
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password (optional)</label>
            <input
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSaveEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-opacity hover:opacity-95"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete User"
        description="This will permanently delete this user and remove all related clinic assignments."
        itemName={deleteModal.userName}
        isLoading={deleteModal.isLoading}
        confirmLabel="Delete User"
        cancelLabel="Keep User"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, userId: '', userName: '', isLoading: false })}
      />
    </div>
  );
}
function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ADMIN_SECTIONS = [
    'Global Stats',
    'User Management',
    'Registered Clients',
    'Client Sites',
    'AI Models',
    'Lead Database',
    'Security Logs',
    'System Config',
    'Analytics',
    'Blog Management',
    'News Management',
    'My Profile',
    'Settings',
  ] as const;

  const toViewValue = (label: string) => label.toLowerCase().replace(/\s+/g, '-');
  const toSectionLabel = (view: string | null) => {
    if (!view) return null;
    if (view === 'staff-management') return 'User Management';
    return ADMIN_SECTIONS.find((label) => toViewValue(label) === view) || null;
  };

  const [user, setUser] = useState<any>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  // track which sidebar section is active
  const [section, setSection] = useState<string>('Global Stats');
  const [sectionHistory, setSectionHistory] = useState<string[]>(['Global Stats']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedUser, setSelectedUser] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');
  const { theme } = useSitePreferences();
  const dark = theme === 'dark';
  const { t } = useAdminTranslation();

  // Modal states
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddClinicModal, setShowAddClinicModal] = useState(false);
  const [showEditClinicModal, setShowEditClinicModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState<any>(null);
  const [showQuickAssignModal, setShowQuickAssignModal] = useState(false);
  const [quickAssignClinicId, setQuickAssignClinicId] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [newClientRole, setNewClientRole] = useState('client');
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicType, setNewClinicType] = useState('');
  const [newClinicLocation, setNewClinicLocation] = useState('');
  const [newClinicAssignedUser, setNewClinicAssignedUser] = useState('');
  // Analytics refresh trigger – incremented after form saves
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);

  // Command Center metrics
  const [commandCenterData, setCommandCenterData] = useState({
    weeklyPatients: 0,
    weeklyPatientsTrend: 0,
    monthlyPatients: 0,
    monthlyPatientsTrend: 0,
    weeklyAdSpend: { meta: 0, google: 0, total: 0 },
    monthlyAdSpend: { meta: 0, google: 0, total: 0 },
    topClinics: [] as any[],
    traffic: { total: 0, calls: 0, websiteVisits: 0, directionClicks: 0 },
    alerts: [] as any[],
    recentActivity: [] as any[],
  });

  const isAdminLike = useCallback((role?: string) => role === 'admin' || role === 'super_admin', []);

  const fetchAdminData = useCallback(async () => {
    try {
      const [usersRes, clinicsRes] = await Promise.all([
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/admin/clinics', { cache: 'no-store' }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
        setAssignments(usersData.assignments || []);
      }

      if (clinicsRes.ok) {
        const clinicsData = await clinicsRes.json();
        setClinics(clinicsData.clinics || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
  }, []);

  const [gmbState, setGmbState] = useState({
    loading: false,
    connecting: false,
    syncing: false,
    error: '',
    message: '',
    connection: null as any,
    accounts: [] as any[],
    locations: [] as any[],
    selectedAccount: '',
    selectedLocation: '',
  });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    itemName: '',
    isLoading: false,
    onConfirm: () => {},
  });

  const [actionFeedback, setActionFeedback] = useState({
    loading: false,
    loadingText: 'Saving changes...',
    showSuccess: false,
    successMessage: '',
  });

  const startActionFeedback = (loadingText: string) => {
    setActionFeedback(prev => ({
      ...prev,
      loading: true,
      loadingText,
      showSuccess: false,
    }));
  };

  const finishActionSuccess = (successMessage: string) => {
    setActionFeedback({
      loading: false,
      loadingText: 'Saving changes...',
      showSuccess: true,
      successMessage,
    });
  };

  const finishActionError = () => {
    setActionFeedback(prev => ({
      ...prev,
      loading: false,
    }));
  };

  const resetDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      title: '',
      description: '',
      itemName: '',
      isLoading: false,
      onConfirm: () => {},
    });
  };

  // Navigation functions
  const navigateToSection = (newSection: string) => {
    const newHistory = [...sectionHistory.slice(0, historyIndex + 1), newSection];
    setSectionHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSection(newSection);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSection(sectionHistory[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < sectionHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSection(sectionHistory[historyIndex + 1]);
    }
  };

  useEffect(() => {
    // Check auth
    fetch('/api/auth/me').then(res => {
      if (!res.ok) {
        router.push('/login');
      } else {
        res.json().then(data => {
          if (!isAdminLike(data.role)) {
            router.push('/dashboard/client');
          } else {
            setUser(data);
            fetchAdminData();
          }
        });
      }
    });

    // Fetch leads from database
    fetch('/api/contact-lead').then(res => res.json()).then(data => {
      setLeads(data.leads || []);
    }).catch(console.error);

    // Note: Socket.io is disabled for Vercel serverless deployment
    // Real-time updates are not available. Manual refresh or API polling recommended.
  }, [router, isAdminLike, fetchAdminData]);

  useEffect(() => {
    if (!user) return;
    const intervalId = window.setInterval(() => {
      fetchAdminData();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [user, fetchAdminData]);

  // Handle view parameter from URL - Consolidated to prevent race conditions
  useEffect(() => {
    const view = searchParams.get('view');
    const targetSection = toSectionLabel(view);

    // Only sync FROM URL if we have a valid view parameter and it differs from current section
    if (targetSection && targetSection !== section) {
      setSection(targetSection);
      setSectionHistory([targetSection]);
      setHistoryIndex(0);
    }
  }, []); // Empty dependency - only run on mount to read initial URL param

  // Sync TO URL whenever section changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    url.searchParams.set('view', toViewValue(section));
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  }, [section]);

  useEffect(() => {
    if (!actionFeedback.showSuccess) return;
    const timerId = window.setTimeout(() => {
      setActionFeedback(prev => ({ ...prev, showSuccess: false }));
    }, 2600);

    return () => window.clearTimeout(timerId);
  }, [actionFeedback.showSuccess]);

  // Fetch command center data when on Global Stats section
  useEffect(() => {
    if (section !== 'Global Stats' || !user) return;
    
    const fetchCommandCenterData = async () => {
      try {
        const response = await fetch('/api/admin/stats/command-center', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setCommandCenterData(data);
        }
      } catch (error) {
        console.error('Failed to fetch command center data:', error);
      }
    };

    fetchCommandCenterData();
    
    // Refresh every 30 seconds
    const intervalId = setInterval(fetchCommandCenterData, 30000);
    return () => clearInterval(intervalId);
  }, [section, user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedClinic) {
      alert('Please select both a user and a clinic');
      return;
    }

    try {
      startActionFeedback('Assigning clinic...');
      const res = await fetch('/api/admin/clinics/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: selectedUser, clinicId: selectedClinic }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign clinic');
      }

      setAssignments(prev => {
        const exists = prev.some(a => a.userId === selectedUser && a.clinicId === selectedClinic);
        if (exists) return prev;
        return [...prev, { userId: selectedUser, clinicId: selectedClinic }];
      });

      finishActionSuccess('Clinic assigned successfully.');
      setSelectedUser('');
      setSelectedClinic('');
      fetchAdminData();
    } catch (error) {
      console.error('Error assigning clinic:', error);
      finishActionError();
      alert(`❌ Failed to assign clinic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleQuickAssign = async (userId: string) => {
    if (!userId || !quickAssignClinicId) {
      alert('Missing user or clinic');
      return;
    }

    try {
      startActionFeedback('Assigning clinic...');
      const res = await fetch('/api/admin/clinics/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, clinicId: quickAssignClinicId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign clinic');
      }

      setAssignments(prev => {
        const exists = prev.some(a => a.userId === userId && a.clinicId === quickAssignClinicId);
        if (exists) return prev;
        return [...prev, { userId, clinicId: quickAssignClinicId }];
      });

      finishActionSuccess('Clinic assigned successfully.');
      setShowQuickAssignModal(false);
      setQuickAssignClinicId('');
      setSelectedUser('');
      fetchAdminData();
    } catch (error) {
      console.error('Error assigning clinic:', error);
      finishActionError();
      alert(`❌ Failed to assign clinic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRemoveAssignment = async (userId: string, clinicId: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Remove Assignment',
      description: 'This will remove the current user-clinic assignment.',
      itemName: 'User/Clinic Assignment',
      isLoading: false,
      onConfirm: async () => {
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        startActionFeedback('Removing assignment...');

        try {
          const res = await fetch('/api/admin/clinics/assign', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ userId, clinicId }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Failed to remove assignment');
          }

          setAssignments(prev => prev.filter(a => !(a.userId === userId && a.clinicId === clinicId)));
          resetDeleteModal();
          finishActionSuccess('Assignment removed successfully.');
        } catch (error) {
          console.error('Error removing assignment:', error);
          finishActionError();
          resetDeleteModal();
          alert(`❌ Failed to remove assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      },
    });
  };

  const handleUpdateStats = async (clinicId: string, leads: number, appointments: number) => {
    // Stats update can be added as future enhancement
    console.log('Update stats for clinic', clinicId, ':', { leads, appointments });
  };

  const handleAddClient = async () => {
    if (newClientName && newClientEmail && newClientPassword) {
      try {
        startActionFeedback('Creating user...');
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newClientName,
            email: newClientEmail,
            password: newClientPassword,
            role: newClientRole,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          finishActionError();
          alert(data.error || 'Failed to create user');
          return;
        }

        setUsers(prev => [data, ...prev]);

        setNewClientName('');
        setNewClientEmail('');
        setNewClientPassword('');
        setNewClientRole('client');
        setShowAddClientModal(false);
        finishActionSuccess('User added successfully.');
        fetchAdminData();
      } catch (err) {
        console.error('Error creating user:', err);
        finishActionError();
        alert('Failed to create user. Please try again.');
      }
    }
  };

  const handleAddClinic = async () => {
    if (!newClinicName || !newClinicType || !newClinicLocation) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      startActionFeedback('Creating clinic...');
      const res = await fetch('/api/admin/clinics/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newClinicName,
          type: newClinicType,
          location: newClinicLocation,
          assignedUsers: newClinicAssignedUser ? [newClinicAssignedUser] : [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create clinic');
      }

      setClinics(prev => [data, ...prev]);
      if (newClinicAssignedUser) {
        setAssignments(prev => {
          const exists = prev.some(a => a.userId === newClinicAssignedUser && a.clinicId === data.id);
          if (exists) return prev;
          return [...prev, { userId: newClinicAssignedUser, clinicId: data.id }];
        });
      }

      finishActionSuccess('Clinic created successfully.');
      setNewClinicName('');
      setNewClinicType('');
      setNewClinicLocation('');
      setNewClinicAssignedUser('');
      setShowAddClinicModal(false);
      fetchAdminData();
    } catch (error) {
      console.error('Error creating clinic:', error);
      finishActionError();
      alert(`❌ Failed to create clinic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditClinic = async () => {
    if (!editingClinic) return;

    try {
      const res = await fetch(`/api/admin/clinics/${editingClinic.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: editingClinic.name,
          type: editingClinic.type,
          location: editingClinic.location,
          assignedUsers: editingClinic.clientAssignments?.map((ca: any) => ca.userId) || [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update clinic');
      }

      alert('✅ Clinic updated successfully');
      setEditingClinic(null);
      setShowEditClinicModal(false);
      fetchAdminData();
    } catch (error) {
      console.error('Error updating clinic:', error);
      alert(`❌ Failed to update clinic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteClinic = async (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId);
    
    setDeleteModal({
      isOpen: true,
      title: 'Delete Clinic',
      description: 'This will permanently delete the clinic and all associated data, including GMB connections and analytics. This action cannot be undone.',
      itemName: clinic?.name || '',
      isLoading: false,
      onConfirm: async () => {
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        startActionFeedback('Deleting clinic...');
        
        try {
          const res = await fetch(`/api/admin/clinics/${clinicId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Failed to delete clinic');
          }

          setClinics(prev => prev.filter(c => c.id !== clinicId));
          setAssignments(prev => prev.filter(a => a.clinicId !== clinicId));
          resetDeleteModal();
          finishActionSuccess('Clinic deleted successfully.');
          fetchAdminData();
        } catch (error) {
          console.error('Error deleting clinic:', error);
          finishActionError();
          alert(`❌ Failed to delete clinic: ${error instanceof Error ? error.message : 'Unknown error'}`);
          resetDeleteModal();
        }
      },
    });
  };

  const handleDeleteClient = async (clientId: string) => {
    const client = users.find(u => u.id === clientId);
    
    setDeleteModal({
      isOpen: true,
      title: 'Delete User',
      description: 'This will permanently delete the user account and all associated data. This action cannot be undone.',
      itemName: client?.name || client?.email || '',
      isLoading: false,
      onConfirm: async () => {
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        startActionFeedback('Deleting user...');
        
        try {
          const res = await fetch(`/api/admin/users?id=${clientId}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (!res.ok) {
            finishActionError();
            alert(data.error || 'Failed to delete user');
            resetDeleteModal();
            return;
          }

          setUsers(prev => prev.filter(u => u.id !== clientId));
          setAssignments(prev => prev.filter(a => a.userId !== clientId));
          resetDeleteModal();
          finishActionSuccess('User deleted successfully.');
          fetchAdminData();
        } catch (err) {
          console.error('Error deleting user:', err);
          finishActionError();
          alert(`❌ Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`);
          resetDeleteModal();
        }
      },
    });
  };

  const fetchGmbConnection = async (clinicId: string) => {
    setGmbState(prev => ({
      ...prev,
      loading: true,
      error: '',
      message: '',
      accounts: [],
      locations: [],
      selectedAccount: '',
      selectedLocation: '',
    }));

    try {
      const connRes = await fetch(`/api/admin/gmb/connection?clinicId=${encodeURIComponent(clinicId)}`);
      const connData = await connRes.json();
      if (!connRes.ok) throw new Error(connData.error || 'Failed to load GMB connection');

      const connection = connData.connection;
      if (!connection) {
        setGmbState(prev => ({
          ...prev,
          loading: false,
          connection: null,
          message: 'Connect Google to choose the correct business account and location.',
        }));
        return;
      }

      const accountsRes = await fetch(`/api/admin/gmb/accounts?clinicId=${encodeURIComponent(clinicId)}`);
      const accountsData = await accountsRes.json();
      if (!accountsRes.ok) throw new Error(accountsData.error || 'Failed to load Google accounts');

      const selectedAccount = connection.businessAccountId || accountsData.accounts?.[0]?.name || '';
      let locations: any[] = [];

      if (selectedAccount) {
        const locationsRes = await fetch(`/api/admin/gmb/locations?clinicId=${encodeURIComponent(clinicId)}&accountName=${encodeURIComponent(selectedAccount)}`);
        const locationsData = await locationsRes.json();
        if (!locationsRes.ok) throw new Error(locationsData.error || 'Failed to load account locations');
        locations = locationsData.locations || [];
      }

      setGmbState(prev => ({
        ...prev,
        loading: false,
        connection,
        accounts: accountsData.accounts || [],
        locations,
        selectedAccount,
        selectedLocation: connection.businessLocationId || '',
        message: connection.businessLocationId
          ? 'Google Business Profile connected. Daily sync is active.'
          : 'Google connected. Select account and location to complete setup.',
      }));
    } catch (error: any) {
      setGmbState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load GMB status',
      }));
    }
  };

  const handleGmbConnect = async () => {
    if (!editingClinic?.id) return;

    setGmbState(prev => ({ ...prev, connecting: true, error: '', message: '' }));

    try {
      // Get the OAuth URL from our endpoint
      const urlRes = await fetch(`/api/admin/gmb/auth-url?clinicId=${encodeURIComponent(editingClinic.id)}`);
      const urlData = await urlRes.json();

      if (!urlRes.ok) {
        throw new Error(urlData.error || 'Failed to generate auth URL');
      }

      // Set up message listener before opening popup
      const handlePopupMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === 'gmb_auth_complete') {
          window.removeEventListener('message', handlePopupMessage);
          if (event.data.success) {
            setGmbState(prev => ({
              ...prev,
              connecting: false,
              message: 'Google Business Profile connected successfully!',
              error: '',
            }));
            // Refresh GMB data
            if (editingClinic?.id) {
              fetchGmbConnection(editingClinic.id);
            }
          } else {
            setGmbState(prev => ({
              ...prev,
              connecting: false,
              error: event.data.error || 'Failed to connect GMB',
            }));
          }
        }
      };

      window.addEventListener('message', handlePopupMessage);

      // Open popup with the auth URL
      const popup = window.open(
        urlData.authUrl,
        'gmb_oauth',
        `width=${urlData.popup?.width || 600},height=${urlData.popup?.height || 700}`
      );

      if (!popup) {
        window.removeEventListener('message', handlePopupMessage);
        setGmbState(prev => ({
          ...prev,
          connecting: false,
          error: 'Popup blocked. Please allow popups and try again.',
        }));
      }
    } catch (error: any) {
      console.error('Error starting GMB connection:', error);
      setGmbState(prev => ({
        ...prev,
        connecting: false,
        error: error?.message || 'Failed to start GMB connection. Check configuration.',
      }));
    }
  };

  const handleAccountChange = async (accountName: string) => {
    if (!editingClinic?.id) return;

    setGmbState(prev => ({
      ...prev,
      selectedAccount: accountName,
      selectedLocation: '',
      locations: [],
      error: '',
      message: '',
    }));

    if (!accountName) return;

    try {
      const locationsRes = await fetch(`/api/admin/gmb/locations?clinicId=${encodeURIComponent(editingClinic.id)}&accountName=${encodeURIComponent(accountName)}`);
      const locationsData = await locationsRes.json();
      if (!locationsRes.ok) throw new Error(locationsData.error || 'Failed to load locations');

      setGmbState(prev => ({ ...prev, locations: locationsData.locations || [] }));
    } catch (error: any) {
      setGmbState(prev => ({
        ...prev,
        error: error?.message || 'Failed to load locations',
      }));
    }
  };

  const handleSaveGmbSelection = async () => {
    if (!editingClinic?.id || !gmbState.selectedAccount || !gmbState.selectedLocation) return;

    setGmbState(prev => ({ ...prev, loading: true, error: '', message: '' }));

    try {
      const res = await fetch('/api/admin/gmb/select-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: editingClinic.id,
          accountName: gmbState.selectedAccount,
          locationName: gmbState.selectedLocation,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save account/location');

      await fetchGmbConnection(editingClinic.id);
      setGmbState(prev => ({
        ...prev,
        message: data.warning
          ? `Connected, but initial sync failed: ${data.warning}`
          : 'Google Business Profile location saved. Daily sync is now enabled.',
      }));
    } catch (error: any) {
      setGmbState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to save GMB location',
      }));
    }
  };

  const handleManualGmbSync = async () => {
    if (!editingClinic?.id) return;

    setGmbState(prev => ({ ...prev, syncing: true, error: '', message: '' }));

    try {
      const res = await fetch('/api/admin/gmb/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicId: editingClinic.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Manual sync failed');

      await fetchGmbConnection(editingClinic.id);
      setGmbState(prev => ({
        ...prev,
        syncing: false,
        message: 'GMB data synced successfully.',
      }));
    } catch (error: any) {
      setGmbState(prev => ({
        ...prev,
        syncing: false,
        error: error?.message || 'Manual sync failed',
      }));
    }
  };

  useEffect(() => {
    if (!showEditClinicModal || !editingClinic?.id) return;
    fetchGmbConnection(editingClinic.id);
  }, [showEditClinicModal, editingClinic?.id]);

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data;
      if (data?.type === 'GMB_OAUTH_SUCCESS' && editingClinic?.id && data.clinicId === editingClinic.id) {
        await fetchGmbConnection(editingClinic.id);
        setGmbState(prev => ({
          ...prev,
          connecting: false,
          message: data.message || 'Google connected. Select account and location to finish setup.',
        }));
      }

      if (data?.type === 'GMB_OAUTH_ERROR') {
        setGmbState(prev => ({
          ...prev,
          connecting: false,
          error: data.message || 'Google connection failed',
        }));
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [editingClinic?.id]);

  if (!user) return <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>Loading...</div>;

  return (
    <>
    <Navbar />
    <div className={`dashboard-scope min-h-screen flex pt-20 ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative inset-y-0 left-0 w-64 border-r flex flex-col p-6 z-50 lg:z-auto transition-transform ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:pt-0 pt-20 ${dark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-white'}`}>
        {/* Back/Forward Navigation */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={goBack}
            disabled={historyIndex === 0}
            className={`p-2 rounded-lg transition-all ${historyIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex >= sectionHistory.length - 1}
            className={`p-2 rounded-lg transition-all ${historyIndex >= sectionHistory.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <span className="text-xs text-slate-500 ml-2">{section}</span>
        </div>

        <nav className="space-y-2 flex-grow">
          <NavItem icon={LayoutDashboard} label={t('Global Stats')} active={section==='Global Stats'} onClick={() => { navigateToSection('Global Stats'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={BarChart3} label={t('Analytics')} active={section==='Analytics'} onClick={() => { navigateToSection('Analytics'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={Users} label={t('User Management')} active={section==='User Management'} onClick={() => { navigateToSection('User Management'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={Building2} label={t('Registered Clients')} active={section==='Registered Clients'} onClick={() => { navigateToSection('Registered Clients'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={Globe} label={t('Client Sites')} active={section==='Client Sites'} onClick={() => { navigateToSection('Client Sites'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={Cpu} label={t('AI Models')} active={section==='AI Models'} onClick={() => { navigateToSection('AI Models'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={Database} label={t('Lead Database')} active={section==='Lead Database'} onClick={() => { navigateToSection('Lead Database'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={ShieldAlert} label={t('Security Logs')} active={section==='Security Logs'} onClick={() => { navigateToSection('Security Logs'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={Settings} label={t('System Config')} active={section==='System Config'} onClick={() => { navigateToSection('System Config'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={User} label={t('My Profile')} active={section==='My Profile'} onClick={() => { navigateToSection('My Profile'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={Lock} label={t('Settings')} active={section==='Settings'} onClick={() => { navigateToSection('Settings'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={FileText} label={t('Blog Management')} active={section==='Blog Management'} onClick={() => { navigateToSection('Blog Management'); setShowMobileMenu(false); }} dark={dark} />
          <NavItem icon={Newspaper} label={t('News Management')} active={section==='News Management'} onClick={() => { navigateToSection('News Management'); setShowMobileMenu(false); }} dark={dark} />
          <Link href="/dashboard/admin/ai-creator" className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${dark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <Sparkles className="h-5 w-5" />
            <span className="text-sm">{t('AI Creator')}</span>
          </Link>
          <Link href="/dashboard/admin/chat-reports" className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${dark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm">{t('Chat Reports')}</span>
          </Link>
          <Link href="/dashboard/admin/leads" className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${dark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <Users className="h-5 w-5" />
            <span className="text-sm">{t('Contact Leads')}</span>
          </Link>
          <Link href="/dashboard/admin/subscribers" className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${dark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
            <Mail className="h-5 w-5" />
            <span className="text-sm">{t('Newsletter Subscribers')}</span>
          </Link>
        </nav>

        <button onClick={handleLogout} className={`flex items-center gap-3 transition-colors p-3 ${dark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-bold">{t('Logout')}</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto flex flex-col">
        {/* Header with Mobile Menu Button and Settings */}
        <div className="flex items-center justify-end mb-6 lg:mb-8 relative">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 absolute left-0"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <AdminSettings />
        </div>

        <div className="flex-grow">
        <ContentForSection
          section={section}
          user={user}
          clinics={clinics}
          users={users}
          leads={leads}
          assignments={assignments}
          selectedUser={selectedUser}
          selectedClinic={selectedClinic}
          setSelectedUser={setSelectedUser}
          setSelectedClinic={setSelectedClinic}
          handleAssign={handleAssign}
          handleRemoveAssignment={handleRemoveAssignment}
          handleUpdateStats={handleUpdateStats}
          onAddClient={() => setShowAddClientModal(true)}
          onAddClinic={() => setShowAddClinicModal(true)}
          onEditClinic={(clinic: any) => {
            setEditingClinic({ ...clinic });
            setShowEditClinicModal(true);
          }}
          onDeleteClinic={handleDeleteClinic}
          onDeleteClient={handleDeleteClient}
          onQuickAssign={(clinicId: string) => {
            setQuickAssignClinicId(clinicId);
            setShowQuickAssignModal(true);
          }}
          isDark={dark}
          analyticsRefreshKey={analyticsRefreshKey}
          setAnalyticsRefreshKey={setAnalyticsRefreshKey}
          setUsers={setUsers}
          setAssignments={setAssignments}
          isActionLoading={actionFeedback.loading}
          startActionFeedback={startActionFeedback}
          finishActionSuccess={finishActionSuccess}
          finishActionError={finishActionError}
          t={t}
          commandCenterData={commandCenterData}
          navigateToSection={navigateToSection}
        />
        </div>
      </main>
    </div>

    {/* Add Client Modal */}
    <Modal isOpen={showAddClientModal} onClose={() => setShowAddClientModal(false)} title="Add New User">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            placeholder="John Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            value={newClientEmail}
            onChange={(e) => setNewClientEmail(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={newClientRole}
            onChange={(e) => setNewClientRole(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
          >
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">Select whether this user is a Client or Admin</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={newClientPassword}
            onChange={(e) => setNewClientPassword(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            placeholder="Enter password for login"
          />
          <p className="text-xs text-slate-500 mt-1">User will use this password to log in</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleAddClient}
            disabled={!newClientName || !newClientEmail || !newClientPassword || actionFeedback.loading}
            className="flex-1 bg-emerald-500 text-black font-bold py-2 rounded-lg hover:bg-emerald-400 disabled:opacity-50"
          >
            {actionFeedback.loading ? 'Adding...' : 'Add User'}
          </button>
          <button
            onClick={() => setShowAddClientModal(false)}
            disabled={actionFeedback.loading}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>

    {/* Add Clinic Modal */}
    <Modal isOpen={showAddClinicModal} onClose={() => setShowAddClinicModal(false)} title="Add New Clinic">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Clinic Name</label>
          <input
            type="text"
            value={newClinicName}
            onChange={(e) => setNewClinicName(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            placeholder="Downtown Medical Center"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={newClinicType}
            onChange={(e) => setNewClinicType(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
          >
            <option value="">Select type...</option>
            <option value="ER">Emergency Room (ER)</option>
            <option value="Urgent Care">Urgent Care</option>
            <option value="Wellness">Wellness Center</option>
            <option value="MedSpa">MedSpa</option>
            <option value="Dental">Dental Practice</option>
            <option value="Specialty">Specialty Clinic</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={newClinicLocation}
            onChange={(e) => setNewClinicLocation(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            placeholder="Houston, TX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Assign to Client (Optional)</label>
          <select
            value={newClinicAssignedUser}
            onChange={(e) => setNewClinicAssignedUser(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
          >
            <option value="">Leave Unassigned</option>
            {users.filter(u => u.role === 'client').map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">You can assign this clinic to a client immediately, or leave it unassigned</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleAddClinic}
            disabled={!newClinicName || !newClinicType || !newClinicLocation}
            className="flex-1 bg-emerald-500 text-black font-bold py-2 rounded-lg hover:bg-emerald-400 disabled:opacity-50"
          >
            Add Clinic
          </button>
          <button
            onClick={() => setShowAddClinicModal(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>

    {/* Edit Clinic Modal */}
    <Modal isOpen={showEditClinicModal} onClose={() => setShowEditClinicModal(false)} title="Clinic Profile">
      {editingClinic && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Clinic Name</label>
            <input
              type="text"
              value={editingClinic.name}
              onChange={(e) => setEditingClinic({ ...editingClinic, name: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={editingClinic.type}
              onChange={(e) => setEditingClinic({ ...editingClinic, type: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            >
              <option value="ER">Emergency Room (ER)</option>
              <option value="Urgent Care">Urgent Care</option>
              <option value="Wellness">Wellness Center</option>
              <option value="MedSpa">MedSpa</option>
              <option value="Dental">Dental Practice</option>
              <option value="Specialty">Specialty Clinic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={editingClinic.location}
              onChange={(e) => setEditingClinic({ ...editingClinic, location: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            />
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Google Business Profile (GMB)</p>
              <button
                onClick={handleGmbConnect}
                disabled={gmbState.connecting || gmbState.loading}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50 transition-colors"
              >
                <Link2 className="h-3.5 w-3.5" />
                {gmbState.connection ? 'Reconnect Google' : 'Connect Google'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Required scopes: business.manage, openid, email, profile.
            </p>

            {gmbState.connection && (
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p><span className="font-semibold">Google Account:</span> {gmbState.connection.googleEmail || '—'}</p>
                <p><span className="font-semibold">Status:</span> {gmbState.connection.connectionStatus || '—'} • {gmbState.connection.syncStatus || 'idle'}</p>
                <p><span className="font-semibold">Last Sync:</span> {gmbState.connection.lastSyncedAt ? new Date(gmbState.connection.lastSyncedAt).toLocaleString() : 'Never'}</p>
              </div>
            )}

            {gmbState.accounts.length > 0 && (
              <div>
                <label className="block text-xs font-medium mb-1">Business Account</label>
                <select
                  value={gmbState.selectedAccount}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800"
                >
                  <option value="">Select account...</option>
                  {gmbState.accounts.map((account) => (
                    <option key={account.name} value={account.name}>
                      {account.accountName || account.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {gmbState.selectedAccount && (
              <div>
                <label className="block text-xs font-medium mb-1">Location</label>
                <select
                  value={gmbState.selectedLocation}
                  onChange={(e) => setGmbState(prev => ({ ...prev, selectedLocation: e.target.value }))}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800"
                >
                  <option value="">Select location...</option>
                  {gmbState.locations.map((location) => (
                    <option key={location.name} value={location.name}>
                      {location.title || location.name}{location.address ? ` — ${location.address}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSaveGmbSelection}
                disabled={!gmbState.selectedAccount || !gmbState.selectedLocation || gmbState.loading}
                className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 disabled:opacity-50"
              >
                Save Account & Location
              </button>
              <button
                onClick={handleManualGmbSync}
                disabled={!gmbState.connection?.businessLocationId || gmbState.syncing}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${gmbState.syncing ? 'animate-spin' : ''}`} />
                Sync Now
              </button>
            </div>

            {gmbState.message && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{gmbState.message}</p>
            )}
            {gmbState.error && (
              <p className="text-xs text-red-600 dark:text-red-400">{gmbState.error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleEditClinic}
              className="flex-1 bg-emerald-500 text-black font-bold py-2 rounded-lg hover:bg-emerald-400"
            >
              Save Changes
            </button>
            <button
              onClick={() => setShowEditClinicModal(false)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>

    {/* Quick Assign Modal */}
    <Modal isOpen={showQuickAssignModal} onClose={() => setShowQuickAssignModal(false)} title="Assign Client to Clinic">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Client</label>
          <select 
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
          >
            <option value="">Choose a client...</option>
            {users.filter(u => u.role === 'client').map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => selectedUser && handleQuickAssign(selectedUser)}
            disabled={!selectedUser || actionFeedback.loading}
            className="flex-1 bg-emerald-500 text-black font-bold py-2 rounded-lg hover:bg-emerald-400 disabled:opacity-50"
          >
            {actionFeedback.loading ? 'Assigning...' : 'Assign'}
          </button>
          <button
            onClick={() => {
              setShowQuickAssignModal(false);
              setSelectedUser('');
            }}
            disabled={actionFeedback.loading}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>

    <DeleteConfirmationModal
      isOpen={deleteModal.isOpen}
      title={deleteModal.title}
      description={deleteModal.description}
      itemName={deleteModal.itemName}
      isLoading={deleteModal.isLoading}
      onConfirm={deleteModal.onConfirm}
      onCancel={resetDeleteModal}
    />

    <ActionFeedback
      loading={actionFeedback.loading}
      loadingText={actionFeedback.loadingText}
      showSuccess={actionFeedback.showSuccess}
      successMessage={actionFeedback.successMessage}
      onDismissSuccess={() => setActionFeedback(prev => ({ ...prev, showSuccess: false }))}
    />

    <Footer />
    </>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}

/* ─── Admin Profile View ─── */
function AdminProfileView({ user }: { user: any }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'File must be an image' });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      let avatarUrl = formData.avatar;

      if (avatarFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', avatarFile);

        const uploadRes = await fetch('/api/upload/avatar', {
          method: 'POST',
          body: uploadFormData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.url;
        } else {
          throw new Error('Failed to upload avatar');
        }
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          avatar: avatarUrl,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden border-4 border-white/30">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt={user?.name} width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">{user?.name?.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-slate-800 border-2 border-emerald-500 cursor-pointer hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-emerald-100 flex items-center gap-2 mt-1">
                  <ShieldAlert className="h-4 w-4" />
                  Administrator
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <MailIcon className="inline h-4 w-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-2">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
        >
          <Save className="h-5 w-5" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

    </div>
  );
}
function DashboardSettingsView({ role }: { role: 'admin' | 'client' }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/password')
      .then((res) => res.json())
      .then((data) => {
        if (data?.currentPassword) setCurrentPassword(data.currentPassword);
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Failed to load current password.' });
      });
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update password');
      }

      setMessage({ type: 'success', text: 'Password updated and saved successfully.' });
      setCurrentPassword(data.currentPassword || newPassword);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="glass rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Change your password and update account-level security settings.</p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Updating Password...' : (
              <>
                <Lock className="h-5 w-5" />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>

      <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold mb-1">{role === 'admin' ? 'Admin Settings' : 'Client Settings'}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {role === 'admin'
            ? 'Your password controls access to dashboard administration, client management, and platform controls.'
            : 'Your password controls access to client analytics, profile data, and billing settings.'}
        </p>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false, onClick, dark = false }: { icon: any, label: string, active?: boolean, onClick?: () => void, dark?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${
        active ? 'bg-emerald-500 text-black font-bold' : dark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

// render content based on selected section
function ContentForSection(props: {
  section: string;
  user: any;
  clinics: any[];
  users: any[];
  leads: any[];
  assignments: any[];
  selectedUser: string;
  selectedClinic: string;
  setSelectedUser: (s: string) => void;
  setSelectedClinic: (s: string) => void;
  handleAssign: () => void;
  handleRemoveAssignment: (u:string,c:string)=>void;
  handleUpdateStats: (c:string,l:number,a:number)=>void;
  onAddClient: () => void;
  onAddClinic: () => void;
  onEditClinic: (c: any) => void;
  onDeleteClinic: (id: string) => void;
  onDeleteClient: (id: string) => void;
  onQuickAssign: (clinicId: string) => void;
  isDark: boolean;
  analyticsRefreshKey: number;
  setAnalyticsRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  setAssignments: React.Dispatch<React.SetStateAction<any[]>>;
  isActionLoading: boolean;
  startActionFeedback: (loadingText: string) => void;
  finishActionSuccess: (successMessage: string) => void;
  finishActionError: () => void;
  t: (key: string) => string;
  commandCenterData: any;
  navigateToSection: (section: string) => void;
}) {
  const {
    section,
    user,
    clinics,
    users,
    leads,
    assignments,
    selectedUser,
    selectedClinic,
    setSelectedUser,
    setSelectedClinic,
    handleAssign,
    handleRemoveAssignment,
    handleUpdateStats,
    onAddClient,
    onAddClinic,
    onEditClinic,
    onDeleteClinic,
    onDeleteClient,
    onQuickAssign,
    isDark,
    analyticsRefreshKey,
    setAnalyticsRefreshKey,
    setUsers,
    setAssignments,
    isActionLoading,
    startActionFeedback,
    finishActionSuccess,
    finishActionError,
    t,
    commandCenterData,
    navigateToSection,
  } = props;

  switch(section) {
    case 'Global Stats':
      return (
        <>
          <header className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-[20px] font-bold mb-1">{t('Command Center')}</h1>
              <p className="text-slate-500 dark:text-slate-400">{t('Welcome')}, {user.name}. {t('System health is optimal')}.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onAddClient}
                className="flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all"
              >
                <Plus className="h-5 w-5" /> {t('New User')}
              </button>
              <button 
                onClick={onAddClinic}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                <Plus className="h-5 w-5" /> {t('New Clinic')}
              </button>
            </div>
          </header>

          {/* Real-time Clinic Management (same as before) */}
          <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 mb-12">
            <h3 className="text-xl font-bold mb-6">{t('Assign Clinics to Clients')}</h3>
            <div className="flex flex-wrap gap-4 mb-8">
              <select 
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 dark:text-slate-200 focus:outline-none focus:border-emerald-500 min-w-[200px]"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">{t('Select Client User')}</option>
                {users.filter(u => u.role === 'client').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <select 
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 dark:text-slate-200 focus:outline-none focus:border-emerald-500 min-w-[200px]"
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
              >
                <option value="">{t('Select Clinic/ER')}</option>
                {clinics.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.location}</option>
                ))}
              </select>
              <button 
                onClick={handleAssign}
                disabled={!selectedUser || !selectedClinic || isActionLoading}
                className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActionLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>

            <h3 className="text-xl font-bold mb-6">Manage Clinics (Real-time Sync)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                    <th className="px-4 py-4">Clinic Name</th>
                    <th className="px-4 py-4">Type</th>
                    <th className="px-4 py-4">Assigned Users</th>
                    <th className="px-4 py-4">Leads</th>
                    <th className="px-4 py-4">Appointments</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {clinics.map(clinic => {
                    const assignedUsers = assignments.filter(a => a.clinicId === clinic.id).map(a => {
                      const u = users.find(user => user.id === a.userId);
                      return u ? { ...u, assignmentId: a.userId } : null;
                    }).filter(Boolean);

                    return (
                      <tr key={clinic.id} className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-4 py-4 font-bold">{clinic.name}</td>
                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{clinic.type}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {assignedUsers.map((u: any) => (
                              <span key={u.id} className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md flex items-center gap-2">
                                {u.name}
                                <button
                                  onClick={() => handleRemoveAssignment(u.id, clinic.id)}
                                  disabled={isActionLoading}
                                  className="text-red-400 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                            {assignedUsers.length === 0 && <span className="text-slate-400 text-xs">Unassigned</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="number" 
                            value={clinic.leads}
                            onChange={(e) => handleUpdateStats(clinic.id, parseInt(e.target.value) || 0, clinic.appointments)}
                            className="w-20 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1 text-center dark:text-slate-200"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="number" 
                            value={clinic.appointments}
                            onChange={(e) => handleUpdateStats(clinic.id, clinic.leads, parseInt(e.target.value) || 0)}
                            className="w-20 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1 text-center dark:text-slate-200"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-emerald-500 text-xs">Live Sync Active</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => onQuickAssign(clinic.id)}
                                className="text-xs bg-emerald-500 text-black px-3 py-1 rounded hover:bg-emerald-400 transition-colors font-bold"
                              >
                                + Assign
                              </button>
                              <button 
                                onClick={() => onEditClinic(clinic)}
                                className="text-xs bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors font-bold"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => onDeleteClinic(clinic.id)}
                                className="text-xs bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white px-3 py-1 rounded transition-colors font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Patient Visits - Last Week */}
            <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-emerald-500" />
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Week</h4>
              </div>
              <p className="text-3xl font-bold mb-1">{commandCenterData.weeklyPatients.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Patient Visits</p>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <span className={commandCenterData.weeklyPatientsTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                  {commandCenterData.weeklyPatientsTrend >= 0 ? '↑' : '↓'} {Math.abs(commandCenterData.weeklyPatientsTrend)}%
                </span>
                <span className="text-slate-500 dark:text-slate-400">vs prev week</span>
              </div>
            </div>

            {/* Total Patient Visits - Last Month */}
            <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Month</h4>
              </div>
              <p className="text-3xl font-bold mb-1">{commandCenterData.monthlyPatients.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Patient Visits</p>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <span className={commandCenterData.monthlyPatientsTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                  {commandCenterData.monthlyPatientsTrend >= 0 ? '↑' : '↓'} {Math.abs(commandCenterData.monthlyPatientsTrend)}%
                </span>
                <span className="text-slate-500 dark:text-slate-400">vs prev month</span>
              </div>
            </div>

            {/* Total Ad Spend - Week */}
            <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Weekly Ad Spend</h4>
              </div>
              <p className="text-3xl font-bold mb-1">${commandCenterData.weeklyAdSpend.total.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Meta + Google</p>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Meta: ${commandCenterData.weeklyAdSpend.meta.toLocaleString()} • Google: ${commandCenterData.weeklyAdSpend.google.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Total Ad Spend - Month */}
            <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-purple-500" />
                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Monthly Ad Spend</h4>
              </div>
              <p className="text-3xl font-bold mb-1">${commandCenterData.monthlyAdSpend.total.toLocaleString()}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Meta + Google</p>
              <div className="mt-3 flex items-center gap-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Meta: ${commandCenterData.monthlyAdSpend.meta.toLocaleString()} • Google: ${commandCenterData.monthlyAdSpend.google.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Visits by Clinic & Traffic Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Patient Visits by Clinic */}
            <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-bold">Top Performing Clinics</h3>
                </div>
                <button 
                  onClick={() => navigateToSection('Analytics')}
                  className="text-xs text-emerald-500 hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {commandCenterData.topClinics.length > 0 ? (
                  commandCenterData.topClinics.map((clinic: any, idx: number) => (
                    <div key={clinic.clinicId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{clinic.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{clinic.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{clinic.patients.toLocaleString()}</p>
                        <p className="text-xs">
                          <span className={clinic.trend >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                            {clinic.trend >= 0 ? '↑' : '↓'} {Math.abs(clinic.trend)}%
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-sm">No data available</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Add weekly analytics to see clinic performance</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Traffic & GMB Summary */}
            <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-bold">Traffic & GMB Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Traffic</p>
                  <p className="text-2xl font-bold">{commandCenterData.traffic.total.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Phone Calls</p>
                  <p className="text-2xl font-bold">{commandCenterData.traffic.calls.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Website Visits</p>
                  <p className="text-2xl font-bold">{commandCenterData.traffic.websiteVisits.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Direction Clicks</p>
                  <p className="text-2xl font-bold">{commandCenterData.traffic.directionClicks.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Alerts & Issues */}
            <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold">System Alerts</h3>
              </div>
              <div className="space-y-3">
                {commandCenterData.alerts.length > 0 ? (
                  commandCenterData.alerts.map((alert: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{alert.message}</p>
                        {alert.details && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{alert.details}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        alert.type === 'warning'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {alert.type === 'warning' ? '⚠️' : '❌'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">All systems operational</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No alerts or issues detected</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">OK</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Admin Activity */}
            <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-bold">Recent Activity</h3>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {commandCenterData.recentActivity.length > 0 ? (
                  commandCenterData.recentActivity.map((activity: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{activity.action}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {activity.name} {activity.details && `• ${activity.details}`}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">No recent activity</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      );

    case 'User Management':
      return (
        <StaffManagementSection
          users={users}
          setUsers={setUsers}
          setAssignments={setAssignments}
          currentUserId={user?.id}
          startActionFeedback={startActionFeedback}
          finishActionSuccess={finishActionSuccess}
          finishActionError={finishActionError}
        />
      );

    case 'Registered Clients':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">Registered Clients</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-400">All users who have signed up as clients on the platform.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Role</th>
                  <th className="px-4 py-4">Signup Date</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.filter(u => u.role === 'client').map(client => (
                  <tr key={client.id} className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-4 py-4 font-bold">{client.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{client.email}</td>
                    <td className="px-4 py-4"><span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full">{client.role}</span></td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-4 py-4 flex items-center gap-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">Active</span>
                      <button onClick={() => onDeleteClient(client.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.filter(u => u.role === 'client').length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No clients registered yet. <button onClick={onAddClient} className="text-emerald-500 font-bold hover:underline">Add one now</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'Client Sites':
      return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Client Sites</h2>
              <p className="text-slate-600 dark:text-slate-400">Overview of every clinic/ER registered with the platform.</p>
            </div>
            <button
              onClick={onAddClinic}
              className="flex items-center gap-2 bg-emerald-500 text-black px-4 py-2 rounded-xl font-bold hover:bg-emerald-400 transition-all"
            >
              <Plus className="h-5 w-5" /> Add Clinic
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Leads</th>
                  <th className="px-4 py-4">Appointments</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {clinics.map(c => (
                  <tr key={c.id} className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-4 py-4 font-bold">{c.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{c.type}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{c.location}</td>
                    <td className="px-4 py-4">{c.leads}</td>
                    <td className="px-4 py-4">{c.appointments}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => onEditClinic(c)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDeleteClinic(c.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clinics.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No clinics registered yet. <button onClick={onAddClinic} className="text-emerald-500 font-bold hover:underline">Add one now</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'AI Models':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-2">AI Models</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Manage and monitor AI model performance across the platform.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-8 w-8 text-emerald-500" />
                <div>
                  <h3 className="font-bold">Intent Recognition</h3>
                  <p className="text-sm text-slate-500">GPT-4 Turbo</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black">98%</span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 px-3 py-1 rounded-full">Active</span>
              </div>
            </div>
            
            <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-bold">Lead Scoring</h3>
                  <p className="text-sm text-slate-500">Custom ML Model</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black">94%</span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 px-3 py-1 rounded-full">Active</span>
              </div>
            </div>
            
            <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-bold">Chatbot AI</h3>
                  <p className="text-sm text-slate-500">Claude 3.5</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black">96%</span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 px-3 py-1 rounded-full">Active</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4">Recent Model Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Intent model processed 1,247 requests</span>
                </div>
                <span className="text-sm text-slate-500">Last hour</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Lead scoring model updated with new training data</span>
                </div>
                <span className="text-sm text-slate-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Chatbot handled 89 conversations</span>
                </div>
                <span className="text-sm text-slate-500">Today</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'Lead Database':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-2">Lead Database</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">All leads generated from contact forms and inquiries.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">Total Leads</p>
              <p className="text-3xl font-black">{leads.length}</p>
            </div>
            <div className="glass rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">New</p>
              <p className="text-3xl font-black text-blue-500">{leads.filter(l => l.status === 'new').length}</p>
            </div>
            <div className="glass rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">Qualified</p>
              <p className="text-3xl font-black text-emerald-500">{leads.filter(l => l.status === 'qualified').length}</p>
            </div>
            <div className="glass rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">Closed</p>
              <p className="text-3xl font-black text-slate-500">{leads.filter(l => l.status === 'closed').length}</p>
            </div>
          </div>

          <div className="overflow-x-auto glass rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Phone</th>
                  <th className="px-4 py-4">Business Type</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {leads.slice(0, 10).map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-4 py-4 font-bold">{lead.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{lead.email}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{lead.phone || '-'}</td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{lead.businessType || '-'}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        lead.status === 'new' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700' :
                        lead.status === 'qualified' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' :
                        lead.status === 'contacted' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}>{lead.status}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No leads yet. Leads will appear here when users submit contact forms.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {leads.length > 10 && (
            <div className="mt-4 text-center">
              <Link href="/dashboard/admin/leads" className="text-emerald-500 font-bold hover:underline">
                View all {leads.length} leads →
              </Link>
            </div>
          )}
        </div>
      );

    case 'Security Logs':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">Security Logs</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Audit trail of authentication events, errors, and system alerts.</p>
          <div className="font-mono text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <p><span className="text-red-500">[22:01:03]</span> Failed login attempt for user &quot;badguy@example.com&quot;</p>
            <p><span className="text-red-500">[21:59:47]</span> Token expiry triggered logout for user ID abc123</p>
            <p><span className="text-emerald-500">[21:58:22]</span> Admin user &quot;jane&quot; updated system configuration</p>
          </div>
        </div>
      );

    case 'System Config':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-6">System Config</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Modify platform-wide settings and API keys.</p>
          <div className="mt-8 p-6 glass border border-slate-200 dark:border-slate-700 rounded-2xl">
            <label className="block mb-2 text-sm font-bold">Site-wide maintenance mode</label>
            <select className="w-64 rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-white dark:bg-slate-800 dark:text-slate-200">
              <option>Off</option>
              <option>On</option>
            </select>
          </div>
        </div>
      );

    case 'Analytics':
      return (
        <div className="space-y-8">
          {/* Data Entry Form – at the TOP */}
          <AnalyticsForm
            onSaved={() => {
              setAnalyticsRefreshKey((k) => k + 1);
              // Note: Socket.io is disabled for Vercel serverless deployment
            }}
          />

          {/* Analytics Charts – refreshed after every save */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black mb-2">📊 Charts & Insights</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Charts below update in real time after each save. Edit your data above to see instant results.
              </p>
            </div>
            <div className={`pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <ClientAnalyticsView isAdmin refreshTrigger={analyticsRefreshKey} />
            </div>
          </div>
        </div>
      );

    case 'Blog Management':
      return <BlogManagementSection />;

    case 'News Management':
      return <NewsManagementSection />;

    case 'My Profile':
      return <AdminProfileView user={user} />;

    case 'Settings':
      return <DashboardSettingsView role="admin" />;

    default:
      return <div>Unknown section</div>;
  }
}

/* ─── Blog Management Section ─── */
function BlogManagementSection() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Auto-Blog state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiCustomTopic, setAiCustomTopic] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState('');
  const [aiShowPanel, setAiShowPanel] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    postId: 0,
    postTitle: '',
    isLoading: false,
  });

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    const post = posts.find(p => p.id === id);
    setDeleteModal({
      isOpen: true,
      postId: id,
      postTitle: post?.title || '',
      isLoading: false,
    });
  };

  const confirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    try {
      await fetch(`/api/admin/posts/${deleteModal.postId}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== deleteModal.postId));
      setDeleteModal({ isOpen: false, postId: 0, postTitle: '', isLoading: false });
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(`❌ Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // ── Toggle publish/draft status ───────────────────────────────────
  const handleTogglePublish = async (postId: number, currentStatus: string | null, slug: string) => {
    try {
      const newStatus = currentStatus ? null : new Date().toISOString();
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedAt: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      // Update local state
      setPosts(posts.map(p => p.id === postId ? { ...p, publishedAt: newStatus } : p));
      
      // Trigger sitemap revalidation
      if (newStatus) {
        await fetch('/api/revalidate-sitemap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });
      }
    } catch (error) {
      console.error('Toggle publish error:', error);
      alert('Failed to update post status');
    }
  };

  // ── AI Blog generation handler ────────────────────────────────────
  const handleAiGenerate = async (autoPublish: boolean) => {
    setAiGenerating(true);
    setAiResult(null);
    setAiError('');
    try {
      const res = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiCustomTopic.trim() || undefined,
          autoPublish,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Generation failed');
      setAiResult(data.post);
      setAiCustomTopic('');
      // Refresh post list
      const postsRes = await fetch('/api/posts');
      const postsData = await postsRes.json();
      setPosts(postsData);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Create and manage blog posts for your website.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAiShowPanel(!aiShowPanel)}
            className="flex items-center gap-2 bg-violet-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-violet-400 transition-all"
          >
            <Sparkles className="h-5 w-5" /> AI Auto-Blog
          </button>
          <Link
            href="/dashboard/admin/blog/new"
            className="flex items-center gap-2 bg-emerald-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all"
          >
            <Plus className="h-5 w-5" /> New Post
          </Link>
        </div>
      </div>

      {/* ── AI Auto-Blog Panel ────────────────────────────────────────── */}
      <AnimatePresence>
        {aiShowPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="glass rounded-2xl border border-violet-200 dark:border-violet-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                  <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Blog Generator</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Auto-generates SEO-optimized posts with images, internal & external links. Runs daily at 8 AM CST.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Custom Topic (optional)</label>
                  <input
                    type="text"
                    value={aiCustomTopic}
                    onChange={(e) => setAiCustomTopic(e.target.value)}
                    placeholder="Leave blank for auto-selected healthcare marketing topic..."
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-violet-500"
                    disabled={aiGenerating}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAiGenerate(false)}
                    disabled={aiGenerating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-violet-500 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiGenerating ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Generate Draft</>
                    )}
                  </button>
                  <button
                    onClick={() => handleAiGenerate(true)}
                    disabled={aiGenerating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-violet-500 text-white hover:bg-violet-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiGenerating ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /> Publishing...</>
                    ) : (
                      <><Zap className="h-4 w-4" /> Generate &amp; Publish</>
                    )}
                  </button>
                </div>

                {/* Generation result */}
                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4"
                  >
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-2">✅ Blog post generated successfully!</p>
                    <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <p><strong>Title:</strong> {aiResult.title}</p>
                      <p><strong>SEO Title:</strong> {aiResult.seoTitle}</p>
                      <p><strong>Keyword:</strong> {aiResult.focusKeyword}</p>
                      <p><strong>Slug:</strong> /{aiResult.slug}</p>
                      <p><strong>Status:</strong> <span className={aiResult.status === 'published' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>{aiResult.status === 'published' ? '🟢 Published' : '🟡 Draft'}</span></p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/dashboard/admin/blog/edit/${aiResult.id}`} className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-400 transition-all">Edit Post</Link>
                      {aiResult.status === 'published' && (
                        <Link href={`/blog/${aiResult.slug}`} target="_blank" className="text-xs bg-emerald-500 text-black px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-400 transition-all">View Live →</Link>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                {aiError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                  >
                    <p className="text-sm text-red-700 dark:text-red-400">❌ {aiError}</p>
                  </motion.div>
                )}

                {/* Info about daily automation */}
                <div className="flex items-start gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="h-5 w-5 mt-0.5 flex-shrink-0 text-violet-500" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">Daily Auto-Publish Active</p>
                    <p>A new blog post is automatically generated and published every day at <strong>8:00 AM CST</strong>. Each post includes SEO fields, a DALL-E cover image, internal links to your services, and external citations from credible healthcare sources.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">No posts yet. Create your first blog post!</p>
          <Link href="/dashboard/admin/blog/new" className="text-emerald-500 dark:text-emerald-400 font-bold hover:underline">Create Post →</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {post.coverImage ? (
                  <img src={post.coverImage} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">{post.title}</h3>
                      {post.excerpt && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">{post.excerpt}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-slate-500 dark:text-slate-500 font-mono">/{post.slug}</span>
                        {post.publishedAt ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"></span>
                            Published {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full"></span>
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(post.id, post.publishedAt, post.slug)}
                    className={`p-2 rounded-lg transition-all ${
                      post.publishedAt
                        ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                    title={post.publishedAt ? 'Unpublish' : 'Publish'}
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <Link
                    href={`/dashboard/admin/blog/edit/${post.id}`}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Blog Post"
        description="This will permanently delete the blog post. This action cannot be undone."
        itemName={deleteModal.postTitle}
        isLoading={deleteModal.isLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, postId: 0, postTitle: '', isLoading: false })}
      />
    </div>
  );
}

/* ─── News Management Section ─── */
function NewsManagementSection() {
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    articleId: 0,
    articleTitle: '',
    isLoading: false,
  });

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => { setArticles(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    const article = articles.find(a => a.id === id);
    setDeleteModal({
      isOpen: true,
      articleId: id,
      articleTitle: article?.title || '',
      isLoading: false,
    });
  };

  const confirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    try {
      await fetch(`/api/admin/news/${deleteModal.articleId}`, { method: 'DELETE' });
      setArticles(articles.filter(a => a.id !== deleteModal.articleId));
      setDeleteModal({ isOpen: false, articleId: 0, articleTitle: '', isLoading: false });
    } catch (error) {
      console.error('Error deleting article:', error);
      alert(`❌ Failed to delete article: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">News Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Create and manage healthcare news articles.</p>
        </div>
        <Link
          href="/dashboard/admin/news/new"
          className="flex items-center gap-2 bg-emerald-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all"
        >
          <Plus className="h-5 w-5" /> New Article
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="glass rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Newspaper className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">No news articles yet. Create your first one!</p>
          <Link href="/dashboard/admin/news/new" className="text-emerald-500 font-bold hover:underline">Create Article →</Link>
        </div>
      ) : (
        <div className="overflow-x-auto glass rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                <th className="px-4 py-4">Article</th>
                <th className="px-4 py-4">Source</th>
                <th className="px-4 py-4">Published</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {articles.map(article => (
                <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      {article.coverImage && <img src={article.coverImage} alt="" className="w-14 h-14 object-cover rounded-lg" />}
                      <div>
                        <p className="font-bold">{article.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">/{article.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {article.source ? (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">{article.source}</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {article.publishedAt ? (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/admin/news/edit/${article.id}`} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(article.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete News Article"
        description="This will permanently delete the news article. This action cannot be undone."
        itemName={deleteModal.articleTitle}
        isLoading={deleteModal.isLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, articleId: 0, articleTitle: '', isLoading: false })}
      />
    </div>
  );
}
