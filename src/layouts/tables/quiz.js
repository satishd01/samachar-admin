import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Box,
} from "@mui/material";
import { AddCircle, Delete, Edit } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://samachar.chetakbooks.shop";

function QuizManagement() {
  const navigate = useNavigate();
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
        startTime: "",
        endTime: "",
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
    confirmDelete: null,
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
      // Check if start time and end time are the same
      const startTime = new Date(dialogState.createQuiz.formData.startTime);
      const endTime = new Date(dialogState.createQuiz.formData.endTime);

      if (startTime.toISOString() === endTime.toISOString()) {
        showSnackbar("Start time and end time cannot be the same", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dialogState.createQuiz.formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create quiz");
      }

      const data = await response.json();
      if (data.success) {
        await fetchQuizzes();
        setDialogState((prev) => ({
          ...prev,
          createQuiz: {
            open: false,
            formData: {
              title: "",
              description: "",
              startTime: "",
              endTime: "",
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

  // const handleCreateQuiz = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       showSnackbar("No token found, please login again", "error");
  //       navigate("/authentication/sign-in");
  //       return;
  //     }

  //     const response = await fetch(`${BASE_URL}/api/quizzes`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(dialogState.createQuiz.formData),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || "Failed to create quiz");
  //     }

  //     const data = await response.json();
  //     if (data.success) {
  //       await fetchQuizzes();
  //       setDialogState((prev) => ({
  //         ...prev,
  //         createQuiz: {
  //           open: false,
  //           formData: {
  //             title: "",
  //             description: "",
  //             startTime: "",
  //             endTime: "",
  //           },
  //         },
  //       }));
  //       showSnackbar("Quiz created successfully");
  //     }
  //   } catch (error) {
  //     console.error("Error creating quiz:", error);
  //     showSnackbar(error.message || "Error creating quiz", "error");
  //   }
  // };

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

  const handleDeleteQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        navigate("/authentication/sign-in");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/quizzes/${dialogState.confirmDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete quiz");
      }

      const data = await response.json();
      if (data.success) {
        showSnackbar("Quiz deleted successfully");
        setDialogState((prev) => ({ ...prev, confirmDelete: null }));
        fetchQuizzes();
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      showSnackbar(error.message || "Error deleting quiz", "error");
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
      Cell: ({ value }) => {
        const date = new Date(value);
        return date.toLocaleString("en-IN", {
          timeZone: "UTC", // Ensures UTC time is displayed
          weekday: "short",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
      },
    },
    {
      Header: "End Time",
      accessor: "endTime",
      Cell: ({ value }) => {
        const date = new Date(value);
        return date.toLocaleString("en-IN", {
          timeZone: "UTC", // Ensures UTC time is displayed
          weekday: "short",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
      },
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
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <Box display="flex" gap={1}>
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
            <AddCircle />
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

  const filteredQuizzes = state.quizzes.filter((quiz) => {
    const searchTermLower = state.searchTerm.toLowerCase();
    return (
      (quiz.title?.toLowerCase() || "").includes(searchTermLower) ||
      (quiz.description?.toLowerCase() || "").includes(searchTermLower)
    );
  });

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
                    Quiz Management
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
          <TextField
            margin="normal"
            name="startTime"
            label="Start Time (YYYY-MM-DDTHH:MM)"
            type="datetime-local"
            fullWidth
            value={dialogState.createQuiz.formData.startTime}
            onChange={(e) => handleInputChange(e, "createQuiz")}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            name="endTime"
            label="End Time (YYYY-MM-DDTHH:MM)"
            type="datetime-local"
            fullWidth
            value={dialogState.createQuiz.formData.endTime}
            onChange={(e) => handleInputChange(e, "createQuiz")}
            InputLabelProps={{ shrink: true }}
          />
          {/* <TextField
            margin="normal"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={dialogState.createQuiz.formData.description}
            onChange={(e) => handleInputChange(e, "createQuiz")}
          /> */}
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
          <Button
            onClick={handleCreateQuiz}
            color="error"
            variant="contained"
            disabled={!dialogState.createQuiz.formData.title}
          >
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
              sx={{ width: 525, height: 40 }}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(dialogState.confirmDelete)}
        onClose={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography>Are you sure you want to delete this quiz?</MDTypography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogState((prev) => ({ ...prev, confirmDelete: null }))}>
            Cancel
          </Button>
          <Button onClick={handleDeleteQuiz} color="error" variant="contained">
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

      <Footer />
    </DashboardLayout>
  );
}

// PropTypes validation
const QuizRowPropTypes = {
  original: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
  }).isRequired,
};

QuizManagement.propTypes = {
  row: PropTypes.shape(QuizRowPropTypes),
  value: PropTypes.any,
};

export default QuizManagement;
