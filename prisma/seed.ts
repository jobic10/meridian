import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "meridian123";

function daysFrom(base: Date, offset: number, hour = 9, minute = 0) {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function yearsAgo(base: Date, years: number, month: number, day: number) {
  return new Date(base.getFullYear() - years, month - 1, day);
}

async function main() {
  const today = new Date();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("Clearing existing data…");
  await prisma.auditLog.deleteMany();
  await prisma.labResult.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding staff accounts…");
  const [admin, drAdeyemi, drChukwu, nurseOkafor, records, pharmacist] =
    await Promise.all([
      prisma.user.create({
        data: {
          name: "Adaeze Nwachukwu",
          username: "admin",
          email: "adaeze.nwachukwu@ilera.example",
          passwordHash,
          role: "ADMIN",
          status: "ACTIVE",
        },
      }),
      prisma.user.create({
        data: {
          name: "Dr. Tunde Adeyemi",
          username: "dr.adeyemi",
          email: "tunde.adeyemi@ilera.example",
          passwordHash,
          role: "DOCTOR",
          specialisation: "General Medicine",
          status: "ACTIVE",
        },
      }),
      prisma.user.create({
        data: {
          name: "Dr. Ifeoma Chukwu",
          username: "dr.chukwu",
          email: "ifeoma.chukwu@ilera.example",
          passwordHash,
          role: "DOCTOR",
          specialisation: "Paediatrics",
          status: "ACTIVE",
        },
      }),
      prisma.user.create({
        data: {
          name: "Ngozi Okafor",
          username: "n.okafor",
          email: "ngozi.okafor@ilera.example",
          passwordHash,
          role: "NURSE",
          status: "ACTIVE",
        },
      }),
      prisma.user.create({
        data: {
          name: "Bimpe Lawal",
          username: "records",
          email: "bimpe.lawal@ilera.example",
          passwordHash,
          role: "RECORDS_OFFICER",
          status: "ACTIVE",
        },
      }),
      prisma.user.create({
        data: {
          name: "Musa Bello",
          username: "pharm.bello",
          email: "musa.bello@ilera.example",
          passwordHash,
          role: "PHARMACIST",
          status: "ACTIVE",
        },
      }),
    ]);

  // A second, inactive account to make admin's staff table feel real.
  await prisma.user.create({
    data: {
      name: "Kunle Fashola",
      username: "k.fashola",
      email: "kunle.fashola@ilera.example",
      passwordHash,
      role: "NURSE",
      status: "INACTIVE",
    },
  });

  console.log("Seeding patients…");
  const patientSeeds = [
    { firstName: "Chidinma", lastName: "Okonkwo", gender: "Female", dob: yearsAgo(today, 34, 3, 12), bloodGroup: "O+", allergies: "Penicillin", phone: "0803 214 7765" },
    { firstName: "Emeka", lastName: "Umeh", gender: "Male", dob: yearsAgo(today, 58, 7, 2), bloodGroup: "A+", allergies: null, phone: "0805 662 1190" },
    { firstName: "Aisha", lastName: "Mohammed", gender: "Female", dob: yearsAgo(today, 27, 11, 19), bloodGroup: "B+", allergies: null, phone: "0906 331 8842" },
    { firstName: "Tobiloba", lastName: "Ogunleye", gender: "Male", dob: yearsAgo(today, 6, 1, 30), bloodGroup: "O-", allergies: "Sulfa drugs", phone: "0701 458 3320" },
    { firstName: "Grace", lastName: "Effiong", gender: "Female", dob: yearsAgo(today, 45, 9, 8), bloodGroup: "AB+", allergies: null, phone: "0813 902 4471" },
    { firstName: "Ibrahim", lastName: "Suleiman", gender: "Male", dob: yearsAgo(today, 62, 4, 22), bloodGroup: "A-", allergies: "Aspirin", phone: "0902 117 6653" },
    { firstName: "Blessing", lastName: "Nwosu", gender: "Female", dob: yearsAgo(today, 19, 6, 4), bloodGroup: "O+", allergies: null, phone: "0810 774 2093" },
    { firstName: "Segun", lastName: "Ajayi", gender: "Male", dob: yearsAgo(today, 40, 2, 17), bloodGroup: "B-", allergies: null, phone: "0704 561 8827" },
    { firstName: "Hadiza", lastName: "Bello", gender: "Female", dob: yearsAgo(today, 3, 5, 25), bloodGroup: "O+", allergies: null, phone: "0816 330 9954" },
    { firstName: "Chukwuemeka", lastName: "Eze", gender: "Male", dob: yearsAgo(today, 71, 10, 11), bloodGroup: "A+", allergies: "Ibuprofen", phone: "0803 665 2201" },
    { firstName: "Folake", lastName: "Adeoye", gender: "Female", dob: yearsAgo(today, 29, 8, 14), bloodGroup: "AB-", allergies: null, phone: "0909 224 6631" },
    { firstName: "Yusuf", lastName: "Abdullahi", gender: "Male", dob: yearsAgo(today, 52, 12, 3), bloodGroup: "O+", allergies: null, phone: "0705 883 1147" },
    { firstName: "Ronke", lastName: "Balogun", gender: "Female", dob: yearsAgo(today, 8, 3, 9), bloodGroup: "B+", allergies: "Penicillin", phone: "0812 447 5560" },
    { firstName: "Patrick", lastName: "Osei", gender: "Male", dob: yearsAgo(today, 37, 6, 28), bloodGroup: "A+", allergies: null, phone: "0803 119 8834" },
  ];

  const registrars = [records, admin];
  const patients = [];
  let counter = 1;
  for (const p of patientSeeds) {
    const patient = await prisma.patient.create({
      data: {
        patientCode: `PT-${today.getFullYear()}-${String(counter).padStart(4, "0")}`,
        firstName: p.firstName,
        lastName: p.lastName,
        gender: p.gender,
        dateOfBirth: p.dob,
        address: "Lagos, Nigeria",
        phone: p.phone,
        nextOfKin: `${p.lastName} household`,
        nextOfKinPhone: p.phone,
        bloodGroup: p.bloodGroup,
        allergies: p.allergies,
        registeredById: registrars[counter % registrars.length].id,
        createdAt: daysFrom(today, -(counter * 6)),
      },
    });
    patients.push(patient);
    counter += 1;
  }

  console.log("Seeding medical records, prescriptions and lab results…");
  const doctors = [drAdeyemi, drChukwu];
  const visitPlans = [
    { symptoms: "Persistent cough, mild fever for 4 days", diagnosis: "Acute bronchitis", notes: "Advised rest and fluids; review in a week if symptoms persist.", drugs: [{ drug: "Amoxicillin", dosage: "500mg, 3x daily", duration: "7 days" }] },
    { symptoms: "Headache and elevated blood pressure reading", diagnosis: "Stage 1 hypertension", notes: "Started on antihypertensives; recommended low-sodium diet.", drugs: [{ drug: "Lisinopril", dosage: "10mg, once daily", duration: "30 days" }] },
    { symptoms: "Abdominal pain and vomiting", diagnosis: "Gastroenteritis", notes: "Oral rehydration therapy commenced.", drugs: [{ drug: "Oral Rehydration Salts", dosage: "1 sachet after each stool", duration: "3 days" }, { drug: "Metronidazole", dosage: "400mg, 3x daily", duration: "5 days" }] },
    { symptoms: "Joint pain and swelling in both knees", diagnosis: "Osteoarthritis", notes: "Referred for physiotherapy.", drugs: [{ drug: "Diclofenac", dosage: "50mg, 2x daily", duration: "10 days" }] },
    { symptoms: "Fever, chills and body aches", diagnosis: "Malaria (P. falciparum)", notes: "Confirmed via rapid diagnostic test.", drugs: [{ drug: "Artemether/Lumefantrine", dosage: "4 tablets, 2x daily", duration: "3 days" }] },
    { symptoms: "Routine antenatal review, no complaints", diagnosis: "Normal antenatal visit — 28 weeks", notes: "Foetal heart rate normal; next visit in 2 weeks.", drugs: [{ drug: "Ferrous Sulphate", dosage: "200mg, once daily", duration: "30 days" }] },
    { symptoms: "Sore throat and difficulty swallowing", diagnosis: "Acute tonsillitis", notes: "Advised warm saline gargles.", drugs: [{ drug: "Amoxiclav", dosage: "625mg, 2x daily", duration: "5 days" }] },
    { symptoms: "Skin rash with itching on both arms", diagnosis: "Allergic dermatitis", notes: "Suspected reaction to new detergent; avoid known irritant.", drugs: [{ drug: "Cetirizine", dosage: "10mg, once daily", duration: "7 days" }, { drug: "Hydrocortisone cream", dosage: "Apply thinly, 2x daily", duration: "7 days" }] },
  ];

  let recordIndex = 0;
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    const visitCount = i % 3 === 0 ? 2 : 1;
    for (let v = 0; v < visitCount; v++) {
      const plan = visitPlans[recordIndex % visitPlans.length];
      const doctor = doctors[recordIndex % doctors.length];
      const visitDate = daysFrom(today, -(recordIndex * 3 + 1));

      const record = await prisma.medicalRecord.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          visitDate,
          symptoms: plan.symptoms,
          diagnosis: plan.diagnosis,
          treatmentNotes: plan.notes,
          createdAt: visitDate,
        },
      });

      for (const [di, d] of plan.drugs.entries()) {
        const isDispensed = (recordIndex + di) % 3 !== 0;
        await prisma.prescription.create({
          data: {
            medicalRecordId: record.id,
            drugName: d.drug,
            dosage: d.dosage,
            duration: d.duration,
            dispensed: isDispensed,
            dispensedById: isDispensed ? pharmacist.id : null,
            dispensedAt: isDispensed ? daysFrom(visitDate, 1) : null,
            createdAt: visitDate,
          },
        });
      }

      if (recordIndex % 4 === 0) {
        await prisma.labResult.create({
          data: {
            patientId: patient.id,
            medicalRecordId: record.id,
            testName: "Full Blood Count",
            result: recordIndex % 8 === 0 ? null : "WBC 7.2, Hb 13.1, Platelets 245",
            notes: recordIndex % 8 === 0 ? null : "Within normal range.",
            status: recordIndex % 8 === 0 ? "PENDING" : "COMPLETED",
            enteredById: nurseOkafor.id,
            createdAt: visitDate,
            completedAt: recordIndex % 8 === 0 ? null : daysFrom(visitDate, 1),
          },
        });
      }

      recordIndex += 1;
    }
  }

  console.log("Seeding appointments…");
  const reasons = [
    "Follow-up consultation",
    "New complaint review",
    "Antenatal check-up",
    "Post-treatment review",
    "Routine check-up",
    "Vaccination",
  ];
  let apptIndex = 0;
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    const offsets = i % 2 === 0 ? [-2, 3] : [5];
    for (const offset of offsets) {
      const doctor = doctors[apptIndex % doctors.length];
      const date = daysFrom(today, offset, 9 + (apptIndex % 6));
      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          date,
          time: `${String(9 + (apptIndex % 6)).padStart(2, "0")}:00`,
          reason: reasons[apptIndex % reasons.length],
          status: offset < 0 ? "COMPLETED" : "PENDING",
          createdAt: daysFrom(today, offset - 4),
        },
      });
      apptIndex += 1;
    }
  }

  console.log("Done. Seeded:");
  console.log(`  ${patients.length} patients`);
  console.log(`  ${recordIndex} medical records`);
  console.log(`  ${apptIndex} appointments`);
  console.log("\nDemo accounts (password: meridian123):");
  console.log("  admin        — Administrator");
  console.log("  dr.adeyemi   — Doctor (General Medicine)");
  console.log("  dr.chukwu    — Doctor (Paediatrics)");
  console.log("  n.okafor     — Nurse");
  console.log("  records      — Records Officer");
  console.log("  pharm.bello  — Pharmacist");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
