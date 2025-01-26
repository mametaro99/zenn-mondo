import { LoadingButton } from '@mui/lab';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import axios, { AxiosError } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import useSWR from 'swr';
import Error from '@/components/Error';
import Loading from '@/components/Loading';
import { useSnackbarState, useUserState } from '@/hooks/useGlobalState';
import { useRequireSignedIn } from '@/hooks/useRequireSignedIn';
import { styles } from '@/styles';
import { fetcher } from '@/utils';

type TestQuestionProps = {
  id: number;
  questionText: string;
  isReversedScore: boolean;
};

type TestProps = {
  id: number;
  title: string;
  description: string;
  minScore: number;
  maxScore: number;
};

const QuestionForm: NextPage = () => {
  const router = useRouter();
  if (!router.isReady) {
    return <Loading />;
  }

  useRequireSignedIn();
  const [user] = useUserState();
  const [, setSnackbar] = useSnackbarState();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const { id } = router.query;
  const testUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tests/${id}`;
  const questionsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tests/${id}/questions`;

  const { data: testData, error: testError } = useSWR(testUrl, fetcher);
  const { data: questionsData, error: questionsError } = useSWR(questionsUrl, fetcher);

  const [scores, setScores] = useState<{ [key: number]: number | null }>({});

  const handleScoreChange = (questionId: number, score: number) => {
    setScores((prevScores) => ({ ...prevScores, [questionId]: score }));
    setErrors((prevErrors) => ({ ...prevErrors, [questionId]: '' }));
  };

  if (!user.isSignedIn) {
    return <Error />;
  }

  if (testError || questionsError) return <Error />;
  if (!testData || !questionsData) return <Loading />;

  const test: TestProps = camelcaseKeys(testData);
  const questions: TestQuestionProps[] = camelcaseKeys(questionsData);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const userId = user.id;
    const payload = {
      user_id: userId,
      test_id: test.id,
      scores,
    };

    const validationErrors: { [key: number]: string } = {};
    questions.forEach((question) => {
      if (scores[question.id] == null) {
        validationErrors[question.id] = 'この質問に回答してください。';
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'access-token': localStorage.getItem('access-token'),
      client: localStorage.getItem('client'),
      uid: localStorage.getItem('uid'),
    };

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/current/tests/${test.id}/test_answers`, payload, {
        headers: headers,
      });

      setSnackbar({
        message: '回答を送信しました',
        severity: 'success',
        pathname: '/tests/[id]',
      });
      router.push(`/tests/${test.id}`);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      console.error('Submission error:', error.message);
      setSnackbar({
        message: '回答の送信に失敗しました',
        severity: 'error',
        pathname: '/tests/[id]/questionForm',
      });
      setIsLoading(false);
    }
  };

  return (
    <Box
      css={styles.pageMinHeight}
      sx={{
        borderTop: '0.5px solid #acbcc7',
        pb: 8,
        px: 2,
        pt: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        {test.title}
      </Typography>

      <Typography sx={{ mb: 4, textAlign: 'center', maxWidth: 600 }}>
        以下の質問について、{test.minScore}(あてはまらない)～{test.maxScore}(あてはまる)の間の数字で回答してください。
      </Typography>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 800 }}>
        {questions.map((question, index) => (
          <Box key={question.id} sx={{ mb: 2, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}> 
            <Typography variant="body1" sx={{ mb: 2 }}>
              {index + 1}. {question.questionText}
            </Typography>
            <FormControl component="fieldset" error={!!errors[question.id]} fullWidth>
              <RadioGroup
                row
                value={scores[question.id] ?? ''}
                onChange={(e) => handleScoreChange(question.id, Number(e.target.value))}
                sx={{ justifyContent: 'flex-end' }}
              >
                {[...Array(test.maxScore - test.minScore + 1)].map((_, idx) => {
                  const scoreValue = test.minScore + idx;
                  return (
                    <FormControlLabel
                      key={scoreValue}
                      value={scoreValue}
                      control={<Radio />}
                      label={scoreValue.toString()}
                    />
                  );
                })}
              </RadioGroup>
              {errors[question.id] && (
                <FormHelperText>{errors[question.id]}</FormHelperText>
              )}
            </FormControl>
          </Box>
        ))}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <LoadingButton
            type="submit"
            loading={isLoading}
            variant="contained"
            color="primary"
          >
            回答を送信
          </LoadingButton>
        </Box>
      </form>
    </Box>
  );
};

export default QuestionForm;
