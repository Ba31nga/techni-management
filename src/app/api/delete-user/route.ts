import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { getApps, cert } from "firebase-admin/app";

// Import the service account key JSON file
import serviceAccount from "@/lib/firebase-admin/serviceAccountKey.json";

// Initialize Firebase Admin only once
if (!getApps().length) {
  admin.initializeApp({
    credential: cert(serviceAccount as admin.ServiceAccount),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid } = body;

    if (!uid) {
      return NextResponse.json({ error: "Missing user UID" }, { status: 400 });
    }

    await admin.auth().deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
