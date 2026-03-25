import Anthropic from "@anthropic-ai/sdk";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
  })
);

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Full product catalog extracted from the store
const PRODUCT_CATALOG = `
CLEANSERS:
- Hydra-Silk Cleanser (DermaFix) — Gentle daily cleanser for all skin types | 200ml | R425
- Active Cleansing Gel (DermaFix) — Alpha & beta hydroxy acid cleanser | 200ml | R425
- Calming Microfoam Cleanser (DermaFix) — Refresh and purify sensitive skin | 100ml | R357
- Gentle Cleansing Gel (DermaFix) — Calming botanical cleanser for all types | 157ml | R380
- Brightening Cleanser (DermaFix) — Minimises uneven skin tone & hyperpigmentation | 157ml | R380 [BESTSELLER]
- Azelaic Cleansing Gel (DermaFix) — Powered by azelaic acid for problem skin | 157ml | R380 [NEW]
- MD Mandelic Cleanser (MD Clinical) — Clinical strength exfoliation, hyperpigmentation, acne | 200ml | R473 [CLINICAL]

TONERS:
- Revitalising Toner (DermaFix) — Botanical extracts & anti-oxidant | 150ml | R362
- Brightening Toner (DermaFix) — Increases skin evenness, colour & tone | 150ml | R362
- C-Breeze (DermaFix) — Functional vitamin C mist for hydration | 150ml | R400
- MD Mandelic Toner (MD Clinical) — Clinical strength — acne, rejuvenation | 150ml | R383 [CLINICAL]

SERUMS:
- ACC Retinol+ (ActiveCellCeuticals) — Micro-encapsulated retinol for cell renewal | 57ml | R935 [BESTSELLER]
- ACC Vitamin C (ActiveCellCeuticals) — Liposomal serum for brightening & protection | 57ml | R698
- ACC Hyaluronic Gel (ActiveCellCeuticals) — Binds water into epidermis & dermis | 57ml | R698 [BESTSELLER]
- ACC Copper (ActiveCellCeuticals) — Intensive collagen repair peptide | 57ml | R698
- ACC Tranexamic Gel (ActiveCellCeuticals) — Inhibits melanin production | 57ml | R698 [NEW]
- Collagen Conformer (Advanced) — Tetra peptides — flash lifting effect | 57ml | R935
- Hyalu7 Boost (DermaFix) — Hyaluronic concentrate for plumping | 30ml | R830
- B3 Boost (DermaFix) — Niacinamide concentrate for barrier & tone | 30ml | R830 [NEW]
- Vitamin C Serum (DermaFix) — Skin rescue — lightweight daily antioxidant | 30ml | R614
- Ferulic+C+E (Advanced) — Anti-oxidant for hyperpigmentation & ageing | 50ml | R898
- Ceramide Complex (Advanced) — Stem cells — lipid barrier repair | 30ml | R693
- DermaBright (DermaFix) — Photo ageing, pigmentation & breakout corrective | 50ml | R782
- DeCeLeRate (Advanced) — Age reversal peptides for rejuvenation | 57ml | R924
- PowerDerm (Advanced) — Intensive anti-ageing stem cell complex | 57ml | R672
- Regenerate RX (Advanced) — Epidermal growth factors & anti-oxidants | 57ml | R767
- Resveratrol+ (Advanced) — High potency anti-oxidant | 57ml | R1029
- MelanoDerm (DermaFix) — Pigment reducing complex | 57ml | R830

MOISTURISERS:
- Bio-Effective Cream (DermaFix) — Rich cream for lipid-dry skin | 57ml | R704
- Bio-Hydrating Cream (DermaFix) — Lightweight hydrator for dehydrated skin | 57ml | R641 [BESTSELLER]
- Vitamin B Cream (DermaFix) — Balancing moisturiser for oily & problem skin | 57ml | R604
- VitaPlex-C Cream (DermaFix) — Protection for environmentally stressed skin | 57ml | R651
- Dermal Repair (DermaFix) — Multi-vitamin skin recovery, primer & perfector | 57ml | R625
- HydraSooth SOS (DermaFix) — Rescue & repair — redness reducing corrective | 125ml | R588 [BESTSELLER]

EYE CARE:
- Ceramide Eye Complex (DermaFix) — Ageless corrective with ceramide technology | 15ml | R467
- Corrective Eye Complex (DermaFix) — Stem cell technology for periorbital rejuvenation | 15ml | R562
- CircleLight (DermaFix) — Dark circle corrector | 15ml | R562
- RetinEye (DermaFix) — Retinaldehyde complex for fine lines | 15ml | R590 [NEW]

SUN CARE:
- DermaShield SPF40 (DermaFix) — Oil-free UVA/UVB high protection | 125ml | R494
- DermaShield SPF50 (DermaFix) — Water resistant UVA/UVB/HEV protection | 125ml | R494 [BESTSELLER]
- Tinted SPF 40 (DermaFix) — Corrective coverage UVA/UVB/HEV | 50ml | R473
- Tinted SPF 40 Dark (DermaFix) — Deeper shade corrective coverage | 50ml | R473
- BB Cream Light/Medium/Ultra/Bronzed/Mocha (DermaFix) — SPF20 BB creams | 40ml | R520 each
- MD SPF50 Sunscreen (MD Clinical) — Clinical strength water resistant | 57ml | R331 [CLINICAL]
- LipFix Balm SPF20 (DermaFix) — Protect, plump & perfect lip treatment | 15ml | R263

EXFOLIATORS:
- DermaPolish (DermaFix) — Enzymatic exfoliator | 100g | R425
- DermaPolish+ Charcoal (Advanced) — Activated charcoal enzymatic exfoliator | 50g | R497 [BESTSELLER]
- Brightening Wipes (DermaFix) — High potency brightening treatment wipes | 32 wipes | R819
- MD Mandelic Wipes (MD Clinical) — Clinical retexturising wipes | 32 wipes | R683 [CLINICAL]

MASQUES:
- Vitamin Therapy Masque (DermaFix) — Hydrating anti-oxidant nutrient masque | 125ml | R714
- Pumpkin Peptide Masque (DermaFix) — Thermo-enzyme boost heating masque | 125ml | R672
- Clari-Fine Clay Masque (DermaFix) — Deep cleansing gel-clay masque | 125ml | R609
- Skin ResQ (DermaFix) — Barrier protection with Q10 Plus | 125ml | R572
- Collagen Film Masque (DermaFix) — Seaweed marine collagen sheet masque | 25g | R126
- Hydrogel Collagen Masque (DermaFix) — Hydration, plumping & calming | 25g | R142
- Centella Masque (DermaFix) — Healing, hydrating centella asiatica | 25g | R155 [NEW]

MD CLINICAL TREATMENTS:
- MD Vitamin A Propionate — Clinical rejuvenation, hyperpigmentation, acne | 57ml | R1040
- MD Intensive Scar Repair — Clinical copper peptide complex | 75ml | R641
- MD Skin Clear — Clinical niacinamide for breakouts | 57ml | R830 [NEW]

BODY & SPECIALIST:
- DermaLift+ (Advanced) — Neck, decollete & bust firming | 157ml | R851
- BioHair (Specialist) — Revitalising peptide complex for hair | 100ml | R887
- Argan Oil (Specialist) — 100% natural Ecocert certified oil | 50ml | R599

KITS & FACIALS:
- Essentials Kit — Starter kit: cleanser, exfoliator, SPF, masque | 4 products | R1281
- At-home Anti-Ageing Facial — DermaPolish, Argan, Collagen, Retinol+, Vit Therapy | 5 products | R3558
- At-home Hydrating Facial — DermaPolish, Argan, Hyaluronic, HydraSooth | 4 products | R2260
- At-home SOS Repair Facial — Hydra-Silk, HydraSooth, Dermal Repair, Copper, Argan | 5 products | R2885
- At-home Deep Cleansing Facial — DermaBright, DermaPolish+, Copper, Clari-Fine | 4 products | R2174
- At-home Glow and Go Facial — Ferulic, DermaPolish+, Retinol+, HydraSooth | 4 products | R2636
- Winter Preparation Pack — DermaPolish, Hyalu7, Bio-Hydrating, Vit Therapy | 4 products | R2560
- Environmentally Stressed Facial — Brightening Wipes, DermaPolish+, Vit C, Pumpkin | 4 products | R2868
`;

