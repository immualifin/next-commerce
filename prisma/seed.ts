import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import prisma from "../lib/prisma";

async function seed() {
  const email = "admin@example.com";
  const password = "admin123456";
  const name = "Super Admin";

  console.log("🌱 Seeding superadmin...");

  // Hash password with Better Auth's scrypt
  const hashed = await hashPassword(password);

  // Create User
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, rule: "superadmin", emailVerified: true },
  });

  // Create Account (credential)
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: email,
      },
    },
    update: { password: hashed },
    create: {
      userId: user.id,
      accountId: email,
      providerId: "credential",
      password: hashed,
    },
  });

  console.log("✅ Superadmin ready:");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     superadmin`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
