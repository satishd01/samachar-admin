import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import {
  Grid,
  Card,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Chip,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://safety.shellcode.cloud";

function QuizManagement() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [state, setState] = useState({
    quizzes: [],
    loading: true,
    searchTerm: "",
    snackbar: {
      open: false,
      message: "",
      severity: "success",
    },
    pagination: {
      page: 0,
      rowsPerPage: 5,
    },
  });

  const [dialogState, setDialogState] = useState({
    createQuiz: {
      open: false,
      formData: {
        title: "",
        description: "",
        startTime: new Date(),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Default to 2 days from now
      },
    },
    addQuestion: {
      open: false,
      quizId: "",
      formData: {
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        points: 10,
      },
    },
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

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

  const fetchQuizzes = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/quizzes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      const data = await response.json();
      if (data.success && data.data?.quizzes) {
        setState((prev) => ({
          ...prev,
          quizzes: data.data.quizzes,
          loading: false,
        }));
      } else {
        throw new Error(data.message || "No quizzes found");
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      showSnackbar(error.message || "Error fetching quizzes", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCreateQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      // Format dates to ISO string in UTC timezone
      const formattedData = {
        title: dialogState.createQuiz.formData.title,
        description: dialogState.createQuiz.formData.description,
        startTime: dialogState.createQuiz.formData.startTime.toISOString(),
        endTime: dialogState.createQuiz.formData.endTime.toISOString(),
      };

      const response = await fetch(`${BASE_URL}/api/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create quiz");
      }

      const data = await response.json();
      if (data.success) {
        await fetchQuizzes(); // Refresh the list from backend
        setDialogState((prev) => ({
          ...prev,
          createQuiz: {
            open: false,
            formData: {
              title: "",
              description: "",
              startTime: new Date(),
              endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            },
          },
        }));
        showSnackbar("Quiz created successfully");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      showSnackbar(error.message || "Error creating quiz", "error");
    }
  };

  const handleAddQuestion = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const questionData = {
        ...dialogState.addQuestion.formData,
        options: JSON.stringify(dialogState.addQuestion.formData.options),
      };

      const response = await fetch(
        `${BASE_URL}/api/quizzes/${dialogState.addQuestion.quizId}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(questionData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add question");
      }

      const data = await response.json();
      if (data.success) {
        setDialogState((prev) => ({
          ...prev,
          addQuestion: {
            open: false,
            quizId: "",
            formData: {
              text: "",
              options: ["", "", "", ""],
              correctAnswer: 0,
              points: 10,
            },
          },
        }));
        showSnackbar("Question added successfully");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      showSnackbar(error.message || "Error adding question", "error");
    }
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    setDialogState((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        formData: {
          ...prev[formType].formData,
          [name]: value,
        },
      },
    }));
  };

  const handleOptionChange = (index, value) => {
    setDialogState((prev) => {
      const newOptions = [...prev.addQuestion.formData.options];
      newOptions[index] = value;
      return {
        ...prev,
        addQuestion: {
          ...prev.addQuestion,
          formData: {
            ...prev.addQuestion.formData,
            options: newOptions,
          },
        },
      };
    });
  };

  const handleDateChange = (name, date, formType) => {
    setDialogState((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        formData: {
          ...prev[formType].formData,
          [name]: date,
        },
      },
    }));
  };

  const handleChangePage = (event, newPage) => {
    setState((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page: newPage,
      },
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setState((prev) => ({
      ...prev,
      pagination: {
        page: 0,
        rowsPerPage: parseInt(event.target.value, 10),
      },
    }));
  };

  const columns = [
    { Header: "Title", accessor: "title" },
    {
      Header: "Start Time",
      accessor: "startTime",
      Cell: ({ value }) => new Date(value).toLocaleString(),
    },
    {
      Header: "End Time",
      accessor: "endTime",
      Cell: ({ value }) => new Date(value).toLocaleString(),
    },
    {
      Header: "Status",
      accessor: "isActive",
      Cell: ({ value }) => (
        <Chip
          label={value ? "Active" : "Inactive"}
          color={value ? "success" : "error"}
          size="small"
        />
      ),
    },
    {
      Header: "Add Question",
      accessor: "actions",
      Cell: ({ row }) => (
        <IconButton
          color="primary"
          onClick={() =>
            setDialogState((prev) => ({
              ...prev,
              addQuestion: {
                open: true,
                quizId: row.original.id,
                formData: {
                  text: "",
                  options: ["", "", "", ""],
                  correctAnswer: 0,
                  points: 10,
                },
              },
            }))
          }
        >
          <AddCircleIcon />
        </IconButton>
      ),
    },
  ];

  const filteredQuizzes = state.quizzes.filter((quiz) => {
    const searchTermLower = state.searchTerm.toLowerCase();
    return (
      (quiz.title?.toLowerCase() || "").includes(searchTermLower) ||
      (quiz.description?.toLowerCase() || "").includes(searchTermLower)
    );
  });

  // Apply pagination
  const paginatedQuizzes = filteredQuizzes.slice(
    state.pagination.page * state.pagination.rowsPerPage,
    state.pagination.page * state.pagination.rowsPerPage + state.pagination.rowsPerPage
  );

  if (state.loading && state.quizzes.length === 0) {
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
                    Quiz 
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <TextField
                      label="Search Quizzes"
                      value={state.searchTerm}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, searchTerm: e.target.value }))
                      }
                      sx={{ width: 300 }}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() =>
                        setDialogState((prev) => ({
                          ...prev,
                          createQuiz: {
                            ...prev.createQuiz,
                            open: true,
                          },
                        }))
                      }
                    >
                      Create Quiz
                    </Button>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {filteredQuizzes.length > 0 ? (
                  <>
                    <DataTable
                      table={{ columns, rows: paginatedQuizzes }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={filteredQuizzes.length}
                      rowsPerPage={state.pagination.rowsPerPage}
                      page={state.pagination.page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </>
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      {state.searchTerm ? "No matching quizzes found" : "No quizzes available"}
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Create Quiz Dialog */}
      <Dialog
        open={dialogState.createQuiz.open}
        onClose={() =>
          setDialogState((prev) => ({
            ...prev,
            createQuiz: {
              ...prev.createQuiz,
              open: false,
            },
          }))
        }
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiDialog-container": {
            "& .MuiPaper-root": {
              maxHeight: "80vh", // Limit modal height
            },
          },
        }}
      >
        <DialogTitle>Create New Quiz</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="normal"
            name="title"
            label="Title"
            type="text"
            fullWidth
            value={dialogState.createQuiz.formData.title}
            onChange={(e) => handleInputChange(e, "createQuiz")}
            required
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Start Time (UTC)"
              value={dialogState.createQuiz.formData.startTime}
              onChange={(date) => handleDateChange("startTime", date, "createQuiz")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  helperText="Date and time in UTC timezone"
                />
              )}
              minDateTime={new Date()}
              PopperProps={{
                placement: "bottom-start", // Ensure calendar opens above the input
              }}
            />
            <DateTimePicker
              label="End Time (UTC)"
              value={dialogState.createQuiz.formData.endTime}
              onChange={(date) => handleDateChange("endTime", date, "createQuiz")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  helperText="Date and time in UTC timezone"
                />
              )}
              minDateTime={dialogState.createQuiz.formData.startTime}
              PopperProps={{
                placement: "bottom-end", // Ensure calendar opens above the input
              }}
            />
          </LocalizationProvider>
          <TextField
            margin="normal"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={dialogState.createQuiz.formData.description}
            onChange={(e) => handleInputChange(e, "createQuiz")}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDialogState((prev) => ({
                ...prev,
                createQuiz: {
                  ...prev.createQuiz,
                  open: false,
                },
              }))
            }
          >
            Cancel
          </Button>
          <Button onClick={handleCreateQuiz} color="error" variant="contained">
            Create Quiz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog
        open={dialogState.addQuestion.open}
        onClose={() =>
          setDialogState((prev) => ({
            ...prev,
            addQuestion: {
              ...prev.addQuestion,
              open: false,
            },
          }))
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Question to Quiz</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            name="text"
            label="Question Text"
            type="text"
            fullWidth
            value={dialogState.addQuestion.formData.text}
            onChange={(e) => handleInputChange(e, "addQuestion")}
          />
          {dialogState.addQuestion.formData.options.map((option, index) => (
            <TextField
              key={index}
              margin="normal"
              label={`Option ${index + 1}`}
              type="text"
              fullWidth
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
          ))}
          <FormControl fullWidth margin="normal">
            <InputLabel>Correct Answer</InputLabel>
            <Select
              name="correctAnswer"
              value={dialogState.addQuestion.formData.correctAnswer}
              onChange={(e) => handleInputChange(e, "addQuestion")}
              label="Correct Answer"
              sx={{ width: "100%", height: 35 }}
            >
              {dialogState.addQuestion.formData.options.map((option, index) => (
                <MenuItem key={index} value={index} disabled={!option.trim()}>
                  {option || `Option ${index + 1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            name="points"
            label="Points"
            type="number"
            fullWidth
            value={dialogState.addQuestion.formData.points}
            onChange={(e) => handleInputChange(e, "addQuestion")}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDialogState((prev) => ({
                ...prev,
                addQuestion: {
                  ...prev.addQuestion,
                  open: false,
                },
              }))
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddQuestion}
            color="error"
            variant="contained"
            disabled={
              !dialogState.addQuestion.formData.text ||
              dialogState.addQuestion.formData.options.some((opt) => !opt.trim())
            }
          >
            Add Question
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

      <Footer />
    </DashboardLayout>
  );
}

QuizManagement.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
      isActive: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
  value: PropTypes.any,
};

export default QuizManagement;
