// src/app/api/delete-user/route.ts

import { NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "@/lib/firebase-admin/serviceAccountKey.json";

// Initialize Firebase Admin SDK only once
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Get user by email
    const userRecord = await getAuth().getUserByEmail(email);

    // Delete from Firebase Authentication
    await getAuth().deleteUser(userRecord.uid);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
