import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'  // your helper we wrote earlier

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  // ✅ Extract token from Authorization header
  const token = req.headers.authorization?.split(' ')[1]
  const decoded = verifyToken(token!)

  if (!decoded) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and Email are required' })
  }

  const candidate = await prisma.candidate.create({
    data: { name, email }
  })

  return res.status(201).json({ message: 'Candidate created', candidate })
}
