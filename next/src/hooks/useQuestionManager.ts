import { useState, useEffect } from "react";
import axios from "axios";
import { useSnackbarState } from "@/hooks/useGlobalState";
import { useRouter } from "next/router";


type BulkedQuestionProps = {
  id:string,
  question_text: string;
  isReversedScore: boolean;
};


export const useQuestionManager = (id: string, mutate: () => void) => {
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState<string>("");
  const [editingisRevercedScore, setEditingisRevercedScore] = useState<boolean>(false);
  const [creatingQuestionText, setCreatingQuestionText] = useState<string>("");
  const [creatingisRevercedScore, setCreatingisRevercedScore] = useState<boolean>(false);
  const [creatingBulkQuestions, setCreatingBulkQuestions] = useState<BulkedQuestionProps[]>([]);
  const [headers, setHeaders] = useState<any>({});
  const [isGeminiSucsess, setIsGeminiSucsess] = useState<boolean>(false);

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

  const handleQuestion = (
    questionId: number,
    questionText: string,
    isRevercedScore: boolean
  ) => {
    setEditingQuestionId(questionId);
    setEditingQuestionText(questionText);
    setEditingisRevercedScore(isRevercedScore);
  };

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

  const handleBulkCreateQuestions = async () => {
    try {
      const questions = creatingBulkQuestions.map((question) => {
        const { id, ...rest } = question;
        return rest;
      });
      await axios.post(`${url}/bulk_question_create`, {
        questions,
      }, { headers });

      setSnackbar({ message: "質問を一括作成しました", severity: "success", pathname: router.pathname });
      mutate();
      resetCreate();
      setIsGeminiSucsess(false);
    } catch (err) {
      setSnackbar({ message: "質問の一括作成に失敗しました", severity: "error", pathname: router.pathname });
    }
  };

  const handleDeleteBulkedQuestion = async (id: string) => {
    const filteredQuestions = creatingBulkQuestions.filter((q) => q.id !== id);
    setCreatingBulkQuestions(filteredQuestions);
  }

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
    creatingBulkQuestions,
    isGeminiSucsess,
    setEditingQuestionText,
    setEditingisRevercedScore,
    setCreatingQuestionText,
    setCreatingisRevercedScore,
    setCreatingBulkQuestions,
    setIsGeminiSucsess,
    handleQuestion,
    handleSaveQuestion,
    handleCreateQuestion,
    handleDeleteQuestion,
    handleBulkCreateQuestions,
    handleDeleteBulkedQuestion,
    resetEdit,
    resetCreate,
  };
};
