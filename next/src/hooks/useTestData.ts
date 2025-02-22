import useSWR from "swr";
import { fetcher } from '@/utils'
import { useState, useEffect } from "react";
import camelcaseKeys from "camelcase-keys";

type TestFormData = {
  id?: string
  title: string
  description: string
  siteUrl: string
  improvementSuggestion: string
  minScore: number
  maxScore: number
  avgScore: number
  status: string
  createdAt: string
  fromToday: string
}

export const useTestData = (id: string | string[] | undefined, user: any) => {
  const url = id ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/current/tests/${id}` : null;
  const { data, error } = useSWR(user.isSignedIn && id ? url : null, fetcher);

  const [test, setTest] = useState<TestFormData | null>(null);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    if (data) {
      const formattedData = camelcaseKeys(data, { deep: true });
      setTest({
        id: formattedData.id,
        title: formattedData.title || "",
        description: formattedData.description || "",
        siteUrl: formattedData.siteUrl || "",
        improvementSuggestion: formattedData.improvementSuggestion || "",
        minScore: formattedData.minScore,
        maxScore: formattedData.maxScore,
        avgScore: formattedData.avgScore,
        createdAt: formattedData.createdAt,
        fromToday: formattedData.fromToday,
        status: formattedData.status,
      });
      setIsFetched(true);
    }
  }, [data]);

  return { test, error, isFetched };
};
