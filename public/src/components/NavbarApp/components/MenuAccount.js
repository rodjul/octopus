import React from "react";
import {
    AccountCircle, ExitToApp as LogoutIcon
    // Menu as MenuIcon
} from '@material-ui/icons';
import {
     Menu, MenuItem, IconButton, ListItemIcon, ListItemText 
} from "@material-ui/core";
import { NavLink} from "react-router-dom";

import styles from "./styles.js";



const MenuAccount = ({pathname}) => {
    const classes = styles();

    const [anchorEl, setAnchorEl] = React.useState(null);
  
    const handleProfileMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    
    const menuIdProfile = "primary-search-account-menu";
    const renderMenuAccount = (
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        id={menuIdProfile}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {/* <MenuItem onClick={handleMenuClose}>Profile2</MenuItem> */}
        <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
                <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <NavLink to="/logout" style={{textDecoration:"none", color: "black"}}>
              <ListItemText primary="Logout" />
            </NavLink>
        </MenuItem>
      </Menu>
    );


    return (
        <div>
            <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls={menuIdProfile}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
            >
            <AccountCircle/>
            
            </IconButton>
            {renderMenuAccount}
        </div>
    )
}


export default MenuAccount;