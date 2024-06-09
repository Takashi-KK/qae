import { AppBar, Toolbar, IconButton, Typography, Stack } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React, { useEffect } from "react";
import { ResponseData } from "../../api/interfaces";

const URL_USER_ID = "/api/userid";
const USER_ID_PREFIX = "A";
const USER_ID_DEFAULT = "901";

interface NavBarProps {
  onDrawerOpen: () => void;
  userId: string;
  setUserId: (userId: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onDrawerOpen, userId, setUserId }) => {
  useEffect(() => {
    console.log("NavBar: useEffect called");
    const url = URL_USER_ID;
    async function getSample() {
      const res: Response = await fetch(url);
      const data: ResponseData = await res.json();
      let ipAddress = data.response["user-address"];
      //ipAddress = "192.168.1.2";   // for debug
      console.log(`IP-Address: ${ipAddress}`);
      const parts = ipAddress.split(".");
      let userId = USER_ID_PREFIX + USER_ID_DEFAULT;
      if (parts.length === 4) {
        const value4 = parts[3];
        const paddedValue4 = value4.padStart(3, "0");
        userId = USER_ID_PREFIX + paddedValue4;
      }
      setUserId(userId);
    }
    getSample();
  }, [setUserId]);
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="logo"
            onClick={onDrawerOpen}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Prompt Engineering Tool
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              UserID:
            </Typography>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {userId}
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default NavBar;
