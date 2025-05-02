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

const TransactionTypeCell = ({ value }) => (
  <Chip
    label={value === "credit" ? "Credit" : "Debit"}
    color={value === "credit" ? "success" : "error"}
    size="small"
  />
);
TransactionTypeCell.propTypes = {
  value: PropTypes.string.isRequired,
};

const StatusCell = ({ value }) => (
  <Chip label={value ? "Verified" : "Pending"} color={value ? "success" : "warning"} size="small" />
);
StatusCell.propTypes = {
  value: PropTypes.bool.isRequired,
};

function WalletHistory() {
  const [state, setState] = useState({
    users: [],
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

  const [selectedUser, setSelectedUser] = useState(null);
  const [transactionDialog, setTransactionDialog] = useState({
    open: false,
    transactions: [],
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

  const fetchWalletHistory = async (page = 1, limit = 10) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/admin/users/wallet-history?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wallet history");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setState((prev) => ({
          ...prev,
          users: data.data,
          totalPages: data.pagination?.pages || 1,
          currentPage: data.pagination?.page || 1,
          loading: false,
        }));
      } else {
        throw new Error(data.message || "No wallet history found");
      }
    } catch (error) {
      console.error("Error fetching wallet history:", error);
      showSnackbar(error.message || "Error fetching wallet history", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));
  };

  const handlePageChange = (event, newPage) => {
    setState((prev) => ({ ...prev, currentPage: newPage }));
    fetchWalletHistory(newPage);
  };

  const handleViewTransactions = (user) => {
    setSelectedUser(user);
    setTransactionDialog({
      open: true,
      transactions: user.wallet?.transactions || [],
    });
  };

  const userColumns = [
    { Header: "Name", accessor: "name" },
    // { Header: "Email", accessor: "email" },
    { Header: "Phone", accessor: "phoneNumber" },
    {
      Header: "Status",
      accessor: "isVerified",
      Cell: StatusCell,
    },
    {
      Header: "Balance",
      accessor: (row) => `₹${row.wallet?.balance || 0}`,
    },
    {
      Header: "Transactions",
      accessor: "actions",
      Cell: ({ row }) => (
        <IconButton
          color={row.original.wallet?.transactions?.length ? "success" : "info"}
          onClick={() => handleViewTransactions(row.original)}
          // disabled={!row.original.wallet?.transactions?.length}
          title={`View transactions (${row.original.wallet?.transactions?.length || 0})`}
        >
          <VisibilityIcon />
          {row.original.wallet?.transactions?.length > 0 && (
            <MDTypography variant="caption" color="text" ml={0.5}>
              ({row.original.wallet.transactions.length})
            </MDTypography>
          )}
        </IconButton>
      ),
    },
  ];

  const transactionColumns = [
    { Header: "Amount", accessor: (row) => `₹${row.amount}` },
    {
      Header: "Type",
      accessor: "type",
      Cell: TransactionTypeCell,
    },
    { Header: "Description", accessor: "description" },
    {
      Header: "Date",
      accessor: "createdAt",
      Cell: ({ value }) => new Date(value).toLocaleString(),
    },
    { Header: "Reference", accessor: "reference" },
  ];

  useEffect(() => {
    fetchWalletHistory();
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

  const filteredUsers = state.users.filter(
    (user) =>
      user.name.toLowerCase().includes(state.searchTerm) ||
      user.email.toLowerCase().includes(state.searchTerm) ||
      user.phoneNumber.toLowerCase().includes(state.searchTerm)
  );

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
                    Wallet History
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Users"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredUsers.length > 0 ? (
                  <>
                    <DataTable
                      table={{ columns: userColumns, rows: filteredUsers }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                    <Box display="flex" justifyContent="center" p={2}>
                      <Pagination
                        count={state.totalPages}
                        page={state.currentPage}
                        onChange={handlePageChange}
                        color="primary"
                      />
                    </Box>
                  </>
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching users found" : "No wallet data available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Transactions Dialog */}
      <Dialog
        open={transactionDialog.open}
        onClose={() => setTransactionDialog((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>
          Transactions for {selectedUser?.name} (Balance: ₹{selectedUser?.wallet?.balance || 0})
        </DialogTitle>
        <DialogContent dividers>
          {transactionDialog.transactions.length > 0 ? (
            <DataTable
              table={{ columns: transactionColumns, rows: transactionDialog.transactions }}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={false}
              noEndBorder
            />
          ) : (
            <MDBox p={3} textAlign="center">
              <MDTypography variant="body1">No transactions found for this user</MDTypography>
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionDialog((prev) => ({ ...prev, open: false }))}>
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

WalletHistory.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      phoneNumber: PropTypes.string.isRequired,
      isVerified: PropTypes.bool.isRequired,
      wallet: PropTypes.shape({
        balance: PropTypes.number.isRequired,
        transactions: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            amount: PropTypes.number.isRequired,
            type: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            createdAt: PropTypes.string.isRequired,
            reference: PropTypes.string.isRequired,
          })
        ).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default WalletHistory;
