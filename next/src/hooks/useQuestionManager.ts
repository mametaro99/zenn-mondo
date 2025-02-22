import { useState, useEffect } from "react";
import axios from "axios";
import { useSnackbarState } from "@/hooks/useGlobalState";
import { useRouter } from "next/router";

export const useQuestionManager = (id: string, mutate: () => void) => {
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState<string>("");
  const [editingisRevercedScore, setEditingisRevercedScore] = useState<boolean>(false);
  const [creatingQuestionText, setCreatingQuestionText] = useState<string>("");
  const [creatingisRevercedScore, setCreatingisRevercedScore] = useState<boolean>(false);
  const [headers, setHeaders] = useState<any>({});

  const [, setSnackbar] = useSnackbarState();
  const router = useRouter();
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/current/tests/${id}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      // This code will only run in the browser
      setHeaders({
        "access-token": localStorage.getItem("access-token"),
        client: localStorage.getItem("client"),
        uid: localStorage.getItem("uid"),
      });
    }
  }, []);

  const handleSaveQuestion = async (questionId: number) => {
    try {
      await axios.patch(`${url}/questions/${questionId}`, {
        question: { question_text: editingQuestionText, isReversedScore: editingisRevercedScore },
      }, { headers });

      setSnackbar({ message: "質問を保存しました", severity: "success", pathname: router.pathname });
      mutate();
      resetEdit();
    } catch (err) {
      setSnackbar({ message: "質問の保存に失敗しました", severity: "error", pathname: router.pathname });
    }
  };

  const handleCreateQuestion = async () => {
    try {
      await axios.post(`${url}/questions`, {
        question: { question_text: creatingQuestionText, isReversedScore: creatingisRevercedScore },
      }, { headers });

      setSnackbar({ message: "質問を作成しました", severity: "success", pathname: router.pathname });
      mutate();
      resetCreate();
    } catch (err) {
      setSnackbar({ message: "質問の作成に失敗しました", severity: "error", pathname: router.pathname });
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await axios.delete(`${url}/questions/${questionId}`, { headers });
      setSnackbar({ message: "質問を削除しました", severity: "success", pathname: router.pathname });
      mutate();
    } catch (err) {
      setSnackbar({ message: "質問の削除に失敗しました", severity: "error", pathname: router.pathname });
    }
  };

  const resetEdit = () => {
    setEditingQuestionId(null);
    setEditingQuestionText("");
    setEditingisRevercedScore(false);
  };

  const resetCreate = () => {
    setCreatingQuestionText("");
    setCreatingisRevercedScore(false);
  };

  return {
    editingQuestionId,
    editingQuestionText,
    editingisRevercedScore,
    creatingQuestionText,
    creatingisRevercedScore,
    setEditingQuestionText,
    setEditingisRevercedScore,
    setCreatingQuestionText,
    setCreatingisRevercedScore,
    handleSaveQuestion,
    handleCreateQuestion,
    handleDeleteQuestion,
    resetEdit,
    resetCreate,
  };
};
