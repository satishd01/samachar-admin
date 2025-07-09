import { useEffect, useState } from "react";
import { Button, Card, CircularProgress, Grid, IconButton, TextField } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { Edit } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Box from "@mui/material/Box";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://samachar.chetakbooks.shop";

function TermsAndConditions() {
  const [state, setState] = useState({
    loading: true,
    editing: false,
    terms: null,
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
  });

  const [editorContent, setEditorContent] = useState("");

  const showSnackbar = (message, severity = "success") => {
    setState((prev) => ({
      ...prev,
      snackbar: {
        open: true,
        message,
        severity,
      },
    }));
  };

  const handleCloseSnackbar = () => {
    setState((prev) => ({
      ...prev,
      snackbar: {
        ...prev.snackbar,
        open: false,
      },
    }));
  };

  const fetchTermsAndConditions = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/terms-and-conditions`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch terms and conditions");
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        loading: false,
        terms: data,
      }));
      setEditorContent(data.description);
    } catch (error) {
      console.error("Error fetching terms and conditions:", error);
      showSnackbar(error.message || "Error fetching terms and conditions", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleUpdateTerms = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/api/terms-and-conditions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: editorContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update terms and conditions");
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        loading: false,
        editing: false,
        terms: data,
      }));
      showSnackbar("Terms and conditions updated successfully");
    } catch (error) {
      console.error("Error updating terms and conditions:", error);
      showSnackbar(error.message || "Error updating terms and conditions", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = ["header", "bold", "italic", "underline", "strike", "list", "bullet", "link"];

  useEffect(() => {
    fetchTermsAndConditions();
  }, []);

  if (state.loading && !state.terms) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3} display="flex" justifyContent="center">
          <CircularProgress />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="white"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="h6" color="black">
                    Terms and Conditions
                  </MDTypography>
                  {!state.editing ? (
                    <IconButton
                      color="primary"
                      onClick={() => setState((prev) => ({ ...prev, editing: true }))}
                    >
                      <Edit />
                    </IconButton>
                  ) : (
                    <Box>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          setState((prev) => ({
                            ...prev,
                            editing: false,
                          }));
                          setEditorContent(state.terms.description);
                        }}
                        sx={{ mr: 2 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleUpdateTerms}
                        disabled={state.loading}
                      >
                        {state.loading ? <CircularProgress size={24} /> : "Update"}
                      </Button>
                    </Box>
                  )}
                </MDBox>
              </MDBox>
              <MDBox p={3}>
                {state.editing ? (
                  <ReactQuill
                    value={editorContent}
                    onChange={handleEditorChange}
                    modules={modules}
                    formats={formats}
                    theme="snow"
                    style={{ height: "400px", marginBottom: "50px" }}
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: state.terms?.description || "" }}
                    style={{ minHeight: "200px" }}
                  />
                )}
                {state.terms && (
                  <MDBox mt={3}>
                    {/* <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Created At"
                          value={new Date(state.terms.createdAt).toLocaleString()}
                          fullWidth
                          margin="normal"
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Updated At"
                          value={new Date(state.terms.updatedAt).toLocaleString()}
                          fullWidth
                          margin="normal"
                          disabled
                        />
                      </Grid>
                    </Grid> */}
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Snackbar
        open={state.snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={state.snackbar.severity}
          sx={{ width: "100%" }}
        >
          {state.snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default TermsAndConditions;
