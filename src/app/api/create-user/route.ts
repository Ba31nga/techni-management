// src/app/api/create-user/route.ts
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import serviceAccount from "@/lib/firebase-admin/serviceAccountKey.json";

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, roles } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
