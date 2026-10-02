// The public contact surface uses email links. Retire the unused relay,
// which could log message excerpts or forward data to a configured third party.
export async function onRequestPost(): Promise<Response> {
  return Response.json(
    {
      error:
        "The contact API is retired. Email hello@securepride.org without sensitive records.",
    },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
