import { NextResponse } from 'next/server'

const SITE_PASSWORD = process.env.SITE_PASSWORD || 'JESUS'
const COOKIE_NAME = 'uc_auth'
const ONE_YEAR = 60 * 60 * 24 * 365

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (password === SITE_PASSWORD) {
      const res = NextResponse.json({ ok: true })
      res.cookies.set(COOKIE_NAME, password, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: ONE_YEAR,
        path: '/',
      })
      return res
    }
    return NextResponse.json({ ok: false, error: 'Senha incorreta' }, { status: 401 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Requisição inválida' }, { status: 400 })
  }
}
