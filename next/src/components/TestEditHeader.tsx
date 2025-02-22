import { AppBar, Box, IconButton, Switch, Toolbar, Typography } from "@mui/material";
import ArrowBackSharpIcon from "@mui/icons-material/ArrowBackSharp";
import Link from "next/link";
import { LoadingButton } from "@mui/lab";

type TestEditHeaderProps = {
  previewChecked: boolean;
  onPreviewCheckedChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  statusChecked: boolean;
  onStatusCheckedChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
};

const TestEditHeader: React.FC<TestEditHeaderProps> = ({
  previewChecked,
  onPreviewCheckedChange,
  statusChecked,
  onStatusCheckedChange,
  isLoading,
}) => {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#EDF2F7" }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: 50 }}>
          <Link href="/admin/home">
            <IconButton>
              <ArrowBackSharpIcon />
            </IconButton>
          </Link>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: "0 16px", sm: "0 24px" },
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Switch checked={previewChecked} onChange={onPreviewCheckedChange} />
            <Typography sx={{ color: "black", fontSize: { xs: 12, sm: 15 } }}>
              プレビュー表示
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Switch checked={statusChecked} onChange={onStatusCheckedChange} />
            <Typography sx={{ color: "black", fontSize: { xs: 12, sm: 15 } }}>
              下書き／公開
            </Typography>
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
  );
};

export default TestEditHeader;
