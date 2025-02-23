import { Box, Button, TextField, Typography, Switch, IconButton, AppBar, Toolbar, Link } from '@mui/material';
import { Controller } from 'react-hook-form';
import ArrowBackSharpIcon from '@mui/icons-material/ArrowBackSharp';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbarState } from '@/hooks/useGlobalState';


type TestFormData = {
  title: string;
  description: string;
  siteUrl: string;
  improvementSuggestion: string;
  minScore: number;
  maxScore: number;
  avgScore: number;
  status: string;
};

type TestFormProps = {
  test: TestFormData;
  control: any;
  previewChecked: boolean;
  onPreviewCheckedChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  statusChecked: boolean;
  onStatusCheckedChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
};

const TestForm: React.FC<TestFormProps> = ({
  test,
  control,
  previewChecked,
  onPreviewCheckedChange,
  statusChecked,
  onStatusCheckedChange,
  isLoading,
}) => {

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: "#EDF2F7" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ width: 50 }}>
            <Link href="/admin/home">
              <IconButton>
                <ArrowBackSharpIcon />
              </IconButton>
            </Link>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: { xs: "0 16px", sm: "0 24px" } }}>
            <Box sx={{ textAlign: "center" }}>
              <Switch checked={previewChecked} onChange={onPreviewCheckedChange} />
              <Typography sx={{ color: "black", fontSize: { xs: 12, sm: 15 } }}>プレビュー表示</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Switch checked={statusChecked} onChange={onStatusCheckedChange} />
              <Typography sx={{ color: "black", fontSize: { xs: 12, sm: 15 } }}>下書き／公開</Typography>
            </Box>
            <LoadingButton
              variant="contained"
              type="submit"
              loading={isLoading}
              sx={{ color: "white", fontWeight: "bold", fontSize: { xs: 12, sm: 16 } }}
            >
              更新する
            </LoadingButton>
          </Box>
        </Toolbar>
      </AppBar>
      {!previewChecked && (
        <Box sx={{ width: 840, mt: 8 }}>
          {[
            { name: "title", label: "タイトル", placeholder: "Write in Title", rows: 1 },
            { name: "description", label: "説明", placeholder: "Write in Markdown Text", rows: 10 },
            { name: "improvementSuggestion", label: "改善案", placeholder: "Improvement Suggestion in Markdown Text", rows: 10 },
            { name: "siteUrl", label: "引用URL", placeholder: "Site URL", rows: 1, type: "url" },
          ].map(({ name, label, placeholder, rows, type = "text" }) => (
            <Box key={name} sx={{ mb: 2 }}>
              <Typography>{label}</Typography>
              <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type={type}
                    error={fieldState.invalid}
                    helperText={fieldState.error?.message}
                    placeholder={placeholder}
                    fullWidth
                    multiline={rows > 1}
                    rows={rows}
                    sx={{ backgroundColor: 'white' }}
                  />
                )}
              />
            </Box>
          ))}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[
              { name: "minScore", label: "最低スコア", placeholder: "Minimum Score" },
              { name: "maxScore", label: "最高スコア", placeholder: "Maximum Score" },
              { name: "avgScore", label: "平均スコア", placeholder: "Average Score" },
            ].map(({ name, label, placeholder }) => (
              <Box key={name} sx={{ flex: 1 }}>
                <Typography>{label}</Typography>
                <Controller
                  name={name}
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="number"
                      error={fieldState.invalid}
                      helperText={fieldState.error?.message}
                      placeholder={placeholder}
                      fullWidth
                      sx={{ backgroundColor: 'white' }}
                    />
                  )}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </>
  )
}


export default TestForm;
