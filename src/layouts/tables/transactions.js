import { useEffect, useState } from "react";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  CircularProgress,
  Pagination,
  Grid,
  Card,
  Snackbar,
  Alert,
} from "@mui/material";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

const PaidCell = ({ value }) => (
  <Chip label={value ? "Paid" : "Free"} color={value ? "error" : "success"} size="small" />
);
PaidCell.propTypes = {
  value: PropTypes.bool.isRequired,
};

function TransactionManagement() {
  const [state, setState] = useState({
    transactions: [],
    filteredTransactions: [],
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

  const [filters, setFilters] = useState({
    userId: "",
    startDate: null,
    endDate: null,
    paymentStatus: "",
    transactionType: "",
  });

  const [users, setUsers] = useState([]);

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

  const fetchTransactions = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const params = new URLSearchParams({
        page: state.currentPage,
        limit: 10,
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.startDate && { startDate: filters.startDate.toISOString().split("T")[0] }),
        ...(filters.endDate && { endDate: filters.endDate.toISOString().split("T")[0] }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.transactionType && { transactionType: filters.transactionType }),
      });

      const response = await fetch(`${BASE_URL}/api/transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        transactions: data.data,
        filteredTransactions: data.data,
        loading: false,
        totalPages: data.meta.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showSnackbar(error.message || "Error fetching transactions", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
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
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar(error.message || "Error fetching users", "error");
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchUsers();
  }, [state.currentPage, filters]);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));

    if (query.trim() === "") {
      setState((prev) => ({ ...prev, filteredTransactions: prev.transactions }));
      return;
    }

    const filtered = state.transactions.filter(
      (transaction) =>
        transaction.paymentId.toLowerCase().includes(query) ||
        transaction.userName.toLowerCase().includes(query) ||
        transaction.userEmail.toLowerCase().includes(query)
    );
    setState((prev) => ({ ...prev, filteredTransactions: filtered }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleDateChange = (name, date) => {
    setFilters((prev) => ({
      ...prev,
      [name]: date,
    }));
    setState((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (event, value) => {
    setState((prev) => ({ ...prev, currentPage: value }));
  };

  const resetFilters = () => {
    setFilters({
      userId: "",
      startDate: null,
      endDate: null,
      paymentStatus: "",
      transactionType: "",
    });
    setState((prev) => ({ ...prev, currentPage: 1 }));
    fetchTransactions();
  };

  const columns = [
    { Header: "Transaction ID", accessor: "paymentId" },
    { Header: "User", accessor: (row) => `${row.userName} (${row.userEmail})` },
    { Header: "Amount", accessor: (row) => `${row.amount} ${row.currency}` },
    { Header: "Type", accessor: (row) => row.metadata.notes.type },
    { Header: "Status", accessor: "paymentStatus", Cell: PaidCell },
    { Header: "Date", accessor: (row) => new Date(row.paymentDate).toLocaleString() },
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
                    Transactions
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Transactions"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button variant="contained" color="error" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>User</InputLabel>
                      <Select
                        name="userId"
                        value={filters.userId}
                        onChange={handleFilterChange}
                        label="User"
                        sx={{ width: 400, height: 35, ml: 1 }}
                      >
                        <MenuItem value="">All Users</MenuItem>
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={filters.startDate ? filters.startDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => handleDateChange("startDate", new Date(e.target.value))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={filters.endDate ? filters.endDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => handleDateChange("endDate", new Date(e.target.value))}
                      fullWidth
                    />
                  </Grid>
                  {/* <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Status</InputLabel>
                      <Select
                        name="paymentStatus"
                        value={filters.paymentStatus}
                        onChange={handleFilterChange}
                        label="Payment Status"
                      >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="created">Created</MenuItem>
                        <MenuItem value="captured">Captured</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                        <MenuItem value="refunded">Refunded</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Transaction Type</InputLabel>
                      <Select
                        name="transactionType"
                        value={filters.transactionType}
                        onChange={handleFilterChange}
                        label="Transaction Type"
                      >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="group_subscription">Group Subscription</MenuItem>
                        <MenuItem value="wallet_topup">Wallet Top-up</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid> */}
                </Grid>
                {state.filteredTransactions.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: state.filteredTransactions }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm
                        ? "No matching transactions found"
                        : "No transactions available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

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

TransactionManagement.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      paymentId: PropTypes.string.isRequired,
      userName: PropTypes.string.isRequired,
      userEmail: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      currency: PropTypes.string.isRequired,
      paymentStatus: PropTypes.string.isRequired,
      paymentDate: PropTypes.string.isRequired,
      metadata: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
};

export default TransactionManagement;
