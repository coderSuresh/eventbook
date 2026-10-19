"use client"

import type { FormEvent } from "react"
import type { AdminEvent, EventInput } from "@/services/admin.service"

type AdminEventFormProps = {
    event?: AdminEvent
    isSubmitting: boolean
    onSubmit: (input: EventInput) => Promise<void>
    onCancel: () => void
}

function toDateTimeLocal(date?: string) {
    if (!date) {
        return ""
    }

    const value = new Date(date)
    const pad = (part: number) => String(part).padStart(2, "0")

    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`
}

export default function AdminEventForm({ event, isSubmitting, onSubmit, onCancel }: AdminEventFormProps) {
    async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
        formEvent.preventDefault()
        const formData = new FormData(formEvent.currentTarget)

        await onSubmit({
            title: String(formData.get("title")),
            description: String(formData.get("description")),
            date: String(formData.get("date")),
            venue: String(formData.get("venue")),
            totalSeats: Number(formData.get("totalSeats")),
        })
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-line bg-white/55">
            <div className="border-b border-line bg-panel/55 px-6 py-5 sm:px-8">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">{event ? "Edit event" : "Create an event"}</h2>
                <p className="mt-1 text-sm text-muted">{event ? "Update the details attendees see on this event." : "Add the details attendees need to find and book this experience."}</p>
            </div>
            <form className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2" htmlFor="title">
                    Event name
                    <input type="text" id="title" name="title" defaultValue={event?.title} placeholder="e.g. Hacktoberfest In-person Meetup" required className="rounded-lg border border-line bg-background p-4 outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20" />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="date">
                    Date and time
                    <input type="datetime-local" id="date" name="date" defaultValue={toDateTimeLocal(event?.date)} required className="rounded-lg border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20" />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="totalSeats">
                    Capacity
                    <input type="number" id="totalSeats" name="totalSeats" min="1" step="1" defaultValue={event?.totalSeats} placeholder="e.g. 250" required className="rounded-lg border border-line bg-background px-4 py-3 font-normal outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20" />
                    <span className="text-xs font-normal text-muted">Maximum number of attendees.</span>
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2" htmlFor="venue">
                    Location
                    <input type="text" id="venue" name="venue" defaultValue={event?.venue} placeholder="e.g. DDI Banquet, Buddhanagar" required className="rounded-lg border border-line bg-background px-4 py-3 font-normal outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20" />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold sm:col-span-2" htmlFor="description">
                    Description
                    <textarea id="description" name="description" rows={6} defaultValue={event?.description} placeholder="Tell attendees what makes this event worth showing up for..." required className="resize-y rounded-lg border border-line bg-background px-4 py-3 font-normal leading-6 outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/20" />
                </label>

                <div className="flex flex-col-reverse gap-4 border-t border-line pt-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-end">
                    <button type="button" onClick={onCancel} className="rounded-full px-6 py-3 text-sm font-semibold text-muted transition hover:bg-panel hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Saving..." : event ? "Save changes" : "Create event"}</button>
                </div>
            </form>
        </section>
    )
}
