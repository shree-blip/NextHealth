'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import AnalyticsForm from './analytics';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  // track which sidebar section is active
  const [section, setSection] = useState<string>('Global Stats');

  const [selectedUser, setSelectedUser] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');

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

    return () => {
      newSocket.disconnect();
    };
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAssign = () => {
    if (socketRef.current && selectedUser && selectedClinic) {
      socketRef.current.emit('assign_clinic', { userId: selectedUser, clinicId: selectedClinic });
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

  if (!user) return <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">Loading...</div>;

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-slate-50 text-slate-900 flex pt-20">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-100 flex flex-col p-6 hidden lg:flex">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <img
            src="/Client-review-image/nextgen_footerlogo.png"
            alt="NextGen Marketing Agency"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="space-y-2 flex-grow">
          <NavItem icon={LayoutDashboard} label="Global Stats" active={section==='Global Stats'} onClick={() => setSection('Global Stats')} />
          <NavItem icon={BarChart3} label="Analytics" active={section==='Analytics'} onClick={() => setSection('Analytics')} />
          <NavItem icon={Globe} label="Client Sites" active={section==='Client Sites'} onClick={() => setSection('Client Sites')} />
          <NavItem icon={Cpu} label="AI Models" active={section==='AI Models'} onClick={() => setSection('AI Models')} />
          <NavItem icon={Database} label="Lead Database" active={section==='Lead Database'} onClick={() => setSection('Lead Database')} />
          <NavItem icon={ShieldAlert} label="Security Logs" active={section==='Security Logs'} onClick={() => setSection('Security Logs')} />
          <NavItem icon={Settings} label="System Config" active={section==='System Config'} onClick={() => setSection('System Config')} />
          <Link href="/dashboard/admin/blog" className="w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            <FileText className="h-5 w-5" />
            <span className="text-sm">Blog Management</span>
          </Link>
          <Link href="/dashboard/admin/news" className="w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            <Newspaper className="h-5 w-5" />
            <span className="text-sm">News Management</span>
          </Link>
          <Link href="/dashboard/admin/chat-reports" className="w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm">Chat Reports</span>
          </Link>
          <Link href="/dashboard/admin/leads" className="w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            <Users className="h-5 w-5" />
            <span className="text-sm">Contact Leads</span>
          </Link>
          <Link href="/dashboard/admin/subscribers" className="w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            <Mail className="h-5 w-5" />
            <span className="text-sm">Newsletter Subscribers</span>
          </Link>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors p-3">
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
          assignments={assignments}
          selectedUser={selectedUser}
          selectedClinic={selectedClinic}
          setSelectedUser={setSelectedUser}
          setSelectedClinic={setSelectedClinic}
          handleAssign={handleAssign}
          handleRemoveAssignment={handleRemoveAssignment}
          handleUpdateStats={handleUpdateStats}
        />
      </main>
    </div>
    <Footer />
    </>
  );
}

function NavItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${
        active ? 'bg-emerald-500 text-black font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
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
        <span className="text-slate-600">{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
  assignments: any[];
  selectedUser: string;
  selectedClinic: string;
  setSelectedUser: (s: string) => void;
  setSelectedClinic: (s: string) => void;
  handleAssign: () => void;
  handleRemoveAssignment: (u:string,c:string)=>void;
  handleUpdateStats: (c:string,l:number,a:number)=>void;
}) {
  const {
    section,
    user,
    clinics,
    users,
    assignments,
    selectedUser,
    selectedClinic,
    setSelectedUser,
    setSelectedClinic,
    handleAssign,
    handleRemoveAssignment,
    handleUpdateStats
  } = props;

  switch(section) {
    case 'Global Stats':
      return (
        <>
          <header className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-[20px] font-bold mb-1">Agency Command Center</h1>
              <p className="text-slate-500">Welcome, {user.name}. System health is optimal.</p>
            </div>
            <button className="flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all">
              <Plus className="h-5 w-5" /> New Client
            </button>
          </header>

          {/* Real-time Clinic Management (same as before) */}
          <div className="glass rounded-[2.5rem] p-8 border border-slate-200 mb-12">
            <h3 className="text-xl font-bold mb-6">Assign Clinics to Clients</h3>
            <div className="flex gap-4 mb-8">
              <select 
                className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-500"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select Client User</option>
                {users.filter(u => u.role === 'client').map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <select 
                className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-500"
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
                className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400 transition-all"
              >
                Assign
              </button>
            </div>

            <h3 className="text-xl font-bold mb-6">Manage Clinics (Real-time Sync)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-4 py-4">Clinic Name</th>
                    <th className="px-4 py-4">Type</th>
                    <th className="px-4 py-4">Assigned Users</th>
                    <th className="px-4 py-4">Leads</th>
                    <th className="px-4 py-4">Appointments</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clinics.map(clinic => {
                    const assignedUsers = assignments.filter(a => a.clinicId === clinic.id).map(a => {
                      const u = users.find(user => user.id === a.userId);
                      return u ? { ...u, assignmentId: a.userId } : null;
                    }).filter(Boolean);

                    return (
                      <tr key={clinic.id} className="hover:bg-slate-100 transition-colors">
                        <td className="px-4 py-4 font-bold">{clinic.name}</td>
                        <td className="px-4 py-4 text-sm text-slate-600">{clinic.type}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {assignedUsers.map((u: any) => (
                              <span key={u.id} className="text-xs bg-slate-200 px-2 py-1 rounded-md flex items-center gap-2">
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
                            className="w-20 bg-slate-100 border border-slate-200 rounded p-1 text-center"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="number" 
                            value={clinic.appointments}
                            onChange={(e) => handleUpdateStats(clinic.id, clinic.leads, parseInt(e.target.value) || 0)}
                            className="w-20 bg-slate-100 border border-slate-200 rounded p-1 text-center"
                          />
                        </td>
                        <td className="px-4 py-4 text-emerald-500 text-xs">Live Sync Active</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Performance & Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass rounded-[2.5rem] p-8 border border-slate-200">
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
            
            <div className="glass rounded-[2.5rem] p-8 border border-slate-200">
              <h3 className="text-xl font-bold mb-6">System Logs</h3>
              <div className="font-mono text-xs text-slate-500 space-y-2">
                <p><span className="text-emerald-500">[21:57:15]</span> AI Agent #42 successfully verified insurance for Client ID: 90210</p>
                <p><span className="text-emerald-500">[21:56:42]</span> Global SEO sync completed for 124 keywords</p>
                <p><span className="text-blue-500">[21:55:10]</span> New client &quot;Houston ER&quot; added to system</p>
                <p><span className="text-slate-400">[21:54:05]</span> Routine security audit completed. 0 vulnerabilities found.</p>
              </div>
            </div>
          </div>
        </>
      );

    case 'Client Sites':
      return (
        <div>
          <h2 className="h2 mb-6">Client Sites</h2>
          <p className="mb-4 text-slate-600">Overview of every clinic/ER registered with the platform.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Location</th>
                  <th className="px-4 py-4">Leads</th>
                  <th className="px-4 py-4">Appointments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clinics.map(c => (
                  <tr key={c.id} className="hover:bg-slate-100 transition-colors">
                    <td className="px-4 py-4 font-bold">{c.name}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{c.type}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{c.location}</td>
                    <td className="px-4 py-4">{c.leads}</td>
                    <td className="px-4 py-4">{c.appointments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'AI Models':
      return (
        <div>
          <h2 className="h2 mb-6">AI Models</h2>
          <p className="text-slate-600">Model management and performance metrics will appear here.</p>
          <div className="mt-8 p-6 glass border border-slate-200 rounded-2xl text-center text-slate-500">
            <em>Feature coming soon&hellip;</em>
          </div>
        </div>
      );

    case 'Lead Database':
      return (
        <div>
          <h2 className="h2 mb-6">Lead Database</h2>
          <p className="text-slate-600">Access raw lead records generated across all client sites.</p>
          <div className="mt-8 p-6 glass border border-slate-200 rounded-2xl text-center text-slate-500">
            <em>Feature coming soon&hellip;</em>
          </div>
        </div>
      );

    case 'Security Logs':
      return (
        <div>
          <h2 className="h2 mb-6">Security Logs</h2>
          <p className="text-slate-600 mb-4">Audit trail of authentication events, errors, and system alerts.</p>
          <div className="font-mono text-xs text-slate-500 space-y-2">
            <p><span className="text-red-500">[22:01:03]</span> Failed login attempt for user &quot;badguy@example.com&quot;</p>
            <p><span className="text-red-500">[21:59:47]</span> Token expiry triggered logout for user ID abc123</p>
            <p><span className="text-emerald-500">[21:58:22]</span> Admin user &quot;jane&quot; updated system configuration</p>
          </div>
        </div>
      );

    case 'System Config':
      return (
        <div>
          <h2 className="h2 mb-6">System Config</h2>
          <p className="text-slate-600 mb-4">Modify platform-wide settings and API keys.</p>
          <div className="mt-8 p-6 glass border border-slate-200 rounded-2xl">
            <label className="block mb-2 text-sm font-bold">Site-wide maintenance mode</label>
            <select className="w-64 rounded-xl border border-slate-200 p-2">
              <option>Off</option>
              <option>On</option>
            </select>
          </div>
        </div>
      );

    case 'Analytics':
      return <AnalyticsForm />;

    default:
      return <div>Unknown section</div>;
  }
}
