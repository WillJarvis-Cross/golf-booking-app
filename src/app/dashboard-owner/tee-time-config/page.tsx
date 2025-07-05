"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import TextField from "@/ui-components/TextField";
import Button from "@/ui-components/Button";
import styles from "./TeeTimeConfigPage.module.css"; // Import the CSS module
import NumberField from "@/ui-components/NumberField";

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
            managerId: user?.attributes?.sub, // Use Cognito user ID
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
      setMessage("Configuration saved successfully!");
    } catch (error) {
      console.error("Error saving configuration:", error);
      setMessage("Failed to save configuration.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Tee Time Configuration</h1>
      {message && (
        <p
          className={
            message.includes("successfully") ? styles.message : styles.error
          }
        >
          {message}
        </p>
      )}
      <form className={styles.form}>
        <TextField
          label="Course Name"
          name="courseName"
          value={config.courseName}
          onChange={handleChange}
          placeholder="Enter the name of the golf course"
        />
        <div className={styles.horizontalFields}>
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
          <NumberField
            label="Interval Between Tee Times (minutes)"
            name="intervalMinutes"
            value={config.intervalMinutes}
            onChange={handleChange}
          />
        </div>
        <div className={styles.horizontalFields}>
          <NumberField
            label="Morning Price"
            name="morningPrice"
            value={config.morningPrice}
            onChange={handleChange}
          />
          <NumberField
            label="Afternoon Price"
            name="afternoonPrice"
            value={config.afternoonPrice}
            onChange={handleChange}
          />
          <NumberField
            label="Evening Price"
            name="eveningPrice"
            value={config.eveningPrice}
            onChange={handleChange}
          />
        </div>
        <Button onClick={handleSubmit} label="Save Configuration" />
      </form>
    </div>
  );
}
