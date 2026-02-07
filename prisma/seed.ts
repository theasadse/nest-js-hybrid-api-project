import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: "admin123", // In production, hash this password
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Create regular users
  const users = await prisma.user.createMany({
    data: [
      {
        email: "john@example.com",
        name: "John Doe",
        password: "password123",
        role: Role.USER,
      },
      {
        email: "jane@example.com",
        name: "Jane Smith",
        password: "password123",
        role: Role.USER,
      },
    ],
  });

  console.log(`✅ Created ${users.count} regular users`);

  // Create some posts
  const john = await prisma.user.findUnique({
    where: { email: "john@example.com" },
  });

  if (john) {
    await prisma.post.createMany({
      data: [
        {
          title: "Getting Started with NestJS",
          content: "NestJS is a progressive Node.js framework...",
          published: true,
          authorId: john.id,
        },
        {
          title: "Prisma with PostgreSQL",
          content: "Learn how to use Prisma ORM with PostgreSQL...",
          published: true,
          authorId: john.id,
        },
        {
          title: "Draft Post",
          content: "This is a draft post...",
          published: false,
          authorId: john.id,
        },
      ],
    });

    console.log("✅ Created sample posts");
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
