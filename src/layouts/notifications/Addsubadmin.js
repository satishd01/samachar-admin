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

function AddSubAdmin() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "ADMIN",
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
      const response = await fetch("https://api.blissiq.cloud/admin.addSubAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status) {
        setMessageType("success");
        setMessage(data.message || "Sub-admin added successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        // On failure, set the error message
        setMessageType("error");
        setMessage(data.message || "Failed to add sub-admin. Please try again.");
      }
    } catch (error) {
      // If there's an error with the API call, display a generic error message
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
                  Add Sub-Admin
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
                        label="Name"
                        variant="outlined"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone"
                        variant="outlined"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Role"
                        variant="outlined"
                        name="role"
                        value={formData.role}
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
                        {loading ? "Adding..." : "Add Sub-Admin"}
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

export default AddSubAdmin;