const SYSTEM_PROMPT = `You are Sage, the AI Skin Consultant for Advanced Skin Solutions — an authorised DermaFix distributor based in South Africa. You are warm, knowledgeable, and professional.

Your role is to:
1. Help customers find the right skincare products from our catalog
2. Answer questions about skincare concerns (ageing, pigmentation, acne, hydration, sensitivity)
3. Suggest personalised routines based on skin type and concerns
4. Explain the benefits of specific ingredients (retinol, vitamin C, hyaluronic acid, niacinamide, etc.)
5. Guide customers on how to use products correctly (order of application, frequency, AM/PM)

Key facts about Advanced Skin Solutions:
- Official authorised DermaFix distributor
- 4,200+ clients treated
- 94% see results within 8 weeks
- Cosmeceutical-grade formulations (between cosmetics and pharmaceuticals)
- Free delivery on orders over R750
- Prices are in South African Rand (R)
- WhatsApp-based checkout available

Product ranges in our catalog:
- DermaFix: Core range, suitable for all skin types
- ActiveCellCeuticals (ACC): Advanced cell-targeting actives
- Advanced: High-potency corrective serums
- MD Clinical: Professional-strength treatments (stronger actives, recommend patch testing)
- Specialist: Targeted solutions (hair, body)

Our full product catalog:
${PRODUCT_CATALOG}

Guidelines:
- Always be helpful and empathetic — skincare can be personal
- Recommend 2-4 products at a time, not an overwhelming list
- Mention price ranges when recommending (prices in Rand)
- For MD Clinical products, note they are clinical strength and suggest a consultation
- If a customer seems ready to buy, encourage them to add to cart or contact via WhatsApp
- Keep responses concise (2-4 paragraphs max) unless a detailed routine is requested
- Do not make medical claims or diagnose skin conditions
- Do not discuss competitor products
- If asked about something outside skincare/our products, politely redirect`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

app.post("/api/chat", async (req: Request, res: Response): Promise<void> => {
  const { messages } = req.body as ChatRequest;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  // Validate message format
  const validRoles = new Set(["user", "assistant"]);
  for (const msg of messages) {
    if (!validRoles.has(msg.role) || typeof msg.content !== "string") {
      res.status(400).json({ error: "Invalid message format" });
      return;
    }
  }

  // Set up SSE streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const stream = client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
  } finally {
    res.end();
  }
});

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "Advanced Skin Solutions AI Consultant" });
});

const PORT = parseInt(process.env.PORT || "3001", 10);
app.listen(PORT, () => {
  console.log(`AI Skin Consultant API running on port ${PORT}`);
});
