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
  IconButton,
  FormGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { CloudUpload as CloudUploadIcon, Edit, Delete } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://samachar.chetakbooks.shop";

function Messages() {
  const [state, setState] = useState({
    messages: [],
    groups: [],
    loading: true,
    searchTerm: "",
    selectedGroupId: "",
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
    audioFiles: [],
    audioLoading: false,
  });

  const [dialogState, setDialogState] = useState({
    open: false,
    mode: "create", // 'create' or 'edit'
    currentMessage: null,
    formData: {
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
      images: Array(5).fill(null),
      imagePreviews: Array(5).fill(null),
      share_message: false,
      link: "",
      document: null,
      documentPreview: null,
    },
    formErrors: {
      scriptName: false,
      actionType: false,
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
      const response = await fetch(`${BASE_URL}/api/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.groups) {
        setState((prev) => ({
          ...prev,
          groups: data.groups,
          selectedGroupId: data.groups[0]?.id || "",
          loading: false,
        }));
        if (data.groups.length > 0) {
          fetchMessages(data.groups[0].id);
        }
      } else {
        // throw new Error(data.message || "No groups found");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      showSnackbar(error.message || "Error fetching groups", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchMessages = async (groupId, page = 1) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/messages/group/${groupId}?page=${page}&limit=${state.pagination.limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setState((prev) => ({
          ...prev,
          messages: data.data || [],
          loading: false,
          pagination: {
            ...prev.pagination,
            page: data.pagination?.page || 1,
            total: data.pagination?.total || 0,
            totalPages: data.pagination?.totalPages || 1,
          },
        }));
      } else {
        throw new Error(data.message || "No messages found");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      showSnackbar(error.message || "Error fetching messages", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchAudioFiles = async () => {
    try {
      setState((prev) => ({ ...prev, audioLoading: true }));
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/audio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setState((prev) => ({
          ...prev,
          audioFiles: data.data || [],
          audioLoading: false,
        }));
      } else {
        throw new Error(data.message || "No audio files found");
      }
    } catch (error) {
      console.error("Error fetching audio files:", error);
      showSnackbar(error.message || "Error fetching audio files", "error");
      setState((prev) => ({ ...prev, audioLoading: false }));
    }
  };

  const handleGroupChange = (e) => {
    const groupId = e.target.value;
    setState((prev) => ({ ...prev, selectedGroupId: groupId }));
    fetchMessages(groupId);
  };

  const handlePageChange = (event, newPage) => {
    fetchMessages(state.selectedGroupId, newPage);
  };

  const handleSearchChange = (e) => {
    setState((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const validateForm = () => {
    const errors = {
      scriptName: !dialogState.formData.scriptName.trim(),
      actionType: !dialogState.formData.actionType.trim(),
    };

    setDialogState((prev) => ({
      ...prev,
      formErrors: errors,
    }));

    return !Object.values(errors).some(Boolean);
  };

  const handleCreateMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Append images
      dialogState.formData.images.forEach((image, index) => {
        if (image) {
          formDataToSend.append(`image${index + 1}`, image);
        }
      });

      // Append other fields
      formDataToSend.append("timeFrame", dialogState.formData.timeFrame);
      formDataToSend.append("scriptName", dialogState.formData.scriptName);
      formDataToSend.append("actionType", dialogState.formData.actionType);
      formDataToSend.append("target1", dialogState.formData.target1);
      formDataToSend.append("target2", dialogState.formData.target2 || "");
      formDataToSend.append("stopLoss", dialogState.formData.stopLoss);
      formDataToSend.append("reason", dialogState.formData.reason);
      formDataToSend.append(
        "discriminator",
        dialogState.formData.discriminator ||
          "https://commoditysamachar.com/disclosures-and-disclaimers/"
      );
      formDataToSend.append(
        "sebzRegistration",
        dialogState.formData.sebzRegistration || "INH000017781"
      );
      formDataToSend.append("adminId", localStorage.getItem("id"));
      formDataToSend.append("groupId", state.selectedGroupId);
      formDataToSend.append("share_message", dialogState.formData.share_message.toString());
      formDataToSend.append("link", dialogState.formData.link || "");

      if (dialogState.formData.audioId) {
        formDataToSend.append("audioId", dialogState.formData.audioId);
      }

      if (dialogState.formData.document) {
        formDataToSend.append("document", dialogState.formData.document);
      }

      const response = await fetch(`${BASE_URL}/api/groups/message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create message");
      }

      const data = await response.json();
      if (data) {
        showSnackbar("Message created successfully");
        setDialogState((prev) => ({ ...prev, open: false }));
        resetForm();
        fetchMessages(state.selectedGroupId);
      }
    } catch (error) {
      console.error("Error creating message:", error);
      showSnackbar(error.message || "Error creating message", "error");
    }
  };

  const handleUpdateMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      const adminId = localStorage.getItem("id");
      const formDataToSend = new FormData();

      // Append images
      dialogState.formData.images.forEach((image, index) => {
        if (image) {
          formDataToSend.append(`image${index + 1}`, image);
        }
      });

      // Append other fields
      formDataToSend.append("adminId", adminId);
      formDataToSend.append("timeFrame", dialogState.formData.timeFrame);
      formDataToSend.append("scriptName", dialogState.formData.scriptName);
      formDataToSend.append("actionType", dialogState.formData.actionType);
      formDataToSend.append("target1", dialogState.formData.target1);
      formDataToSend.append("target2", dialogState.formData.target2 || "");
      formDataToSend.append("stopLoss", dialogState.formData.stopLoss);
      formDataToSend.append("reason", dialogState.formData.reason);
      formDataToSend.append("share_message", dialogState.formData.share_message.toString());
      formDataToSend.append("link", dialogState.formData.link || "");

      if (dialogState.formData.audioId) {
        formDataToSend.append("audioId", dialogState.formData.audioId);
      }

      if (dialogState.formData.document) {
        formDataToSend.append("document", dialogState.formData.document);
      }

      const response = await fetch(`${BASE_URL}/api/messages/${dialogState.currentMessage.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update message");
      }

      const data = await response.json();
      if (data.success) {
        showSnackbar("Message updated successfully");
        setDialogState((prev) => ({ ...prev, open: false }));
        resetForm();
        fetchMessages(state.selectedGroupId);
      }
    } catch (error) {
      console.error("Error updating message:", error);
      showSnackbar(error.message || "Error updating message", "error");
    }
  };

  const handleDeleteMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/messages/${dialogState.confirmDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminId: localStorage.getItem("id"),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete message");
      }

      const data = await response.json();
      if (data.success) {
        showSnackbar("Message deleted successfully");
        setDialogState((prev) => ({ ...prev, confirmDelete: null }));
        fetchMessages(state.selectedGroupId);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      showSnackbar(error.message || "Error deleting message", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (name === "document") {
        setDialogState((prev) => ({
          ...prev,
          formData: {
            ...prev.formData,
            document: files[0],
            documentPreview: files[0] ? URL.createObjectURL(files[0]) : null,
          },
        }));
      } else {
        const index = parseInt(name.split("-")[1]);
        const newImages = [...dialogState.formData.images];
        const newImagePreviews = [...dialogState.formData.imagePreviews];

        newImages[index] = files[0];
        newImagePreviews[index] = files[0] ? URL.createObjectURL(files[0]) : null;

        setDialogState((prev) => ({
          ...prev,
          formData: {
            ...prev.formData,
            images: newImages,
            imagePreviews: newImagePreviews,
          },
        }));
      }
    } else if (name === "share_message") {
      setDialogState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          [name]: e.target.checked,
        },
      }));
    } else {
      setDialogState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          [name]: value,
        },
        formErrors: {
          ...prev.formErrors,
          [name]: false,
        },
      }));
    }
  };

  const handleEditMessage = (message) => {
    fetchAudioFiles().then(() => {
      setDialogState({
        open: true,
        mode: "edit",
        currentMessage: message,
        formData: {
          timeFrame: message.timeFrame,
          scriptName: message.scriptName,
          actionType: message.actionType,
          target1: message.target1,
          target2: message.target2 || "",
          stopLoss: message.stopLoss,
          reason: message.reason,
          discriminator:
            message.discriminator || "https://commoditysamachar.com/disclosures-and-disclaimers/",
          sebzRegistration: message.sebzRegistration || "INH000017781",
          audioId: message.audioId || "",
          images: Array(5).fill(null),
          imagePreviews: [
            message.image1 || null,
            message.image2 || null,
            message.image3 || null,
            message.image4 || null,
            message.image5 || null,
          ],
          share_message: message.share_message || false,
          link: message.link || "",
          document: null,
          documentPreview: message.document || null,
        },
        formErrors: {
          scriptName: false,
          actionType: false,
        },
      });
    });
  };

  const handleCreateNewMessage = () => {
    fetchAudioFiles().then(() => {
      setDialogState({
        open: true,
        mode: "create",
        currentMessage: null,
        formData: {
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
          images: Array(5).fill(null),
          imagePreviews: Array(5).fill(null),
          share_message: false,
          link: "",
          document: null,
          documentPreview: null,
        },
        formErrors: {
          scriptName: false,
          actionType: false,
        },
      });
    });
  };

  const resetForm = () => {
    setDialogState((prev) => ({
      ...prev,
      formData: {
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
        images: Array(5).fill(null),
        imagePreviews: Array(5).fill(null),
        share_message: false,
        link: "",
        document: null,
        documentPreview: null,
      },
    }));
  };

  const filteredMessages = state.messages.filter((message) => {
    const searchTerm = state.searchTerm.toLowerCase();
    return (
      message.scriptName.toLowerCase().includes(searchTerm) ||
      message.actionType.toLowerCase().includes(searchTerm) ||
      message.reason.toLowerCase().includes(searchTerm)
    );
  });

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

  const columns = [
    { Header: "Script", accessor: "scriptName" },
    { Header: "Action", accessor: "actionType" },
    { Header: "Time Frame", accessor: "timeFrame" },
    { Header: "Targets", accessor: (row) => `${row.target1} / ${row.target2 || "-"}` },
    { Header: "Stop Loss", accessor: "stopLoss" },
    { Header: "Reason", accessor: "reason" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={() => handleEditMessage(row.original)}>
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() =>
              setDialogState((prev) => ({
                ...prev,
                confirmDelete: row.original.id,
              }))
            }
          >
            <Delete />
          </IconButton>
        </Box>
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
                    Group Messages
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Messages"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button variant="contained" color="error" onClick={handleCreateNewMessage}>
                      Send New Message
                    </Button>
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
                    sx={{ width: 300, height: 40, mb: 2 }}
                  >
                    {state.groups.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {state.selectedGroupId ? (
                  state.loading ? (
                    <MDBox p={3} display="flex" justifyContent="center">
                      <CircularProgress />
                    </MDBox>
                  ) : filteredMessages.length > 0 ? (
                    <DataTable
                      table={{ columns, rows: filteredMessages }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  ) : (
                    <MDBox p={3} textAlign="center">
                      <MDTypography variant="body1">
                        {state.searchTerm
                          ? "No matching messages found"
                          : "No messages available for this group"}
                      </MDTypography>
                    </MDBox>
                  )
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      Please select a group to view messages
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create/Edit Message Dialog */}
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
        <DialogTitle>
          {dialogState.mode === "create" ? "Send New Message" : "Edit Message"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Time Frame"
                name="timeFrame"
                value={dialogState.formData.timeFrame}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Script Name"
                name="scriptName"
                value={dialogState.formData.scriptName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={dialogState.formErrors.scriptName}
                helperText={dialogState.formErrors.scriptName ? "Script Name is required" : ""}
              />
              <TextField
                label="Action Type"
                name="actionType"
                value={dialogState.formData.actionType}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={dialogState.formErrors.actionType}
                helperText={dialogState.formErrors.actionType ? "Action Type is required" : ""}
              />
              <TextField
                label="Target 1"
                name="target1"
                type="number"
                value={dialogState.formData.target1}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Target 2"
                name="target2"
                type="number"
                value={dialogState.formData.target2}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Link"
                name="link"
                value={dialogState.formData.link}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                placeholder="https://example.com"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Stop Loss"
                name="stopLoss"
                type="number"
                value={dialogState.formData.stopLoss}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Reason"
                name="reason"
                value={dialogState.formData.reason}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Disclaimer"
                name="discriminator"
                disabled
                value={dialogState.formData.discriminator}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="SEBI Registration Number"
                name="sebzRegistration"
                disabled
                value={dialogState.formData.sebzRegistration}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />

              {/* Audio selection dropdown */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Audio</InputLabel>
                <Select
                  value={dialogState.formData.audioId}
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

              {/* Document upload */}
              <Box sx={{ mt: 2 }}>
                <input
                  accept=".pdf,.doc,.docx"
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
                {dialogState.formData.document && (
                  <Chip
                    label={dialogState.formData.document.name}
                    onDelete={() => {
                      setDialogState((prev) => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          document: null,
                          documentPreview: null,
                        },
                      }));
                    }}
                    sx={{ mt: 1, ml: 1 }}
                  />
                )}
                {/* {dialogState.formData.documentPreview &&
                  typeof dialogState.formData.documentPreview === "string" && (
                    <Box mt={1}>
                      <a
                        href={dialogState.formData.documentPreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1976d2", textDecoration: "none" }}
                      >
                        View Document
                      </a>
                    </Box>
                  )} */}
              </Box>

              {/* Share Message Toggle */}
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={dialogState.formData.share_message}
                      onChange={handleInputChange}
                      name="share_message"
                    />
                  }
                  label="Share Message"
                />
              </FormGroup>

              {/* Multiple image upload fields */}
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
                  {dialogState.formData.images[index] && (
                    <Chip
                      label={dialogState.formData.images[index].name}
                      onDelete={() => {
                        const newImages = [...dialogState.formData.images];
                        const newImagePreviews = [...dialogState.formData.imagePreviews];
                        newImages[index] = null;
                        newImagePreviews[index] = null;
                        setDialogState((prev) => ({
                          ...prev,
                          formData: {
                            ...prev.formData,
                            images: newImages,
                            imagePreviews: newImagePreviews,
                          },
                        }));
                      }}
                      sx={{ mt: 1, ml: 1 }}
                    />
                  )}
                  {dialogState.formData.imagePreviews[index] && (
                    <Box mt={1}>
                      <img
                        src={dialogState.formData.imagePreviews[index]}
                        alt={`Preview ${index + 1}`}
                        style={{ maxWidth: "100%", maxHeight: "100px" }}
                      />
                    </Box>
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
          <Button
            onClick={dialogState.mode === "create" ? handleCreateMessage : handleUpdateMessage}
            color="error"
            variant="contained"
          >
            {dialogState.mode === "create" ? "Send" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(dialogState.confirmDelete)}
        onClose={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>Are you sure you want to delete this message?</MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}>
            Cancel
          </Button>
          <Button onClick={handleDeleteMessage} color="error" variant="contained">
            Delete
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

Messages.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      scriptName: PropTypes.string,
      actionType: PropTypes.string,
      timeFrame: PropTypes.string,
      target1: PropTypes.string,
      target2: PropTypes.string,
      stopLoss: PropTypes.string,
      reason: PropTypes.string,
      discriminator: PropTypes.string,
      sebzRegistration: PropTypes.string,
      audioId: PropTypes.string,
      image1: PropTypes.string,
      image2: PropTypes.string,
      image3: PropTypes.string,
      image4: PropTypes.string,
      image5: PropTypes.string,
      share_message: PropTypes.bool,
      link: PropTypes.string,
      document: PropTypes.string,
    }),
  }),
};

export default Messages;
