import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Icon from "@mui/material/Icon";
import DownloadIcon from "@mui/icons-material/Download";

// Base URL from environment or default
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://samachar.chetakbooks.shop";

function Invoices() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  useEffect(() => {
    fetchInvoices();
  }, [pagination.page]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchInvoices = async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMDFjNGEzZS1lY2U5LTQ2N2MtYWY0Yy0zMzEyMDE4MjEwOGIiLCJwaG9uZU51bWJlciI6IjgxNjA1NDkyMjAiLCJ0b2tlbklkIjoiZGIzYzYyNjhmMWEwM2YwMmRlNzBhYmE1MDk3MWM3YmEiLCJpYXQiOjE3NDc3MjE4MTksImV4cCI6MTc0ODMyNjYxOX0.EkFtQIcnfdbNqyXj4_tghea5fvBHTDhenfCmnFWwDnY";

      const response = await fetch(`${BASE_URL}/api/invoices`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();

      if (data.success) {
        setInvoices(data.data);
        setPagination({
          total: data.data.length,
          page: 1,
          limit: 10,
          totalPages: Math.ceil(data.data.length / 10),
        });
      } else {
        throw new Error(data.message || "Failed to fetch invoices");
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      showSnackbar(error.message || "Error fetching invoices", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDownloadPdf = (pdfUrl) => {
    window.open(pdfUrl, "_blank");
  };
  const DownloadButtonCell = ({ value }) => (
    <Button
      variant="contained"
      color="info"
      size="small"
      startIcon={<DownloadIcon />}
      onClick={() => window.open(value, "_blank")}
    >
      PDF
    </Button>
  );

  DownloadButtonCell.propTypes = {
    value: PropTypes.string.isRequired,
  };
  const columns = [
    { Header: "Invoice Number", accessor: "invoiceNumber" },
    { Header: "Customer Name", accessor: "customerName" },
    { Header: "Customer Phone", accessor: "customerPhone" },
    { Header: "Group Name", accessor: "groupName" },
    {
      Header: "Date",
      accessor: "date",
      Cell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      Header: "Total Amount",
      accessor: "totalAmount",
      Cell: ({ value }) => `₹${value}`,
    },
    {
      Header: "Actions",
      accessor: "pdfPath",
      Cell: DownloadButtonCell,
    },
  ];

  const filteredInvoices = invoices.filter((invoice) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber.toLowerCase().includes(searchTermLower) ||
      (invoice.customerName && invoice.customerName.toLowerCase().includes(searchTermLower)) ||
      (invoice.customerPhone && invoice.customerPhone.toLowerCase().includes(searchTermLower)) ||
      (invoice.groupName && invoice.groupName.toLowerCase().includes(searchTermLower))
    );
  });

  // Pagination logic
  const paginatedInvoices = filteredInvoices.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography>Loading Invoices...</MDTypography>
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
                    Invoice History
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search Invoices"
                      type="text"
                      fullWidth
                      value={searchTerm}
                      onChange={handleSearchChange}
                      sx={{
                        mr: 2,
                        width: { xs: "100%", sm: 200 },
                        [theme.breakpoints.down("sm")]: {
                          marginBottom: 2,
                        },
                      }}
                    />
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: paginatedInvoices }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={true}
                  noEndBorder
                  pagination={{
                    currentPage: pagination.page,
                    totalPages: Math.ceil(filteredInvoices.length / pagination.limit),
                    onPageChange: handlePageChange,
                  }}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
}

Invoices.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      invoiceNumber: PropTypes.string.isRequired,
      customerName: PropTypes.string.isRequired,
      customerPhone: PropTypes.string.isRequired,
      groupName: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      totalAmount: PropTypes.number.isRequired,
      pdfPath: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Invoices;
