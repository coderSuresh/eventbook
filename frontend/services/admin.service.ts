import apiClient from "@/lib/axios"
import type { Event, Pagination } from "@/services/events.service"

export type AdminEvent = Event & {
    totalSeats: number
    isActive: boolean
}

export type EventInput = {
    title: string
    description: string
    date: string
    venue: string
    totalSeats: number
}

export type AttendeeBooking = {
    id: string
    eventId: string
    userId: string
    status: "CONFIRMED" | "CANCELLED"
    createdAt: string
    user: {
        name: string
        email: string
    }
}

export async function getAdminEvents(page = 1, pageSize = 10) {
    const response = await apiClient.get<{ data: AdminEvent[]; pagination: Pagination }>("/events", {
        params: { page, pageSize },
    })
    return response.data
}

export async function getAllAdminEvents() {
    const firstPage = await getAdminEvents(1, 50)
    const events = [...firstPage.data]

    for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
        const nextPage = await getAdminEvents(page, 50)
        events.push(...nextPage.data)
    }

    return events
}

export async function createAdminEvent(input: EventInput) {
    const response = await apiClient.post<{ newEvent: AdminEvent }>("/events", input)
    return response.data.newEvent
}

export async function updateAdminEvent(id: string, input: EventInput) {
    const response = await apiClient.put<{ updatedEvent: AdminEvent }>(`/events/${id}`, input)
    return response.data.updatedEvent
}

export async function deleteAdminEvent(id: string, reason: string) {
    await apiClient.delete(`/events/${id}`, { data: { reason } })
}

export async function getEventBookings(eventId: string) {
    const response = await apiClient.get<{ bookings: AttendeeBooking[] }>(`/booking/event/${eventId}`)
    return response.data.bookings
}