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

// Base URL from environment or default
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

function CallVerifications() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [verifications, setVerifications] = useState([]);
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
    fetchCallVerifications();
  }, [pagination.page]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchCallVerifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/get-users-call-verification?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch call verifications");
      }

      const data = await response.json();
      setVerifications(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching call verification data:", error);
      showSnackbar("Error fetching call verifications", "error");
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

  const columns = [
    { Header: "User Name", accessor: (row) => row.user?.name || "N/A" },
    { Header: "User Email", accessor: (row) => row.user?.email || "N/A" },
    { Header: "Phone", accessor: "phone" },
    {
      Header: "Response",
      accessor: "response",
      Cell: ({ value }) => (value === 1 ? "Verified" : "Not Verified"),
    },
    { Header: "Context", accessor: "context" },
    { Header: "Call SID", accessor: "callSid" },
    // {
    //   Header: "Created At",
    //   accessor: "createdAt",
    //   Cell: ({ value }) => new Date(value).toLocaleString(),
    // },
  ];

  const filteredVerifications = verifications.filter((verification) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (verification.user?.name && verification.user.name.toLowerCase().includes(searchTermLower)) ||
      (verification.user?.email &&
        verification.user.email.toLowerCase().includes(searchTermLower)) ||
      (verification.phone && verification.phone.toLowerCase().includes(searchTermLower)) ||
      (verification.callSid && verification.callSid.toLowerCase().includes(searchTermLower))
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography>Loading Call Verifications...</MDTypography>
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
                    Call Verifications
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search Verifications"
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
                  table={{ columns, rows: filteredVerifications }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  pagination={{
                    currentPage: pagination.page,
                    totalPages: pagination.totalPages,
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

CallVerifications.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.number.isRequired,
      userId: PropTypes.string.isRequired,
      response: PropTypes.number.isRequired,
      phone: PropTypes.string.isRequired,
      context: PropTypes.string.isRequired,
      callSid: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      user: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
      }),
    }).isRequired,
  }).isRequired,
};

export default CallVerifications;
