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
  CircularProgress,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { CloudUpload as CloudUploadIcon, Edit as EditIcon } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

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
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    mode: "create", // 'create' or 'edit'
    currentGroup: null,
    confirmDelete: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPaid: false,
    oneMonthPrice: "",
    twoMonthPrice: "",
    threeMonthPrice: "",
    yearlyPrice: "",
    customPrice: "",
    customDuration: "",
    groupImage: null,
    imagePreview: null,
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    description: false,
    oneMonthPrice: false,
    twoMonthPrice: false,
    threeMonthPrice: false,
    yearlyPrice: false,
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
      errors.oneMonthPrice = !formData.oneMonthPrice || isNaN(formData.oneMonthPrice);
      errors.twoMonthPrice = !formData.twoMonthPrice || isNaN(formData.twoMonthPrice);
      errors.threeMonthPrice = !formData.threeMonthPrice || isNaN(formData.threeMonthPrice);
      errors.yearlyPrice = !formData.yearlyPrice || isNaN(formData.yearlyPrice);
    }

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmitGroup = async () => {
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

      const adminId = localStorage.getItem("id");
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("isPaid", formData.isPaid.toString());
      formDataToSend.append("adminId", adminId);

      if (formData.isPaid) {
        formDataToSend.append("oneMonthPrice", formData.oneMonthPrice);
        formDataToSend.append("twoMonthPrice", formData.twoMonthPrice);
        formDataToSend.append("threeMonthPrice", formData.threeMonthPrice);
        formDataToSend.append("yearlyPrice", formData.yearlyPrice);
        formDataToSend.append("customPrice", formData.customPrice || "0");
        formDataToSend.append("customDuration", formData.customDuration || "0");
      }

      if (formData.groupImage) {
        formDataToSend.append("groupImage", formData.groupImage);
      }

      const url =
        dialogState.mode === "create"
          ? `${BASE_URL}/api/group`
          : `${BASE_URL}/api/groups/${dialogState.currentGroup.id}`;

      const method = dialogState.mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${dialogState.mode} group`);
      }

      const data = await response.json();
      if (data.success) {
        const updatedGroup = data.group || data.data;
        if (updatedGroup) {
          if (dialogState.mode === "create") {
            setState((prev) => ({
              ...prev,
              groups: [...prev.groups, updatedGroup],
              filteredGroups: [...prev.filteredGroups, updatedGroup],
            }));
          } else {
            setState((prev) => ({
              ...prev,
              groups: prev.groups.map((group) =>
                group.id === updatedGroup.id ? updatedGroup : group
              ),
              filteredGroups: prev.filteredGroups.map((group) =>
                group.id === updatedGroup.id ? updatedGroup : group
              ),
            }));
          }
          setDialogState((prev) => ({ ...prev, open: false }));
          resetForm();
          showSnackbar(
            `Group ${dialogState.mode === "create" ? "created" : "updated"} successfully`
          );
        } else {
          throw new Error("Group data not found in response");
        }
      }
    } catch (error) {
      console.error(
        `Error ${dialogState.mode === "create" ? "creating" : "updating"} group:`,
        error
      );
      showSnackbar(
        error.message || `Error ${dialogState.mode === "create" ? "creating" : "updating"} group`,
        "error"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      isPaid: false,
      oneMonthPrice: "",
      twoMonthPrice: "",
      threeMonthPrice: "",
      yearlyPrice: "",
      customPrice: "",
      customDuration: "",
      groupImage: null,
      imagePreview: null,
    });
    setFormErrors({
      name: false,
      description: false,
      oneMonthPrice: false,
      twoMonthPrice: false,
      threeMonthPrice: false,
      yearlyPrice: false,
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
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        groupImage: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleEditGroup = (group) => {
    setDialogState({
      open: true,
      mode: "edit",
      currentGroup: group,
    });
    setFormData({
      name: group.name,
      description: group.description,
      isPaid: group.isPaid,
      oneMonthPrice: group.oneMonthPrice || "",
      twoMonthPrice: group.twoMonthPrice || "",
      threeMonthPrice: group.threeMonthPrice || "",
      yearlyPrice: group.yearlyPrice || "",
      customPrice: group.customPrice || "",
      customDuration: group.customDuration || "",
      groupImage: null,
      imagePreview: group.groupImage ? `${BASE_URL}/${group.groupImage}` : null,
    });
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
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={() => handleEditGroup(row.original)}>
            <EditIcon />
          </IconButton>
          <Button
            variant="contained"
            color="error"
            onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: row.original.id }))}
          >
            Delete
          </Button>
        </Box>
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
                      onClick={() =>
                        setDialogState({
                          open: true,
                          mode: "create",
                          currentGroup: null,
                        })
                      }
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

      {/* Create/Edit Group Dialog */}
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
          {dialogState.mode === "create" ? "Create New Group" : "Edit Group"}
        </DialogTitle>
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
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Group Image
                  </Button>
                </label>
                {formData.groupImage && (
                  <Chip
                    label={formData.groupImage.name}
                    onDelete={() =>
                      setFormData((prev) => ({ ...prev, groupImage: null, imagePreview: null }))
                    }
                    sx={{ mt: 1, ml: 1 }}
                  />
                )}
              </Box>
              {formData.imagePreview && (
                <Box mt={2}>
                  <img
                    src={formData.imagePreview}
                    alt="Group Preview"
                    style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "4px" }}
                  />
                </Box>
              )}
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
                    label="1 Month Price *"
                    name="oneMonthPrice"
                    type="number"
                    value={formData.oneMonthPrice}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={formErrors.oneMonthPrice}
                    helperText={formErrors.oneMonthPrice ? "Valid price required" : ""}
                  />
                  <TextField
                    label="2 Months Price *"
                    name="twoMonthPrice"
                    type="number"
                    value={formData.twoMonthPrice}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={formErrors.twoMonthPrice}
                    helperText={formErrors.twoMonthPrice ? "Valid price required" : ""}
                  />
                  <TextField
                    label="3 Months Price *"
                    name="threeMonthPrice"
                    type="number"
                    value={formData.threeMonthPrice}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={formErrors.threeMonthPrice}
                    helperText={formErrors.threeMonthPrice ? "Valid price required" : ""}
                  />
                  <TextField
                    label="Yearly Price *"
                    name="yearlyPrice"
                    type="number"
                    value={formData.yearlyPrice}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={formErrors.yearlyPrice}
                    helperText={formErrors.yearlyPrice ? "Valid price required" : ""}
                  />
                  <TextField
                    label="Custom Duration (days)"
                    name="customDuration"
                    type="number"
                    value={formData.customDuration}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Custom Price"
                    name="customPrice"
                    type="number"
                    value={formData.customPrice}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </>
              )}
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
            onClick={handleSubmitGroup}
            color="error"
            variant="contained"
            disabled={!formData.name}
          >
            {dialogState.mode === "create" ? "Create Group" : "Update Group"}
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
      oneMonthPrice: PropTypes.number,
      twoMonthPrice: PropTypes.number,
      threeMonthPrice: PropTypes.number,
      yearlyPrice: PropTypes.number,
      customPrice: PropTypes.number,
      customDuration: PropTypes.number,
      groupImage: PropTypes.string,
      members: PropTypes.array,
    }).isRequired,
  }).isRequired,
};

export default GroupsManagement;
