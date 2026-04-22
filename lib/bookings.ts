import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Booking } from "@/lib/types";

export async function getBookingsForListing(listingId: string): Promise<Booking[]> {
  const q = query(
    collection(db, "bookings"),
    where("listingId", "==", listingId),
    where("status", "!=", "cancelled")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    checkIn: (d.data().checkIn as Timestamp)?.toDate(),
    checkOut: (d.data().checkOut as Timestamp)?.toDate(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate() || new Date(),
  })) as Booking[];
}

export async function checkAvailability(
  listingId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  const bookings = await getBookingsForListing(listingId);
  for (const b of bookings) {
    const overlap =
      checkIn < b.checkOut && checkOut > b.checkIn;
    if (overlap) return false;
  }
  return true;
}

export async function createBooking(
  data: Omit<Booking, "id" | "createdAt">
): Promise<string> {
  const available = await checkAvailability(data.listingId, data.checkIn, data.checkOut);
  if (!available) throw new Error("Selected dates are not available.");

  const docRef = await addDoc(collection(db, "bookings"), {
    ...data,
    checkIn: Timestamp.fromDate(data.checkIn),
    checkOut: Timestamp.fromDate(data.checkOut),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getBookingsByGuest(guestId: string): Promise<Booking[]> {
  const q = query(
    collection(db, "bookings"),
    where("guestId", "==", guestId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    checkIn: (d.data().checkIn as Timestamp)?.toDate(),
    checkOut: (d.data().checkOut as Timestamp)?.toDate(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate() || new Date(),
  })) as Booking[];
}

export async function getBookingsByHost(hostId: string): Promise<Booking[]> {
  const q = query(
    collection(db, "bookings"),
    where("hostId", "==", hostId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    checkIn: (d.data().checkIn as Timestamp)?.toDate(),
    checkOut: (d.data().checkOut as Timestamp)?.toDate(),
    createdAt: (d.data().createdAt as Timestamp)?.toDate() || new Date(),
  })) as Booking[];
}

export async function getBookingsForHostListings(listingIds: string[]): Promise<Booking[]> {
  if (listingIds.length === 0) return [];
  const all: Booking[] = [];
  for (const lid of listingIds) {
    const q = query(
      collection(db, "bookings"),
      where("listingId", "==", lid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const bookings = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      checkIn: (d.data().checkIn as Timestamp)?.toDate(),
      checkOut: (d.data().checkOut as Timestamp)?.toDate(),
      createdAt: (d.data().createdAt as Timestamp)?.toDate() || new Date(),
    })) as Booking[];
    all.push(...bookings);
  }
  return all;
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await updateDoc(doc(db, "bookings", bookingId), { status: "cancelled" });
}
