import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import VerifyEmailContainer from "@/components/auth/verify-email-container";

type VerifyPageProps = {
    searchParams: Promise<{ token?: string | string[] }>;
};

export const instant = false;

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
    const params = await searchParams;
    const token = params.token as string | undefined;

    return (
        <div className="flex min-h-full flex-col bg-background">
            <Header />
            <main className="flex flex-1 items-center justify-center px-6 py-16 lg:py-24">
                <section className="w-full max-w-md">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">Email verification</p>
                    <h1 className="m-0 text-5xl font-semibold leading-none tracking-[-0.07em] text-foreground">Verify your email</h1>
                    <p className="mt-5 text-sm leading-6 text-muted">Confirming your email keeps your EventBook account secure.</p>
                    <VerifyEmailContainer token={token} />
                </section>
            </main>
            <Footer />
        </div>
    );
}
