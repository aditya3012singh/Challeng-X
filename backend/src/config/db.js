// prisma connecition setup

import { PrismaClient } from "@prisma/client";

class Database {
	static client = new PrismaClient();
}

export default Database;

