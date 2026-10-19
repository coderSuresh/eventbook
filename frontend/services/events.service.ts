import apiClient from "@/lib/axios";

export type Event = {
    id: string;
    title: string;
    description: string;
    date: string;
    venue: string;
    totalSeats: number;
    remainingSeats?: number;
};

export type Pagination = {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

export type PaginatedEvents = {
    data: Event[];
    pagination: Pagination;
};

export async function getUpcomingEvents(page = 1, pageSize = 10) {
    const response = await apiClient.get<PaginatedEvents>("/events/upcoming", {
        params: { page, pageSize },
    });

    return response.data;
}

export async function getEventById(id: string) {
    const response = await apiClient.get<Event>(`/events/${id}`);

    return response.data;
}
