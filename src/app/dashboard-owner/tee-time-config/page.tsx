"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import TextField from "@/ui-components/TextField";
import Button from "@/ui-components/Button";
import NumberField from "@/ui-components/NumberField";
import { addToDynamoDB, getFromDynamoDB } from "@/api/dynamo";
import { amplifyUuid } from "@aws-amplify/core/internals/utils";
import axios from "axios";

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

  useEffect(() => {
    if (!user?.userId) return;

    // const fetchUserData = async () => {
    //   try {
    //     const result = await getFromDynamoDB("golf-course-config", user.userId);
    //     if (result) {
    //       setConfig((prev) => ({
    //         ...prev,
    //         ...result,
    //       }));
    //     }
    //   } catch (err) {
    //     console.error("Failed to load user data:", err);
    //   }
    // };

    // fetchUserData();
  }, [user?.userId]);

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
      // const res = await axios.get(
      //   "https://kj9n1dhik2.execute-api.us-east-2.amazonaws.com/prod/courses"
      // );
      // console.log("API Response:", res.data);
      const courseId = amplifyUuid();
      await addToDynamoDB("golf-courses", {
        city: "Placeholder City",
        course_id: courseId,
        userId: user.userId ?? "",
        courseName: config.courseName,
        startTime: config.startTime,
        endTime: config.endTime,
        intervalMinutes: config.intervalMinutes,
        morningPrice: config.morningPrice,
        afternoonPrice: config.afternoonPrice,
        eveningPrice: config.eveningPrice,
      });

      setMessage("Configuration saved successfully!");
    } catch (error) {
      console.error("Error saving configuration:", error);
      setMessage("Failed to save configuration.");
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Tee Time Configuration</h1>
      {message && (
        <p
          className={`alert ${
            message.includes("successfully") ? "alert-success" : "alert-danger"
          }`}
        >
          {message}
        </p>
      )}
      <form>
        <div className="mb-3">
          <TextField
            label="Course Name"
            name="courseName"
            value={config.courseName}
            onChange={handleChange}
            placeholder="Enter the name of the golf course"
          />
        </div>
        <div className="row mb-3">
          <div className="col-md-4">
            <TextField
              label="Start Time"
              name="startTime"
              type="time"
              value={config.startTime}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <TextField
              label="End Time"
              name="endTime"
              type="time"
              value={config.endTime}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <NumberField
              label="Interval Between Tee Times (minutes)"
              name="intervalMinutes"
              value={config.intervalMinutes}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-4">
            <NumberField
              label="Morning Price"
              name="morningPrice"
              value={config.morningPrice}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <NumberField
              label="Afternoon Price"
              name="afternoonPrice"
              value={config.afternoonPrice}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <NumberField
              label="Evening Price"
              name="eveningPrice"
              value={config.eveningPrice}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="d-flex justify-content-end">
          <Button onClick={handleSubmit} label="Save Configuration" />
        </div>
      </form>
    </div>
  );
}
