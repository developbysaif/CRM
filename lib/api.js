import { NextResponse } from 'next/server';

export function apiSuccess(data, message = 'Success', status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function apiError(message = 'Internal Server Error', status = 500, errors = null) {
  return NextResponse.json({ success: false, message, errors }, { status });
}

export function paginate(page = 1, limit = 20) {
  const skip = (Number(page) - 1) * Number(limit);
  return { skip, limit: Number(limit) };
}

export function buildSearchFilter(searchTerm, fields) {
  if (!searchTerm) return {};
  const regex = new RegExp(searchTerm, 'i');
  return { $or: fields.map((f) => ({ [f]: regex })) };
}
