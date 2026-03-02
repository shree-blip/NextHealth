'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import AnalyticsForm from './analytics';
import AdminAnalyticsView from '@/components/AdminAnalyticsView';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSitePreferences } from '@/components/SitePreferencesProvider';
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

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
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

  // Modal states
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddClinicModal, setShowAddClinicModal] = useState(false);
  const [showEditClinicModal, setShowEditClinicModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState<any>(null);
  const [showQuickAssignModal, setShowQuickAssignModal] = useState(false);
  const [quickAssignClinicId, setQuickAssignClinicId] = useState('');

  // Form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [newClientRole, setNewClientRole] = useState('client');
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicType, setNewClinicType] = useState('');
  const [newClinicLocation, setNewClinicLocation] = useState('');
  const [newClinicAssignedUser, setNewClinicAssignedUser] = useState('');

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
          if (data.role !== 'admin') {
            router.push('/dashboard/client');
          } else {
            setUser(data);
          }
        });
      }
    });

    // Fetch leads from database
    fetch('/api/contact-lead').then(res => res.json()).then(data => {
      setLeads(data.leads || []);
    }).catch(console.error);

    // Connect socket
    const newSocket = io({ path: '/socket.io' });
    socketRef.current = newSocket;

    newSocket.on('initial_state', (data) => {
      setClinics(data.clinics);
      setUsers(data.users);
      setAssignments(data.assignments);
    });

    newSocket.on('assignment_added', (data) => {
      setAssignments(prev => {
        if (!prev.find(a => a.userId === data.userId && a.clinicId === data.clinicId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    newSocket.on('assignment_removed', (data) => {
      setAssignments(prev => prev.filter(a => !(a.userId === data.userId && a.clinicId === data.clinicId)));
    });

    newSocket.on('clinic_updated', (updatedClinic) => {
      setClinics(prev => prev.map(c => c.id === updatedClinic.id ? updatedClinic : c));
    });

    newSocket.on('clinic_added', (newClinic) => {
      setClinics(prev => [...prev, newClinic]);
    });

    newSocket.on('clinic_deleted', (data) => {
      setClinics(prev => prev.filter(c => c.id !== data.id));
    });

    newSocket.on('client_added', (newClient) => {
      setUsers(prev => [...prev, newClient]);
    });

    newSocket.on('client_deleted', (data) => {
      setUsers(prev => prev.filter(u => u.id !== data.id));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [router]);

  // Handle view parameter from URL
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'profile') {
      navigateToSection('My Profile');
    }
    if (view === 'settings') {
      navigateToSection('Settings');
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAssign = () => {
    if (socketRef.current && selectedUser && selectedClinic) {
      socketRef.current.emit('assign_clinic', { userId: selectedUser, clinicId: selectedClinic });
    }
  };

  const handleQuickAssign = (userId: string) => {
    if (socketRef.current && userId && quickAssignClinicId) {
      socketRef.current.emit('assign_clinic', { userId, clinicId: quickAssignClinicId });
      setShowQuickAssignModal(false);
      setQuickAssignClinicId('');
      setSelectedUser('');
    }
  };

  const handleRemoveAssignment = (userId: string, clinicId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('remove_assignment', { userId, clinicId });
    }
  };

  const handleUpdateStats = (clinicId: string, leads: number, appointments: number) => {
    if (socketRef.current) {
      socketRef.current.emit('update_clinic_stats', { clinicId, leads, appointments });
    }
  };

  const handleAddClient = () => {
    if (socketRef.current && newClientName && newClientEmail && newClientPassword) {
      socketRef.current.emit('add_client', { 
        name: newClientName, 
        email: newClientEmail, 
        password: newClientPassword,
        role: newClientRole 
      });
      setNewClientName('');
      setNewClientEmail('');
      setNewClientPassword('');
      setNewClientRole('client');
      setShowAddClientModal(false);
    }
  };

  const handleAddClinic = () => {
    if (socketRef.current && newClinicName && newClinicType && newClinicLocation) {
      socketRef.current.emit('add_clinic', { 
        name: newClinicName, 
        type: newClinicType, 
        location: newClinicLocation,
        assignedUserId: newClinicAssignedUser || null
      });
      setNewClinicName('');
      setNewClinicType('');
      setNewClinicLocation('');
      setNewClinicAssignedUser('');
      setShowAddClinicModal(false);
    }
  };

  const handleEditClinic = () => {
    if (socketRef.current && editingClinic) {
      socketRef.current.emit('update_clinic', {
        id: editingClinic.id,
        name: editingClinic.name,
        type: editingClinic.type,
        location: editingClinic.location
      });
      setEditingClinic(null);
      setShowEditClinicModal(false);
    }
  };

  const handleDeleteClinic = (clinicId: string) => {
    if (confirm('Are you sure you want to delete this clinic?')) {
      if (socketRef.current) {
        socketRef.current.emit('delete_clinic', { id: clinicId });
      }
    }
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      if (socketRef.current) {
        socketRef.current.emit('delete_client', { id: clientId });
      }
    }
  };

  if (!user) return <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>Loading...</div>;

  return (
    <>
    <Navbar />
    <div className={`dashboard-scope min-h-screen flex pt-20 ${dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <aside className={`w-64 border-r flex flex-col p-6 hidden lg:flex ${dark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100'}`}>
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
          <NavItem icon={LayoutDashboard} label="Global Stats" active={section==='Global Stats'} onClick={() => navigateToSection('Global Stats')} dark={dark} />
          <NavItem icon={BarChart3} label="Analytics" active={section==='Analytics'} onClick={() => navigateToSection('Analytics')} dark={dark} />
          <NavItem icon={Users} label="Registered Clients" active={section==='Registered Clients'} onClick={() => navigateToSection('Registered Clients')} dark={dark} />
          <NavItem icon={Globe} label="Client Sites" active={section==='Client Sites'} onClick={() => navigateToSection('Client Sites')} dark={dark} />
          <NavItem icon={Cpu} label="AI Models" active={section==='AI Models'} onClick={() => navigateToSection('AI Models')} dark={dark} />
          <NavItem icon={Database} label="Lead Database" active={section==='Lead Database'} onClick={() => navigateToSection('Lead Database')} dark={dark} />
          <NavItem icon={ShieldAlert} label="Security Logs" active={section==='Security Logs'} onClick={() => navigateToSection('Security Logs')} dark={dark} />
          <NavItem icon={Settings} label="System Config" active={section==='System Config'} onClick={() => navigateToSection('System Config')} dark={dark} />
          <NavItem icon={User} label="My Profile" active={section==='My Profile'} onClick={() => navigateToSection('My Profile')} dark={dark} />
          <NavItem icon={Lock} label="Settings" active={section==='Settings'} onClick={() => navigateToSection('Settings')} dark={dark} />
          <Link href="/dashboard/admin/blog" className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
            <FileText className="h-5 w-5" />
            <span className="text-sm">Blog Management</span>
          </Link>
          <Link href="/dashboard/admin/news" className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
            <Newspaper className="h-5 w-5" />
            <span className="text-sm">News Management</span>
          </Link>
          <Link href="/dashboard/admin/chat-reports" className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm">Chat Reports</span>
          </Link>
          <Link href="/dashboard/admin/leads" className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
            <Users className="h-5 w-5" />
            <span className="text-sm">Contact Leads</span>
          </Link>
          <Link href="/dashboard/admin/subscribers" className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
            <Mail className="h-5 w-5" />
            <span className="text-sm">Newsletter Subscribers</span>
          </Link>
        </nav>

        <button onClick={handleLogout} className={`flex items-center gap-3 transition-colors p-3 ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-bold">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
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
        />
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
            disabled={!newClientName || !newClientEmail || !newClientPassword}
            className="flex-1 bg-emerald-500 text-black font-bold py-2 rounded-lg hover:bg-emerald-400 disabled:opacity-50"
          >
            Add User
          </button>
          <button
            onClick={() => setShowAddClientModal(false)}
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
    <Modal isOpen={showEditClinicModal} onClose={() => setShowEditClinicModal(false)} title="Edit Clinic">
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
            disabled={!selectedUser}
            className="flex-1 bg-emerald-500 text-black font-bold py-2 rounded-lg hover:bg-emerald-400 disabled:opacity-50"
          >
            Assign
          </button>
          <button
            onClick={() => {
              setShowQuickAssignModal(false);
              setSelectedUser('');
            }}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>

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
        active ? 'bg-emerald-500 text-black font-bold' : dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function EfficiencyBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-emerald-500"
        />
      </div>
    </div>
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
    isDark
  } = props;

  switch(section) {
    case 'Global Stats':
      return (
        <>
          <header className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-[20px] font-bold mb-1">Command Center</h1>
              <p className="text-slate-500 dark:text-slate-400">Welcome, {user.name}. System health is optimal.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onAddClient}
                className="flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all"
              >
                <Plus className="h-5 w-5" /> New User
              </button>
              <button 
                onClick={onAddClinic}
                className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-400 transition-all"
              >
                <Plus className="h-5 w-5" /> New Clinic
              </button>
            </div>
          </header>

          {/* Real-time Clinic Management (same as before) */}
          <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700 mb-12">
            <h3 className="text-xl font-bold mb-6">Assign Clinics to Clients</h3>
            <div className="flex flex-wrap gap-4 mb-8">
              <select 
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 dark:text-slate-200 focus:outline-none focus:border-emerald-500 min-w-[200px]"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select Client User</option>
                {users.filter(u => u.role === 'client').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <select 
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 dark:text-slate-200 focus:outline-none focus:border-emerald-500 min-w-[200px]"
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
              >
                <option value="">Select Clinic/ER</option>
                {clinics.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.location}</option>
                ))}
              </select>
              <button 
                onClick={handleAssign}
                disabled={!selectedUser || !selectedClinic}
                className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign
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
                                <button onClick={() => handleRemoveAssignment(u.id, clinic.id)} className="text-red-400 hover:text-red-300">×</button>
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
                                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400 transition-colors font-bold"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => onDeleteClinic(clinic.id)}
                                className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400 transition-colors font-bold"
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

          {/* AI Performance & Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="h-6 w-6 text-emerald-500" />
                <h3 className="text-xl font-bold">AI Intake Efficiency</h3>
              </div>
              <div className="space-y-6">
                <EfficiencyBar label="Intent Recognition" value={98} />
                <EfficiencyBar label="Insurance Verification" value={92} />
                <EfficiencyBar label="Appointment Booking" value={89} />
              </div>
            </div>
            
            <div className="glass rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold mb-6">System Logs</h3>
              <div className="font-mono text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <p><span className="text-emerald-500">[21:57:15]</span> AI Agent #42 successfully verified insurance for Client ID: 90210</p>
                <p><span className="text-emerald-500">[21:56:42]</span> Global SEO sync completed for 124 keywords</p>
                <p><span className="text-blue-500">[21:55:10]</span> New client &quot;Houston ER&quot; added to system</p>
                <p><span className="text-slate-400">[21:54:05]</span> Routine security audit completed. 0 vulnerabilities found.</p>
              </div>
            </div>
          </div>
        </>
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
          <div>
            <h2 className="text-2xl font-black mb-2">📊 Analytics Dashboard</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              View performance metrics across all clinics and manage weekly data entry
            </p>
          </div>
          
          {/* Analytics Charts */}
          <AdminAnalyticsView isDark={isDark} />
          
          {/* Data Entry Form */}
          <div className={`mt-12 pt-8 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <h2 className="text-2xl font-black mb-6">📝 Enter Weekly Data</h2>
            <AnalyticsForm />
          </div>
        </div>
      );

    case 'My Profile':
      return <AdminProfileView user={user} />;

    case 'Settings':
      return <DashboardSettingsView role="admin" />;

    default:
      return <div>Unknown section</div>;
  }
}
