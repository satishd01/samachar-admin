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
import AudioPlayer from "./audioplayer";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

function AudioNotifications() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [newAudio, setNewAudio] = useState({
    name: "",
    file: null,
  });

  useEffect(() => {
    fetchAudioNotifications();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchAudioNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/audio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audio notifications");
      }

      const data = await response.json();
      setAudios(data.data);
    } catch (error) {
      console.error("Error fetching audio data:", error);
      showSnackbar("Error fetching audio notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = (audio) => {
    setSelectedAudio(audio);
    setConfirmOpen(true);
  };

  const confirmNotify = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/notify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audioId: selectedAudio.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send notification");
      }

      showSnackbar("Notification sent successfully");
    } catch (error) {
      console.error("Error sending notification:", error);
      showSnackbar(error.message || "Error sending notification", "error");
    } finally {
      setConfirmOpen(false);
      setSelectedAudio(null);
    }
  };

  const handleUploadAudio = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      if (!newAudio.name || !newAudio.file) {
        showSnackbar("Please provide both name and audio file", "error");
        return;
      }

      const formData = new FormData();
      formData.append("name", newAudio.name);
      formData.append("audio", newAudio.file);

      const response = await fetch(`${BASE_URL}/api/audio`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload audio");
      }

      showSnackbar("Audio uploaded successfully");
      setUploadOpen(false);
      setNewAudio({ name: "", file: null });
      fetchAudioNotifications();
    } catch (error) {
      console.error("Error uploading audio:", error);
      showSnackbar(error.message || "Error uploading audio", "error");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setNewAudio({ ...newAudio, file: e.target.files[0] });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAudio({ ...newAudio, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const columns = [
    { Header: "Name", accessor: "name" },
    { Header: "Created By", accessor: (row) => row.admin?.name || "N/A" },
    {
      Header: "Created At",
      accessor: "createdAt",
      Cell: ({ value }) => new Date(value).toLocaleString(),
    },
    {
      Header: "Status",
      accessor: "isActive",
      Cell: ({ value }) => (value ? "Active" : "Inactive"),
    },
    {
      Header: "Audio",
      Cell: ({ row }) => <AudioPlayer src={row.original.url} />,
    },
    {
      Header: "Actions",
      Cell: ({ row }) => (
        <Button variant="contained" color="error" onClick={() => handleNotify(row.original)}>
          Notify Users
        </Button>
      ),
    },
  ];

  const filteredAudios = audios.filter((audio) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (audio.name && audio.name.toLowerCase().includes(searchTermLower)) ||
      (audio.admin?.name && audio.admin.name.toLowerCase().includes(searchTermLower))
    );
  });

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography>Loading Audio Notifications...</MDTypography>
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
                    Audio Notifications
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap">
                    <TextField
                      label="Search Audios"
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
                    {/* <Button variant="contained" color="error" onClick={() => setUploadOpen(true)}>
                      Upload Audio
                    </Button> */}
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows: filteredAudios }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Confirm Notification</DialogTitle>
        <DialogContent>
          <MDTypography>
            Are you sure you want to send &quot;{selectedAudio?.name}&quot; to all users?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmNotify} color="error" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Upload New Audio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Audio Name"
            type="text"
            fullWidth
            value={newAudio.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <input
            accept="audio/*"
            style={{ display: "none" }}
            id="audio-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="audio-upload">
            <Button variant="contained" color="error" component="span" sx={{ mb: 2 }}>
              Select Audio File
            </Button>
          </label>
          {newAudio.file && (
            <MDTypography variant="caption" display="block">
              Selected file: {newAudio.file.name}
            </MDTypography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
          <Button onClick={handleUploadAudio} color="error" variant="contained">
            Upload
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

AudioNotifications.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      filePath: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      isActive: PropTypes.bool.isRequired,
      createdBy: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
      admin: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
      }),
    }).isRequired,
  }).isRequired,
};

export default AudioNotifications;
