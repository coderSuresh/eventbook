import apiClient from "@/lib/axios";

export type Booking = {
    id: string;
    eventId: string;
    userId: string;
    status: "CONFIRMED" | "CANCELLED";
};

export async function createBooking(eventId: string) {
    const response = await apiClient.post<{ booking: Booking }>("/booking", { eventId });

    return response.data.booking;
}