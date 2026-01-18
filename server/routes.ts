import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";

interface AnalyzeRequest {
  imageBase64: string;
}

interface AnalysisResult {
  roastLevel: string;
  temperature: string;
  temperatureRange: string;
  notes: string;
}

async function analyzeWithAbacus(imageBase64: string): Promise<AnalysisResult> {
  const apiKey = process.env.ABACUS_API_KEY;

  if (!apiKey) {
    throw new Error("ABACUS_API_KEY is not configured");
  }

  const prompt = `You are a coffee roast level expert. Analyze this image of coffee beans and determine the roast level.

Classify the roast into one of these categories:
- Light (light tan/cinnamon color, no oil on surface)
- Medium-Light (medium brown, slight sweetness, no oil)
- Medium (rich brown, balanced, no oil)
- Medium-Dark (dark brown, some oil, bittersweet)
- Dark (very dark/black, oily surface, bitter)

Based on the roast level, provide the optimal water temperature range for Aeropress brewing:
- Light roast: 92-96°C (197-205°F)
- Medium-Light roast: 90-94°C (194-201°F)
- Medium roast: 85-90°C (185-194°F)
- Medium-Dark roast: 82-88°C (180-190°F)
- Dark roast: 80-85°C (176-185°F)

Respond in this exact JSON format:
{
  "roastLevel": "the roast level category",
  "temperature": "the midpoint temperature in Celsius",
  "temperatureRange": "the full temperature range",
  "notes": "brief 1-2 sentence brewing tip specific to this roast level for Aeropress"
}`;

  const imageUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  try {
    const response = await fetch("https://api.abacus.ai/v0/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Abacus API error:", errorText);
      throw new Error(`Abacus API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from Abacus API");
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse response from Abacus API");
    }

    const result = JSON.parse(jsonMatch[0]) as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Error calling Abacus API:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/analyze", async (req: Request, res: Response) => {
    try {
      const { imageBase64 } = req.body as AnalyzeRequest;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const result = await analyzeWithAbacus(imageBase64);

      return res.json(result);
    } catch (error) {
      console.error("Analysis error:", error);
      const message = error instanceof Error ? error.message : "Analysis failed";
      return res.status(500).json({ error: message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
