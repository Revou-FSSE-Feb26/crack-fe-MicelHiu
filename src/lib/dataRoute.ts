//promo

import { backendFetch } from "./backend";

//promo
export interface DiscountFromApi {
    id: string;
    name: string;
    value: number; // Prisma Decimal dikirim sbg string via JSON
    valid_until: string;
    valid_from: string;
    is_active: boolean;
    admin_disabled: boolean;
}

export interface CreatePromotionPayload {
    name: string;
    value: string;
    valid_from: string;
    valid_until: string;
}

export type UpdatePromotionPayload = Partial<CreatePromotionPayload> & {
    admin_disabled?: boolean;
};

export async function getPromotions(): Promise<DiscountFromApi[]> {
    const res = await fetch("/api/promotions");
    if (!res.ok) throw new Error("Failed to fetch discounts");

    const data: DiscountFromApi[] = await res.json();

    return data.map((d) => ({
        id: d.id,
        name: d.name,
        value: d.value,
        valid_until: d.valid_until,
        valid_from: d.valid_from,
        is_active: d.is_active,
        admin_disabled: d.admin_disabled
    }));
}

export async function createPromotion(payload: CreatePromotionPayload): Promise<DiscountFromApi> {
    const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message ?? "Failed to create promotion");
    return data;
}

export async function updatePromotion(id: string, payload: UpdatePromotionPayload): Promise<DiscountFromApi> {
    const res = await fetch(`/api/promotions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message ?? "Failed to update promotion");
    return data;
}

export async function deletePromotion(id: string): Promise<void> {
    const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete promotion");
}

//profile
export interface Profile {
    id: string;
    full_name: string;
    nickname: string;
    email: string;
    role: string;
    points: number;
    password: string;
}

//rooms (admin) — bentuk mentah dari backend, beda dengan Room di lib/data.ts
export type RoomType = "PC" | "PS";

export interface AdminRoom {
    id: string;
    name: string;
    description: string;
    price: string | number;
    image: string;
    type: RoomType;
    stock: number;
    stock_today?: number;
}

export type RoomPayload = Omit<AdminRoom, "stock_today" | "price"> & { price: number };

function errorMessage(data: { message?: string | string[]; error?: string } | null, fallback: string) {
    const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
    return message ?? data?.error ?? fallback;
}

export async function getAdminRooms(): Promise<AdminRoom[]> {
    const res = await fetch("/api/rooms");
    if (!res.ok) throw new Error("Failed to fetch rooms");
    return res.json();
}

export async function createRoom(payload: RoomPayload): Promise<AdminRoom> {
    const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(errorMessage(data, "Failed to create room"));
    return data;
}

export async function updateRoom(id: string, payload: Partial<Omit<RoomPayload, "id">>): Promise<AdminRoom> {
    const res = await fetch(`/api/rooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(errorMessage(data, "Failed to update room"));
    return data;
}

export async function deleteRoom(id: string): Promise<void> {
    const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(errorMessage(data, "Failed to delete room"));
    }
}

export async function getProfile(): Promise<Profile[]> {
    const res = await fetch("/api/auth/me");
    if (!res.ok) throw new Error("Failed to fetch profile. Please log in again");

    const data: Profile[] = await res.json();

    return data.map((d) => ({
        id: d.id,
        full_name: d.full_name,
        nickname: d.nickname,
        email: d.email,
        role: d.role,
        points: d.points,
        password: d.password
    }));
}

//cart
export interface CartRoom {
    name: string;
    price: string | number;
    type: string;
    image: string;
    stock: number;
}

export interface CartEntry {
    id: string;
    user_id: string;
    room_id: string;
    quantity: number;
    discount_id: string | null;
    discount_value: string | null;
    date_play: string;
    time_start: string;
    time_end: string;
    total_price: string;
    created_at: string;
    rooms?: CartRoom;
}

export interface CreateCartPayload {
    room_id: string;
    quantity: number;
    date_play: string;
    time_start: string;
    time_end: string;
    discount_id?: string;
}

export type UpdateCartPayload = Partial<Omit<CreateCartPayload, "discount_id">> & { discount_id?: string | null };

export async function fetchCarts(): Promise<CartEntry[]> {
    const res = await fetch("/api/carts");
    if (!res.ok) return [];
    return res.json();
}

export async function fetchCartById(id: string): Promise<CartEntry | null> {
    const res = await fetch(`/api/carts/${id}`);
    if (!res.ok) return null;
    return res.json();
}

export async function createCartItem(payload: CreateCartPayload): Promise<CartEntry> {
    const res = await fetch("/api/carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to add to cart");
    return res.json();
}

export async function updateCartItem(id: string, payload: UpdateCartPayload): Promise<CartEntry> {
    const res = await fetch(`/api/carts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
        console.error("updateCartItem failed", res.status, data);
        throw new Error(data?.message ?? "Failed to update cart");
    }
    return data;
}

export async function deleteCartItem(id: string): Promise<void> {
    const res = await fetch(`/api/carts/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to remove cart item");
}

//booking
export type BookingStatus = "confirmed" | "ongoing" | "canceled" | "completed";

export interface BookingEntry {
    code: string;
    user_id: string;
    room_id: string;
    guest_name: string;
    guest_contact: string;
    time_start: string;
    time_end: string;
    date_play: string;
    unit_price: string;
    discount_id: string | null;
    discount_value: string | null;
    quantity: number;
    total_price: string;
    status: BookingStatus;
    created_at: string;
    points_earned: number;
    rooms?: CartRoom;
}

export interface CreateBookingPayload {
    cart_id: string;
    guest_name: string;
    guest_contact: string;
}

export async function createBooking(payload: CreateBookingPayload): Promise<BookingEntry> {
    const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
        console.error("createBooking failed", res.status, data);
        throw new Error(data?.message ?? "Failed to confirm booking");
    }
    return data;
}

export async function cancelBooking(code: string): Promise<BookingEntry> {
    const res = await fetch(`/api/bookings/${code}/cancel`, { method: "PATCH" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message ?? data?.error ?? "Failed to cancel booking");
    return data;
}

export async function fetchCurrentBookings(): Promise<BookingEntry[]> {
    const res = await fetch("/api/bookings/current");
    if (!res.ok) return [];
    return res.json();
}

export async function fetchBookingByCode(code: string): Promise<BookingEntry | null> {
    const res = await fetch(`/api/bookings/${code}`);
    if (!res.ok) return null;
    return res.json();
}