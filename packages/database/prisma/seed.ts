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

  // Seed complaints + tickets so dashboards have data
  const seededUsers = await prisma.user.findMany({
    where: { institutionId: institution.id },
    select: { id: true, email: true, role: true, departmentId: true },
  });

  const studentUser = seededUsers.find(u => u.role === UserRole.STUDENT)!;
  const staffUser   = seededUsers.find(u => u.role === UserRole.ADMIN_STAFF)!;

  const complaintSeeds = [
    { title: "Grade appeal for CSC301", description: "My grade was recorded incorrectly for CSC301 final exam. I scored 74 but 64 was entered.", category: "Academic", status: "SUBMITTED" as const },
    { title: "Library access denied", description: "Unable to access the e-library portal since last week despite having a valid student ID.", category: "Facilities", status: "UNDER_REVIEW" as const },
    { title: "Missing coursework marks", description: "Coursework submission for CSC401 was not recorded. I have proof of submission.", category: "Academic", status: "IN_PROGRESS" as const },
    { title: "Hostel maintenance issue", description: "Bathroom fixtures in Block C room 14 have been broken for over two weeks with no response.", category: "Facilities", status: "RESOLVED" as const },
    { title: "Scholarship application rejected", description: "My scholarship application was rejected without reason. I meet all stated criteria.", category: "Financial", status: "ASSIGNED" as const },
  ];

  for (let i = 0; i < complaintSeeds.length; i++) {
    const cs = complaintSeeds[i];
    const refNumber = `CLN-2026-${String(i + 1).padStart(5, "0")}`;

    const existing = await prisma.complaint.findFirst({ where: { institutionId: institution.id, referenceNumber: refNumber } });
    if (existing) continue;

    const complaint = await prisma.complaint.create({
      data: {
        institutionId: institution.id,
        departmentId: csDept.id,
        submitterId: studentUser.id,
        referenceNumber: refNumber,
        title: cs.title,
        description: cs.description,
        category: cs.category,
        status: cs.status,
        isAnonymous: false,
      },
    });

    await prisma.timelineEvent.create({
      data: {
        complaintId: complaint.id,
        actorId: studentUser.id,
        eventType: "COMPLAINT_SUBMITTED",
        description: "Complaint submitted",
      },
    });

    // Create a ticket for non-draft, non-submitted complaints
    if (!["DRAFT", "SUBMITTED"].includes(cs.status)) {
      await prisma.ticket.create({
        data: {
          institutionId: institution.id,
          departmentId: csDept.id,
          complaintId: complaint.id,
          assigneeId: staffUser.id,
          referenceNumber: `TKT-2026-${String(i + 1).padStart(5, "0")}`,
          title: cs.title,
          description: cs.description,
          priority: i % 2 === 0 ? "HIGH" : "MEDIUM",
          severity: "MODERATE",
          status: cs.status === "RESOLVED" ? "RESOLVED" : cs.status === "IN_PROGRESS" ? "IN_PROGRESS" : "ASSIGNED",
          slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          slaBreached: false,
        },
      });
    }
  }

  console.log("✅ Seed complete!");
  console.log(`   Institution: ${institution.name} (${institution.slug})`);
  console.log(`   Departments: ${departments.length}`);
  console.log(`   Users: ${users.length}`);
  console.log(`   Complaints: ${complaintSeeds.length}`);
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
