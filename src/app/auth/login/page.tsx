"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen gap-10 p-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4 max-w-md">
        <h1 className="text-4xl font-bold mb-2">Welcome Back 👋</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
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
          <Button type="submit" className="cursor-pointer w-full">Login</Button>
        </form>
        <div className="text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/auth/signup" className="text-blue-600 hover:underline">Sign up</a>
        </div>
      </div>

      <Image
        src="/login.jpg"
        alt="Login illustration"
        width={400}
        height={300}
        className="rounded-lg w-[400px] h-auto shadow-lg"
      />
    </div>
  );
}
