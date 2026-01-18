import { router } from "../index";
import { playgroundRouter } from "./playground";

export const appRouter = router({
  playground: playgroundRouter,
});

export type AppRouter = typeof appRouter;
