import { NextResponse } from 'next/server';
import { getDbPool } from '@lib/server/db';

export const dynamic = 'force-dynamic';

export const GET = async (): Promise<NextResponse> => {
  try {
    const db = getDbPool();
    await db.query('select 1');

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Database health check failed';

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
};
