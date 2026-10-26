
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing.");

    return res.status(503).json({
      error: "Gemini is not configured. Check the Vercel environment variables."
    });
  }

  const { destination, days, interests, budget, travelers } =
    req.body || {};

  if (
    typeof destination !== "string" ||
    destination.trim().length < 2 ||
    destination.length > 120 ||
    !Number.isInteger(Number(days)) ||
    Number(days) < 1 ||
    Number(days) > 14
  ) {
    return res.status(400).json({
      error: "Enter a destination and a trip length of 1–14 days."
    });
  }

  const prompt = `
You are the AI travel planning assistant for TravelMate 360.

Create a practical itinerary using these details:
Destination: ${destination.trim()}
Duration: ${Number(days)} days
Interests: ${String(interests || "General sightseeing").slice(0, 500)}
Budget: ${String(budget || "Not specified").slice(0, 100)}
Travelers: ${String(travelers || "Not specified").slice(0, 100)}

For each day, include morning, afternoon and evening plans,
attractions, activities, rest breaks, food suggestions,
and approximate travel times where reasonably known.

Also include a trip summary, estimated budget breakdown,
transport suggestions, and booking and safety reminders.

Use clear headings and readable formatting.
Never claim bookings are confirmed or invent live opening
hours, ticket prices, weather, or real-time transport details.
Clearly label estimates and advise travelers to verify them.
`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 3500,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

   if (!response.ok) {
  console.error("Gemini API error:", JSON.stringify({
    httpStatus: response.status,
    status: data.error?.status,
    message: data.error?.message
  }));

  let message = "Gemini request failed. Check the Vercel logs.";

  if (response.status === 400 || response.status === 401) {
    message = "Gemini rejected the request or API key. Check the Vercel logs.";
  } else if (response.status === 403) {
    message = "Gemini access is restricted. Check the API key and project permissions.";
  } else if (response.status === 404) {
    message = "The Gemini model or API endpoint was not found.";
  } else if (response.status === 429) {
    message = "Gemini usage limit reached. Please wait and try again.";
  }

  return res.status(502).json({ error: message });
}

    const itinerary = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("\n")
      .trim();

    if (!itinerary) {
      return res.status(502).json({
        error: "Gemini returned no itinerary. Please try again."
      });
    }

    return res.status(200).json({ itinerary });
  } catch (error) {
    console.error("Trip planning request failed:", error.message);

    return res.status(500).json({
      error: "A server error occurred while creating your itinerary."
    });
  }
}
