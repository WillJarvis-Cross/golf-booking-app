"use client";

import { useState } from "react";
import { Button, TextField, Heading } from "@aws-amplify/ui-react";
import { useAuth } from "@/app/context/AuthContext";

interface TeeTimeConfig {
  courseName: string;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  morningPrice: number;
  afternoonPrice: number;
  eveningPrice: number;
}

export default function TeeTimeConfigPage() {
  const { user } = useAuth();
  console.log("Current user:", user);
  const [config, setConfig] = useState<TeeTimeConfig>({
    courseName: "",
    startTime: "",
    endTime: "",
    intervalMinutes: 15,
    morningPrice: 50,
    afternoonPrice: 70,
    eveningPrice: 60,
  });

  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]:
        name === "intervalMinutes" || name.includes("Price")
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "https://your-api-gateway-url/save-course-config",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            managerId: "manager-id-from-cognito", // Replace with the actual manager ID from Cognito
            courseName: config.courseName,
            startTime: config.startTime,
            endTime: config.endTime,
            intervalMinutes: config.intervalMinutes,
            morningPrice: config.morningPrice,
            afternoonPrice: config.afternoonPrice,
            eveningPrice: config.eveningPrice,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save configuration");
      }

      const data = await response.json();
      console.log("Configuration saved:", data);
      setMessage("Configuration saved successfully!");
    } catch (error) {
      console.error("Error saving configuration:", error);
      setMessage("Failed to save configuration.");
    }
  };

  return (
    <div className="p-8">
      <Heading level={3} className="mb-4">
        Tee Time Configuration
      </Heading>
      {message && <p className="mb-4">{message}</p>}
      <form className="space-y-4">
        <TextField
          label="Course Name"
          name="courseName"
          value={config.courseName}
          onChange={handleChange}
          placeholder="Enter the name of the golf course"
        />
        <TextField
          label="Start Time"
          name="startTime"
          type="time"
          value={config.startTime}
          onChange={handleChange}
        />
        <TextField
          label="End Time"
          name="endTime"
          type="time"
          value={config.endTime}
          onChange={handleChange}
        />
        <TextField
          label="Interval Between Tee Times (minutes)"
          name="intervalMinutes"
          type="number"
          value={config.intervalMinutes}
          onChange={handleChange}
        />
        <TextField
          label="Morning Price"
          name="morningPrice"
          type="number"
          value={config.morningPrice}
          onChange={handleChange}
        />
        <TextField
          label="Afternoon Price"
          name="afternoonPrice"
          type="number"
          value={config.afternoonPrice}
          onChange={handleChange}
        />
        <TextField
          label="Evening Price"
          name="eveningPrice"
          type="number"
          value={config.eveningPrice}
          onChange={handleChange}
        />
        <Button onClick={handleSubmit} type="button">
          Save Configuration
        </Button>
      </form>
    </div>
  );
}
