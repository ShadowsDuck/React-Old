export const generateMockEvents = () => {
  const companies = [
    "Tech Corp",
    "Media Inc",
    "Finance Ltd",
    "Retail Co",
    "Healthcare Plus",
  ];
  const eventTypes = [
    "Conference",
    "Workshop",
    "Seminar",
    "Product Launch",
    "Team Building",
  ];
  const staffMembers = [
    { id: 1, name: "John Smith", role: "Host" },
    { id: 2, name: "Sarah Johnson", role: "Host" },
    { id: 3, name: "Mike Chen", role: "Host" },
    { id: 4, name: "Emily Davis", role: "Cameraman" },
    { id: 5, name: "David Wilson", role: "Cameraman" },
    { id: 6, name: "Lisa Brown", role: "Admin" },
    { id: 7, name: "Tom Anderson", role: "Admin" },
    { id: 8, name: "Anna Lee", role: "Admin" },
    { id: 9, name: "Chris Martinez", role: "Technician" },
    { id: 10, name: "Jessica Taylor", role: "Technician" },
  ];

  const events = [];
  const today = new Date(2025, 10, 15);

  // สร้างรายการวันที่จะมี events (ไม่ใช่ทุกวัน)
  const daysWithEvents = new Set();
  const totalDays = 30; // ช่วง ±15 วัน
  const daysToHaveEvents = 20; // จาก 30 วันจะมีแค่ 20 วันที่มี events

  while (daysWithEvents.size < daysToHaveEvents) {
    const dayOffset = Math.floor(Math.random() * totalDays) - 15;
    daysWithEvents.add(dayOffset);
  }

  const daysArray = Array.from(daysWithEvents);

  // เพิ่มจำนวน events เป็น 150 เพื่อให้มีโอกาสมีหลาย events ต่อวัน
  for (let i = 0; i < 150; i++) {
    const randomDay = new Date(today);
    // เลือกเฉพาะวันที่กำหนดไว้
    const dayOffset = daysArray[Math.floor(Math.random() * daysArray.length)];
    randomDay.setDate(today.getDate() + dayOffset);

    const startHour = 8 + Math.floor(Math.random() * 8);
    const duration = 2 + Math.floor(Math.random() * 4);

    const requiredStaff = {
      Host: Math.floor(Math.random() * 2) + 1,
      Cameraman: Math.floor(Math.random() * 2) + 1,
      Admin: Math.floor(Math.random() * 3) + 1,
      Technician: Math.floor(Math.random() * 2),
    };

    const assignedStaff = [];
    const assignmentRate = Math.random();

    Object.entries(requiredStaff).forEach(([role, count]) => {
      const availableForRole = staffMembers.filter((s) => s.role === role);
      // เพิ่มโอกาสที่จะ assign staff ครบ จาก 30% เป็น 80%
      const assignCount =
        assignmentRate > 0.2 ? count : Math.floor(count * Math.random());
      for (let j = 0; j < Math.min(assignCount, availableForRole.length); j++) {
        assignedStaff.push(availableForRole[j]);
      }
    });

    const requiredEquipment = [
      { category: "Camera", quantity: Math.floor(Math.random() * 3) + 1 },
      { category: "Microphone", quantity: Math.floor(Math.random() * 4) + 2 },
      { category: "Projector", quantity: Math.floor(Math.random() * 2) + 1 },
      { category: "Laptop", quantity: Math.floor(Math.random() * 5) + 1 },
    ];

    const assignedEquipment = requiredEquipment.map((eq) => ({
      ...eq,
      assigned: eq.quantity,
    }));

    // กำหนดสถานะ complete สำหรับ events ที่ผ่านมาแล้ว
    const isCompleted = randomDay < today && Math.random() > 0.3; // 70% ของ events ที่ผ่านมาจะ complete

    events.push({
      id: i + 1,
      name: `${eventTypes[Math.floor(Math.random() * eventTypes.length)]} ${
        i + 1
      }`,
      date: randomDay,
      startTime: `${startHour.toString().padStart(2, "0")}:00`,
      endTime: `${(startHour + duration).toString().padStart(2, "0")}:00`,
      company: companies[Math.floor(Math.random() * companies.length)],
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      requiredStaff,
      assignedStaff,
      requiredEquipment,
      assignedEquipment,
      status: isCompleted ? "completed" : "pending",
    });
  }

  return events.sort((a, b) => a.date - b.date);
};

export const getAllStaff = (events) => {
  const staffSet = new Set();
  events.forEach((event) => {
    event.assignedStaff.forEach((staff) => {
      staffSet.add(JSON.stringify(staff));
    });
  });
  return Array.from(staffSet).map((s) => JSON.parse(s));
};

export const getAllCompanies = (events) => {
  return [...new Set(events.map((e) => e.company))].sort();
};

export const getAllEventTypes = (events) => {
  return [...new Set(events.map((e) => e.eventType))].sort();
};
