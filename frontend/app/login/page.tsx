import Link from "next/link";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import LoginFormContainer from "@/components/auth/login-form-container";

export default function LoginPage() {
    return (
        <div className="flex min-h-full flex-col bg-background">
            <Header />
            <main className="flex flex-1 items-center justify-center px-6 py-16 lg:py-24">
                <section className="w-full max-w-md">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">Welcome back</p>
                    <h1 className="m-0 text-5xl font-semibold leading-none tracking-[-0.07em] text-foreground">Log in to EventBook</h1>
                    <p className="mt-5 text-sm leading-6 text-muted">Keep track of the events you want to experience.</p>
                    <LoginFormContainer />
                    <p className="mt-8 text-center text-sm text-muted">New to EventBook? <Link className="font-semibold text-foreground hover:text-accent-dark" href="/register">Create an account</Link></p>
                </section>
            </main>
            <Footer />
        </div>
    );
}
