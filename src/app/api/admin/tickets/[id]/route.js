import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Ticket } from '@/lib/models';
import { requireAdmin } from '@/lib/auth';

export async function GET(_req, { params }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  await connectDB();
  const ticket = await Ticket.findById(id).lean();
  if (!ticket) return NextResponse.json({ error: 'تیکت یافت نشد.' }, { status: 404 });
  return NextResponse.json({ ...ticket, _id: String(ticket._id) });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { text } = await request.json();
  if (!text?.trim()) return NextResponse.json({ error: 'متن پاسخ الزامی است.' }, { status: 400 });

  await connectDB();
  const ticket = await Ticket.findByIdAndUpdate(
    id,
    {
      $push: { replies: { author: 'admin', text: String(text).trim(), createdAt: new Date() } },
      $set: { status: 'answered' },
    },
    { returnDocument: 'after' }
  ).lean();
  if (!ticket) return NextResponse.json({ error: 'تیکت یافت نشد.' }, { status: 404 });
  return NextResponse.json({ ok: true, replies: ticket.replies, status: ticket.status });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { status } = await request.json();
  if (!['open', 'answered', 'closed'].includes(status)) {
    return NextResponse.json({ error: 'وضعیت نامعتبر است.' }, { status: 400 });
  }

  await connectDB();
  const ticket = await Ticket.findByIdAndUpdate(id, { status }, { returnDocument: 'after' }).lean();
  if (!ticket) return NextResponse.json({ error: 'تیکت یافت نشد.' }, { status: 404 });
  return NextResponse.json({ ok: true, status: ticket.status });
}
