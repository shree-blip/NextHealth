'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // placeholder: send data to API
    alert('Submitted (demo only)');
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-6">Got a project? Let’s talk.</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Company</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 block w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </div>
          <div className="text-center">
            <button type="submit" className="px-6 py-3 bg-emerald-500 text-white rounded hover:bg-emerald-400">Submit</button>
          </div>
        </form>
      </div>
    </section>
  );
}
