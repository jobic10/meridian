type DateInput = Date | string;

function toDate(d: DateInput) {
  return typeof d === "string" ? new Date(d) : d;
}

export function calculateAge(dob: DateInput) {
  const birth = toDate(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function formatDate(date: DateInput) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(toDate(date));
}

export function formatDateLong(date: DateInput) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(toDate(date));
}

export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function greeting(date: Date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function patientName(p: { firstName: string; lastName: string }) {
  return `${p.firstName} ${p.lastName}`;
}
