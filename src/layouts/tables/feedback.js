import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Card,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import VisibilityIcon from "@mui/icons-material/Visibility";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://samachar.chetakbooks.shop";

const StatusCell = ({ value }) => (
  <Chip label={value ? "Active" : "Inactive"} color={value ? "success" : "error"} size="small" />
);
StatusCell.propTypes = {
  value: PropTypes.bool.isRequired,
};

const FrequencyCell = ({ value }) => (
  <Chip label={value.charAt(0).toUpperCase() + value.slice(1)} color="primary" size="small" />
);
FrequencyCell.propTypes = {
  value: PropTypes.string.isRequired,
};

function FeedbackList() {
  const [state, setState] = useState({
    feedbacks: [],
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
    currentFeedback: null,
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

  const fetchFeedbacks = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/feedback`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch feedbacks");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setState((prev) => ({
          ...prev,
          feedbacks: data.data,
          loading: false,
        }));
      } else {
        throw new Error(data.message || "No feedbacks found");
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      showSnackbar(error.message || "Error fetching feedbacks", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSearchChange = (e) => {
    setState((prev) => ({ ...prev, searchTerm: e.target.value.toLowerCase() }));
  };

  const handleViewDetails = (feedback) => {
    setDialogState({
      open: true,
      currentFeedback: feedback,
    });
  };

  const columns = [
    // {
    //   Header: "Rate",
    //   accessor: "rate",
    //   Cell: ({ value }) => <Chip label={value} color="primary" size="small" />,
    // },
    {
      Header: "Description",
      accessor: "description",
    },
    {
      Header: "Created At",
      accessor: "created_at",
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      Header: "Updated At",
      accessor: "updated_at",
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      Header: "View Details",
      accessor: "actions",
      Cell: ({ row }) => (
        <IconButton
          color="info"
          onClick={() => handleViewDetails(row.original)}
          aria-label="view details"
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (state.loading && state.feedbacks.length === 0) {
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

  const filteredFeedbacks = state.feedbacks.filter((feedback) => {
    const search = state.searchTerm.toLowerCase();
    return (
      feedback.id.toLowerCase().includes(search) ||
      feedback.userId.toLowerCase().includes(search) ||
      feedback.description.toLowerCase().includes(search)
    );
  });

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
                    Feedback List
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Feedback"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredFeedbacks.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredFeedbacks }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching feedback found" : "No feedback available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Feedback Details Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Feedback Details</DialogTitle>
        <DialogContent dividers>
          {dialogState.currentFeedback && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <MDTypography variant="h6">Feedback ID:</MDTypography>
                <MDTypography>{dialogState.currentFeedback.id}</MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">User ID:</MDTypography>
                <MDTypography>{dialogState.currentFeedback.userId}</MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">Rate:</MDTypography>
                <MDTypography>
                  <Chip label={dialogState.currentFeedback.rate} color="primary" size="small" />
                </MDTypography>
              </Grid>
              <Grid item xs={12}>
                <MDTypography variant="h6">Description:</MDTypography>
                <MDTypography>{dialogState.currentFeedback.description}</MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">Created At:</MDTypography>
                <MDTypography>
                  {new Date(dialogState.currentFeedback.created_at).toLocaleString()}
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">Updated At:</MDTypography>
                <MDTypography>
                  {new Date(dialogState.currentFeedback.updated_at).toLocaleString()}
                </MDTypography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}>
            Close
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
}

FeedbackList.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      rate: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      updated_at: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default FeedbackList;
