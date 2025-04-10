import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function GetSessions() {
  const [searchParams, setSearchParams] = useState({
    class: "A1", // default class value
    topic: "",
    type: "video", // default type
  });

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // State to store message
  const [messageType, setMessageType] = useState(""); // State to store message type (success/error)
  const [openModal, setOpenModal] = useState(false); // Modal state
  const [selectedSession, setSelectedSession] = useState(null); // Selected session to update
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false); // Confirm dialog for deletion
  const [deleteSessionId, setDeleteSessionId] = useState(null); // Selected session ID for deletion

  const navigate = useNavigate(); // Hook to navigate

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const fetchSessions = async () => {
    setLoading(true);
    setMessage(""); // Clear any previous messages

    const { class: classParam, topic, type } = searchParams;
    const url = `https://api.blissiq.cloud/session?class=${classParam}&type=${type}&topic=${topic}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setSessions(data.data); // Assuming the data comes in 'data' field
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to fetch sessions.");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (sessionId) => {
    // Trigger PUT request for updating the session
    const updatedSession = selectedSession;

    try {
      const response = await fetch(`https://api.blissiq.cloud/session/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSession),
      });
      const data = await response.json();
      if (data.success) {
        setMessageType("success");
        setMessage("Session updated successfully!");
        setOpenModal(false);
        fetchSessions();
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to update session.");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("An error occurred. Please try again.");
    }
  };

  const handleDelete = async () => {
    // Trigger DELETE request for deleting the session
    try {
      const response = await fetch(`https://api.blissiq.cloud/session/${deleteSessionId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setMessageType("success");
        setMessage("Session deleted successfully!");
        setOpenDeleteConfirm(false); // Close confirmation dialog
        fetchSessions(); // Refresh sessions after deletion
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to delete session.");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("An error occurred. Please try again.");
    }
  };

  const handleModalOpen = (session) => {
    setSelectedSession(session);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedSession(null);
  };

  const handleDeleteConfirmOpen = (sessionId) => {
    setDeleteSessionId(sessionId);
    setOpenDeleteConfirm(true);
  };

  const handleDeleteConfirmClose = () => {
    setOpenDeleteConfirm(false);
    setDeleteSessionId(null);
  };

  useEffect(() => {
    fetchSessions();
  }, [searchParams]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h5" align="center">
                  Get Sessions
                </MDTypography>
              </MDBox>
              <MDBox pt={2} pb={2} px={2}>
                {message && (
                  <MDBox mb={2}>
                    <MDTypography
                      variant="body2"
                      color={messageType === "error" ? "error" : "success"}
                      align="center"
                    >
                      {message}
                    </MDTypography>
                  </MDBox>
                )}
                <form onSubmit={(e) => e.preventDefault()}>
                  <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Class"
                        variant="outlined"
                        name="class"
                        value={searchParams.class}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Topic"
                        variant="outlined"
                        name="topic"
                        value={searchParams.topic}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Type"
                        variant="outlined"
                        name="type"
                        value={searchParams.type}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        fullWidth
                        disabled={loading}
                        onClick={fetchSessions} // Fetch sessions on button click
                      >
                        {loading ? "Loading..." : "Search"}
                      </MDButton>
                    </Grid>
                  </Grid>
                </form>

                {/* Sessions Display */}
                <MDBox mt={3}>
                  {sessions.length > 0 ? (
                    <Box
                      sx={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        marginTop: "16px",
                      }}
                    >
                      <Grid container spacing={1} direction="column">
                        {sessions.map((session) => (
                          <Grid item xs={12} key={session.id}>
                            <Card sx={{ padding: 1, marginBottom: 1 }}>
                              <Grid container spacing={1}>
                                <Grid item xs={3}>
                                  <MDTypography variant="h6">{session.class}</MDTypography>
                                </Grid>
                                <Grid item xs={5}>
                                  <MDTypography variant="body1">
                                    <strong>Topic:</strong> {session.topic}
                                  </MDTypography>
                                </Grid>
                                <Grid item xs={4} align="right">
                                  <Grid container spacing={1}>
                                    <Grid item xs={4}>
                                      <MDButton
                                        component="a"
                                        href={session.URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="gradient"
                                        color="info"
                                        fullWidth
                                        sx={{ width: "100%" }} // Ensure full width
                                      >
                                        Watch
                                      </MDButton>
                                    </Grid>

                                    <Grid item xs={4}>
                                      <MDButton
                                        onClick={() => handleModalOpen(session)}
                                        variant="gradient"
                                        color="warning"
                                        sx={{ width: "100%", marginRight: "8px" }} // Adjusting width and spacing
                                      >
                                        Update
                                      </MDButton>
                                    </Grid>

                                    <Grid item xs={4}>
                                      <MDButton
                                        onClick={() => handleDeleteConfirmOpen(session.id)} // Open delete confirmation
                                        variant="gradient"
                                        color="error"
                                        sx={{ width: "100%", marginLeft: "8px" }} // Adjusting width and spacing
                                      >
                                        Delete
                                      </MDButton>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ) : (
                    <MDTypography variant="body2" align="center" color="textSecondary">
                      No sessions found.
                    </MDTypography>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Update Modal */}
      <Dialog open={openModal} onClose={handleModalClose}>
        <DialogTitle>Update Session</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Class"
            variant="outlined"
            name="class"
            value={selectedSession?.class || ""}
            onChange={(e) => setSelectedSession({ ...selectedSession, class: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Topic"
            variant="outlined"
            name="topic"
            value={selectedSession?.topic || ""}
            onChange={(e) => setSelectedSession({ ...selectedSession, topic: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="URL"
            variant="outlined"
            name="URL"
            value={selectedSession?.URL || ""}
            onChange={(e) => setSelectedSession({ ...selectedSession, URL: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={() => handleUpdate(selectedSession.id)} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteConfirm} onClose={handleDeleteConfirmClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2">Are you sure you want to delete this session?</MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default GetSessions;
