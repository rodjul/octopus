import React from "react"

// import PropTypes from 'prop-types';
// import AppBar from '@material-ui/core/AppBar';
// import CssBaseline from '@material-ui/core/CssBaseline';
// import Divider from '@material-ui/core/Divider';
// import Drawer from '@material-ui/core/Drawer';
// import Hidden from '@material-ui/core/Hidden';
// import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
// import InboxIcon from '@material-ui/icons/MoveToInbox';
// import MailIcon from '@material-ui/icons/Mail';
// import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import {
    Dashboard, Add, Edit, Assessment, ExpandLess, ExpandMore
} from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { useTheme } from '@material-ui/core/styles';
// import Toolbar from '@material-ui/core/Toolbar';

// import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
// import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { NavLink} from "react-router-dom";
// import clsx from 'clsx';

import styles from "./styles.js";



const ProviderGCP = ({pathname}) => {
    const classes = styles();
    const theme = useTheme();
    // const [open, setOpen] = React.useState(false);
    
    const [openCollapse, setOpenCollapse] = React.useState(false);
    const handleClick = () => {
        setOpenCollapse(!openCollapse);
    };
    
    // const [openCollapse2, setOpenCollapse2] = React.useState(false);
    // const handleClick2 = () => {
    //     setOpenCollapse2(!openCollapse2);
    // };

    const isActive = match => pathname === match ? classes.active : "";

    return (
        <>
            <ListItem button onClick={handleClick} className={`${classes.groupLink}`} >
                <ListItemIcon>
                    <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="GCP" />
                {openCollapse ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openCollapse} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItem button key="gcp-organization-resource-manager" className={`${classes.buttonHover} ${isActive("/gcp-organization-resource-manager")}`}> 
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <NavLink to="/gcp-organization-resource-manager" className={classes.links} >
                            <ListItemText primary="Organization Resource Manager" />
                        </NavLink>
                    </ListItem>
                    <ListItem button key="gcp-configure-account-api" className={`${classes.buttonHover} ${isActive("/gcp-configure-account-api")}`}> 
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <NavLink to="/gcp-configure-account-api" className={classes.links} >
                            <ListItemText primary="Account API" />
                        </NavLink>
                    </ListItem>
                    {/* <ListItem button key="Histórico de Eventos" className={`${classes.buttonHover}`}> 
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <NavLink to="#" className={classes.links} >
                            <ListItemText primary="Histórico de Eventos" />
                        </NavLink>
                    </ListItem> */}
                    {/* <ListItem button key="IAM Roles Autorizadas" className={`${classes.buttonHover}`}> 
                        <ListItemIcon><SettingsIcon /></ListItemIcon>
                        <NavLink to="#" className={classes.links} >
                            <ListItemText primary="IAM Roles Autorizadas" />
                        </NavLink>
                    </ListItem> */}
                </List>
            </Collapse>
        </>
    )

}

export default ProviderGCP;