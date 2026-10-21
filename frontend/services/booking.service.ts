import apiClient from "@/lib/axios";

export type Booking = {
    id: string;
    eventId: string;
    userId: string;
    status: "CONFIRMED" | "CANCELLED";
    createdAt: string;
    event?: {
        id: string;
        title: string;
        description: string;
        date: string;
        venue: string;
        totalSeats: number;
        isActive: boolean;
        isUpcoming: boolean;
    };
};

export type BookingPagination = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

export type PaginatedBookings = {
    data: Booking[];
    pagination: BookingPagination;
};

export async function createBooking(eventId: string) {
    const response = await apiClient.post<{ booking: Booking }>("/booking", { eventId });

    return response.data.booking;
}

export async function getUserBookings(page = 1, pageSize = 10) {
    const response = await apiClient.get<PaginatedBookings>("/booking/user", {
        params: { page, pageSize },
    });

    return response.data;
}

export async function cancelBooking(bookingId: string) {
    await apiClient.delete(`/booking/${bookingId}`);
}