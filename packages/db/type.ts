import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type * as schema from "./src/schema";

export type Database = NodePgDatabase<typeof schema>;
