import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Ticket } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';

  await connectDB();
  const filter = status ? { status } : {};
  const tickets = await Ticket.find(filter).sort({ updatedAt: -1 }).limit(200).lean();
  return NextResponse.json(tickets.map((t) => ({ ...t, _id: String(t._id) })));
}
