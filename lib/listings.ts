import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, where, orderBy, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Listing } from "@/lib/types";

export async function createListing(
  data: Omit<Listing, "id" | "createdAt">,
  imageFiles: File[]
): Promise<string> {
  const imageUrls: string[] = [];
  for (const file of imageFiles) {
    const storageRef = ref(storage, `listings/${Date.now()}_${file.name}`);
    const snap = await uploadBytes(storageRef, file);
    imageUrls.push(await getDownloadURL(snap.ref));
  }
  const docRef = await addDoc(collection(db, "listings"), {
    ...data, images: imageUrls, createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateListing(
  id: string,
  data: Partial<Omit<Listing, "id" | "createdAt">>,
  newImageFiles?: File[]
): Promise<void> {
  let imageUrls = data.images || [];
  if (newImageFiles?.length) {
    for (const file of newImageFiles) {
      const storageRef = ref(storage, `listings/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      imageUrls.push(await getDownloadURL(snap.ref));
    }
  }
  await updateDoc(doc(db, "listings", id), { ...data, images: imageUrls });
}

export async function deleteListing(id: string): Promise<void> {
  await deleteDoc(doc(db, "listings", id));
}

function mapDoc(d: import("firebase/firestore").QueryDocumentSnapshot | import("firebase/firestore").DocumentSnapshot): Listing {
  const data = d.data()!;
  return {
    id: d.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
  } as Listing;
}

export async function getAllListings(filterType?: "rental" | "sale"): Promise<Listing[]> {
  let q;
  if (filterType) {
    q = query(collection(db, "listings"), where("listingType", "==", filterType), orderBy("createdAt", "desc"));
  } else {
    q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const snap = await getDoc(doc(db, "listings", id));
  if (!snap.exists()) return null;
  return mapDoc(snap);
}

export async function getListingsByHost(hostId: string): Promise<Listing[]> {
  const q = query(collection(db, "listings"), where("hostId", "==", hostId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
}
