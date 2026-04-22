export type UserRole = "guest" | "host";
export type ListingType = "rental" | "sale";
export type PaymentMethod = "paystack" | "paypal" | "bank_transfer" | "apple_pay";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface Listing {
  id: string;
  hostId: string;
  hostName?: string;
  title: string;
  description: string;
  location: string;
  listingType: ListingType;        // "rental" | "sale"
  pricePerNight?: number;          // rental only
  salePrice?: number;              // sale only
  bedrooms?: number;
  bathrooms?: number;
  propertyType: string;
  amenities: string[];
  images: string[];
  isVerified?: boolean;
  contactPhone?: string;           // for sale inquiry
  contactEmail?: string;           // for sale inquiry
  createdAt: Date;
}

export interface Booking {
  id: string;
  listingId: string;
  listingTitle?: string;
  guestId: string;
  guestName?: string;
  hostId: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  nights: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentMethod?: PaymentMethod;
  createdAt: Date;
}

export interface Inquiry {
  id: string;
  listingId: string;
  listingTitle?: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
  hostId: string;
  status: "new" | "read" | "replied";
  createdAt: Date;
}

export const GHANA_LOCATIONS = [
  "Accra", "Kumasi", "East Legon", "Tema", "Aburi",
  "Osu", "Airport Residential", "Cantonments", "Labone", "Spintex",
];

export const PROPERTY_TYPES = [
  "Apartment", "House", "Studio", "Villa", "Guesthouse", "Airbnb",
  "Townhouse", "Land", "Commercial",
];

export const AMENITIES_LIST = [
  "WiFi", "Air Conditioning", "Swimming Pool", "Parking", "Kitchen",
  "Washer", "TV", "Generator", "Security", "Garden", "Balcony", "Hot Water",
  "CCTV", "Gym", "Furnished", "Boys Quarters",
];

export const GHS_TO_USD = 0.063;

export const BANK_DETAILS = {
  bankName: "Ecobank Ghana",
  accountName: "Efiehub Ltd",
  accountNumber: "1441000123456",
  branch: "Accra Main",
  swiftCode: "ECOCGHAC",
};
