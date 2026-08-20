import type { Product } from "@/integrations/types.js";
import type {
  Businesses,
  Prompts,
  Customers,
  Messages,
} from "@/supabase/index.js";

interface AskAssistantParams {
  business: Businesses["Row"];
  prompts: Prompts["Row"][];
  customer: Customers["Row"];
  messages: Messages["Row"][];
  products: Product[];
  message: string;
}

interface AssistantResponse {
  message: string;
  customer_updates?: {
    name?: string;
    city?: string;
    country?: string;
  };
  order_action: "none" | "new" | "confirm";
  order_revenue?: number;
}

const responseFormat = {
  type: "object",
  properties: {
    message: { type: "string" },
    customer_updates: {
      type: "object",
      properties: {
        name: { type: "string" },
        city: { type: "string" },
        country: { type: "string" },
      },
    },
    order_action: {
      type: "string",
      enum: ["none", "new", "confirm"],
    },
    order_revenue: { type: "number" },
  },
  required: ["message", "order_action"],
};

async function askAssistant({
  business,
  prompts,
  customer,
  messages,
  products,
  message,
}: AskAssistantParams) {
  const systemPrompt = `
You are a helpful working agent for The Business ${business.name}.
You are assisting the customer with the id ${customer.id} with their inquiries.
You are currently texting with the customer, not the business owner.

Current information about the customer:
- Name: ${customer.name || "not provided"}
- City: ${customer.city || "not provided"}
- Country: ${customer.country || "not provided"}

Try to gather any of these missing pieces of information naturally during the conversation.

${
  products.length === 0
    ? "No products are currently available for this business."
    : `Here are the currently available products for this business:
${JSON.stringify(products)}`
}

Please respond to the customer's message in a concise and helpful manner.
Do not make up any information about the products or the business.

${JSON.stringify(prompts.map((p) => p.content).join("\n"))}
`;

  const res = await fetch(`${process.env.OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages.map(({ role, content }) => ({ role, content })),
        {
          role: "user",
          content: message,
        },
      ],
      stream: false,
      format: responseFormat,
    }),
  });

  if (!res.ok) {
    const error = await res.text();

    throw new Error(`Agent request failed: ${res.status} - ${error}`);
  }

  const data = (await res.json()) as any;
  return JSON.parse(data.message.content) as AssistantResponse;
}

export { askAssistant };
