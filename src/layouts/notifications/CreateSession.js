import { useState } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function CreateSession() {
  const [formData, setFormData] = useState({
    class: "A1", // default class value
    topic: "",
    subtopic: "",
    URL: "",
    type: "video", // default type
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // State to store message
  const [messageType, setMessageType] = useState(""); // State to store message type (success/error)

  const navigate = useNavigate(); // Hook to navigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear any previous messages

    try {
      const response = await fetch("https://api.blissiq.cloud/session/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // Checking if the response status is "success"
      if (data.success) {
        setMessageType("success");
        setMessage(data.message || "Video added successfully for A1!");
        setTimeout(() => {
          navigate("/Get-session");
        }, 1000);
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to add video. Please try again.");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4} mb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={6}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h5" align="center">
                  Create Session
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
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Class"
                        variant="outlined"
                        name="class"
                        value={formData.class}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Topic"
                        variant="outlined"
                        name="topic"
                        value={formData.topic}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subtopic"
                        variant="outlined"
                        name="subtopic"
                        value={formData.subtopic}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Video URL"
                        variant="outlined"
                        name="URL"
                        value={formData.URL}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Type"
                        variant="outlined"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDButton
                        type="submit"
                        variant="gradient"
                        color="info" // This will give a blue color
                        fullWidth
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Session"}
                      </MDButton>
                    </Grid>
                  </Grid>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CreateSession;
