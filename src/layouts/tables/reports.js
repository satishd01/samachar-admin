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
} from "@mui/material";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://samachar.chetakbooks.shop";

const ReportsManagement = () => {
  const [state, setState] = useState({
    reports: [],
    filteredReports: [],
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
    currentReport: null,
  });

  const [formData, setFormData] = useState({
    description: "",
    groupId: "",
    userId: "",
  });

  const [formErrors, setFormErrors] = useState({
    description: false,
    groupId: false,
    userId: false,
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

  const fetchReports = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();

      // If the response is a direct array of reports (no `success` key)
      if (Array.isArray(data)) {
        setState((prev) => ({
          ...prev,
          reports: data,
          filteredReports: data,
          loading: false,
        }));
      } else if (data.reports && Array.isArray(data.reports)) {
        // If the API wraps reports in a `reports` key
        setState((prev) => ({
          ...prev,
          reports: data.reports,
          filteredReports: data.reports,
          loading: false,
        }));
      } else {
        throw new Error("Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      showSnackbar(error.message || "Error fetching reports", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));

    if (query.trim() === "") {
      setState((prev) => ({ ...prev, filteredReports: prev.reports }));
      return;
    }

    const filtered = state.reports.filter(
      (report) =>
        report.description.toLowerCase().includes(query) ||
        report.groupId.toLowerCase().includes(query) ||
        report.userId.toLowerCase().includes(query)
    );
    setState((prev) => ({ ...prev, filteredReports: filtered }));
  };

  const validateForm = () => {
    const errors = {
      description: !formData.description.trim(),
      groupId: !formData.groupId.trim(),
      userId: !formData.userId.trim(),
    };

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmitReport = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const formDataToSend = {
        description: formData.description,
        groupId: formData.groupId,
        userId: formData.userId,
      };

      const url =
        dialogState.mode === "create"
          ? `${BASE_URL}/api/reports`
          : `${BASE_URL}/api/reports/${dialogState.currentReport.id}`;

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
        throw new Error(errorData.message || `Failed to ${dialogState.mode} report`);
      }

      const data = await response.json();
      if (data.success) {
        const updatedReport = data.report || data.data;
        if (updatedReport) {
          if (dialogState.mode === "create") {
            setState((prev) => ({
              ...prev,
              reports: [...prev.reports, updatedReport],
              filteredReports: [...prev.filteredReports, updatedReport],
            }));
          } else {
            setState((prev) => ({
              ...prev,
              reports: prev.reports.map((report) =>
                report.id === updatedReport.id ? updatedReport : report
              ),
              filteredReports: prev.filteredReports.map((report) =>
                report.id === updatedReport.id ? updatedReport : report
              ),
            }));
          }
          setDialogState((prev) => ({ ...prev, open: false }));
          resetForm();
          showSnackbar(
            `Report ${dialogState.mode === "create" ? "created" : "updated"} successfully`
          );
        } else {
          throw new Error("Report data not found in response");
        }
      }
    } catch (error) {
      console.error(
        `Error ${dialogState.mode === "create" ? "creating" : "updating"} report:`,
        error
      );
      showSnackbar(
        error.message || `Error ${dialogState.mode === "create" ? "creating" : "updating"} report`,
        "error"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      description: "",
      groupId: "",
      userId: "",
    });
    setFormErrors({
      description: false,
      groupId: false,
      userId: false,
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

  const handleEditReport = (report) => {
    setDialogState({
      open: true,
      mode: "edit",
      currentReport: report,
    });
    setFormData({
      description: report.description,
      groupId: report.groupId,
      userId: report.userId,
    });
  };

  const handleDeleteReport = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete report");
      }

      const data = await response.json();
      if (data.success) {
        setState((prev) => ({
          ...prev,
          reports: prev.reports.filter((report) => report.id !== reportId),
          filteredReports: prev.filteredReports.filter((report) => report.id !== reportId),
        }));
        showSnackbar("Report deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      showSnackbar(error.message || "Error deleting report", "error");
    }
  };

  const columns = [
    { Header: "Description", accessor: "description" },
    { Header: "Group", accessor: (row) => row.group.name },
    { Header: "User", accessor: (row) => row.user.name },
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  if (state.loading && state.reports.length === 0) {
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
                    Reports
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Reports"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {state.filteredReports.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: state.filteredReports }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching reports found" : "No reports available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create/Edit Report Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => {
          setDialogState((prev) => ({ ...prev, open: false }));
          resetForm();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogState.mode === "create" ? "Create New Report" : "Edit Report"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.description}
                helperText={formErrors.description ? "Description is required" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Group ID *"
                name="groupId"
                value={formData.groupId}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.groupId}
                helperText={formErrors.groupId ? "Group ID is required" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="User ID *"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.userId}
                helperText={formErrors.userId ? "User ID is required" : ""}
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
            onClick={handleSubmitReport}
            color="error"
            variant="contained"
            disabled={!formData.description || !formData.groupId || !formData.userId}
          >
            {dialogState.mode === "create" ? "Create Report" : "Update Report"}
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
          <MDTypography>Are you sure you want to delete this report?</MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteReport(dialogState.confirmDelete)}
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

ReportsManagement.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      groupId: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ReportsManagement;
