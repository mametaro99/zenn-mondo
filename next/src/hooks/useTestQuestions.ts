import useSWR from "swr";
import { fetcher } from "@/utils";

export const useTestQuestions = (id: string | string[] | undefined, user: any) => {
  const url = id ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/tests/${id}/questions` : null;
  const { data, error, mutate } = useSWR(user.isSignedIn && id ? url : null, fetcher);

  return { questions: data || [], error, mutate };
};