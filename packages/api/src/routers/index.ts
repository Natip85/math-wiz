import { router } from "../index";
import { adminRouter } from "./admin";
import { apiClientsRouter } from "./api-clients";
import { playgroundRouter } from "./playground";

export const appRouter = router({
  playground: playgroundRouter,
  admin: adminRouter,
  apiClients: apiClientsRouter,
});

export type AppRouter = typeof appRouter;
