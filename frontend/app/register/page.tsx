import Link from "next/link"
import Header from "@/components/common/header"
import Footer from "@/components/common/footer"
import RegisterFormContainer from "@/components/auth/register-form-container"

export default function RegisterPage() {
    return (
        <div className="flex min-h-full flex-col bg-background">
            <Header />
            <main className="flex flex-1 items-center justify-center px-6 py-16 lg:py-24">
                <section className="w-full max-w-md">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">Join the community</p>
                    <h1 className="m-0 text-5xl font-semibold leading-none tracking-[-0.07em] text-foreground">Create your account</h1>
                    <p className="mt-5 text-sm leading-6 text-muted">Save the events that make your calendar better.</p>
                    <RegisterFormContainer />
                    <p className="mt-8 text-center text-sm text-muted">Already have an account? <Link className="font-semibold text-foreground hover:text-accent-dark" href="/login">Log in</Link></p>
                </section>
            </main>
            <Footer />
        </div>
    )
}
