const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_USER_EMAIL || "admin@patchproof.dev";
  const password = process.env.SEED_USER_PASSWORD || "PatchProofAdminPassword123!";

  console.log(`Seeding demo user: ${email}...`);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "PatchProof Admin",
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email,
      name: "PatchProof Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`[SEED SUCCESS] Created or updated demo user: ${user.email} (ID: ${user.id}, Role: ${user.role})`);
  console.log("No fake findings, runs, or reports seeded. All future verification records will derive from real execution.");
}

main()
  .catch((e) => {
    console.error("Seed execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
