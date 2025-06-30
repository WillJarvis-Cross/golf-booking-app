import axios from "axios";

export async function addToDynamoDB(tableName: string, item: any) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${tableName}`;
  const res = await axios.post(url, item);
  return res.data;
}

export async function getFromDynamoDB(email: string) {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${email}`;
  const res = await axios.get(url);
  return res.data;
}
