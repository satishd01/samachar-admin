import { useEffect, useState, useMemo, useCallback } from "react";
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
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  Pagination,
} from "@mui/material";
import PropTypes from "prop-types";
import DownloadIcon from "@mui/icons-material/Download";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";
const DEFAULT_PAGE_SIZE = 10;

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
    statusFilter: "all",
    dateRange: {
      start: null,
      end: null,
    },
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    },
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    formData: {
      userId: "",
      groupId: "",
      frequency: "one_month",
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: dayjs().add(1, "month").format("YYYY-MM-DD"),
    },
    formErrors: {
      userId: false,
      groupId: false,
      startDate: false,
      endDate: false,
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
      setState((prev) => ({
        ...prev,
        users: Array.isArray(data) ? data : [],
      }));
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
      setState((prev) => ({
        ...prev,
        groups: data.success ? data.groups : [],
      }));
    } catch (error) {
      console.error("Error fetching groups:", error);
      showSnackbar(error.message || "Error fetching groups", "error");
    }
  };

  const fetchSubscriptions = useCallback(
    async (userId = "", page = 1) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const token = localStorage.getItem("token");
        if (!token) {
          showSnackbar("No token found, please login again", "error");
          return;
        }

        let url;
        if (userId) {
          // Specific user endpoint - no pagination or filters
          url = `${BASE_URL}/api/subscriptions/${userId}`;
        } else {
          // General endpoint with pagination and filters
          const params = new URLSearchParams();
          params.append("page", page);
          params.append("pageSize", DEFAULT_PAGE_SIZE);

          if (state.dateRange.start) {
            params.append("startDate", state.dateRange.start);
          }

          if (state.dateRange.end) {
            params.append("endDate", state.dateRange.end);
          }

          url = `${BASE_URL}/api/subscriptions?${params.toString()}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch subscriptions");
        }

        const data = await response.json();

        // Normalize the data structure
        const subscriptions = Array.isArray(data)
          ? data
          : data.data
            ? data.data
            : data.subscriptions || [];

        setState((prev) => ({
          ...prev,
          subscriptions: subscriptions.map((sub) => ({
            ...sub,
            userId: sub.userId || sub.user?.id,
          })),
          loading: false,
          pagination: userId
            ? {
                currentPage: 1,
                totalPages: 1,
                totalItems: subscriptions.length,
              }
            : {
                currentPage: data.currentPage || 1,
                totalPages: data.totalPages || 1,
                totalItems: data.totalItems || subscriptions.length,
              },
        }));
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        showSnackbar(error.message || "Error fetching subscriptions", "error");
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [state.dateRange.start, state.dateRange.end]
  );

  const handleUserChange = (event, newValue) => {
    const userId = newValue?.id || "";
    setState((prev) => ({
      ...prev,
      selectedUserId: userId,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
      },
    }));
    fetchSubscriptions(userId);
  };

  const handleSearchChange = (e) => {
    setState((prev) => ({ ...prev, searchTerm: e.target.value.toLowerCase() }));
  };

  const handleStatusFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setState((prev) => ({ ...prev, statusFilter: newFilter }));
    }
  };

  const handleDateRangeChange = (name, date) => {
    const newDateRange = {
      ...state.dateRange,
      [name]: date,
    };

    setState((prev) => ({
      ...prev,
      dateRange: newDateRange,
    }));

    // Only refetch general subscriptions when date changes
    if (!state.selectedUserId) {
      fetchSubscriptions();
    }
  };

  const handlePageChange = (event, page) => {
    setState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        currentPage: page,
      },
    }));
    // Only fetch with pagination for general subscriptions
    if (!state.selectedUserId) {
      fetchSubscriptions("", page);
    }
  };

  const filteredSubscriptions = useMemo(() => {
    let result = state.subscriptions;

    // Apply client-side filters (search and status)
    if (state.searchTerm) {
      result = result.filter((sub) => {
        const groupName = state.groups.find((g) => g.id === sub.groupId)?.name?.toLowerCase() || "";
        const userName = state.users.find((u) => u.id === sub.userId)?.name?.toLowerCase() || "";
        return (
          groupName.includes(state.searchTerm) ||
          userName.includes(state.searchTerm) ||
          sub.frequency.toLowerCase().includes(state.searchTerm)
        );
      });
    }

    if (state.statusFilter !== "all") {
      result = result.filter((sub) =>
        state.statusFilter === "active" ? sub.isActive : !sub.isActive
      );
    }

    return result;
  }, [state.subscriptions, state.searchTerm, state.statusFilter, state.groups, state.users]);

  const handleExportExcel = (type = "all") => {
    let dataToExport = filteredSubscriptions;

    if (type !== "all") {
      dataToExport = dataToExport.filter((sub) =>
        type === "active" ? sub.isActive : !sub.isActive
      );
    }

    if (dataToExport.length === 0) {
      showSnackbar(`No ${type} subscriptions to export`, "warning");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      dataToExport.map((sub) => {
        const user = sub.user || state.users.find((u) => u.id === sub.userId);
        const group = state.groups.find((g) => g.id === sub.groupId);

        return {
          "User Name": user?.name || "N/A",
          "User Phone": user?.phoneNumber || "N/A",
          "Group Name": group?.name || "N/A",
          Frequency: sub.frequency,
          "Start Date": dayjs(sub.startDate).format("DD/MM/YYYY"),
          "End Date": dayjs(sub.endDate).format("DD/MM/YYYY"),
          Status: sub.isActive ? "Active" : "Inactive",
        };
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscriptions");
    XLSX.writeFile(workbook, `subscriptions_${type}_${dayjs().format("YYYY-MM-DD")}.xlsx`);
  };

  const validateForm = () => {
    const errors = {
      userId: !dialogState.formData.userId,
      groupId: !dialogState.formData.groupId,
      startDate: !dialogState.formData.startDate,
      endDate:
        !dialogState.formData.endDate ||
        dayjs(dialogState.formData.endDate).isBefore(dayjs(dialogState.formData.startDate)),
    };

    setDialogState((prev) => ({
      ...prev,
      formErrors: errors,
    }));

    return !Object.values(errors).some(Boolean);
  };

  const handleCreateSubscription = async () => {
    if (!validateForm()) {
      showSnackbar("Please fill all required fields correctly", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        userId: dialogState.formData.userId,
        groupId: dialogState.formData.groupId,
        frequency: dialogState.formData.frequency,
        startDate: dialogState.formData.startDate,
        endDate: dialogState.formData.endDate,
      };

      const response = await fetch(`${BASE_URL}/api/admin/subscribe-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create subscription");
      }

      showSnackbar("Subscription created successfully");
      setDialogState((prev) => ({
        ...prev,
        open: false,
        formData: {
          userId: "",
          groupId: "",
          frequency: "one_month",
          startDate: dayjs().format("YYYY-MM-DD"),
          endDate: dayjs().add(1, "month").format("YYYY-MM-DD"),
        },
      }));
      fetchSubscriptions(state.selectedUserId);
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

  const handleDateChange = (name, value) => {
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
      Header: "Name",
      accessor: (row) => {
        const user = row.user || state.users.find((u) => u.id === row.userId);
        return user?.name || "N/A";
      },
    },
    {
      Header: "Mobile",
      accessor: (row) => {
        const user = row.user || state.users.find((u) => u.id === row.userId);
        return user?.phoneNumber || "N/A";
      },
    },
    {
      Header: "Group",
      accessor: (row) => {
        const group = state.groups.find((g) => g.id === row.groupId);
        return group?.name || row.groupId;
      },
    },
    {
      Header: "Frequency",
      accessor: "frequency",
      Cell: ({ value }) => value.charAt(0).toUpperCase() + value.slice(1).replace("_", " "),
    },
    {
      Header: "Start Date",
      accessor: "startDate",
      Cell: ({ value }) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      Header: "End Date",
      accessor: "endDate",
      Cell: ({ value }) => dayjs(value).format("DD/MM/YYYY"),
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
      await fetchSubscriptions();
    };
    init();
  }, [fetchSubscriptions]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={2}
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
                    Subscription Management
                  </MDTypography>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDialogState((prev) => ({ ...prev, open: true }))}
                      size="small"
                    >
                      Add subscription
                    </Button>
                    <Tooltip title="Export All">
                      <IconButton
                        onClick={() => handleExportExcel("all")}
                        color="primary"
                        size="small"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export Active Only">
                      <IconButton
                        onClick={() => handleExportExcel("active")}
                        color="success"
                        size="small"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export Inactive Only">
                      <IconButton
                        onClick={() => handleExportExcel("inactive")}
                        color="error"
                        size="small"
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </MDBox>
              </MDBox>
              <MDBox pt={2} px={2}>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                      options={state.users}
                      getOptionLabel={(option) => `${option.name} (${option.phoneNumber})`}
                      onChange={handleUserChange}
                      renderInput={(params) => (
                        <TextField {...params} label="Search User" size="small" fullWidth />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Search Subscriptions"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  {/* <Grid item xs={12} sm={6} md={2}>
                    <ToggleButtonGroup
                      value={state.statusFilter}
                      exclusive
                      onChange={handleStatusFilterChange}
                      fullWidth
                      size="small"
                    >
                      <ToggleButton value="all">All</ToggleButton>
                      <ToggleButton value="active">Active</ToggleButton>
                      <ToggleButton value="inactive">Inactive</ToggleButton>
                    </ToggleButtonGroup>
                  </Grid> */}
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={state.dateRange.start || ""}
                      onChange={(e) => handleDateRangeChange("start", e.target.value)}
                      size="small"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        max: state.dateRange.end || undefined,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={state.dateRange.end || ""}
                      onChange={(e) => handleDateRangeChange("end", e.target.value)}
                      size="small"
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: state.dateRange.start || undefined,
                      }}
                    />
                  </Grid>
                </Grid>

                {state.loading ? (
                  <MDBox p={3} display="flex" justifyContent="center">
                    <CircularProgress />
                  </MDBox>
                ) : filteredSubscriptions.length > 0 ? (
                  <>
                    <DataTable
                      table={{ columns, rows: filteredSubscriptions }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                    {/* Only show pagination when viewing general subscriptions */}
                    {!state.selectedUserId && (
                      <MDBox display="flex" justifyContent="center" p={2}>
                        <Pagination
                          count={state.pagination.totalPages}
                          page={state.pagination.currentPage}
                          onChange={handlePageChange}
                          color="primary"
                        />
                      </MDBox>
                    )}
                  </>
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ||
                      state.statusFilter !== "all" ||
                      state.dateRange.start ||
                      state.dateRange.end
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

      <Dialog
        open={dialogState.open}
        onClose={() =>
          setDialogState((prev) => ({
            ...prev,
            open: false,
            formData: {
              userId: "",
              groupId: "",
              frequency: "one_month",
              startDate: dayjs().format("YYYY-MM-DD"),
              endDate: dayjs().add(1, "month").format("YYYY-MM-DD"),
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
              <Autocomplete
                options={state.users}
                getOptionLabel={(option) => `${option.name} (${option.phoneNumber})`}
                onChange={(event, newValue) =>
                  handleInputChange({
                    target: {
                      name: "userId",
                      value: newValue?.id || "",
                    },
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="User *"
                    size="small"
                    error={dialogState.formErrors.userId}
                    helperText={dialogState.formErrors.userId ? "User is required" : ""}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={state.groups}
                getOptionLabel={(option) => option.name}
                onChange={(event, newValue) =>
                  handleInputChange({
                    target: {
                      name: "groupId",
                      value: newValue?.id || "",
                    },
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Group *"
                    size="small"
                    error={dialogState.formErrors.groupId}
                    helperText={dialogState.formErrors.groupId ? "Group is required" : ""}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="frequency"
                  value={dialogState.formData.frequency}
                  onChange={handleInputChange}
                  label="Frequency"
                >
                  <MenuItem value="one_month">One Month</MenuItem>
                  <MenuItem value="two_month">Two Months</MenuItem>
                  <MenuItem value="three_month">Three Months</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Start Date *"
                type="date"
                name="startDate"
                value={dialogState.formData.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                error={dialogState.formErrors.startDate}
                helperText={dialogState.formErrors.startDate ? "Start date is required" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="End Date *"
                type="date"
                name="endDate"
                value={dialogState.formData.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                error={dialogState.formErrors.endDate}
                helperText={
                  dialogState.formErrors.endDate ? "End date must be after start date" : ""
                }
              />
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
                  frequency: "one_month",
                  startDate: dayjs().format("YYYY-MM-DD"),
                  endDate: dayjs().add(1, "month").format("YYYY-MM-DD"),
                },
              }))
            }
            size="small"
          >
            Cancel
          </Button>
          <Button onClick={handleCreateSubscription} color="error" variant="contained" size="small">
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
          size="small"
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
