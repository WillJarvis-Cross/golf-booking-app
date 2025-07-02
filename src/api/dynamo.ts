import axios from "axios";

export async function addToDynamoDB(tableName: string, item: any) {
  const body = {
    tableName,
    item,
  };
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
  const res = await axios.post(url, body);
  return res.data;
}

export async function getFromDynamoDB(tableName: string, email: string) {
  const url = `${
    process.env.NEXT_PUBLIC_API_BASE_URL
  }/${tableName}?email=${encodeURIComponent(email)}`;
  const res = await axios.get(url);
  return res.data;
}
