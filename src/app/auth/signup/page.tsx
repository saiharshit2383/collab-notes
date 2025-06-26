"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from 'next/image'

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("/api/auth/register", { name, email, password });
      router.push("/auth/login");
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      {/* Heading */}
      

      {/* Form + Image */}
      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-4 w-80">
          <h1 className="text-4xl font-bold mb-8 text-center">Signup</h1>
          <Input
            type="text"
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
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="cursor-pointer w-full">Signup</Button>
        </form>

        {/* Image */}
        <Image
          src="/login.jpg"
          alt="Signup illustration"
          width={400}
          height={300}
          className="rounded-lg w-[400px] h-auto shadow-lg"
        />
      </div>
    </div>
  );
}
