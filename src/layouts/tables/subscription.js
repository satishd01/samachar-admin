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
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

const StatusCell = ({ value }) => (
  <Chip label={value ? "Active" : "Inactive"} color={value ? "success" : "error"} size="small" />
);
StatusCell.propTypes = {
  value: PropTypes.bool.isRequired,
};

function SubscriptionManagement() {
  const [state, setState] = useState({
    subscriptions: [],
    users: [],
    groups: [],
    loading: true,
    searchTerm: "",
    selectedUserId: "",
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    formData: {
      userId: "",
      groupId: "",
      frequency: "monthly",
    },
    formErrors: {
      userId: false,
      groupId: false,
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setState((prev) => ({
          ...prev,
          users: data,
        }));
      } else {
        throw new Error(data.message || "No users found");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar(error.message || "Error fetching users", "error");
    }
  };

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
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
        }));
      } else {
        throw new Error(data.message || "No groups found");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      showSnackbar(error.message || "Error fetching groups", "error");
    }
  };

  const fetchSubscriptions = async (userId) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/subscriptions/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await response.json();
      if (data.subscriptions) {
        setState((prev) => ({
          ...prev,
          subscriptions: data.subscriptions,
          loading: false,
        }));
      } else {
        throw new Error(data.message || "No subscriptions found");
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      showSnackbar(error.message || "Error fetching subscriptions", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setState((prev) => ({ ...prev, selectedUserId: userId }));
    fetchSubscriptions(userId);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));
  };

  const validateForm = () => {
    const errors = {
      userId: !dialogState.formData.userId,
      groupId: !dialogState.formData.groupId,
    };

    setDialogState((prev) => ({
      ...prev,
      formErrors: errors,
    }));

    return !Object.values(errors).some(Boolean);
  };

  const handleCreateSubscription = async () => {
    if (!validateForm()) {
      showSnackbar("Please fill all required fields", "error"); //
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/admin/subscribe-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dialogState.formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create subscription");
      }

      const data = await response.json();
      if (data) {
        showSnackbar("Subscription created successfully");
        setDialogState((prev) => ({
          ...prev,
          open: false,
          formData: {
            userId: "",
            groupId: "",
            frequency: "monthly",
          },
        }));
        fetchSubscriptions(state.selectedUserId);
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      showSnackbar(error.message || "Error creating subscription", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDialogState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value,
      },
      formErrors: {
        ...prev.formErrors,
        [name]: false,
      },
    }));
  };

  const columns = [
    {
      Header: "Group",
      accessor: (row) => state.groups.find((g) => g.id === row.groupId)?.name || row.groupId,
    },
    {
      Header: "Frequency",
      accessor: "frequency",
      Cell: ({ value }) => value.charAt(0).toUpperCase() + value.slice(1),
    },
    {
      Header: "Start Date",
      accessor: "startDate",
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      Header: "End Date",
      accessor: "endDate",
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      Header: "Status",
      accessor: "isActive",
      Cell: StatusCell,
    },
  ];

  useEffect(() => {
    const init = async () => {
      await fetchUsers();
      await fetchGroups();
      setState((prev) => ({ ...prev, loading: false }));
    };
    init();
  }, []);

  if (state.loading && state.users.length === 0) {
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
                    Subscription
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Subscriptions"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                      disabled={!state.selectedUserId}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDialogState((prev) => ({ ...prev, open: true }))}
                    >
                      Allocate Subscription
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3} px={2}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select User</InputLabel>
                  <Select
                    value={state.selectedUserId}
                    label="Select User"
                    onChange={handleUserChange}
                    sx={{ width: 300, height: 35 }}
                  >
                    {state.users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {state.selectedUserId ? (
                  state.subscriptions.length > 0 ? (
                    <DataTable
                      table={{ columns, rows: state.subscriptions }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  ) : (
                    <MDBox p={3} textAlign="center">
                      <MDTypography variant="body1">
                        No subscriptions found for this user
                      </MDTypography>
                    </MDBox>
                  )
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      Please select a user to view subscriptions
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create Subscription Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() =>
          setDialogState((prev) => ({
            ...prev,
            open: false,
            formData: {
              userId: "",
              groupId: "",
              frequency: "monthly",
            },
          }))
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Subscription</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" error={dialogState.formErrors.userId}>
                <InputLabel>User *</InputLabel>
                <Select
                  name="userId"
                  value={dialogState.formData.userId}
                  onChange={handleInputChange}
                  label="User *"
                  sx={{ width: 300, height: 35 }}
                >
                  {state.users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" error={dialogState.formErrors.groupId}>
                <InputLabel>Group *</InputLabel>
                <Select
                  name="groupId"
                  value={dialogState.formData.groupId}
                  onChange={handleInputChange}
                  label="Group *"
                  sx={{ width: 300, height: 35 }}
                >
                  {state.groups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="frequency"
                  value={dialogState.formData.frequency}
                  onChange={handleInputChange}
                  label="Frequency"
                  sx={{ width: 300, height: 35 }}
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDialogState((prev) => ({
                ...prev,
                open: false,
                formData: {
                  userId: "",
                  groupId: "",
                  frequency: "monthly",
                },
              }))
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateSubscription}
            color="error"
            variant="contained"
            disabled={!dialogState.formData.userId || !dialogState.formData.groupId}
          >
            Create
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

SubscriptionManagement.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      groupId: PropTypes.string.isRequired,
      frequency: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      isActive: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
};

export default SubscriptionManagement;
