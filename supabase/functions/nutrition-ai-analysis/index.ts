import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CartItem {
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface NutritionAnalysisRequest {
  items: CartItem[];
  preferences?: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { items, preferences } = (await req.json()) as NutritionAnalysisRequest;

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No items provided",
          suggestions: [],
          totals: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const totals = items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories * item.quantity,
        protein: acc.protein + item.protein * item.quantity,
        carbs: acc.carbs + item.carbs * item.quantity,
        fat: acc.fat + item.fat * item.quantity,
        fiber: acc.fiber + item.fiber * item.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const itemList = items
      .map((item) => `${item.quantity}x ${item.name}`)
      .join(", ");

    const prompt = `Analyze this meal order for nutrition and health. Provide constructive suggestions:

Items ordered: ${itemList}

Nutrition totals:
- Calories: ${totals.calories}
- Protein: ${totals.protein}g
- Carbs: ${totals.carbs}g
- Fat: ${totals.fat}g
- Fiber: ${totals.fiber}g

Customer preferences: ${preferences?.join(", ") || "None specified"}

Provide:
1. A brief nutritional assessment (2-3 sentences)
2. 2-3 specific health suggestions relevant to their order
3. Any dietary considerations or tips

Keep response concise and friendly.`;

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anthropic API error:", error);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestion =
      data.content[0].type === "text" ? data.content[0].text : "";

    return new Response(
      JSON.stringify({
        suggestion,
        totals,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          caloriesPerItem: item.calories,
          totalCalories: item.calories * item.quantity,
        })),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        suggestion:
          "Unable to analyze nutrition at this moment. Please try again later.",
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});