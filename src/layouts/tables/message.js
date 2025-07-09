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
  Box,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { CloudUpload as CloudUploadIcon, Download as DownloadIcon } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://samachar.chetakbooks.shop";

const PaidCell = ({ value }) => (
  <Chip label={value ? "Paid" : "Free"} color={value ? "error" : "success"} size="small" />
);
PaidCell.propTypes = {
  value: PropTypes.bool.isRequired,
};

function GroupsWithMessages() {
  const [state, setState] = useState({
    groups: [],
    loading: true,
    searchTerm: "",
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
    pdfLoading: false,
    audioLoading: false,
    audioFiles: [],
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    selectedGroupId: "",
  });

  const [formData, setFormData] = useState({
    images: Array(5).fill(null),
    timeFrame: "",
    scriptName: "",
    actionType: "",
    target1: "",
    target2: "",
    stopLoss: "",
    reason: "",
    discriminator: "https://commoditysamachar.com/disclosures-and-disclaimers/",
    sebzRegistration: "INH000017781",
    audioId: "",
    document: null,
    link: "",
    share_message: false,
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

  const fetchAudioFiles = async () => {
    try {
      setState((prev) => ({ ...prev, audioLoading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/audio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setState((prev) => ({
          ...prev,
          audioFiles: response.data.data || [],
          audioLoading: false,
        }));
      } else {
        throw new Error(response.data.message || "Failed to fetch audio files");
      }
    } catch (error) {
      console.error("Error fetching audio files:", error);
      showSnackbar(error.message || "Error fetching audio files", "error");
      setState((prev) => ({ ...prev, audioLoading: false }));
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));
  };

  const filteredGroups = state.groups.filter(
    (group) =>
      group.name.toLowerCase().includes(state.searchTerm) ||
      group.description.toLowerCase().includes(state.searchTerm)
  );

  const handleCreateMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const formDataToSend = new FormData();

      // Append images
      formData.images.forEach((image, index) => {
        if (image) {
          formDataToSend.append(`image${index + 1}`, image);
        }
      });

      // Append other fields
      formDataToSend.append("timeFrame", formData.timeFrame);
      formDataToSend.append("scriptName", formData.scriptName);
      formDataToSend.append("actionType", formData.actionType);
      formDataToSend.append("target1", formData.target1);
      formDataToSend.append("target2", formData.target2);
      formDataToSend.append("stopLoss", formData.stopLoss);
      formDataToSend.append("reason", formData.reason);
      formDataToSend.append("discriminator", formData.discriminator);
      formDataToSend.append("sebzRegistration", formData.sebzRegistration);
      formDataToSend.append("adminId", localStorage.getItem("id"));
      formDataToSend.append("groupId", dialogState.selectedGroupId);

      // Append audio if selected
      if (formData.audioId) {
        formDataToSend.append("audioId", formData.audioId);
      }

      // Append document if selected
      if (formData.document) {
        formDataToSend.append("document", formData.document);
      }

      // Append link if provided
      if (formData.link) {
        formDataToSend.append("link", formData.link);
      }

      // Append share_message
      formDataToSend.append("share_message", formData.share_message.toString());

      const response = await fetch(`${BASE_URL}/api/groups/message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create message");
      }

      const data = await response.json();
      if (data) {
        setDialogState((prev) => ({ ...prev, open: false }));
        resetForm();
        showSnackbar("Message created successfully");
      }
    } catch (error) {
      console.error("Error creating message:", error);
      showSnackbar(error.message || "Error creating message", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (name === "document") {
        setFormData((prev) => ({
          ...prev,
          document: files[0],
        }));
      } else {
        const index = parseInt(name.split("-")[1]);
        const newImages = [...formData.images];
        newImages[index] = files[0];
        setFormData((prev) => ({
          ...prev,
          images: newImages,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleToggleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      share_message: e.target.checked,
    }));
  };

  const handleOpenCreateDialog = async (groupId) => {
    await fetchAudioFiles(); // Fetch audio files when opening dialog
    setDialogState({
      open: true,
      selectedGroupId: groupId,
    });
  };

  const handleDownloadMessages = async (groupId) => {
    try {
      setState((prev) => ({ ...prev, pdfLoading: true }));
      const token = localStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/api/groups/${groupId}/messages/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { pdfUrl } = response.data;

      if (!pdfUrl) {
        throw new Error("PDF URL not found in response.");
      }

      // Create a link to trigger download
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.setAttribute("download", `messages_${groupId}_${Date.now()}.pdf`);
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setState((prev) => ({ ...prev, pdfLoading: false }));
    } catch (error) {
      console.error("Error downloading messages:", error);
      showSnackbar(error.message || "Error downloading messages", "error");
      setState((prev) => ({ ...prev, pdfLoading: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      images: Array(5).fill(null),
      timeFrame: "",
      scriptName: "",
      actionType: "",
      target1: "",
      target2: "",
      stopLoss: "",
      reason: "",
      discriminator: "https://commoditysamachar.com/disclosures-and-disclaimers/",
      sebzRegistration: "INH000017781",
      audioId: "",
      document: null,
      link: "",
      share_message: false,
    });
  };

  const columns = [
    { Header: "Group Name", accessor: "name" },
    {
      Header: "Type",
      accessor: "isPaid",
      Cell: PaidCell,
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleOpenCreateDialog(row.original.id)}
            size="small"
          >
            Send Message
          </Button>
          <IconButton
            color="primary"
            onClick={() => handleDownloadMessages(row.original.id)}
            disabled={state.pdfLoading}
          >
            {state.pdfLoading ? <CircularProgress size={24} /> : <DownloadIcon />}
          </IconButton>
        </Box>
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
                    Groups With Messages
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Groups"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredGroups.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: filteredGroups }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching groups found" : "No groups available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create Message Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => {
          setDialogState((prev) => ({ ...prev, open: false }));
          resetForm();
        }}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>Create New Message</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Time Frame"
                name="timeFrame"
                value={formData.timeFrame}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Script Name"
                name="scriptName"
                value={formData.scriptName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Action Type"
                name="actionType"
                value={formData.actionType}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Target 1"
                name="target1"
                type="number"
                value={formData.target1}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Target 2"
                name="target2"
                type="number"
                value={formData.target2}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Stop Loss"
                name="stopLoss"
                type="number"
                value={formData.stopLoss}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Disclaimer"
                name="discriminator"
                disabled
                value={formData.discriminator}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="SEBI Registration Number"
                name="sebzRegistration"
                disabled
                value={formData.sebzRegistration}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Audio</InputLabel>
                <Select
                  value={formData.audioId}
                  onChange={handleInputChange}
                  name="audioId"
                  label="Select Audio"
                  disabled={state.audioLoading}
                  sx={{ width: 350, height: 45 }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {state.audioFiles.map((audio) => (
                    <MenuItem key={audio.id} value={audio.id}>
                      {audio.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.share_message}
                      onChange={handleToggleChange}
                      name="share_message"
                      color="primary"
                    />
                  }
                  label="Share Message"
                />
              </FormGroup>
              <input
                accept="application/pdf"
                type="file"
                name="document"
                onChange={handleInputChange}
                style={{ display: "none" }}
                id="messageDocument"
              />
              <label htmlFor="messageDocument">
                <Button
                  component="span"
                  color="error"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Document
                </Button>
              </label>
              {formData.document && (
                <Chip
                  label={formData.document.name}
                  onDelete={() => {
                    setFormData((prev) => ({ ...prev, document: null }));
                  }}
                  sx={{ mt: 1, ml: 1 }}
                />
              )}
              {[0, 1, 2, 3, 4].map((index) => (
                <Box key={index} sx={{ mt: 2 }}>
                  <input
                    accept="image/*"
                    type="file"
                    name={`image-${index}`}
                    onChange={handleInputChange}
                    style={{ display: "none" }}
                    id={`messageImage-${index}`}
                  />
                  <label htmlFor={`messageImage-${index}`}>
                    <Button
                      component="span"
                      color="error"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload Image {index + 1}
                    </Button>
                  </label>
                  {formData.images[index] && (
                    <Chip
                      label={formData.images[index].name}
                      onDelete={() => {
                        const newImages = [...formData.images];
                        newImages[index] = null;
                        setFormData((prev) => ({ ...prev, images: newImages }));
                      }}
                      sx={{ mt: 1, ml: 1 }}
                    />
                  )}
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogState((prev) => ({ ...prev, open: false }));
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateMessage} color="error" variant="contained">
            Send Message
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

GroupsWithMessages.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      isPaid: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
};

export default GroupsWithMessages;
