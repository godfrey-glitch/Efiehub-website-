import {
  collection, addDoc, getDocs, query, where,
  orderBy, serverTimestamp, Timestamp, updateDoc, doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Inquiry } from "@/lib/types";

export async function createInquiry(
  data: Omit<Inquiry, "id" | "createdAt" | "status">
): Promise<string> {
  const docRef = await addDoc(collection(db, "inquiries"), {
    ...data,
    status: "new",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getInquiriesForHost(hostId: string): Promise<Inquiry[]> {
  const q = query(
    collection(db, "inquiries"),
    where("hostId", "==", hostId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate() || new Date(),
  })) as Inquiry[];
}

export async function markInquiryRead(id: string): Promise<void> {
  await updateDoc(doc(db, "inquiries", id), { status: "read" });
}
