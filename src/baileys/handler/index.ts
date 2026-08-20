import { askAssistant } from "@/baileys/handler/assistant.js";
import { fetchBusinessProducts } from "@/integrations/products.js";
import {
  createOrder,
  getBusinessById,
  getBusinessPrompts,
  getCustomerMessages,
  insertMessages,
  upsertCustomer,
  updateActiveOrder,
  updateCustomer,
} from "@/supabase/index.js";
import type { Connection } from "@/baileys/types.js";

async function handleCustomerMessage(
  businessesId: string,
  connection: Connection,
  message: string,
  phone: string,
) {
  const business = await getBusinessById(businessesId);
  const prompts = await getBusinessPrompts(businessesId);
  const customer = await upsertCustomer(businessesId, phone);
  const messages = await getCustomerMessages(customer.id);
  const products = await fetchBusinessProducts(businessesId);

  const response = await askAssistant({
    business,
    prompts,
    customer,
    messages,
    products,
    message,
  });

  await connection.socket.sendMessage(phone, {
    text: response.message,
  });

  await insertMessages([
    {
      customer_id: customer.id,
      role: "user",
      content: message
    },
    {
      customer_id: customer.id,
      role: "assistant",
      content: response.message
    },
  ]);

  if (response.customer_updates) {
    await updateCustomer(customer.id, response.customer_updates);
  }

  if (response.order_action === "new") {
    await createOrder(customer.id);
  } else if (response.order_action === "confirm" && response.order_revenue) {
    await updateActiveOrder(customer.id, response.order_revenue);
  }
}

export { handleCustomerMessage };
