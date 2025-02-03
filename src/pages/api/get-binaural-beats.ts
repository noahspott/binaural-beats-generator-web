import { z } from "zod";
import type { APIRoute } from "astro";
import { AudioGenerator } from "@/lib/audio-generator";
import { rateLimiter } from "@/lib/rate-limiter";
import { AudioSegmentManager } from '@/lib/audio-segments';
import { getClosestFrequencies, loadAudioSegment } from '@/lib/audio-utils';

// Define the schema for request validation
const BinauralBeatSchema = z.object({
  baseFreq: z
    .number()
    .min(20, "Base frequency must be at least 20 Hz")
    .max(20000, "Base frequency cannot exceed 20,000 Hz"),
  binauralFreq: z
    .number()
    .min(0.5, "Binaural beat frequency must be at least 0.5 Hz")
    .max(40, "Binaural beat frequency cannot exceed 40 Hz"),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .max(15, "Free tier limited to 15 minutes"),
});

// Create a singleton instance
const audioManager = new AudioSegmentManager();

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Check rate limit
    const isAllowed = await rateLimiter.isAllowed(clientAddress);
    if (!isAllowed) {
      const remainingTime = await rateLimiter.getRemainingTime(clientAddress);
      const formattedTime = rateLimiter.formatRemainingTime(remainingTime);
      
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          details: `Daily limit reached. Please try again in ${formattedTime}.`,
        }),
        {
          status: 429, // Too Many Requests
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(remainingTime / 1000).toString(),
          },
        }
      );
    }

    // Log the incoming request
    console.log("Received request");
    
    // Parse request body
    const body = await request.json();
    console.log("Request body:", body);
    
    // Convert strings to numbers and validate
    const parsedData = {
      baseFreq: Number(body.baseFreq),
      binauralFreq: Number(body.binauralFreq),
      duration: Number(body.duration),
    };
    console.log("Parsed data:", parsedData);

    // Validate request data
    const result = BinauralBeatSchema.safeParse(parsedData);

    if (!result.success) {
      console.log("Validation failed:", result.error.issues);
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: result.error.issues,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { base, beat } = getClosestFrequencies(
      result.data.baseFreq,
      result.data.binauralFreq
    );

    // Load the pre-generated segment
    const audioBuffer = loadAudioSegment(base, beat);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": `attachment; filename="binaural-${base}-${beat}.wav"`,
      },
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}; 