'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import socket from '../../../lib/socket';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

type Note = {
  id: string;
  message: string;
  sender: {
    name: string;
  };
  candidateId: string;
  createdAt: string;
  tags: string[];
};

type User = {
  id: string;
  name: string;
  email: string;
};

export default function NotesPage() {
  const params = useParams();
  const candidateId = params?.candidateId as string;
  const { data: session } = useSession();

  const [notes, setNotes] = useState<Note[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch notes for the candidate
  useEffect(() => {
    if (!candidateId) return;

    const fetchNotes = async () => {
      const res = await axios.get<Note[]>(`/api/notes?candidateId=${candidateId}`);
      setNotes(res.data);
    };

    fetchNotes();
  }, [candidateId]);

  // Real-time notes via socket
  useEffect(() => {
    if (!candidateId) return;

    socket.emit('joinRoom', candidateId);

    socket.on('newNote', (note: Note) => {
      setNotes((prev) => [...prev, note]);
    });

    return () => {
      socket.emit('leaveRoom', candidateId);
      socket.off('newNote');
    };
  }, [candidateId]);

  // Fetch all users for @tagging autocomplete
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get<User[]>('/api/users');
      setAllUsers(res.data);
    };
    fetchUsers();
  }, []);

  // Handle new message submission
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Extract @username tags from message
    const tagMatches = newMessage.match(/@(\w+)/g);
    const taggedUsernames = tagMatches?.map((tag) => tag.slice(1)) || [];

    // Map usernames to user IDs
    const taggedUserIds = allUsers
      .filter((user) => taggedUsernames.includes(user.name))
      .map((u) => u.id);

    await axios.post(`/api/notes`, {
      message: newMessage,
      senderId: session?.user?.id,
      candidateId,
      tags: taggedUsernames,
      taggedUserIds,
    });

    setNewMessage('');
    setShowSuggestions(false);
  };

  // Autocomplete suggestion detection on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    const lastWord = value.split(' ').pop();
    if (lastWord?.startsWith('@')) {
      const query = lastWord.slice(1).toLowerCase();
      const matches = allUsers.filter((user) =>
        user.name.toLowerCase().startsWith(query)
      );
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle user clicking a suggestion
  const handleSelectSuggestion = (username: string) => {
    const parts = newMessage.split(' ');
    parts[parts.length - 1] = `@${username}`;
    setNewMessage(parts.join(' ') + ' ');
    setShowSuggestions(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Notes for Candidate</h1>

      {/* Notes List */}
      <div className="space-y-4 border rounded p-4 max-h-[500px] overflow-y-auto">
        {notes.map((note) => (
          <div key={note.id} className="border-b pb-2">
            <p className="font-medium">{note.sender.name}</p>
            <p>{note.message}</p>
            <span className="text-xs text-gray-500">
              {new Date(note.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* New Message Form */}
      <form onSubmit={handleSend} className="relative flex gap-2">
        <Input
          placeholder="Type your note with @username..."
          value={newMessage}
          onChange={handleInputChange}
        />
        <Button type="submit">Send</Button>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute bottom-14 left-0 bg-white dark:bg-gray-900 border rounded shadow w-64 z-10">
            {suggestions.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectSuggestion(user.name)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {user.name}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
