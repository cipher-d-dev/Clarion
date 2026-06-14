import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Password123!";

async function main() {
  console.log("🌱 Seeding Clarion database...");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const institution = await prisma.institution.upsert({
    where: { slug: "unilag-demo" },
    update: {},
    create: {
      name: "University of Lagos Demo",
      slug: "unilag-demo",
      domain: "unilag-demo.clarion.app",
      isActive: true,
    },
  });

  const campus = await prisma.campus.upsert({
    where: {
      institutionId_code: {
        institutionId: institution.id,
        code: "MAIN",
      },
    },
    update: {},
    create: {
      institutionId: institution.id,
      name: "Main Campus",
      code: "MAIN",
      address: "Akoka, Lagos, Nigeria",
    },
  });

  const departments = await Promise.all([
    prisma.department.upsert({
      where: {
        institutionId_code: { institutionId: institution.id, code: "CS" },
      },
      update: {},
      create: {
        institutionId: institution.id,
        campusId: campus.id,
        name: "Computer Science",
        code: "CS",
        description: "Department of Computer Science",
      },
    }),
    prisma.department.upsert({
      where: {
        institutionId_code: { institutionId: institution.id, code: "ENG" },
      },
      update: {},
      create: {
        institutionId: institution.id,
        campusId: campus.id,
        name: "Engineering",
        code: "ENG",
        description: "Faculty of Engineering",
      },
    }),
    prisma.department.upsert({
      where: {
        institutionId_code: { institutionId: institution.id, code: "ADMIN" },
      },
      update: {},
      create: {
        institutionId: institution.id,
        campusId: campus.id,
        name: "Administration",
        code: "ADMIN",
        description: "Central Administration",
      },
    }),
  ]);

  const [csDept, _engDept, adminDept] = departments;

  const users = [
    {
      email: "student@unilag-demo.clarion.app",
      firstName: "Ada",
      lastName: "Okonkwo",
      role: UserRole.STUDENT,
      matricNo: "CS/2021/001",
      departmentId: csDept.id,
    },
    {
      email: "lecturer@unilag-demo.clarion.app",
      firstName: "Emeka",
      lastName: "Nwosu",
      role: UserRole.LECTURER,
      staffId: "LEC-001",
      departmentId: csDept.id,
    },
    {
      email: "staff@unilag-demo.clarion.app",
      firstName: "Funke",
      lastName: "Adeyemi",
      role: UserRole.ADMIN_STAFF,
      staffId: "STF-001",
      departmentId: adminDept.id,
    },
    {
      email: "depthead@unilag-demo.clarion.app",
      firstName: "Ibrahim",
      lastName: "Bello",
      role: UserRole.DEPT_HEAD,
      staffId: "DH-001",
      departmentId: csDept.id,
    },
    {
      email: "mgmt@unilag-demo.clarion.app",
      firstName: "Chioma",
      lastName: "Eze",
      role: UserRole.INSTITUTION_MGMT,
      staffId: "MGMT-001",
      departmentId: adminDept.id,
    },
    {
      email: "superadmin@clarion.app",
      firstName: "Clarion",
      lastName: "Admin",
      role: UserRole.SUPER_ADMIN,
      staffId: "SA-001",
      departmentId: null,
    },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: { passwordHash },
      create: {
        ...userData,
        passwordHash,
        institutionId:
          userData.role === UserRole.SUPER_ADMIN ? null : institution.id,
        campusId:
          userData.role === UserRole.SUPER_ADMIN ? null : campus.id,
        isActive: true,
        emailVerified: true,
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log(`   Institution: ${institution.name} (${institution.slug})`);
  console.log(`   Departments: ${departments.length}`);
  console.log(`   Users: ${users.length}`);
  console.log(`   Default password: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
