import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Avatar,
  Pagination,
  Grid,
  Card,
  CircularProgress,
  Box,
  Chip,
  IconButton,
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

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

const NewsItem = ({ item }) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    {item.image && (
      <Avatar
        src={item.image}
        alt={item.text}
        sx={{ width: 56, height: 56, mr: 2 }}
        variant="rounded"
      />
    )}
    <Box>
      <MDTypography variant="h6" fontWeight="medium">
        {item.text}
      </MDTypography>
      <MDTypography variant="caption" color="text">
        {item.subText}
      </MDTypography>
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Chip
          label={`Created: ${new Date(item.createdAt).toLocaleDateString()}`}
          size="small"
          color="info"
        />
        <Chip
          label={`Expires: ${new Date(item.expireAt).toLocaleDateString()}`}
          size="small"
          color={new Date(item.expireAt) > new Date() ? "success" : "error"}
        />
      </Box>
    </Box>
  </Box>
);

NewsItem.propTypes = {
  item: PropTypes.shape({
    text: PropTypes.string.isRequired,
    subText: PropTypes.string.isRequired,
    image: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    expireAt: PropTypes.string.isRequired,
  }).isRequired,
};

function NewsManagement() {
  const [state, setState] = useState({
    news: [],
    filteredNews: [],
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

  const [dialogState, setDialogState] = useState({
    open: false,
    confirmDelete: null,
    isEdit: false,
  });

  const [formData, setFormData] = useState({
    text: "",
    subText: "",
    expireAt: "",
    image: null,
    video: null,
  });

  const [formErrors, setFormErrors] = useState({
    text: false,
    subText: false,
    expireAt: false,
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

  const fetchNews = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const response = await fetch(`${BASE_URL}/api/updated-news`, {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiYmVmZjFhMzEtYTZhMC00MTg2LThhOTctMDU2ZmI1OTU5MDgxIiwiaWF0IjoxNzQ0MzU2NTg3LCJleHAiOjE3NDQ5NjEzODd9.RNP9bMoEB7BKycSIHvWIotA5Xlx_hmlNB49LBFIhvjM",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setState((prev) => ({
          ...prev,
          news: data.data,
          filteredNews: data.data,
          loading: false,
        }));
      } else {
        throw new Error(data.message || "No news found");
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      showSnackbar(error.message || "Error fetching news", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setState((prev) => ({ ...prev, searchTerm: query }));

    if (query.trim() === "") {
      setState((prev) => ({ ...prev, filteredNews: prev.news }));
      return;
    }

    const filtered = state.news.filter(
      (item) =>
        item.text.toLowerCase().includes(query) || item.subText.toLowerCase().includes(query)
    );
    setState((prev) => ({ ...prev, filteredNews: filtered }));
  };

  const validateForm = () => {
    const errors = {
      text: !formData.text.trim(),
      subText: !formData.subText.trim(),
      expireAt: !formData.expireAt,
    };

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleCreateNews = async () => {
    if (!validateForm()) {
      showSnackbar("Please fill all required fields correctly", "error");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("text", formData.text);
      formDataToSend.append("subText", formData.subText);
      formDataToSend.append("expireAt", formData.expireAt);
      if (formData.image) formDataToSend.append("image", formData.image);
      if (formData.video) formDataToSend.append("video", formData.video);

      const response = await fetch(`${BASE_URL}/api/updated-news`, {
        method: "POST",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiYmVmZjFhMzEtYTZhMC00MTg2LThhOTctMDU2ZmI1OTU5MDgxIiwiaWF0IjoxNzQ0MzU2NTg3LCJleHAiOjE3NDQ5NjEzODd9.RNP9bMoEB7BKycSIHvWIotA5Xlx_hmlNB49LBFIhvjM",
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create news");
      }

      const data = await response.json();
      if (data.success) {
        const newNews = data.data || data.news;
        if (newNews) {
          setState((prev) => ({
            ...prev,
            news: [newNews, ...prev.news],
            filteredNews: [newNews, ...prev.filteredNews],
          }));
          setDialogState((prev) => ({ ...prev, open: false }));
          resetForm();
          showSnackbar("News created successfully");
        } else {
          throw new Error("News data not found in response");
        }
      }
    } catch (error) {
      console.error("Error creating news:", error);
      showSnackbar(error.message || "Error creating news", "error");
    }
  };

  const handleUpdateNews = async () => {
    if (!validateForm() || !dialogState.editingId) {
      showSnackbar("Please fill all required fields correctly", "error");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("text", formData.text);
      formDataToSend.append("subText", formData.subText);
      formDataToSend.append("expireAt", formData.expireAt);
      if (formData.image) formDataToSend.append("image", formData.image);
      if (formData.video) formDataToSend.append("video", formData.video);

      const response = await fetch(`${BASE_URL}/api/updated-news/${dialogState.editingId}`, {
        method: "PUT",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiYmVmZjFhMzEtYTZhMC00MTg2LThhOTctMDU2ZmI1OTU5MDgxIiwiaWF0IjoxNzQ0MzU2NTg3LCJleHAiOjE3NDQ5NjEzODd9.RNP9bMoEB7BKycSIHvWIotA5Xlx_hmlNB49LBFIhvjM",
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update news");
      }

      const data = await response.json();
      if (data.success) {
        fetchNews(); // Refresh the list
        setDialogState((prev) => ({ ...prev, open: false, editingId: null }));
        resetForm();
        showSnackbar("News updated successfully");
      }
    } catch (error) {
      console.error("Error updating news:", error);
      showSnackbar(error.message || "Error updating news", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      text: "",
      subText: "",
      expireAt: "",
      image: null,
      video: null,
    });
    setFormErrors({
      text: false,
      subText: false,
      expireAt: false,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.files[0],
      }));
    }
  };

  const handleDeleteNews = async (newsId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/updated-news/${newsId}`, {
        method: "DELETE",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiYmVmZjFhMzEtYTZhMC00MTg2LThhOTctMDU2ZmI1OTU5MDgxIiwiaWF0IjoxNzQ0MzU2NTg3LCJleHAiOjE3NDQ5NjEzODd9.RNP9bMoEB7BKycSIHvWIotA5Xlx_hmlNB49LBFIhvjM",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete news");
      }

      const data = await response.json();
      if (data.success) {
        setState((prev) => ({
          ...prev,
          news: prev.news.filter((item) => item.id !== newsId),
          filteredNews: prev.filteredNews.filter((item) => item.id !== newsId),
        }));
        setDialogState((prev) => ({ ...prev, confirmDelete: null }));
        showSnackbar("News deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      showSnackbar(error.message || "Error deleting news", "error");
    }
  };

  const editNews = (newsItem) => {
    setFormData({
      text: newsItem.text,
      subText: newsItem.subText,
      expireAt: newsItem.expireAt,
      image: null,
      video: null,
    });
    setDialogState({
      open: true,
      isEdit: true,
      editingId: newsItem.id,
    });
  };

  const columns = [
    {
      Header: "News Item",
      accessor: "news",
      Cell: ({ row }) => <NewsItem item={row.original} />,
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Box>
          <IconButton onClick={() => editNews(row.original)} color="info">
            <Edit />
          </IconButton>
          <IconButton
            onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: row.original.id }))}
            color="error"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchNews();
  }, []);

  if (state.loading && state.news.length === 0) {
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
                    News
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search News"
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setDialogState({ open: true, isEdit: false, editingId: null })}
                    >
                      Create New News
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {state.filteredNews.length > 0 ? (
                  <DataTable
                    table={{ columns, rows: state.filteredNews }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching news found" : "No news available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Create/Edit News Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={() => {
          setDialogState({ open: false, isEdit: false, editingId: null });
          resetForm();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{dialogState.isEdit ? "Edit News" : "Create New News"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Title *"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                error={formErrors.text}
                helperText={formErrors.text ? "Title is required" : ""}
              />
              <TextField
                label="Subtext *"
                name="subText"
                value={formData.subText}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={3}
                error={formErrors.subText}
                helperText={formErrors.subText ? "Subtext is required" : ""}
              />
              <TextField
                label="Expiration Date *"
                name="expireAt"
                type="datetime-local"
                value={formData.expireAt}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                error={formErrors.expireAt}
                helperText={formErrors.expireAt ? "Expiration date is required" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mt: 2 }}>
                <input
                  accept="image/*"
                  type="file"
                  id="newsImage"
                  name="image"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="newsImage">
                  <Button
                    component="span"
                    color="error"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Image
                  </Button>
                </label>
                {formData.image && (
                  <Chip
                    label={formData.image.name}
                    onDelete={() => setFormData((prev) => ({ ...prev, image: null }))}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <input
                  accept="video/*"
                  type="file"
                  id="newsVideo"
                  name="video"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="newsVideo">
                  <Button
                    component="span"
                    color="error"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Video
                  </Button>
                </label>
                {formData.video && (
                  <Chip
                    label={formData.video.name}
                    onDelete={() => setFormData((prev) => ({ ...prev, video: null }))}
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogState({ open: false, isEdit: false, editingId: null });
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={dialogState.isEdit ? handleUpdateNews : handleCreateNews}
            color="error"
            variant="contained"
            disabled={!formData.text || !formData.subText || !formData.expireAt}
          >
            {dialogState.isEdit ? "Update News" : "Create News"}
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
          <MDTypography>Are you sure you want to delete this news item?</MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteNews(dialogState.confirmDelete)}
            color="error"
            variant="contained"
          >
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

NewsManagement.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      subText: PropTypes.string.isRequired,
      image: PropTypes.string,
      video: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      expireAt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default NewsManagement;
