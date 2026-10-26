
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed."
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    return res.status(503).json({
      error: "AI is not configured yet. Please try again later."
    });
  }

  const { destination, days, interests, budget, travelers } =
    req.body || {};

  if (
    typeof destination !== "string" ||
    destination.trim().length < 2 ||
    destination.length > 120 ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > 30
  ) {
    return res.status(400).json({
      error: "Enter a destination and a trip length of 1–30 days."
    });
  }

  const prompt = `
You are the AI travel planning assistant for TravelMate 360.

Create a practical travel itinerary using these details:
Destination: ${destination.trim()}
Duration: ${days} days
Interests: ${String(interests || "General sightseeing").slice(0, 500)}
Budget: ${String(budget || "Not specified").slice(0, 100)}
Travelers: ${String(travelers || "Not specified").slice(0, 100)}

For every day, provide:
- A morning, afternoon, and evening schedule
- Suggested attractions and activities
- Estimated travel time between stops where reasonably known
- Food suggestions and rest breaks
- Estimated daily expenses where possible

Also include a trip summary, budget breakdown, practical
transport suggestions, and booking or safety reminders.

Use clear headings and a readable timetable.
Do not invent confirmed bookings, live opening hours,
ticket prices, weather, or real-time transport information.
Label estimates clearly and tell travelers to verify details.
If information is uncertain, say so.
`;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          input: prompt,
          max_output_tokens: 3500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("AI provider error:", data.error?.type || response.status);

      return res.status(502).json({
        error: "The AI could not create your itinerary. Please try again."
      });
    }

    const itinerary = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    if (!itinerary) {
      return res.status(502).json({
        error: "The AI returned no itinerary. Please try again."
      });
    }

    return res.status(200).json({ itinerary });
  } catch (error) {
    console.error("Trip planning request failed.");

    return res.status(500).json({
      error: "Something went wrong while creating your trip."
    });
  }
}
