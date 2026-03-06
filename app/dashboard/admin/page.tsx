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
  Check,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AnalyticsForm from './analytics';
import ClientAnalyticsView from '@/components/ClientAnalyticsView';
import GoogleAnalyticsView from '@/components/GoogleAnalyticsView';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import ActionFeedback from '@/components/ActionFeedback';
import BackgroundTaskNotification, { BackgroundTask } from '@/components/BackgroundTaskNotification';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
import AdminSettings from '@/components/AdminSettings';
import { useAdminTranslation } from '@/hooks/useAdminTranslation';
import AdminSelect from '@/components/AdminSelect';
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
        className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 dark:border-slate-700 z-10"
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
                          className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          aria-label={`Edit ${listedUser.name}`}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => requestDeleteUser(listedUser)}
                          className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          aria-label={`Delete ${listedUser.name}`}
                          title="Delete"
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
          <AdminSelect
            label="Role"
            value={createForm.role}
            onChange={(value) => setCreateForm((prev) => ({ ...prev, role: value }))}
            options={[
              { value: 'client', label: 'Client' },
              { value: 'admin', label: 'Admin' },
            ]}
            required
          />

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
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 font-medium"
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
          <AdminSelect
            label="Role"
            value={editForm.role}
            onChange={(value) => setEditForm((prev) => ({ ...prev, role: value }))}
            options={[
              { value: 'client', label: 'Client' },
              { value: 'admin', label: 'Admin' },
            ]}
            required
          />
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
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 font-medium"
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
    // GA4 & Search Console
    ga4Properties: [] as { propertyId: string; displayName: string; account: string }[],
    scSites: [] as { siteUrl: string; permissionLevel: string }[],
    selectedGA4Property: '',
    selectedSCSite: '',
    analyticsLoading: false,
    analyticsSaving: false,
    confirmSyncing: false,
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

  // Background task management
  const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>([]);
  const taskIdRef = useRef(0);

  const addBackgroundTask = (type: 'blog' | 'news', message: string) => {
    const id = `task-${++taskIdRef.current}`;
    setBackgroundTasks(prev => [...prev, { id, type, status: 'running', message }]);
    return id;
  };

  const updateBackgroundTask = (id: string, status: 'success' | 'error', message: string, details?: string) => {
    setBackgroundTasks(prev => 
      prev.map(task => task.id === id ? { ...task, status, message, details } : task)
    );
    // Auto-dismiss success/error after 10 seconds
    setTimeout(() => {
      setBackgroundTasks(prev => prev.filter(task => task.id !== id));
    }, 10000);
  };

  const dismissBackgroundTask = (id: string) => {
    setBackgroundTasks(prev => prev.filter(task => task.id !== id));
  };

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update clinic');
      }

      setGmbState(prev => ({ ...prev, message: 'Clinic details saved successfully!' }));
      fetchAdminData();
    } catch (error) {
      console.error('Error updating clinic:', error);
      setGmbState(prev => ({ ...prev, error: `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}` }));
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

  // Track which clinic we last loaded GMB data for, to avoid redundant API calls
  const lastLoadedClinicRef = useRef<string | null>(null);

  const fetchGmbConnection = async (clinicId: string, forceRefresh = false) => {
    // Skip if we already loaded data for this exact clinic (prevents quota burn)
    if (!forceRefresh && lastLoadedClinicRef.current === clinicId && gmbState.connection) {
      return;
    }

    setGmbState(prev => ({
      ...prev,
      loading: true,
      error: '',
      message: '',
    }));

    try {
      // Step 1: Always fetch connection status (DB-only, no Google API call)
      const connRes = await fetch(`/api/admin/gmb/connection?clinicId=${encodeURIComponent(clinicId)}`);
      const connData = await connRes.json();
      if (!connRes.ok) throw new Error(connData.error || 'Failed to load GMB connection');

      const connection = connData.connection;
      if (!connection) {
        lastLoadedClinicRef.current = clinicId;
        setGmbState(prev => ({
          ...prev,
          loading: false,
          connection: null,
          accounts: [],
          locations: [],
          ga4Properties: [],
          scSites: [],
          selectedAccount: '',
          selectedLocation: '',
          selectedGA4Property: '',
          selectedSCSite: '',
          message: 'Connect Google to choose the correct business account and location.',
        }));
        return;
      }

      // Step 2: Fetch accounts, locations, GA4, SC in parallel (all use server-side cache)
      let accounts: any[] = [];
      let locations: any[] = [];
      let ga4Properties: any[] = [];
      let scSites: any[] = [];

      const selectedAccountId = connection.businessAccountId || '';

      // Build parallel requests — only call what we need
      const fetches: Promise<void>[] = [];

      fetches.push(
        fetch(`/api/admin/gmb/accounts?clinicId=${encodeURIComponent(clinicId)}`)
          .then(r => r.json())
          .then(d => { if (d.accounts) accounts = d.accounts; })
          .catch(() => { /* quota or network error — skip */ })
      );

      if (selectedAccountId) {
        fetches.push(
          fetch(`/api/admin/gmb/locations?clinicId=${encodeURIComponent(clinicId)}&accountName=${encodeURIComponent(selectedAccountId)}`)
            .then(r => r.json())
            .then(d => { if (d.locations) locations = d.locations; })
            .catch(() => { /* skip */ })
        );
      }

      fetches.push(
        fetch(`/api/admin/gmb/ga4-properties?clinicId=${encodeURIComponent(clinicId)}`)
          .then(r => r.json())
          .then(d => { if (d.properties) ga4Properties = d.properties; })
          .catch(() => { /* skip */ })
      );

      fetches.push(
        fetch(`/api/admin/gmb/sc-sites?clinicId=${encodeURIComponent(clinicId)}`)
          .then(r => r.json())
          .then(d => { if (d.sites) scSites = d.sites; })
          .catch(() => { /* skip */ })
      );

      await Promise.allSettled(fetches);

      const selectedAccount = selectedAccountId || accounts?.[0]?.name || '';

      // If we got accounts but no locations yet (no saved account), fetch locations for first account
      if (!selectedAccountId && selectedAccount && locations.length === 0) {
        try {
          const locRes = await fetch(`/api/admin/gmb/locations?clinicId=${encodeURIComponent(clinicId)}&accountName=${encodeURIComponent(selectedAccount)}`);
          const locData = await locRes.json();
          if (locData.locations) locations = locData.locations;
        } catch { /* skip */ }
      }

      lastLoadedClinicRef.current = clinicId;
      setGmbState(prev => ({
        ...prev,
        loading: false,
        connection,
        accounts,
        locations,
        selectedAccount,
        selectedLocation: connection.businessLocationId || '',
        ga4Properties,
        scSites,
        selectedGA4Property: connection.ga4PropertyId || '',
        selectedSCSite: connection.searchConsoleSite || '',
        message: connection.businessLocationId
          ? 'Google Business Profile connected. Daily sync is active.'
          : 'Google connected. Select account and location to complete setup.',
      }));
    } catch (error: any) {
      const msg = error?.message || 'Failed to load GMB status';
      const isQuota = msg.toLowerCase().includes('quota');
      setGmbState(prev => ({
        ...prev,
        loading: false,
        error: isQuota
          ? 'Google API rate limit reached. Your data is cached — please wait a few minutes before retrying.'
          : msg,
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

      await fetchGmbConnection(editingClinic.id, true);
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

      await fetchGmbConnection(editingClinic.id, true);
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
        lastLoadedClinicRef.current = null; // force refresh after new OAuth
        await fetchGmbConnection(editingClinic.id, true);
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
          addBackgroundTask={addBackgroundTask}
          updateBackgroundTask={updateBackgroundTask}
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
        <AdminSelect
          label="Role"
          value={newClientRole}
          onChange={(value) => setNewClientRole(value)}
          options={[
            { value: 'client', label: 'Client' },
            { value: 'admin', label: 'Admin' },
          ]}
          placeholder="Select a role"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select whether this user is a Client or Admin</p>
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
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600"
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
        <AdminSelect
          label="Type"
          value={newClinicType}
          onChange={(value) => setNewClinicType(value)}
          options={[
            { value: '', label: 'Select type...' },
            { value: 'ER', label: 'Emergency Room (ER)' },
            { value: 'Urgent Care', label: 'Urgent Care' },
            { value: 'Wellness', label: 'Wellness Center' },
            { value: 'MedSpa', label: 'MedSpa' },
            { value: 'Dental', label: 'Dental Practice' },
            { value: 'Specialty', label: 'Specialty Clinic' },
          ]}
          required
        />
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
        <AdminSelect
          label="Assign to Client (Optional)"
          value={newClinicAssignedUser}
          onChange={(value) => setNewClinicAssignedUser(value)}
          options={[
            { value: '', label: 'Leave Unassigned' },
            ...users.filter(u => u.role === 'client').map(u => ({
              value: u.id,
              label: `${u.name} (${u.email})`
            }))
          ]}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You can assign this clinic to a client immediately, or leave it unassigned</p>
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
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600"
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
            <AdminSelect
              label="Type"
              value={editingClinic.type}
              onChange={(value) => setEditingClinic({ ...editingClinic, type: value })}
              options={[
                { value: 'ER', label: 'Emergency Room (ER)' },
                { value: 'Urgent Care', label: 'Urgent Care' },
                { value: 'Wellness', label: 'Wellness Center' },
                { value: 'MedSpa', label: 'MedSpa' },
                { value: 'Dental', label: 'Dental Practice' },
                { value: 'Specialty', label: 'Specialty Clinic' },
              ]}
              required
            />
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={editingClinic.location}
              onChange={(e) => setEditingClinic({ ...editingClinic, location: e.target.value })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
            />
          </div>

          {/* ═══ Google Integrations — Full Redesign ═══ */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {/* ── 1. Header ── */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-white to-blue-50/60 dark:from-slate-800 dark:to-blue-950/20 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Google Integrations</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Business Profile · Analytics · Search Console</p>
                </div>
              </div>
              {/* Status badge — shows nuanced state */}
              {(() => {
                if (!gmbState.connection) return (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-slate-400" /> Not Connected
                  </span>
                );
                const hasGBP = !!gmbState.connection.businessLocationId;
                const hasGA4 = !!gmbState.selectedGA4Property;
                const hasSC = !!gmbState.selectedSCSite;
                const allConfigured = hasGBP && hasGA4 && hasSC;
                const anyConfigured = hasGBP || hasGA4 || hasSC;
                if (gmbState.syncing || gmbState.confirmSyncing) return (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                    <RefreshCw className="h-3 w-3 animate-spin" /> Syncing
                  </span>
                );
                if (allConfigured) return (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Connected
                  </span>
                );
                if (anyConfigured) return (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Needs Setup
                  </span>
                );
                return (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Needs Setup
                  </span>
                );
              })()}
            </div>

            <div className="p-6 space-y-6">
              {/* ── Loading state ── */}
              {gmbState.loading && !gmbState.connection && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading integrations...</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Fetching account details from Google</p>
                  </div>
                </div>
              )}

              {/* ── Not connected ── */}
              {!gmbState.loading && !gmbState.connection && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center mx-auto mb-5 shadow-sm">
                    <Link2 className="h-8 w-8 text-blue-500" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Connect your Google Account</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto leading-relaxed">
                    Link a Google account to enable Business Profile, Google Analytics, and Search Console for this clinic.
                  </p>
                  <button
                    onClick={handleGmbConnect}
                    disabled={gmbState.connecting}
                    className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                  >
                    {gmbState.connecting ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /> Connecting...</>
                    ) : (
                      <><Link2 className="h-4 w-4" /> Connect Google Account</>
                    )}
                  </button>
                </div>
              )}

              {/* ── Connected state ── */}
              {gmbState.connection && (
                <>
                  {/* ── 2. Connected account card ── */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{gmbState.connection.googleEmail}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {gmbState.connection.lastSyncedAt
                                ? <>Last synced {new Date(gmbState.connection.lastSyncedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(gmbState.connection.lastSyncedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</>
                                : 'Not synced yet — select profiles below to get started'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleGmbConnect}
                        disabled={gmbState.connecting}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {gmbState.connecting ? 'Reconnecting...' : 'Reconnect'}
                      </button>
                    </div>
                  </div>

                  {/* ── 3. Integration selection section ── */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Configure Integrations</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Select which Google services to connect for this clinic.</p>
                    </div>

                    {/* STEP 1: Google Business Profile */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                        <span className="h-7 w-7 rounded-lg bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Business Profile</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">Select your Google Business Profile location</p>
                        </div>
                        {gmbState.connection.businessLocationId ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                            <Check className="h-3 w-3" /> Selected
                          </span>
                        ) : gmbState.accounts.length > 0 ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold shrink-0">Action needed</span>
                        ) : null}
                      </div>
                      <div className="p-4 space-y-3 bg-white/50 dark:bg-transparent">
                        {gmbState.loading && gmbState.accounts.length === 0 ? (
                          <div className="flex items-center gap-2 py-3 justify-center">
                            <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                            <span className="text-xs text-slate-400">Loading business accounts...</span>
                          </div>
                        ) : gmbState.accounts.length > 0 ? (
                          <>
                            <AdminSelect
                              label="Business Account"
                              value={gmbState.selectedAccount}
                              onChange={(value) => handleAccountChange(value)}
                              options={[
                                { value: '', label: 'Choose an account...' },
                                ...gmbState.accounts.map((account) => ({
                                  value: account.name,
                                  label: account.accountName || account.name
                                }))
                              ]}
                            />
                            {gmbState.selectedAccount && gmbState.locations.length > 0 && (
                              <AdminSelect
                                label="Business Location"
                                value={gmbState.selectedLocation}
                                onChange={(value) => setGmbState(prev => ({ ...prev, selectedLocation: value }))}
                                options={[
                                  { value: '', label: 'Choose a location...' },
                                  ...gmbState.locations.map((location) => ({
                                    value: location.name,
                                    label: `${location.title || location.name}${location.address ? ` — ${location.address}` : ''}`
                                  }))
                                ]}
                              />
                            )}
                            {gmbState.selectedAccount && gmbState.locations.length === 0 && !gmbState.loading && (
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                                <Search className="h-4 w-4 text-amber-500 shrink-0" />
                                <p className="text-xs text-amber-700 dark:text-amber-400">No locations found for this account. Check that a business location exists in Google Business Profile.</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <Search className="h-4 w-4 text-slate-400 shrink-0" />
                            <p className="text-xs text-slate-500 dark:text-slate-400">No business accounts found for this Google account.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STEP 2: Google Analytics GA4 */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                        <span className="h-7 w-7 rounded-lg bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Google Analytics (GA4)</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">Select your GA4 property for traffic data</p>
                        </div>
                        {gmbState.selectedGA4Property ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                            <Check className="h-3 w-3" /> Selected
                          </span>
                        ) : gmbState.ga4Properties.length > 0 ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold shrink-0">Action needed</span>
                        ) : null}
                      </div>
                      <div className="p-4 bg-white/50 dark:bg-transparent">
                        {gmbState.loading && gmbState.ga4Properties.length === 0 ? (
                          <div className="flex items-center gap-2 py-3 justify-center">
                            <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                            <span className="text-xs text-slate-400">Loading GA4 properties...</span>
                          </div>
                        ) : gmbState.ga4Properties.length > 0 ? (
                          <AdminSelect
                            label="GA4 Property"
                            value={gmbState.selectedGA4Property}
                            onChange={(value) => setGmbState(prev => ({ ...prev, selectedGA4Property: value }))}
                            options={[
                              { value: '', label: 'Choose a GA4 property...' },
                              ...gmbState.ga4Properties.map((p) => ({
                                value: p.propertyId,
                                label: `${p.displayName} (${p.account})`
                              }))
                            ]}
                          />
                        ) : (
                          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <Search className="h-4 w-4 text-slate-400 shrink-0" />
                            <p className="text-xs text-slate-500 dark:text-slate-400">No GA4 properties found for this Google account. Ensure the account has access to a GA4 property.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STEP 3: Search Console */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                        <span className="h-7 w-7 rounded-lg bg-purple-500 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Search Console</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">Select your Search Console property for SEO data</p>
                        </div>
                        {gmbState.selectedSCSite ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                            <Check className="h-3 w-3" /> Selected
                          </span>
                        ) : gmbState.scSites.length > 0 ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold shrink-0">Action needed</span>
                        ) : null}
                      </div>
                      <div className="p-4 bg-white/50 dark:bg-transparent">
                        {gmbState.loading && gmbState.scSites.length === 0 ? (
                          <div className="flex items-center gap-2 py-3 justify-center">
                            <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                            <span className="text-xs text-slate-400">Loading Search Console sites...</span>
                          </div>
                        ) : gmbState.scSites.length > 0 ? (
                          <AdminSelect
                            label="Search Console Site"
                            value={gmbState.selectedSCSite}
                            onChange={(value) => setGmbState(prev => ({ ...prev, selectedSCSite: value }))}
                            options={[
                              { value: '', label: 'Choose a site...' },
                              ...gmbState.scSites.map((s) => ({
                                value: s.siteUrl,
                                label: s.siteUrl
                              }))
                            ]}
                          />
                        ) : (
                          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                            <p className="text-xs text-slate-500 dark:text-slate-400">No Search Console sites found. Verify site ownership in Google Search Console first.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── 4. Action bar — Save + Sync ── */}
                  <div className="space-y-3 pt-2">
                    {/* Integration summary chips */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { key: 'GBP', active: !!gmbState.connection.businessLocationId, label: gmbState.connection.locationName || 'Business Profile' },
                        { key: 'GA4', active: !!gmbState.selectedGA4Property, label: gmbState.ga4Properties.find(p => p.propertyId === gmbState.selectedGA4Property)?.displayName || 'Analytics' },
                        { key: 'SC', active: !!gmbState.selectedSCSite, label: gmbState.selectedSCSite || 'Search Console' },
                      ].map(item => (
                        <span key={item.key} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          item.active
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                        }`}>
                          {item.active ? <Check className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-current opacity-40" />}
                          {item.key}
                        </span>
                      ))}
                    </div>

                    {/* Save Configuration */}
                    <button
                      onClick={async () => {
                        if (!editingClinic?.id) return;
                        setGmbState(prev => ({ ...prev, analyticsSaving: true, error: '', message: '' }));
                        try {
                          // Save GBP selection if changed
                          if (gmbState.selectedAccount && gmbState.selectedLocation) {
                            const gbpRes = await fetch('/api/admin/gmb/select-location', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                clinicId: editingClinic.id,
                                accountName: gmbState.selectedAccount,
                                locationName: gmbState.selectedLocation,
                              }),
                            });
                            if (!gbpRes.ok) {
                              const err = await gbpRes.json();
                              throw new Error(err.error || 'Failed to save Business Profile selection');
                            }
                          }
                          // Save GA4 + SC selections
                          if (gmbState.selectedGA4Property || gmbState.selectedSCSite) {
                            const analyticsRes = await fetch('/api/admin/gmb/select-analytics', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                clinicId: editingClinic.id,
                                ga4PropertyId: gmbState.selectedGA4Property,
                                searchConsoleSite: gmbState.selectedSCSite,
                              }),
                            });
                            if (!analyticsRes.ok) {
                              const err = await analyticsRes.json();
                              throw new Error(err.error || 'Failed to save analytics configuration');
                            }
                          }
                          await fetchGmbConnection(editingClinic.id, true);
                          setGmbState(prev => ({
                            ...prev,
                            analyticsSaving: false,
                            message: 'Configuration saved successfully. You can now sync data.',
                          }));
                        } catch (err: any) {
                          setGmbState(prev => ({
                            ...prev,
                            analyticsSaving: false,
                            error: err?.message || 'Failed to save configuration',
                          }));
                        }
                      }}
                      disabled={gmbState.analyticsSaving || (!gmbState.selectedAccount && !gmbState.selectedGA4Property && !gmbState.selectedSCSite)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                        gmbState.analyticsSaving
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-wait'
                          : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed'
                      }`}
                    >
                      {gmbState.analyticsSaving ? (
                        <><RefreshCw className="h-4 w-4 animate-spin" /> Saving Configuration...</>
                      ) : (
                        <><Save className="h-4 w-4" /> Save Configuration</>
                      )}
                    </button>

                    {/* Sync Data */}
                    <button
                      onClick={async () => {
                        if (!editingClinic?.id) return;
                        setGmbState(prev => ({ ...prev, confirmSyncing: true, error: '', message: '' }));
                        try {
                          const syncPromises: Promise<void>[] = [];
                          if (gmbState.connection.businessLocationId) {
                            syncPromises.push(
                              fetch('/api/admin/gmb/sync', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ clinicId: editingClinic.id }),
                              }).then(r => { if (!r.ok) throw new Error('GBP sync failed'); }).catch(() => {})
                            );
                          }
                          if (gmbState.selectedGA4Property || gmbState.selectedSCSite) {
                            syncPromises.push(
                              fetch('/api/admin/gmb/sync-analytics', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ clinicId: editingClinic.id }),
                              }).then(r => { if (!r.ok) throw new Error('Analytics sync failed'); }).catch(() => {})
                            );
                          }
                          if (syncPromises.length === 0) throw new Error('No integrations configured to sync');
                          await Promise.allSettled(syncPromises);
                          await fetchGmbConnection(editingClinic.id, true);
                          setGmbState(prev => ({
                            ...prev,
                            confirmSyncing: false,
                            message: `Data synced successfully at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}. Dashboard charts will update shortly.`,
                          }));
                        } catch (err: any) {
                          setGmbState(prev => ({
                            ...prev,
                            confirmSyncing: false,
                            error: err?.message || 'Sync failed. Please try again.',
                          }));
                        }
                      }}
                      disabled={gmbState.confirmSyncing || (!gmbState.connection.businessLocationId && !gmbState.selectedGA4Property && !gmbState.selectedSCSite)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border ${
                        gmbState.confirmSyncing
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 cursor-wait'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {gmbState.confirmSyncing ? (
                        <><RefreshCw className="h-4 w-4 animate-spin" /> Syncing Data...</>
                      ) : (
                        <><RefreshCw className="h-4 w-4" /> Sync Data Now</>
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* ── 5. Status messages ── */}
              {gmbState.message && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/40 animate-in fade-in">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{gmbState.message}</p>
                  </div>
                </div>
              )}
              {gmbState.error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 animate-in fade-in">
                  <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">{gmbState.error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleEditClinic}
              className="flex-1 bg-emerald-500 text-black font-bold py-2.5 rounded-xl hover:bg-emerald-400 transition-colors"
            >
              Save Clinic Details
            </button>
            <button
              onClick={() => setShowEditClinicModal(false)}
              className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
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

    <BackgroundTaskNotification 
      tasks={backgroundTasks}
      onDismiss={dismissBackgroundTask}
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
  addBackgroundTask: (type: 'blog' | 'news', message: string) => string;
  updateBackgroundTask: (id: string, status: 'success' | 'error', message: string, details?: string) => void;
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
    addBackgroundTask,
    updateBackgroundTask,
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
                      <button onClick={() => onDeleteClient(client.id)} className="p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Delete">
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
                        <button onClick={() => onEditClinic(c)} className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDeleteClinic(c.id)} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
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

          {/* Google Analytics & Search Console (per-clinic) */}
          <GoogleAnalyticsSection clinics={clinics} isDark={isDark} />
        </div>
      );

    case 'Blog Management':
      return <BlogManagementSection addBackgroundTask={addBackgroundTask} updateBackgroundTask={updateBackgroundTask} />;

    case 'News Management':
      return <NewsManagementSection addBackgroundTask={addBackgroundTask} updateBackgroundTask={updateBackgroundTask} />;

    case 'My Profile':
      return <AdminProfileView user={user} />;

    case 'Settings':
      return <DashboardSettingsView role="admin" />;

    default:
      return <div>Unknown section</div>;
  }
}

/* ─── Blog Management Section ─── */
function BlogManagementSection({ 
  addBackgroundTask, 
  updateBackgroundTask 
}: { 
  addBackgroundTask: (type: 'blog' | 'news', message: string) => string;
  updateBackgroundTask: (id: string, status: 'success' | 'error', message: string, details?: string) => void;
}) {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Auto-Blog state
  const [aiCustomTopic, setAiCustomTopic] = useState('');
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
      
      // Revalidate sitemap + homepage whenever publish state changes
      await fetch('/api/revalidate-sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type: 'blog' }),
      });
    } catch (error) {
      console.error('Toggle publish error:', error);
      alert('Failed to update post status');
    }
  };

  // ── Change publish date ───────────────────────────────────────────
  const handleChangePublishDate = async (postId: number, newDate: string, slug: string) => {
    if (!newDate) return;
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedAt: new Date(newDate).toISOString() }),
      });
      if (!res.ok) throw new Error('Failed to update date');
      setPosts(posts.map(p => p.id === postId ? { ...p, publishedAt: new Date(newDate).toISOString() } : p));
      await fetch('/api/revalidate-sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type: 'blog' }),
      });
    } catch (error) {
      console.error('Change publish date error:', error);
      alert('Failed to update publish date');
    }
  };

  // ── AI Blog generation handler ────────────────────────────────────
  const handleAiGenerate = async (autoPublish: boolean) => {
    const taskId = addBackgroundTask('blog', `Generating AI blog post${autoPublish ? ' and publishing' : ''}...`);
    setAiCustomTopic('');
    setAiShowPanel(false); // Close the panel so user can navigate away
    
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
      
      // Refresh post list
      const postsRes = await fetch('/api/posts');
      const postsData = await postsRes.json();
      setPosts(postsData);
      
      // Show success notification
      updateBackgroundTask(
        taskId, 
        'success', 
        '✅ Blog post generated successfully!',
        `"${data.post.title}" is now ${autoPublish ? 'published' : 'saved as draft'}`
      );
    } catch (err) {
      updateBackgroundTask(
        taskId, 
        'error', 
        '❌ Blog generation failed',
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  };

  // ── One-Shot Blog generation handler ──────────────────────────────
  const handleOneShotGenerate = async (autoPublish: boolean) => {
    const taskId = addBackgroundTask('blog', `One-shot blog draft${autoPublish ? ' + publish' : ''}...`);
    setAiCustomTopic('');
    setAiShowPanel(false);
    
    try {
      const res = await fetch('/api/ai/generate-blog-oneshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiCustomTopic.trim() || undefined,
          autoPublish,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Generation failed');
      
      const postsRes = await fetch('/api/posts');
      const postsData = await postsRes.json();
      setPosts(postsData);
      
      updateBackgroundTask(
        taskId, 
        'success', 
        '✅ One-shot blog draft created!',
        `"${data.post.title}" — SEO ${data.post.seoScore}/100 — ${autoPublish ? 'published' : 'saved as draft'}`
      );
    } catch (err) {
      updateBackgroundTask(
        taskId, 
        'error', 
        '❌ One-shot blog failed',
        err instanceof Error ? err.message : 'Unknown error'
      );
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
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAiGenerate(false)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-violet-500 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
                  >
                    <Sparkles className="h-4 w-4" /> Generate Draft
                  </button>
                  <button
                    onClick={() => handleAiGenerate(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-violet-500 text-white hover:bg-violet-400 transition-all"
                  >
                    <Zap className="h-4 w-4" /> Generate &amp; Publish
                  </button>
                </div>

                {/* One-Shot Draft Mode */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wide">One-Shot Draft (GPT-4o, single output, no retries)</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleOneShotGenerate(false)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                    >
                      <Sparkles className="h-4 w-4" /> One-Shot Draft
                    </button>
                    <button
                      onClick={() => handleOneShotGenerate(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-white hover:bg-amber-400 transition-all"
                    >
                      <Zap className="h-4 w-4" /> One-Shot &amp; Publish
                    </button>
                  </div>
                </div>

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
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full"></span>
                            Draft
                          </span>
                        )}
                        {/* Publish date picker — visible when published */}
                        {post.publishedAt && (
                          <label className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 cursor-pointer" title="Change publish date">
                            <Calendar className="h-3.5 w-3.5" />
                            <input
                              type="date"
                              defaultValue={post.publishedAt.substring(0, 10)}
                              onChange={(e) => handleChangePublishDate(post.id, e.target.value, post.slug)}
                              className="bg-transparent text-xs text-slate-600 dark:text-slate-400 border-0 outline-none cursor-pointer w-28"
                            />
                          </label>
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
function NewsManagementSection({ 
  addBackgroundTask, 
  updateBackgroundTask 
}: { 
  addBackgroundTask: (type: 'blog' | 'news', message: string) => string;
  updateBackgroundTask: (id: string, status: 'success' | 'error', message: string, details?: string) => void;
}) {
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Auto-News state
  const [aiCustomTopic, setAiCustomTopic] = useState('');
  const [aiShowPanel, setAiShowPanel] = useState(false);

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

  // ── Toggle publish/draft status ───────────────────────────────────
  const handleTogglePublish = async (articleId: number, currentStatus: string | null, slug: string) => {
    try {
      const newStatus = currentStatus ? null : new Date().toISOString();
      const res = await fetch(`/api/admin/news/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedAt: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setArticles(articles.map(a => a.id === articleId ? { ...a, publishedAt: newStatus } : a));

      // Revalidate sitemap + homepage whenever publish state changes
      await fetch('/api/revalidate-sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type: 'news' }),
      });
    } catch (error) {
      console.error('Toggle publish error:', error);
      alert('Failed to update article status');
    }
  };

  // ── Change publish date ───────────────────────────────────────────
  const handleChangePublishDate = async (articleId: number, newDate: string, slug: string) => {
    if (!newDate) return;
    try {
      const res = await fetch(`/api/admin/news/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedAt: new Date(newDate).toISOString() }),
      });
      if (!res.ok) throw new Error('Failed to update date');
      setArticles(articles.map(a => a.id === articleId ? { ...a, publishedAt: new Date(newDate).toISOString() } : a));
      await fetch('/api/revalidate-sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, type: 'news' }),
      });
    } catch (error) {
      console.error('Change publish date error:', error);
      alert('Failed to update publish date');
    }
  };

  // ── AI News generation handler ────────────────────────────────────
  const handleAiGenerate = async (autoPublish: boolean) => {
    const taskId = addBackgroundTask('news', `Generating AI news article${autoPublish ? ' and publishing' : ''}...`);
    setAiCustomTopic('');
    setAiShowPanel(false); // Close the panel so user can navigate away
    
    try {
      const res = await fetch('/api/ai/generate-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiCustomTopic.trim() || undefined,
          autoPublish,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Generation failed');
      
      // Refresh article list
      const articlesRes = await fetch('/api/news');
      const articlesData = await articlesRes.json();
      setArticles(articlesData);
      
      // Show success notification
      updateBackgroundTask(
        taskId, 
        'success', 
        '✅ News article generated successfully!',
        `"${data.article.title}" is now ${autoPublish ? 'published' : 'saved as draft'}`
      );
    } catch (err) {
      updateBackgroundTask(
        taskId, 
        'error', 
        '❌ News generation failed',
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  };

  // ── One-Shot News generation handler ──────────────────────────────
  const handleOneShotGenerate = async (autoPublish: boolean) => {
    const taskId = addBackgroundTask('news', `One-shot news draft${autoPublish ? ' + publish' : ''}...`);
    setAiCustomTopic('');
    setAiShowPanel(false);
    
    try {
      const res = await fetch('/api/ai/generate-news-oneshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiCustomTopic.trim() || undefined,
          autoPublish,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Generation failed');
      
      const articlesRes = await fetch('/api/news');
      const articlesData = await articlesRes.json();
      setArticles(articlesData);
      
      updateBackgroundTask(
        taskId, 
        'success', 
        '✅ One-shot news draft created!',
        `"${data.article.title}" — SEO ${data.article.validationScore}/100 — ${autoPublish ? 'published' : 'saved as draft'}`
      );
    } catch (err) {
      updateBackgroundTask(
        taskId, 
        'error', 
        '❌ One-shot news failed',
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">News Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Create and manage healthcare news articles.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAiShowPanel(!aiShowPanel)}
            className="flex items-center gap-2 bg-violet-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-violet-400 transition-all"
          >
            <Sparkles className="h-5 w-5" /> AI Auto-News
          </button>
          <Link
            href="/dashboard/admin/news/new"
            className="flex items-center gap-2 bg-emerald-500 text-black px-5 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all"
          >
            <Plus className="h-5 w-5" /> New Article
          </Link>
        </div>
      </div>

      {/* ── AI Auto-News Panel ────────────────────────────────────────── */}
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
                  <h3 className="font-bold text-lg">AI News Generator</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Auto-generates SEO-optimized news articles with images and credible sources. Runs daily at 2 PM CST.
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
                    placeholder="Leave blank for auto-selected healthcare news topic..."
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAiGenerate(false)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-violet-500 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
                  >
                    <Sparkles className="h-4 w-4" /> Generate Draft
                  </button>
                  <button
                    onClick={() => handleAiGenerate(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-violet-500 text-white hover:bg-violet-400 transition-all"
                  >
                    <Zap className="h-4 w-4" /> Generate &amp; Publish
                  </button>
                </div>

                {/* One-Shot Draft Mode */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wide">One-Shot Draft (GPT-4o, single output, no retries)</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleOneShotGenerate(false)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                    >
                      <Sparkles className="h-4 w-4" /> One-Shot Draft
                    </button>
                    <button
                      onClick={() => handleOneShotGenerate(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-white hover:bg-amber-400 transition-all"
                    >
                      <Zap className="h-4 w-4" /> One-Shot &amp; Publish
                    </button>
                  </div>
                </div>

                {/* Info about daily automation */}
                <div className="flex items-start gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="h-5 w-5 mt-0.5 flex-shrink-0 text-violet-500" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">Daily Auto-Publish Active</p>
                    <p>A new news article is automatically generated and published every day at <strong>2:00 PM CST</strong>. Each article includes SEO fields, a DALL-E cover image, internal links, and external citations from credible healthcare news sources.</p>
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
      ) : articles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Newspaper className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">No news articles yet. Create your first one!</p>
          <Link href="/dashboard/admin/news/new" className="text-emerald-500 dark:text-emerald-400 font-bold hover:underline">Create Article →</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {articles.map(article => (
            <div key={article.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {article.coverImage ? (
                  <img src={article.coverImage} alt="" className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Newspaper className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">{article.title}</h3>
                      {article.excerpt && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">{article.excerpt}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="text-slate-500 dark:text-slate-500 font-mono">/{article.slug}</span>
                        {article.source && (
                          <span className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                            {article.source}
                          </span>
                        )}
                        {article.publishedAt ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"></span>
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full"></span>
                            Draft
                          </span>
                        )}
                        {/* Publish date picker — visible when published */}
                        {article.publishedAt && (
                          <label className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 cursor-pointer" title="Change publish date">
                            <Calendar className="h-3.5 w-3.5" />
                            <input
                              type="date"
                              defaultValue={article.publishedAt.substring(0, 10)}
                              onChange={(e) => handleChangePublishDate(article.id, e.target.value, article.slug)}
                              className="bg-transparent text-xs text-slate-600 dark:text-slate-400 border-0 outline-none cursor-pointer w-28"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(article.id, article.publishedAt, article.slug)}
                    className={`p-2 rounded-lg transition-all ${
                      article.publishedAt
                        ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                    title={article.publishedAt ? 'Unpublish' : 'Publish'}
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <Link
                    href={`/dashboard/admin/news/edit/${article.id}`}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
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

/* ─── Google Analytics + Search Console section (clinic picker + graphs) ─── */
function GoogleAnalyticsSection({ clinics, isDark }: { clinics: any[]; isDark: boolean }) {
  const [selectedClinicId, setSelectedClinicId] = useState('');

  return (
    <div className="space-y-4">
      <div className={`pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <h2 className="text-2xl font-black mb-2">📊 Google Analytics & Search Console</h2>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Select a clinic to view GA4 and Search Console data. Configure analytics sources in the clinic&apos;s Edit modal.
        </p>
        <select
          value={selectedClinicId}
          onChange={(e) => setSelectedClinicId(e.target.value)}
          className={`w-64 rounded-xl border p-2 ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white'}`}
        >
          <option value="">Select a clinic...</option>
          {clinics.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {selectedClinicId && (
        <GoogleAnalyticsView clinicId={selectedClinicId} isDark={isDark} />
      )}
    </div>
  );
}
