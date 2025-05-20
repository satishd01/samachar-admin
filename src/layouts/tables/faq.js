import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Snackbar,
  Alert,
  Grid,
  Card,
  CircularProgress,
  IconButton,
  EditIcon,
  DeleteIcon,
} from "@mui/material";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

const FAQsManagement = () => {
  const [state, setState] = useState({
    faqs: [],
    filteredFaqs: [],
    loading: true,
    searchTerm: "",
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    mode: "create", // 'create' or 'edit'
    currentFaq: null,
  });

  const [formData, setFormData] = useState({
    que: "",
    ans: "",
  });

  const [formErrors, setFormErrors] = useState({
    que: false,
    ans: false,
  });

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

  const fetchFaqs = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/faqs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch FAQs");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setState((prev) => ({
          ...prev,
          faqs: data.data,
          filteredFaqs: data.data,
          loading: false,
        }));
      } else {
        throw new Error(data.message || "No FAQs found");
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      showSnackbar(error.message || "Error fetching FAQs", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));

    if (query.trim() === "") {
      setState((prev) => ({ ...prev, filteredFaqs: prev.faqs }));
      return;
    }

    const filtered = state.faqs.filter(
      (faq) => faq.que.toLowerCase().includes(query) || faq.ans.toLowerCase().includes(query)
    );
    setState((prev) => ({ ...prev, filteredFaqs: filtered }));
  };

  const validateForm = () => {
    const errors = {
      que: !formData.que.trim(),
      ans: !formData.ans.trim(),
    };

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmitFaq = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const formDataToSend = {
        que: formData.que,
        ans: formData.ans,
      };

      const url =
        dialogState.mode === "create"
          ? `${BASE_URL}/api/faqs`
          : `${BASE_URL}/api/faqs/${dialogState.currentFaq.id}`;

      const method = dialogState.mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${dialogState.mode} FAQ`);
      }

      const data = await response.json();
      if (data.success) {
        const updatedFaq = data.data;
        if (updatedFaq) {
          if (dialogState.mode === "create") {
            setState((prev) => ({
              ...prev,
              faqs: [...prev.faqs, updatedFaq],
              filteredFaqs: [...prev.filteredFaqs, updatedFaq],
            }));
          } else {
            setState((prev) => ({
              ...prev,
              faqs: prev.faqs.map((faq) => (faq.id === updatedFaq.id ? updatedFaq : faq)),
              filteredFaqs: prev.filteredFaqs.map((faq) =>
                faq.id === updatedFaq.id ? updatedFaq : faq
              ),
            }));
          }
          setDialogState((prev) => ({ ...prev, open: false }));
          resetForm();
          showSnackbar(`FAQ ${dialogState.mode === "create" ? "created" : "updated"} successfully`);
        } else {
          throw new Error("FAQ data not found in response");
        }
      }
    } catch (error) {
      console.error(`Error ${dialogState.mode === "create" ? "creating" : "updating"} FAQ:`, error);
      showSnackbar(
        error.message || `Error ${dialogState.mode === "create" ? "creating" : "updating"} FAQ`,
        "error"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      que: "",
      ans: "",
    });
    setFormErrors({
      que: false,
      ans: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleEditFaq = (faq) => {
    setDialogState({
      open: true,
      mode: "edit",
      currentFaq: faq,
    });
    setFormData({
      que: faq.que,
      ans: faq.ans,
    });
  };

  const handleDeleteFaq = async (faqId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/faqs/${faqId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete FAQ");
      }

      const data = await response.json();
      if (data.success) {
        setState((prev) => ({
          ...prev,
          faqs: prev.faqs.filter((faq) => faq.id !== faqId),
          filteredFaqs: prev.filteredFaqs.filter((faq) => faq.id !== faqId),
        }));
        showSnackbar("FAQ deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      showSnackbar(error.message || "Error deleting FAQ", "error");
    }
  };

  const columns = [
    { Header: "Question", accessor: "que" },
    { Header: "Answer", accessor: "ans" },
    { Header: "Created At", accessor: (row) => new Date(row.createdAt).toLocaleString() },
    { Header: "Updated At", accessor: (row) => new Date(row.updatedAt).toLocaleString() },
  ];

  useEffect(() => {
    fetchFaqs();
  }, []);

  if (state.loading && state.faqs.length === 0) {
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
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <MDTypography variant="h6" color="black">
                    FAQs
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search FAQs"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() =>
                        setDialogState({
                          open: true,
                          mode: "create",
                          currentFaq: null,
                        })
                      }
                    >
                      Create New FAQ
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {state.filteredFaqs.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: state.filteredFaqs }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching FAQs found" : "No FAQs available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create/Edit FAQ Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => {
          setDialogState((prev) => ({ ...prev, open: false }));
          resetForm();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{dialogState.mode === "create" ? "Create New FAQ" : "Edit FAQ"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Question *"
                name="que"
                value={formData.que}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.que}
                helperText={formErrors.que ? "Question is required" : ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Answer *"
                name="ans"
                value={formData.ans}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.ans}
                helperText={formErrors.ans ? "Answer is required" : ""}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogState((prev) => ({ ...prev, open: false }));
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitFaq}
            color="error"
            variant="contained"
            disabled={!formData.que || !formData.ans}
          >
            {dialogState.mode === "create" ? "Create FAQ" : "Update FAQ"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(dialogState.confirmDelete)}
        onClose={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>Are you sure you want to delete this FAQ?</MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteFaq(dialogState.confirmDelete)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
};

FAQsManagement.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      que: PropTypes.string.isRequired,
      ans: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default FAQsManagement;
