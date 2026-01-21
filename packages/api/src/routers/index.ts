import { router } from "../index";
import { adminRouter } from "./admin";
import { playgroundRouter } from "./playground";

export const appRouter = router({
  playground: playgroundRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
