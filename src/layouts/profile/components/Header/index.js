import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // To navigate to login page
import PropTypes from "prop-types";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 React base styles
import breakpoints from "assets/theme/base/breakpoints";

// Images
import backgroundImage from "assets/images/bg-profile.jpeg";

function Header({ children }) {
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate(); // Hook to navigate to login page

  useEffect(() => {
    // A function that sets the orientation state of the tabs.
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.sm
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    // Event listener to handle resize
    window.addEventListener("resize", handleTabsOrientation);
    handleTabsOrientation(); // Set initial orientation

    // Clean up event listener
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, []);

  useEffect(() => {
    // Get admin data from localStorage
    const storedAdminData = localStorage.getItem("admin");
    if (storedAdminData) {
      setAdminData(JSON.parse(storedAdminData));
    }
  }, []);

  const handleSetTabValue = (event, newValue) => setTabValue(newValue);

  const handleLogout = () => {
    // Confirm logout
    const isConfirmed = window.confirm("Are you sure you want to log out?");
    if (isConfirmed) {
      // Remove admin data from localStorage
      localStorage.removeItem("admin");

      // Navigate to the login page
      navigate("/login");
    }
  };

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient }, palette: { gradients } }) =>
            `${linearGradient(
              rgba(gradients.info.main, 0.6),
              rgba(gradients.info.state, 0.6)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 2,
          px: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            {/* Display admin avatar from sessionStorage */}
            {adminData && adminData.avatar ? (
              <MDAvatar src={adminData.avatar} alt="profile-image" size="xl" shadow="sm" />
            ) : (
              <MDAvatar src="default-avatar.png" alt="profile-image" size="xl" shadow="sm" />
            )}
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              {/* Display admin name from sessionStorage */}
              <MDTypography variant="h5" fontWeight="medium">
                {adminData ? adminData.name : "fetching..."}
              </MDTypography>
              {/* Display admin role from sessionStorage */}
              <MDTypography variant="button" color="text" fontWeight="regular">
                {adminData ? adminData.role : "fetching..."}
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4} sx={{ ml: "auto" }}>
            <AppBar position="static">
              <Tabs orientation={tabsOrientation} value={tabValue} onChange={handleSetTabValue} />
            </AppBar>
          </Grid>
        </Grid>
        {/* Logout Button */}
        <MDBox display="flex" justifyContent="flex-end" mt={2}>
          <IconButton onClick={handleLogout} color="primary">
            <PowerSettingsNewIcon /> {/* Replace with new icon */}
            <MDTypography variant="button" color="text" fontWeight="regular">
              Logout
            </MDTypography>
          </IconButton>
        </MDBox>
        {children}
      </Card>
    </MDBox>
  );
}

// Setting default props for the Header
Header.defaultProps = {
  children: "",
};

// Typechecking props for the Header
Header.propTypes = {
  children: PropTypes.node,
};

export default Header;
