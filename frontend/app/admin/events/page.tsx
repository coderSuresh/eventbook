"use client"

import { useEffect, useState } from "react"
import AdminEventForm from "@/components/events/admin-event-form"
import AdminEventList from "@/components/events/admin-event-list"
import { createAdminEvent, deleteAdminEvent, getAdminEvents, type AdminEvent, type EventInput, updateAdminEvent } from "@/services/admin.service"
import type { Pagination } from "@/services/events.service"

const AdminEventPage = () => {
    const [events, setEvents] = useState<AdminEvent[]>([])
    const [isCreateFormVisible, setIsCreateFormVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<AdminEvent | undefined>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 10, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false })

    async function loadEvents(currentPage: number) {
        try {
            const result = await getAdminEvents(currentPage)
            setEvents(result.data)
            setPagination(result.pagination)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void loadEvents(page)
    }, [page])

    function handlePageChange(nextPage: number) {
        setIsLoading(true)
        setPage(nextPage)
    }

    async function refreshEvents() {
        const result = await getAdminEvents(page)
        setEvents(result.data)
        setPagination(result.pagination)
    }

    async function handleSave(input: EventInput) {
        setIsSubmitting(true)

        try {
            if (selectedEvent) {
                await updateAdminEvent(selectedEvent.id, input)
            } else {
                await createAdminEvent(input)
            }

            await refreshEvents()
            setSelectedEvent(undefined)
            setIsCreateFormVisible(false)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleCancel(event: AdminEvent) {
        const reason = window.prompt(`Why are you cancelling "${event.title}"?`)

        if (!reason?.trim()) {
            return
        }

        await deleteAdminEvent(event.id, reason.trim())
        await refreshEvents()
    }

    function showCreateForm() {
        setSelectedEvent(undefined)
        setIsCreateFormVisible(true)
    }

    function showEditForm(event: AdminEvent) {
        setSelectedEvent(event)
        setIsCreateFormVisible(true)
    }

    function showEventList() {
        setSelectedEvent(undefined)
        setIsCreateFormVisible(false)
    }

    return (
        <main className="max-w-4xl">
            <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl">Events</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Manage the experiences available to your attendees.</p>
                </div>
                <button
                    type="button"
                    onClick={isCreateFormVisible ? showEventList : showCreateForm}
                    className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
                    {isCreateFormVisible ? "View all events" : "Create event"}
                </button>
            </header>

            {
                isCreateFormVisible ?
                    <AdminEventForm
                        event={selectedEvent}
                        isSubmitting={isSubmitting}
                        onSubmit={handleSave}
                        onCancel={showEventList}
                    />
                    : isLoading
                        ?
                        <p className="border-b border-line py-5 text-sm text-muted">
                            Loading events...
                        </p>
                        : <AdminEventList
                            events={events}
                            pagination={pagination}
                            onEdit={showEditForm}
                            onCancel={handleCancel}
                            onPageChange={handlePageChange}
                        />
            }
        </main>
    )
}

export default AdminEventPage
