import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/logos/logo.jpeg";
import logo from "assets/images/logos/logo.jpeg";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

// Alert component for Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Basic() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch("https://safety.shellcode.cloud/api/admin/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and admin details in localStorage
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("id", data.data.admin.id);
        localStorage.setItem("name", data.data.admin.name);
        localStorage.setItem("email", data.data.admin.email);

        setSnackbarMessage(data.message);
        setSnackbarSeverity("success");
        setOpenSnackbar(true);

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setErrorMessage(data.message || "Login failed");
        setSnackbarMessage(data.message || "Login failed");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error logging in", error);
      setErrorMessage("Error logging in. Please try again.");
      setSnackbarMessage("Error logging in. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="warning" // Changed to warning (yellow) color
          borderRadius="lg"
          coloredShadow="warning" // Changed to warning (yellow) color
          mx={2}
          mt={1}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDBox mb={5}>
            <img
              src={logo}
              alt="Logo"
              style={{
                maxWidth: "100px",
                marginBottom: "5px",
              }}
            />
          </MDBox>
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Admin Login
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={handleEmailChange}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={handlePasswordChange}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="warning" fullWidth type="submit">
                Log in
              </MDButton>
            </MDBox>
            {errorMessage && (
              <MDTypography variant="body2" color="error" textAlign="center">
                {errorMessage}
              </MDTypography>
            )}
          </MDBox>
        </MDBox>
      </Card>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </BasicLayout>
  );
}

export default Basic;
