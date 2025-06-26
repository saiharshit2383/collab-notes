'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import  socket  from '@/lib/socket';
import axios from 'axios';

type User = {
  id: string;
  name: string;
};

export default function TaggableMessageInput({
  onSend,
}: {
  onSend: (msg: string) => void;
}) {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get<User[]>('/api/users');
      setUsers(res.data);
    };

    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    const lastWord = value.split(' ').pop();
    if (lastWord?.startsWith('@')) {
      const query = lastWord.slice(1).toLowerCase();
      const matches = users.filter((user) =>
        user.name.toLowerCase().startsWith(query)
      );
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (username: string) => {
    const words = message.split(' ');
    words[words.length - 1] = `@${username}`;
    const newMessage = words.join(' ');
    setMessage(newMessage + ' ');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    socket.emit('send-message', { message });
    setMessage('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative space-y-2">
      <Input
        ref={inputRef}
        placeholder="Type your message..."
        value={message}
        onChange={handleChange}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      {showSuggestions && (
        <ul className="absolute bg-white border p-2 rounded shadow top-full mt-1 z-20 w-64 max-h-40 overflow-y-auto">
          {suggestions.map((user) => (
            <li
              key={user.id}
              className="cursor-pointer p-1 hover:bg-gray-100"
              onClick={() => handleSelectSuggestion(user.name)}
            >
              @{user.name}
            </li>
          ))}
          {suggestions.length === 0 && (
            <li className="p-1 text-gray-500">No matches</li>
          )}
        </ul>
      )}
      <Button onClick={handleSend} variant="secondary">
        Send
      </Button>
    </div>
  );
}
