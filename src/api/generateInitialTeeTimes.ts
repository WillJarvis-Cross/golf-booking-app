import { addToDynamoDB } from "./dynamo";

export type TeeTime = {
  courseId: string;
  startTime: string; // YYYY-MM-DD__HH;mm
  day: string;
  time: string; // HH:mm
};

export const GenerateInitialTeeTimes = async (
  courseId: string,
  startTime: string, // e.g. "07:00"
  endTime: string, // e.g. "18:00"
  intervalMinutes: number
): Promise<TeeTime[]> => {
  const results: TeeTime[] = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() + dayOffset);

    // Parse start & end times relative to current date
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const start = new Date(currentDate);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(currentDate);
    end.setHours(endHour, endMinute, 0, 0);

    for (
      let slot = new Date(start);
      slot <= end;
      slot.setMinutes(slot.getMinutes() + intervalMinutes)
    ) {
      const day = slot.toISOString().split("T")[0];
      const time = slot.toTimeString().slice(0, 5);
      results.push({
        courseId,
        startTime: `${day}_${time}`,
        day,
        time,
      });
    }
  }
  console.log("Generated tee times:", results);
  await addToDynamoDB("tee-times", results);

  return results;
};
