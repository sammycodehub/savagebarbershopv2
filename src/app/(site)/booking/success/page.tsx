import { SuccessView } from "./SuccessView";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; reference?: string }>;
}) {
  const { booking, reference } = await searchParams;

  if (!booking) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-neon-silver">No booking found.</p>
        <a href="/booking" className="mt-4 inline-block text-savage-gold underline">
          Book a cut
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <SuccessView bookingId={booking} reference={reference} />
    </main>
  );
}
