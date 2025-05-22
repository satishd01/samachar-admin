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
  Pagination,
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

const StatusCell = ({ value }) => (
  <Chip label={value ? "Active" : "Inactive"} color={value ? "success" : "error"} size="small" />
);
StatusCell.propTypes = {
  value: PropTypes.bool.isRequired,
};

const RankCell = ({ value }) => (
  <Chip label={value ? `#${value}` : "N/A"} color={value ? "primary" : "default"} size="small" />
);
RankCell.propTypes = {
  value: PropTypes.number,
};

const RewardCell = ({ value }) => (
  <Chip label={value ? "Yes" : "No"} color={value ? "success" : "default"} size="small" />
);
RewardCell.propTypes = {
  value: PropTypes.bool.isRequired,
};

function QuizResults() {
  const [state, setState] = useState({
    quizzes: [],
    selectedQuiz: null,
    results: {
      winners: [],
      participants: [],
    },
    loading: false,
    currentPage: 1,
    totalPages: 1,
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

  const fetchQuizzes = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
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

  const fetchQuizResults = async (quizId, page = 1) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("No token found, please login again", "error");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/quizzes/${quizId}/results?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quiz results");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setState((prev) => ({
          ...prev,
          results: data.data,
          selectedQuiz: quizId,
          loading: false,
          currentPage: page,
          totalPages: Math.ceil(data.data.participants.length / 10) || 1,
        }));
      } else {
        throw new Error(data.message || "No results found");
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      showSnackbar(error.message || "Error fetching quiz results", "error");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleQuizChange = (e) => {
    const quizId = e.target.value;
    if (quizId) {
      fetchQuizResults(quizId);
    } else {
      setState((prev) => ({
        ...prev,
        selectedQuiz: null,
        results: {
          winners: [],
          participants: [],
        },
      }));
    }
  };

  const handlePageChange = (event, newPage) => {
    fetchQuizResults(state.selectedQuiz, newPage);
  };

  const winnersColumns = [
    { Header: "Rank", accessor: "rank", Cell: RankCell },
    {
      Header: "Participant",
      accessor: (row) => `${row.user?.name || "Unknown"} (${row.user?.phoneNumber || "No phone"})`,
    },
    { Header: "Score", accessor: "totalScore" },
    { Header: "Correct Answers", accessor: "correctAnswers" },
    { Header: "Rewarded", accessor: "rewarded", Cell: RewardCell },
  ];

  const participantsColumns = [
    {
      Header: "Participant",
      accessor: (row) => `${row.user?.name || "Unknown"} (${row.user?.phoneNumber || "No Phone"})`,
    },
    { Header: "Score", accessor: "totalScore" },
    { Header: "Correct Answers", accessor: "correctAnswers" },
    { Header: "Rank", accessor: "rank", Cell: RankCell },
    { Header: "Rewarded", accessor: "rewarded", Cell: RewardCell },
  ];

  useEffect(() => {
    fetchQuizzes();
  }, []);

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

  const selectedQuizDetails = state.quizzes.find((q) => q.id === state.selectedQuiz);

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
                    Quiz Results
                  </MDTypography>
                  <MDBox display="flex" gap={2} flexWrap="wrap" alignItems="center">
                    <FormControl sx={{ minWidth: 300 }}>
                      <InputLabel>Select Quiz</InputLabel>
                      <Select
                        value={state.selectedQuiz || ""}
                        label="Select Quiz"
                        onChange={handleQuizChange}
                        sx={{ width: 300, height: 40 }}
                      >
                        {state.quizzes.map((quiz) => (
                          <MenuItem key={quiz.id} value={quiz.id}>
                            {quiz.title} ({new Date(quiz.startTime).toLocaleDateString()})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                </MDBox>
              </MDBox>
              <MDBox pt={3}>
                {state.selectedQuiz ? (
                  <>
                    {selectedQuizDetails && (
                      <MDBox px={3} pb={2}>
                        <MDTypography variant="h5">{selectedQuizDetails.title}</MDTypography>
                        {/* <MDTypography variant="body2" color="textSecondary">
                          {selectedQuizDetails.description}
                        </MDTypography>
                        <MDTypography variant="body2">
                          {new Date(selectedQuizDetails.startTime).toLocaleString()} -{" "}
                          {new Date(selectedQuizDetails.endTime).toLocaleString()}
                        </MDTypography> */}
                        <StatusCell value={selectedQuizDetails.isActive} />
                      </MDBox>
                    )}

                    {state.results.winners.length > 0 && (
                      <MDBox px={3} pb={3}>
                        <MDTypography variant="h6" gutterBottom>
                          Top Performers
                        </MDTypography>
                        <DataTable
                          table={{ columns: winnersColumns, rows: state.results.winners }}
                          isSorted={false}
                          entriesPerPage={false}
                          showTotalEntries={false}
                          noEndBorder
                        />
                      </MDBox>
                    )}

                    <MDBox px={3}>
                      <MDTypography variant="h6" gutterBottom>
                        All Participants
                      </MDTypography>
                      <DataTable
                        table={{ columns: participantsColumns, rows: state.results.participants }}
                        isSorted={false}
                        entriesPerPage={false}
                        showTotalEntries={false}
                        noEndBorder
                      />
                      {state.totalPages > 1 && (
                        <MDBox display="flex" justifyContent="center" p={2}>
                          <Pagination
                            count={state.totalPages}
                            page={state.currentPage}
                            onChange={handlePageChange}
                            color="primary"
                          />
                        </MDBox>
                      )}
                    </MDBox>
                  </>
                ) : (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="body1">
                      Please select a quiz to view results
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

QuizResults.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      quizId: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      totalScore: PropTypes.number.isRequired,
      correctAnswers: PropTypes.number.isRequired,
      rank: PropTypes.number,
      rewarded: PropTypes.bool.isRequired,
      user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default QuizResults;
