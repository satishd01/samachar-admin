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
  Avatar,
} from "@mui/material";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

const PaidCell = ({ value }) => (
  <Chip label={value ? "Paid" : "Free"} color={value ? "error" : "success"} size="small" />
);
PaidCell.propTypes = {
  value: PropTypes.bool.isRequired,
};

function GroupsWithMessages() {
  const [state, setState] = useState({
    groups: [],
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
    selectedGroupId: "",
  });

  const [formData, setFormData] = useState({
    image: null,
    timeFrame: "",
    scriptName: "",
    actionType: "",
    target1: "",
    target2: "",
    stopLoss: "",
    reason: "",
    discriminator: "",
    sebzRegistration: "",
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

  const fetchGroups = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const data = await response.json();
      if (data.success && data.groups) {
        setState((prev) => ({
          ...prev,
          groups: data.groups,
          loading: false,
        }));
      } else {
        throw new Error(data.message || "No groups found");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      showSnackbar(error.message || "Error fetching groups", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));
  };

  const filteredGroups = state.groups.filter(
    (group) =>
      group.name.toLowerCase().includes(state.searchTerm) ||
      group.description.toLowerCase().includes(state.searchTerm)
  );

  const handleCreateMessage = async () => {
    try {
      const token = localStorage.getItem("token");

      const formDataToSend = new FormData();
      formDataToSend.append("image", formData.image);
      formDataToSend.append("timeFrame", formData.timeFrame);
      formDataToSend.append("scriptName", formData.scriptName);
      formDataToSend.append("actionType", formData.actionType);
      formDataToSend.append("target1", formData.target1);
      formDataToSend.append("target2", formData.target2);
      formDataToSend.append("stopLoss", formData.stopLoss);
      formDataToSend.append("reason", formData.reason);
      formDataToSend.append("discriminator", formData.discriminator);
      formDataToSend.append("sebzRegistration", formData.sebzRegistration);
      formDataToSend.append("adminId", localStorage.getItem("id"));
      formDataToSend.append("groupId", dialogState.selectedGroupId);

      const response = await fetch(`${BASE_URL}/api/groups/message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create message");
      }

      const data = await response.json();
      console.log("Message created successfully:", data);
      if (data) {
        setDialogState((prev) => ({ ...prev, open: false }));
        setFormData({
          image: null,
          timeFrame: "",
          scriptName: "",
          actionType: "",
          target1: "",
          target2: "",
          stopLoss: "",
          reason: "",
          discriminator: "",
          sebzRegistration: "",
        });
        showSnackbar("Message created successfully");
      }
    } catch (error) {
      console.error("Error creating message:", error);
      showSnackbar(error.message || "Error creating message", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOpenCreateDialog = (groupId) => {
    setDialogState({
      open: true,
      selectedGroupId: groupId,
    });
  };

  const columns = [
    { Header: "Group Name", accessor: "name" },
    { Header: "Description", accessor: "description" },
    {
      Header: "Type",
      accessor: "isPaid",
      Cell: PaidCell,
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleOpenCreateDialog(row.original.id)}
        >
          Create Message
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  if (state.loading && state.groups.length === 0) {
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
                    Groups With Messages
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Groups"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredGroups.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredGroups }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching groups found" : "No groups available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create Message Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>Create New Message</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Time Frame"
                name="timeFrame"
                value={formData.timeFrame}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Script Name"
                name="scriptName"
                value={formData.scriptName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Action Type"
                name="actionType"
                value={formData.actionType}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Target 1"
                name="target1"
                type="number"
                value={formData.target1}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Target 2"
                name="target2"
                type="number"
                value={formData.target2}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Stop Loss"
                name="stopLoss"
                type="number"
                value={formData.stopLoss}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Discriminator"
                name="discriminator"
                value={formData.discriminator}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="SEBZ Registration"
                name="sebzRegistration"
                value={formData.sebzRegistration}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <Box sx={{ mt: 2 }}>
                <input
                  accept="image/*"
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  style={{ display: "none" }}
                  id="messageImage"
                />
                <label htmlFor="messageImage">
                  <Button component="span" variant="outlined" startIcon={<CloudUploadIcon />}>
                    Upload Image
                  </Button>
                </label>
                {formData.image && (
                  <Chip
                    label={formData.image.name}
                    onDelete={() => setFormData((prev) => ({ ...prev, image: null }))}
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}>
            Cancel
          </Button>
          <Button onClick={handleCreateMessage} color="error" variant="contained">
            Create Message
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

GroupsWithMessages.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      isPaid: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
};

export default GroupsWithMessages;
