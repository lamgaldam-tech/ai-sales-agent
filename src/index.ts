import "dotenv/config";
import { app } from "@/api/index.js";
import {
  getBusinessesIds,
  subscribeToBusinessesChanges,
} from "@/supabase/index.js";
import {
  createBaileysConnection,
  removeBaileysConnection,
} from "@/baileys/index.js";

async function initializeConnections() {
  const businessIds = await getBusinessesIds();
  Promise.all(businessIds.map(({ id }) => createBaileysConnection(id)));
  subscribeToBusinessesChanges(
    (businessId) => createBaileysConnection(businessId),
    (businessId) => removeBaileysConnection(businessId),
  );
}

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  initializeConnections().catch(console.error);
});
