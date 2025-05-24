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
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
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
import IconButton from "@mui/material/IconButton";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

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

function SubscriptionOrders() {
  const [state, setState] = useState({
    subscriptions: [],
    users: [],
    groups: [],
    loading: true,
    searchTerm: "",
    currentPage: 1,
    totalPages: 1,
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
    statusFilter: "all",
    frequencyFilter: "all",
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    currentSubscription: null,
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

  const fetchSubscriptions = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/subscriptions`, {
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
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
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));
  };

  const handleViewDetails = (subscription) => {
    setDialogState({
      open: true,
      currentSubscription: subscription,
    });
  };

  const handleStatusFilterChange = (event, newFilter) => {
    setState((prev) => ({ ...prev, statusFilter: newFilter }));
  };

  const handleFrequencyFilterChange = (event, newFilter) => {
    setState((prev) => ({ ...prev, frequencyFilter: newFilter }));
  };

  const columns = [
    {
      Header: "User",
      accessor: (row) => `${row.user?.name}`,
    },
    {
      Header: "Phone Number",
      accessor: (row) => `${row.user?.phoneNumber}`,
    },
    {
      Header: "Subscription ID",
      accessor: "id",
    },
    {
      Header: "Frequency",
      accessor: "frequency",
      Cell: FrequencyCell,
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
    const initData = async () => {
      await fetchUsers();
      await fetchGroups();
      await fetchSubscriptions();
    };
    initData();
  }, []);

  if (state.loading && state.subscriptions.length === 0) {
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

  const filteredSubscriptions = state.subscriptions.filter((sub) => {
    const search = state.searchTerm.toLowerCase();
    const user = state.users.find((u) => u.id === sub.userId);
    const group = state.groups.find((g) => g.id === sub.groupId);

    const matchesSearch =
      user?.name.toLowerCase().includes(search) ||
      user?.email.toLowerCase().includes(search) ||
      group?.name.toLowerCase().includes(search) ||
      sub.frequency.toLowerCase().includes(search) ||
      sub.id.toLowerCase().includes(search);

    const matchesStatus =
      state.statusFilter === "all" ||
      (state.statusFilter === "active" ? sub.isActive : !sub.isActive);

    const matchesFrequency =
      state.frequencyFilter === "all" || sub.frequency === state.frequencyFilter;

    return matchesSearch && matchesStatus && matchesFrequency;
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
                    Subscription Orders
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search by subscription ID"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <ToggleButtonGroup
                      value={state.statusFilter}
                      exclusive
                      onChange={handleStatusFilterChange}
                      aria-label="status"
                      sx={{ width: 50, height: 35 }}
                    >
                      <ToggleButton value="all">All</ToggleButton>
                      <ToggleButton value="active">Active</ToggleButton>
                      <ToggleButton value="inactive">Inactive</ToggleButton>
                    </ToggleButtonGroup>
                    <ToggleButtonGroup
                      value={state.frequencyFilter}
                      exclusive
                      onChange={handleFrequencyFilterChange}
                      aria-label="frequency"
                      sx={{ height: 35 }}
                    >
                      <ToggleButton value="all">All</ToggleButton>
                      <ToggleButton value="one_month">Monthly</ToggleButton>
                      <ToggleButton value="two_month">Two-Monthly</ToggleButton>
                      <ToggleButton value="three_month">Three_monthly</ToggleButton>
                      <ToggleButton value="siz_month">six_monthly</ToggleButton>
                      <ToggleButton value="yearly">Yearly</ToggleButton>
                    </ToggleButtonGroup>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredSubscriptions.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredSubscriptions }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm
                        ? "No matching subscriptions found"
                        : "No subscriptions available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Subscription Details Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Subscription Details</DialogTitle>
        <DialogContent dividers>
          {dialogState.currentSubscription && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <MDTypography variant="h6">Subscription ID:</MDTypography>
                <MDTypography>{dialogState.currentSubscription.id}</MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">User:</MDTypography>
                <MDTypography>
                  {(() => {
                    const user = state.users.find(
                      (u) => u.id === dialogState.currentSubscription.userId
                    );
                    return user
                      ? `${user.name} (${user.email})`
                      : dialogState.currentSubscription.userId;
                  })()}
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">Frequency:</MDTypography>
                <MDTypography>
                  <FrequencyCell value={dialogState.currentSubscription.frequency} />
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">Status:</MDTypography>
                <MDTypography>
                  <StatusCell value={dialogState.currentSubscription.isActive} />
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">Start Date:</MDTypography>
                <MDTypography>
                  {new Date(dialogState.currentSubscription.startDate).toLocaleString()}
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <MDTypography variant="h6">End Date:</MDTypography>
                <MDTypography>
                  {new Date(dialogState.currentSubscription.endDate).toLocaleString()}
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

SubscriptionOrders.propTypes = {
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

export default SubscriptionOrders;
