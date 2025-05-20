import { useEffect, useState, useMemo } from "react";
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
import * as XLSX from "xlsx";
import GetAppIcon from "@mui/icons-material/GetApp";
import { MenuItem, TablePagination } from "@mui/material";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

const initialFormData = {
  name: "",
  email: "",
  phoneNumber: "",
  about: "",
  password: "",
  KYCStatus: "pending",
  isVerified: false,
  lastSeen: "",
  fcmToken: "",
};

function Users() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openSubscriptionDialog, setOpenSubscriptionDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState(initialFormData);
  const [subscriptionData, setSubscriptionData] = useState({
    userId: "",
    groupId: "",
    frequency: "one_month",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);

  const filteredUsers = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    return users.filter((user) => {
      return (
        (user.name && user.name.toLowerCase().includes(searchTermLower)) ||
        (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchTermLower))
      );
    });
  }, [users, searchTerm]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
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
      console.error("Error fetching user data:", error);
      showSnackbar("Error fetching users", "error");
    } finally {
      setLoading(false);
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
        setGroups(data.groups);
      } else {
        throw new Error(data.message || "No groups found");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      showSnackbar(error.message || "Error fetching groups", "error");
    }
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value);
        }
      });

      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      const response = await fetch(`${BASE_URL}/api/admin/user`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      const data = await response.json();
      setUsers([...users, data]);
      setOpenCreateDialog(false);
      setFormData(initialFormData);
      setProfileImage(null);
      showSnackbar("User created successfully");
      setPage(0); // Reset to first page after creating new user
    } catch (error) {
      console.error("Error creating user:", error);
      showSnackbar(error.message || "Error creating user", "error");
    }
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value);
        }
      });

      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      const response = await fetch(`${BASE_URL}/api/update-user/id/${currentUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      const data = await response.json();
      setUsers(users.map((user) => (user.id === currentUser.id ? data : user)));
      setOpenEditDialog(false);
      setCurrentUser(null);
      setProfileImage(null);
      showSnackbar("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      showSnackbar(error.message || "Error updating user", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleEditClick = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      about: user.about || "",
      password: "",
      KYCStatus: user.KYCStatus || "pending",
      isVerified: user.isVerified || false,
      lastSeen: user.lastSeen || "",
      fcmToken: user.fcmToken || "",
    });
    setOpenEditDialog(true);
  };

  const handleAllocateSubscription = (user) => {
    setCurrentUser(user);
    setSubscriptionData({
      userId: user.id,
      groupId: "",
      frequency: "one_month",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
    });
    setOpenSubscriptionDialog(true);
  };

  const handleSubscriptionInputChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        userId: subscriptionData.userId,
        groupId: subscriptionData.groupId,
        frequency: subscriptionData.frequency,
        startDate: subscriptionData.startDate,
        endDate: subscriptionData.endDate,
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

      const data = await response.json();
      showSnackbar("Subscription created successfully");
      setOpenSubscriptionDialog(false);
    } catch (error) {
      console.error("Error creating subscription:", error);
      showSnackbar(error.message || "Error creating subscription", "error");
    }
  };

  const exportToExcel = () => {
    const excelData = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      "Phone Number": user.phoneNumber,
      About: user.about || "",
      "KYC Status": user.KYCStatus || "pending",
      Verified: user.isVerified ? "Yes" : "No",
      "Last Seen": user.lastSeen || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_export.xlsx");

    showSnackbar("Users data exported successfully");
  };

  const columns = [
    { Header: "Name", accessor: "name" },
    { Header: "Email", accessor: "email" },
    { Header: "Phone Number", accessor: "phoneNumber" },
    { Header: "KYC Status", accessor: "KYCStatus" },
    {
      Header: "GST No",
      accessor: (row) => row.gstDetails?.gstInNo || "N/A",
    },
    // { Header: "Verified", accessor: "isVerified", Cell: ({ value }) => (value ? "Yes" : "No") },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <div>
          {/* <Button
            variant="contained"
            color="primary"
            onClick={() => handleEditClick(row.original)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button> */}
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAllocateSubscription(row.original)}
          >
            Subscribe
          </Button>
        </div>
      ),
    },
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
                    Users
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search Users"
                      type="text"
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(0);
                      }}
                      sx={{
                        mr: 2,
                        width: { xs: "100%", sm: 200 },
                        [theme.breakpoints.down("sm")]: {
                          marginBottom: 2,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setOpenCreateDialog(true)}
                      sx={{ mr: 2 }}
                    >
                      Create User
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<GetAppIcon />}
                      onClick={exportToExcel}
                    >
                      Export
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: paginatedUsers }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
                <TablePagination
                  rowsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
                  component="div"
                  count={filteredUsers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Create User Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="phoneNumber"
            label="Phone Number"
            type="text"
            fullWidth
            value={formData.phoneNumber}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          {/* <TextField
            margin="dense"
            name="about"
            label="About"
            type="text"
            fullWidth
            value={formData.about}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          /> */}
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="KYCStatus"
            label="KYC Status"
            select
            fullWidth
            value={formData.KYCStatus}
            onChange={handleInputChange}
            sx={{ mb: 2, mt: 2 }}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          {/* <TextField
            margin="dense"
            name="isVerified"
            label="Verified"
            select
            fullWidth
            value={formData.isVerified}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          >
            <MenuItem value={false}>No</MenuItem>
            <MenuItem value={true}>Yes</MenuItem>
          </TextField> */}
          {/* <TextField
            margin="dense"
            name="fcmToken"
            label="FCM Token"
            type="text"
            fullWidth
            value={formData.fcmToken}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          /> */}
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="profile-image-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="profile-image-upload">
            <Button variant="contained" color="error" component="span" sx={{ mb: 2 }}>
              Upload Profile Image
            </Button>
          </label>
          {profileImage && (
            <MDTypography variant="caption" color="text">
              {profileImage.name}
            </MDTypography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} color="error" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="phoneNumber"
            label="Phone Number"
            type="text"
            fullWidth
            value={formData.phoneNumber}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            name="about"
            label="About"
            type="text"
            fullWidth
            value={formData.about}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label="New Password (leave blank to keep current)"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="KYCStatus"
            label="KYC Status"
            select
            fullWidth
            value={formData.KYCStatus}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          {/* <TextField
            margin="dense"
            name="isVerified"
            label="Verified"
            select
            fullWidth
            value={formData.isVerified}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          >
            <MenuItem value={false}>No</MenuItem>
            <MenuItem value={true}>Yes</MenuItem>
          </TextField> */}
          {/* <TextField
            margin="dense"
            name="fcmToken"
            label="FCM Token"
            type="text"
            fullWidth
            value={formData.fcmToken}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          /> */}
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="edit-profile-image-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="edit-profile-image-upload">
            <Button variant="contained" color="primary" component="span" sx={{ mb: 2 }}>
              Change Profile Image
            </Button>
          </label>
          {profileImage && (
            <MDTypography variant="caption" color="text">
              {profileImage.name}
            </MDTypography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateUser} color="primary" variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Allocate Subscription Dialog */}
      <Dialog
        open={openSubscriptionDialog}
        onClose={() => setOpenSubscriptionDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Allocate Subscription</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="groupId"
            label="Group"
            select
            fullWidth
            value={subscriptionData.groupId}
            onChange={handleSubscriptionInputChange}
            sx={{ mb: 2 }}
            required
          >
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="frequency"
            label="Frequency"
            select
            fullWidth
            value={subscriptionData.frequency}
            onChange={handleSubscriptionInputChange}
            sx={{ mb: 2 }}
            required
          >
            <MenuItem value="one_month">One Month</MenuItem>
            <MenuItem value="two_month">Two Months</MenuItem>
            <MenuItem value="three_month">Three Months</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            name="startDate"
            label="Start Date"
            type="date"
            fullWidth
            value={subscriptionData.startDate}
            onChange={handleSubscriptionInputChange}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <TextField
            margin="dense"
            name="endDate"
            label="End Date"
            type="date"
            fullWidth
            value={subscriptionData.endDate}
            onChange={handleSubscriptionInputChange}
            sx={{ mb: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubscriptionDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateSubscription} color="error" variant="contained">
            Allocate
          </Button>
        </DialogActions>
      </Dialog>

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

Users.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      phoneNumber: PropTypes.string.isRequired,
      about: PropTypes.string,
      KYCStatus: PropTypes.string,
      isVerified: PropTypes.bool,
      lastSeen: PropTypes.string,
      fcmToken: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default Users;
