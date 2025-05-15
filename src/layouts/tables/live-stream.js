import { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
  Box,
  IconButton,
  Switch,
  FormControlLabel,
  Chip,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { Edit, Delete, Add } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

function YouTubeLiveStreams() {
  const [state, setState] = useState({
    streams: [],
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
    mode: "create",
    currentStream: null,
    confirmDelete: null,
    formData: {
      youtubeUrl: "",
      title: "",
      description: "",
      isActive: true,
    },
    formErrors: {
      youtubeUrl: false,
      title: false,
    },
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

  const fetchStreams = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/youtube-live/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch live streams");
      }

      const data = await response.json();
      if (data.success) {
        setState((prev) => ({
          ...prev,
          streams: data.data || [],
          loading: false,
        }));
      } else {
        throw new Error(data.message || "No streams found");
      }
    } catch (error) {
      console.error("Error fetching streams:", error);
      showSnackbar(error.message || "Error fetching streams", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const validateForm = () => {
    const errors = {
      youtubeUrl: !dialogState.formData.youtubeUrl,
      title: !dialogState.formData.title,
    };

    setDialogState((prev) => ({
      ...prev,
      formErrors: errors,
    }));

    return !Object.values(errors).some(Boolean);
  };

  const handleCreateStream = async () => {
    if (!validateForm()) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/youtube-live`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dialogState.formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create stream");
      }

      const data = await response.json();
      if (data.success) {
        showSnackbar("Stream created successfully");
        setDialogState((prev) => ({ ...prev, open: false }));
        fetchStreams();
      }
    } catch (error) {
      console.error("Error creating stream:", error);
      showSnackbar(error.message || "Error creating stream", "error");
    }
  };

  const handleUpdateStream = async () => {
    if (!validateForm()) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/youtube-live/${dialogState.currentStream.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dialogState.formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update stream");
      }

      const data = await response.json();
      if (data.success) {
        showSnackbar("Stream updated successfully");
        setDialogState((prev) => ({ ...prev, open: false }));
        fetchStreams();
      }
    } catch (error) {
      console.error("Error updating stream:", error);
      showSnackbar(error.message || "Error updating stream", "error");
    }
  };

  const handleDeleteStream = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/youtube-live/${dialogState.confirmDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete stream");
      }

      const data = await response.json();
      if (data.success) {
        showSnackbar("Stream deleted successfully");
        setDialogState((prev) => ({ ...prev, confirmDelete: null }));
        fetchStreams();
      }
    } catch (error) {
      console.error("Error deleting stream:", error);
      showSnackbar(error.message || "Error deleting stream", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDialogState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: type === "checkbox" ? checked : value,
      },
      formErrors: {
        ...prev.formErrors,
        [name]: false,
      },
    }));
  };

  const handleEditStream = (stream) => {
    setDialogState({
      open: true,
      mode: "edit",
      currentStream: stream,
      formData: {
        youtubeUrl: stream.youtubeUrl,
        title: stream.title,
        description: stream.description,
        isActive: stream.isActive,
      },
      formErrors: {
        youtubeUrl: false,
        title: false,
      },
    });
  };

  const handleCreateNewStream = () => {
    setDialogState({
      open: true,
      mode: "create",
      currentStream: null,
      formData: {
        youtubeUrl: "",
        title: "",
        description: "",
        isActive: true,
      },
      formErrors: {
        youtubeUrl: false,
        title: false,
      },
    });
  };

  const filteredStreams = state.streams.filter((stream) => {
    const searchTerm = state.searchTerm.toLowerCase();
    return (
      stream.title.toLowerCase().includes(searchTerm) ||
      stream.description.toLowerCase().includes(searchTerm) ||
      stream.youtubeUrl.toLowerCase().includes(searchTerm)
    );
  });

  useEffect(() => {
    fetchStreams();
  }, []);

  const columns = [
    { Header: "Title", accessor: "title" },
    { Header: "YouTube URL", accessor: "youtubeUrl" },
    { Header: "Description", accessor: "description" },
    // {
    //   Header: "Status",
    //   accessor: "isActive",
    //   Cell: ({ value }) => (
    //     <Chip
    //       label={value ? "Active" : "Inactive"}
    //       color={value ? "success" : "error"}
    //       size="small"
    //     />
    //   ),
    // },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={() => handleEditStream(row.original)}>
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() =>
              setDialogState((prev) => ({
                ...prev,
                confirmDelete: row.original.id,
              }))
            }
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

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
                    YouTube Live Streams Management
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Streams"
                      value={state.searchTerm}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, searchTerm: e.target.value }))
                      }
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Add />}
                      onClick={handleCreateNewStream}
                    >
                      Add New Stream
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3} px={2}>
                {state.loading ? (
                  <MDBox p={3} display="flex" justifyContent="center">
                    <CircularProgress />
                  </MDBox>
                ) : filteredStreams.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredStreams }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching streams found" : "No live streams available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogState.mode === "create" ? "Add New Stream" : "Edit Stream"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="YouTube URL *"
                name="youtubeUrl"
                value={dialogState.formData.youtubeUrl}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={dialogState.formErrors.youtubeUrl}
                helperText={dialogState.formErrors.youtubeUrl ? "YouTube URL is required" : ""}
              />
              <TextField
                label="Title *"
                name="title"
                value={dialogState.formData.title}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={dialogState.formErrors.title}
                helperText={dialogState.formErrors.title ? "Title is required" : ""}
              />
              <TextField
                label="Description"
                name="description"
                value={dialogState.formData.description}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={dialogState.formData.isActive}
                    onChange={handleInputChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Active Stream"
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button
            onClick={dialogState.mode === "create" ? handleCreateStream : handleUpdateStream}
            color="error"
            variant="contained"
            disabled={!dialogState.formData.youtubeUrl || !dialogState.formData.title}
          >
            {dialogState.mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(dialogState.confirmDelete)}
        onClose={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>Are you sure you want to delete this stream?</MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}>
            Cancel
          </Button>
          <Button onClick={handleDeleteStream} color="error" variant="contained">
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
}

YouTubeLiveStreams.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      youtubeUrl: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      isActive: PropTypes.bool.isRequired,
    }).isRequired,
  }),
};

export default YouTubeLiveStreams;
