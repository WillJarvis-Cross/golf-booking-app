import axios from "axios";

export async function addToDynamoDB(tableName: string, items: any) {
  const body = {
    tableName,
    items,
  };
  console.log("Adding to DynamoDB:", body);

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/addRow`;
  const res = await axios.post(url, body);
  return res.data;
}

export async function batchAddToDynamoDB(tableName: string, items: any[]) {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
  const body = {
    tableName,
    items,
  };

  const res = await axios.post(url, body);
  return res.data;
}

export async function getFromDynamoDB(tableName: string, identifier?: string) {
  const url = `${
    process.env.NEXT_PUBLIC_API_BASE_URL
  }/all-table-data/${tableName}${identifier ? `_${identifier}` : ""}`;
  const res = await axios.get(url);
  return res.data;
}
