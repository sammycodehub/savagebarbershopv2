import { CheckoutForm } from "./CheckoutForm";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking } = await searchParams;

  if (!booking) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-neon-silver">No booking in progress.</p>
        <a href="/booking" className="mt-4 inline-block text-savage-gold underline">
          Start a new booking
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <CheckoutForm bookingId={booking} />
    </main>
  );
}
