import Header from "@/components/common/header"
import Footer from "@/components/common/footer"
import ProfileBookings from "@/components/profile/profile-bookings"

export default function ProfilePage() {
    return (
        <div className="flex min-h-full flex-col">
            <Header />
            <ProfileBookings />
            <Footer />
        </div>
    )
}
