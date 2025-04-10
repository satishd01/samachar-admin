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

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

function GroupMembersManagement() {
  const [state, setState] = useState({
    groups: [],
    groupMembers: [],
    loading: true,
    searchTerm: "",
    selectedGroupId: "",
    snackbar: {
      open: false,
      message: "",
      severity: "success",
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

  const fetchGroupMembers = async (groupId) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/groups/${groupId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch group members");
      }

      const data = await response.json();
      if (data.status && data.groupMembers) {
        setState((prev) => ({
          ...prev,
          groupMembers: data.groupMembers,
          loading: false,
        }));
      } else {
        throw new Error(data.message || "No members found");
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
      showSnackbar(error.message || "Error fetching group members", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setState((prev) => ({ ...prev, selectedGroupId: groupId }));
    fetchGroupMembers(groupId);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));
  };

  const filteredMembers = state.groupMembers.filter(
    (member) =>
      member.userId.toLowerCase().includes(state.searchTerm) ||
      new Date(member.joinedAt).toLocaleString().toLowerCase().includes(state.searchTerm)
  );

  const columns = [
    { Header: "User ID", accessor: "userId" },
    {
      Header: "Joined At",
      accessor: "joinedAt",
      Cell: ({ value }) => new Date(value).toLocaleString(),
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => console.log("Remove member:", row.original.id)}
        >
          Remove
        </Button>
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
                    Group Members
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Members"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                      disabled={!state.selectedGroupId}
                    />
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3} px={2}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Group</InputLabel>
                  <Select
                    value={state.selectedGroupId}
                    label="Select Group"
                    onChange={handleGroupChange}
                    sx={{ width: 300, height: 35 }}
                  >
                    {state.groups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {state.selectedGroupId ? (
                  state.groupMembers.length > 0 ? (
                    <DataTable
                      table={{ columns, rows: filteredMembers }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  ) : (
                    <MDBox p={3} textAlign="center">
                      <MDTypography variant="body1">No members found in this group</MDTypography>
                    </MDBox>
                  )
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      Please select a group to view members
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

GroupMembersManagement.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      groupId: PropTypes.string.isRequired,
      joinedAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default GroupMembersManagement;
