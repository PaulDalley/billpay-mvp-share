import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function clearAll() {
  const c = cookies();
  ["user_email","auth_email","otp","sid","bc_email"].forEach(name => {
    c.set(name, "", { path: "/", maxAge: 0 });
  });
}

export async function POST(req: NextRequest) {
  clearAll();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}

export async function GET(req: NextRequest) {
  clearAll();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
