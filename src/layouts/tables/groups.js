import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Avatar,
  Pagination,
  Grid,
  Card,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
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

function GroupsManagement() {
  const [state, setState] = useState({
    groups: [],
    filteredGroups: [],
    loading: true,
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    confirmDelete: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPaid: false,
    weeklyCharge: "",
    monthlyCharge: "",
    yearlyCharge: "",
    groupImage: null,
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    description: false,
    weeklyCharge: false,
    monthlyCharge: false,
    yearlyCharge: false,
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
          filteredGroups: data.groups,
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

    if (query.trim() === "") {
      setState((prev) => ({ ...prev, filteredGroups: prev.groups }));
      return;
    }

    const filtered = state.groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) || group.description.toLowerCase().includes(query)
    );
    setState((prev) => ({ ...prev, filteredGroups: filtered }));
  };

  const validateForm = () => {
    const errors = {
      name: !formData.name.trim(),
      description: !formData.description.trim(),
    };

    if (formData.isPaid) {
      errors.weeklyCharge = !formData.weeklyCharge || isNaN(formData.weeklyCharge);
      errors.monthlyCharge = !formData.monthlyCharge || isNaN(formData.monthlyCharge);
      errors.yearlyCharge = !formData.yearlyCharge || isNaN(formData.yearlyCharge);
    }

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleCreateGroup = async () => {
    if (!validateForm()) {
      showSnackbar("Please fill all required fields correctly", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("isPaid", formData.isPaid.toString());
      formDataToSend.append("adminId", localStorage.getItem("id"));

      if (formData.isPaid) {
        formDataToSend.append("weeklyCharge", formData.weeklyCharge);
        formDataToSend.append("monthlyCharge", formData.monthlyCharge);
        formDataToSend.append("yearlyCharge", formData.yearlyCharge);
      }

      if (formData.groupImage) {
        formDataToSend.append("groupImage", formData.groupImage);
      }

      const response = await fetch(`${BASE_URL}/api/group`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create group");
      }

      const data = await response.json();
      if (data.success) {
        const newGroup = data.group || data.data;
        if (newGroup) {
          setState((prev) => ({
            ...prev,
            groups: [...prev.groups, newGroup],
            filteredGroups: [...prev.filteredGroups, newGroup],
          }));
          setDialogState((prev) => ({ ...prev, open: false }));
          resetForm();
          showSnackbar("Group created successfully");
        } else {
          throw new Error("Group data not found in response");
        }
      }
    } catch (error) {
      console.error("Error creating group:", error);
      showSnackbar(error.message || "Error creating group", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      isPaid: false,
      weeklyCharge: "",
      monthlyCharge: "",
      yearlyCharge: "",
      groupImage: null,
    });
    setFormErrors({
      name: false,
      description: false,
      weeklyCharge: false,
      monthlyCharge: false,
      yearlyCharge: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        groupImage: e.target.files[0],
      }));
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/group/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete group");
      }

      const data = await response.json();
      if (data.success) {
        setState((prev) => ({
          ...prev,
          groups: prev.groups.filter((group) => group.id !== groupId),
          filteredGroups: prev.filteredGroups.filter((group) => group.id !== groupId),
        }));
        setDialogState((prev) => ({ ...prev, confirmDelete: null }));
        showSnackbar("Group deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      showSnackbar(error.message || "Error deleting group", "error");
    }
  };

  const columns = [
    { Header: "Group Name", accessor: "name" },
    { Header: "Description", accessor: "description" },
    {
      Header: "Type",
      accessor: "isPaid",
      Cell: PaidCell,
    },
    { Header: "Members", accessor: (row) => row.members?.length || 0 },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: row.original.id }))}
        >
          Delete
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
                    Groups
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Groups"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDialogState((prev) => ({ ...prev, open: true }))}
                    >
                      Create New Group
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {state.filteredGroups.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: state.filteredGroups }}
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

      {/* Create Group Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => {
          setDialogState((prev) => ({ ...prev, open: false }));
          resetForm();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.name}
                helperText={formErrors.name ? "Name is required" : ""}
              />
              <TextField
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                error={formErrors.description}
                helperText={formErrors.description ? "Description is required" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPaid}
                    onChange={handleInputChange}
                    name="isPaid"
                    color="primary"
                  />
                }
                label="Paid Group"
              />
              {formData.isPaid && (
                <>
                  <TextField
                    label="Weekly Charge *"
                    name="weeklyCharge"
                    type="number"
                    value={formData.weeklyCharge}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={formErrors.weeklyCharge}
                    helperText={formErrors.weeklyCharge ? "Valid charge required" : ""}
                  />
                  <TextField
                    label="Monthly Charge *"
                    name="monthlyCharge"
                    type="number"
                    value={formData.monthlyCharge}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={formErrors.monthlyCharge}
                    helperText={formErrors.monthlyCharge ? "Valid charge required" : ""}
                  />
                  <TextField
                    label="Yearly Charge *"
                    name="yearlyCharge"
                    type="number"
                    value={formData.yearlyCharge}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={formErrors.yearlyCharge}
                    helperText={formErrors.yearlyCharge ? "Valid charge required" : ""}
                  />
                </>
              )}
              <Box sx={{ mt: 2 }}>
                <input
                  accept="image/*"
                  type="file"
                  id="groupImage"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="groupImage">
                  <Button
                    component="span"
                    color="error"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Group Image
                  </Button>
                </label>
                {formData.groupImage && (
                  <Chip
                    label={formData.groupImage.name}
                    onDelete={() => setFormData((prev) => ({ ...prev, groupImage: null }))}
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
          <Button
            onClick={handleCreateGroup}
            color="error"
            variant="contained"
            disabled={
              !formData.name ||
              !formData.description ||
              (formData.isPaid &&
                (!formData.weeklyCharge || !formData.monthlyCharge || !formData.yearlyCharge))
            }
          >
            Create Group
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
          <MDTypography>Are you sure you want to delete this group?</MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteGroup(dialogState.confirmDelete)}
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
}

GroupsManagement.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      isPaid: PropTypes.bool.isRequired,
      weeklyCharge: PropTypes.number,
      monthlyCharge: PropTypes.number,
      yearlyCharge: PropTypes.number,
      groupImage: PropTypes.string,
      members: PropTypes.array,
    }).isRequired,
  }).isRequired,
};

export default GroupsManagement;
