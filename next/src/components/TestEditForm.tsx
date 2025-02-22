import { Box, Button, TextField, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';


type TestFormData = {
  title: string
  description: string
  siteUrl: string
  improvementSuggestion: string
  minScore: number
  maxScore: number
  avgScore: number
  status: string
}

type TestFormProps = {
  test: TestFormData;
  control: any; // You'll pass control from react-hook-form
};

const TestForm: React.FC<TestFormProps> = ({ test, control }) => (
  <Box sx={{ width: 840 }}>
    <Box sx={{ mb: 2 }}>
      <Typography>タイトル</Typography>
      <Controller
      name="title"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
        {...field}
        type="text"
        error={fieldState.invalid}
        helperText={fieldState.error?.message}
        placeholder="Write in Title"
        fullWidth
        sx={{ backgroundColor: 'white' }} />
      )} />
    </Box>
    <Box sx={{ mb: 2 }}>
      <Typography>説明</Typography>
      <Controller
      name="description"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
        {...field}
        type="text"
        error={fieldState.invalid}
        helperText={fieldState.error?.message}
        multiline
        fullWidth
        placeholder="Write in Markdown Text"
        rows={10}
        sx={{ backgroundColor: 'white' }} />
      )} />
    </Box>
    <Box sx={{ mb: 2 }}>
      <Typography>改善案</Typography>
      <Controller
      name="improvementSuggestion"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
        {...field}
        type="textarea"
        error={fieldState.invalid}
        helperText={fieldState.error?.message}
        multiline
        fullWidth
        placeholder="Improvement Suggestion in Markdown Text"
        rows={10}
        sx={{ backgroundColor: 'white' }} />
      )} />
    </Box>
    <Box sx={{ mb: 2 }}>
      <Typography>引用URL</Typography>
      <Controller
      name="siteUrl"
      control={control}
      render={({ field, fieldState }) => (
        <TextField
        {...field}
        type="url"
        error={fieldState.invalid}
        helperText={fieldState.error?.message}
        placeholder="Site URL"
        fullWidth
        sx={{ backgroundColor: 'white' }} />
      )} />
    </Box>
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box sx={{ flex: 1 }}>
      <Typography>最低スコア</Typography>
      <Controller
        name="minScore"
        control={control}
        render={({ field, fieldState }) => (
        <TextField
          {...field}
          type="number"
          error={fieldState.invalid}
          helperText={fieldState.error?.message}
          placeholder="Minimum Score"
          fullWidth
          sx={{ backgroundColor: 'white' }} />
        )} />
      </Box>
      <Box sx={{ flex: 1 }}>
      <Typography>最高スコア</Typography>
      <Controller
        name="maxScore"
        control={control}
        render={({ field, fieldState }) => (
        <TextField
          {...field}
          type="number"
          error={fieldState.invalid}
          helperText={fieldState.error?.message}
          placeholder="Maximum Score"
          fullWidth
          sx={{ backgroundColor: 'white' }} />
        )} />
      </Box>
      <Box sx={{ flex: 1 }}>
      <Typography>平均スコア</Typography>
      <Controller
        name="avgScore"
        control={control}
        render={({ field, fieldState }) => (
        <TextField
          {...field}
          type="number"
          error={fieldState.invalid}
          helperText={fieldState.error?.message}
          placeholder="Average Score"
          fullWidth
          sx={{ backgroundColor: 'white' }} />
        )} />
      </Box>
    </Box>
  </Box>
);

export default TestForm;
