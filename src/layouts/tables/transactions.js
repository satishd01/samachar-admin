import { useEffect, useState, useMemo } from "react";
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
  IconButton,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReceiptIcon from "@mui/icons-material/Receipt";
import Typography from "@mui/material/Typography";
import logo from "assets/images/logos/logo.jpeg";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

const PaidCell = ({ value }) => {
  switch (value) {
    case "captured":
      return (
        <Chip
          icon={<CheckCircleIcon style={{ color: "white" }} />}
          label="captured"
          color="success"
          size="small"
        />
      );
    case "created":
      return (
        <Chip
          icon={<HourglassEmptyIcon style={{ color: "white" }} />}
          label="created"
          color="warning"
          size="small"
        />
      );
    case "failed":
      return (
        <Chip
          icon={<CancelIcon style={{ color: "white" }} />}
          label="Failed"
          color="error"
          size="small"
        />
      );
    default:
      return <Chip label={value} variant="outlined" size="small" />;
  }
};
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

      const filtered = data.data.filter((tx) => tx?.metadata?.notes?.type !== "wallet_topup");
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

  const downloadInvoice = async (userId, groupId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/invoices/userId/${userId}/groupId/${groupId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No payment record found for this user and group");
      }

      const data = await response.json();

      // Update the transaction with the complete invoice data
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) =>
          t.userId === userId && t.metadata.notes.groupId === groupId
            ? { ...t, invoiceData: data.invoice }
            : t
        ),
        filteredTransactions: prev.filteredTransactions.map((t) =>
          t.userId === userId && t.metadata.notes.groupId === groupId
            ? { ...t, invoiceData: data.invoice }
            : t
        ),
      }));

      generateInvoicePDF(data.invoice);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      showSnackbar(error.message || "Error downloading invoice", "error");
    }
  };

  const generateInvoicePDF = (invoice) => {
    const win = window.open("", "_blank");

    // Format dates
    const issueDate = new Date(invoice.issued_at * 1000).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const dueDate = invoice.expire_by
      ? new Date(invoice.expire_by * 1000).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Immediately";

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            color: #1F2937;
            background-color: #F9FAFB;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          
          .header {
            padding: 24px;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .company-logo {
            height: 40px;
          }
          
          .invoice-title {
            font-size: 24px;
            font-weight: 600;
          }
          
          .invoice-number {
            font-size: 14px;
            opacity: 0.9;
          }
          
          .content {
            padding: 24px;
          }
          
          .summary {
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid #E5E7EB;
          }
          
          .summary-item {
            flex: 1;
          }
          
          .summary-label {
            font-size: 12px;
            color: #6B7280;
            margin-bottom: 4px;
          }
          
          .summary-value {
            font-size: 14px;
            font-weight: 500;
          }
          
          .amount-due {
            background: #F3F4F6;
            padding: 16px;
            border-radius: 8px;
            text-align: right;
            margin-bottom: 24px;
          }
          
          .amount-label {
            font-size: 14px;
            color: #6B7280;
          }
          
          .amount-value {
            font-size: 24px;
            font-weight: 600;
            color: #1F2937;
          }
          
          .details {
            display: flex;
            margin-bottom: 24px;
          }
          
          .billing-address, .shipping-address {
            flex: 1;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #1F2937;
          }
          
          .address {
            font-size: 14px;
            line-height: 1.5;
            color: #4B5563;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          
          th {
            text-align: left;
            padding: 12px 16px;
            background: #F9FAFB;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            border-bottom: 1px solid #E5E7EB;
          }
          
          td {
            padding: 16px;
            font-size: 14px;
            color: #4B5563;
            border-bottom: 1px solid #E5E7EB;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-bold {
            font-weight: 600;
          }
          
          .total-row td {
            border-bottom: none;
            padding-top: 16px;
            padding-bottom: 0;
          }
          
          .footer {
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #6B7280;
            border-top: 1px solid #E5E7EB;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            background: ${invoice.status === "paid" ? "#D1FAE5" : "#FEE2E2"};
            color: ${invoice.status === "paid" ? "#065F46" : "#991B1B"};
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div>
              <img src="${logo}" alt="Company Logo" class="company-logo">
              <div style="margin-top: 8px;">COMMODITY SAMACHAR SECURITIES PRIVATE LIMITED</div>
              <div style="font-size: 12px; margin-top: 4px;">GSTIN - 27AALCC8507A12T</div>
            </div>
            <div style="text-align: right;">
              <div class="invoice-title">Invoice</div>
              <div class="invoice-number">#${invoice.invoice_number}</div>
              <div style="margin-top: 8px; font-size: 14px;">
                Status: <span class="status-badge">${invoice.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          <div class="content">
            <div class="summary">
              <div class="summary-item">
                <div class="summary-label">Issued on</div>
                <div class="summary-value">${issueDate}</div>
              </div>
            </div>
            
            <div class="amount-due">
              <div class="amount-label">Amount Due</div>
              <div class="amount-value">${invoice.currency_symbol} ${invoice.amount_due.toFixed(2)}</div>
            </div>
            
            <div class="details">
              <div class="billing-address">
                <div class="section-title">Billed to</div>
                <div class="address">
                  ${invoice.customer_details.name}<br>
                  ${invoice.customer_details.email}<br>
                  ${invoice.customer_details.contact}<br>
                  ${invoice.customer_details.billing_address || "Office No-311-B, Suratwala Markplazzo, Hinjewadi Road<br>Phase-1, Pimpri Chinchwad, Pune, Maharashtra<br>Pune, Maharashtra, India - 411057"}
                </div>
              </div>
              <div class="shipping-address">
                <div class="section-title">Shipping to</div>
                <div class="address">
                  ${invoice.customer_details.shipping_address || "customer addres not found"}
                </div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.line_items
                  .map(
                    (item) => `
                  <tr>
                    <td>
                      <div style="font-weight: 500;">${item.name}</div>
                      <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">${item.description}</div>
                    </td>
                    <td class="text-right">${invoice.currency_symbol} ${item.unit_amount.toFixed(2)}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${invoice.currency_symbol} ${item.amount.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
                
                <tr>
                  <td colspan="3" class="text-right text-bold">Subtotal</td>
                  <td class="text-right text-bold">${invoice.currency_symbol} ${invoice.taxable_amount.toFixed(2)}</td>
                </tr>
                
                <tr>
                  <td colspan="3" class="text-right">CGST (0%)</td>
                  <td class="text-right">${invoice.currency_symbol} 0.00</td>
                </tr>
                
                <tr>
                  <td colspan="3" class="text-right">SGST (0%)</td>
                  <td class="text-right">${invoice.currency_symbol} 0.00</td>
                </tr>
                
                <tr class="total-row">
                  <td colspan="3" class="text-right text-bold">Total</td>
                  <td class="text-right text-bold">${invoice.currency_symbol} ${invoice.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 24px;">
              <div style="margin-bottom: 8px;">Notes:</div>
              <div>${invoice.notes || "Thank you for your business!"}</div>
            </div>
            
            <div style="font-size: 12px; color: #6B7280;">
              <div style="margin-bottom: 8px;">Terms & Conditions:</div>
              <div>${invoice.terms || "Payment is due within 15 days. Please make the payment by the due date."}</div>
            </div>
          </div>
          
          <div class="footer">
            <div>COMMODITY SAMACHAR SECURITIES PRIVATE LIMITED</div>
            <div style="margin-top: 4px;">${invoice.customer_details.billing_address || "Office No-311-B, Suratwala Markplazzo, Hinjewadi Road, Phase-1, Pimpri Chinchwad, Pune, Maharashtra - 411057"}</div>
            <div style="margin-top: 4px;">GSTIN: 27AALCC8507A12T</div>
            <div style="margin-top: 8px;">Page 1 of 1</div>
          </div>
        </div>
      </body>
      </html>
    `);

    win.document.close();
    setTimeout(() => {
      win.print();
    }, 500);
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
        transaction.userEmail.toLowerCase().includes(query) ||
        (transaction.userPhone && transaction.userPhone.toLowerCase().includes(query))
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
    setState((prev) => ({
      ...prev,
      currentPage: 1,
      searchTerm: "",
    }));
    fetchTransactions();
  };

  const columns = [
    { Header: "Type", accessor: (row) => row.metadata.notes.type },
    { Header: "Transaction ID", accessor: "paymentId" },
    { Header: "Group Name", accessor: "groupName" },
    { Header: "User", accessor: (row) => `${row.userName}` },
    { Header: "Phone", accessor: (row) => `${row.userPhone}` },
    { Header: "Amount", accessor: (row) => `${row.amount} ${row.currency}` },
    // { Header: "Payment Status", accessor: "paymentStatus" },
    { Header: "Status", accessor: "paymentStatus", Cell: PaidCell },
    { Header: "Date", accessor: (row) => new Date(row.paymentDate).toLocaleString() },
    {
      Header: "Invoice",
      accessor: (row) => (
        <Tooltip title="Download Invoice">
          <IconButton
            onClick={() => downloadInvoice(row.userId, row.metadata.notes.groupId)}
            color="primary"
            size="small"
          >
            <PictureAsPdfIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

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
                    Transactions
                  </MDTypography>
                  <Box display="flex" gap={1} alignItems="center">
                    <TextField
                      label="Search Transactions"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      size="small"
                      sx={{ width: 250 }}
                      InputProps={{
                        endAdornment: state.searchTerm && (
                          <IconButton
                            size="small"
                            onClick={() => setState((prev) => ({ ...prev, searchTerm: "" }))}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        ),
                      }}
                    />
                    <Tooltip title="Reset all filters">
                      <Button
                        variant="contained"
                        color="error"
                        onClick={resetFilters}
                        size="small"
                        startIcon={<ClearIcon />}
                      >
                        Reset
                      </Button>
                    </Tooltip>
                  </Box>
                </MDBox>
              </MDBox>
              <MDBox pt={2} px={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={users}
                      getOptionLabel={(option) => `${option.name} (${option.phoneNumber})`}
                      onChange={(event, newValue) => {
                        handleFilterChange({
                          target: {
                            name: "userId",
                            value: newValue?.id || "",
                          },
                        });
                      }}
                      value={users.find((user) => user.id === filters.userId) || null}
                      renderInput={(params) => (
                        <TextField {...params} label="Filter by User" size="small" fullWidth />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="From Date"
                      type="date"
                      value={filters.startDate ? filters.startDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => handleDateChange("startDate", new Date(e.target.value))}
                      fullWidth
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="To Date"
                      type="date"
                      value={filters.endDate ? filters.endDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => handleDateChange("endDate", new Date(e.target.value))}
                      fullWidth
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  {/* <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="paymentStatus"
                        value={filters.paymentStatus}
                        onChange={handleFilterChange}
                        label="Status"
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="free">Free</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid> */}
                  {/* <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        name="transactionType"
                        value={filters.transactionType}
                        onChange={handleFilterChange}
                        label="Type"
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="subscription">Subscription</MenuItem>
                        <MenuItem value="one-time">One-time</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid> */}
                </Grid>

                {state.loading ? (
                  <MDBox p={3} display="flex" justifyContent="center">
                    <CircularProgress />
                  </MDBox>
                ) : state.filteredTransactions.length > 0 ? (
                  <>
                    <DataTable
                      table={{ columns, rows: state.filteredTransactions }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Pagination
                        count={state.totalPages}
                        page={state.currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </>
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm || Object.values(filters).some(Boolean)
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
          size="small"
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
