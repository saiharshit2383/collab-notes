'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/DashboardNavbar';

type Candidate = {
  id: string;
  name: string;
  email: string;
};

type Notification = {
  id: string;
  message: string;
  candidate: {
    id: string;
    name: string;
  };
  sender: {
    name: string;
  };
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    const fetchCandidates = async () => {
      const res = await axios.get<Candidate[]>('/api/candidates');
      setCandidates(res.data);
    };

    fetchCandidates();
  }, [session, router]);

  useEffect(() => {
    if (!session) return;

    const fetchNotifications = async () => {
      const res = await axios.get<Notification[]>(`/api/notifications?userId=${session.user.id}`);
      setNotifications(res.data);
    };

    fetchNotifications();
  }, [session]);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/candidates', { name, email });
    setName('');
    setEmail('');

    const res = await axios.get<Candidate[]>('/api/candidates');
    setCandidates(res.data);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Top Dashboard Navbar */}
      <DashboardNavbar
        onAddCandidateClick={() => {
          const el = document.getElementById('addCandidateForm');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        notificationCount={notifications.length}
      />

      {/* Candidate List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Candidates List</h2>
        <ul className="space-y-2">
          {candidates.map((candidate) => (
            <li
              key={candidate.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <div>
                <p className="font-medium">{candidate.name}</p>
                <p className="text-sm text-gray-500">{candidate.email}</p>
              </div>
              <Link href={`/notes/${candidate.id}`}>
                <Button size="sm">View Notes</Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Candidate Form */}
      <form onSubmit={handleAddCandidate} className="space-y-3" id="addCandidateForm">
        <h2 className="text-xl font-semibold">Add Candidate</h2>
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit">Add Candidate</Button>
      </form>

      {/* Notifications Card */}
      <div id="notifications" className="border p-4 rounded bg-gray-50 dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-2">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((note) => (
              <li key={note.id}>
                <Link href={`/notes/${note.candidate.id}`}>
                  <span className="font-medium">{note.sender.name}:</span> {note.message}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
