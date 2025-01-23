import { LoadingButton } from '@mui/lab';
import {
  Box,
  TextField,
  Typography,
} from '@mui/material';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useSnackbarState } from '@/hooks/useGlobalState';
import { useRequireAdminSignedIn } from '@/hooks/useRequireSignedIn';
import { styles } from '@/styles';

const CreateTestForm: React.FC = () => {
  const router = useRouter();
  useRequireAdminSignedIn();
  const [, setSnackbar] = useSnackbarState();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    site_url: '',
    improvement_suggestion: '',
    min_score: '',
    max_score: '',
    avg_score: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    const headers = {
      'access-token': localStorage.getItem('access-token') || '',
      client: localStorage.getItem('client') || '',
      uid: localStorage.getItem('uid') || '',
    };

    const body = {
      test: {
        title: formData.title,
        description: formData.description,
        site_url: formData.site_url,
        improvement_suggestion: formData.improvement_suggestion,
        min_score: Number(formData.min_score),
        max_score: Number(formData.max_score),
        avg_score: Number(formData.avg_score),
      },
    };

    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/current/tests',
        body,
        { headers }
      );

      setSnackbar({
        message: '新しいテストが作成されました',
        severity: 'success',
        pathname: router.pathname,
      });

      router.push(`/admin/tests/${response.data.id}/edit`);
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError && err.response
          ? err.response.data.message || '不明なエラーが発生しました'
          : 'ネットワークエラーが発生しました';

      console.error('Submission error:', err);
      setSnackbar({
        message: `作成に失敗しました: ${errorMessage}`,
        severity: 'error',
        pathname: router.pathname,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box css={styles.pageMinHeight}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        新しいテストの作成
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name="title"
          label="タイトル"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          name="description"
          label="説明"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          name="site_url"
          label="サイトURL"
          value={formData.site_url}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          name="improvement_suggestion"
          label="改善案"
          value={formData.improvement_suggestion}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          name="min_score"
          label="最小スコア"
          type="number"
          value={formData.min_score}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          name="max_score"
          label="最大スコア"
          type="number"
          value={formData.max_score}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          name="avg_score"
          label="平均スコア"
          type="number"
          value={formData.avg_score}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <LoadingButton
            type="submit"
            loading={isLoading}
            variant="contained"
            color="primary"
            sx={{
              color: 'white',
              textTransform: 'none',
              fontSize: 16,
              borderRadius: 2,
              width: 100,
              boxShadow: 'none',
            }}
          >
            作成
          </LoadingButton>
        </Box>
      </form>
    </Box>
  );
};

export default CreateTestForm;
