import React from "react"

import PropTypes from 'prop-types';
import {
    Assessment, Settings as SettingsIcon,
    ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
    Menu as MenuIcon
} from '@material-ui/icons';
import {
    AppBar, Toolbar, Typography, List, ListItem, ListItemIcon, ListItemText, IconButton, Drawer, Divider, CssBaseline
} from "@material-ui/core";



import { useTheme } from '@material-ui/core/styles';

import { NavLink} from "react-router-dom";
import clsx from 'clsx';

import styles from "./components/styles.js";

import MenuAccount from "./components/MenuAccount";
import ProviderAWS from "./components/ProviderAWS";
import ProviderGCP from "./components/ProviderGCP";


const NavbarApp = (props) => {
    // const { container } = props;
    const classes = styles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    
    // const [openCollapse, setOpenCollapse] = React.useState(false);
    // const handleClick = () => {
    //     setOpenCollapse(!openCollapse);
    // };
    
    // const [openCollapse2, setOpenCollapse2] = React.useState(false);
    // const handleClick2 = () => {
    //     setOpenCollapse2(!openCollapse2);
    // };
    

    const handleDrawerOpen = () => {
        setOpen(true);
    };
    
    const handleDrawerClose = () => {
        setOpen(false);
    };

    const isActive = match => window.location.pathname === match ? classes.active : "";

    const drawer = (
        <div>
            <div className={classes.toolbar} />
            <Divider />
            <List className={classes.fontStyle}>
                {/* <ListItem button key="Dashboard">
                    <ListItemIcon><Dashboard /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem> */}
                <ProviderAWS pathname={window.location.pathname} />
                <ProviderGCP pathname={window.location.pathname} />

                <ListItem button key="Histórico de Eventos" className={`${classes.buttonHover} ${isActive("/event-history")}`}> 
                    <ListItemIcon><Assessment /></ListItemIcon>
                    <NavLink to="/event-history" className={classes.links} >
                        <ListItemText primary="Histórico de Eventos" />
                    </NavLink>
                </ListItem>
                <ListItem button key="Usuários" className={`${classes.buttonHover} ${isActive("/manage-users")}`}> 
                    <ListItemIcon><SettingsIcon /></ListItemIcon>
                    <NavLink to="/manage-users" className={classes.links} >
                        <ListItemText primary="Usuários" />
                    </NavLink>
                </ListItem>
                {/* <ListItem button key="Usuários" className={`${classes.buttonHover} ${isActive("/users")}`}> 
                    <ListItemIcon><Assessment /></ListItemIcon>
                    <NavLink to="/users" className={classes.links} >
                        <ListItemText primary="Histórico de Eventos" />
                    </NavLink>
                </ListItem> */}
                
                
            </List>
            {/* <Divider />
        <List>
          {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon>{index % 2 === 0 ? <AccountBox /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List> */}
        </div>
    );
    
    
    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
                // color="transparent"
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, open && classes.hide)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        Octopus
                    </Typography>

                    {/* right side */}
                    <div className={classes.grow} />
                    <MenuAccount pathname={window.location.pathname}/>

                </Toolbar>
            </AppBar>

            <Drawer
                className={classes.drawer}
                variant="persistent"
                anchor="left"
                open={open}
                classes={{
                paper: classes.drawerPaper,
                }}
            >
                <div className={classes.drawerHeader}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </div>
                <Divider />
                {drawer}
            </Drawer>
            <div
                className={clsx(classes.content, {
                [classes.contentShift]: open,
                })}
            >
                {props.children}

            </div>
        </div>

    );
}

NavbarApp.propTypes = {
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    container: PropTypes.instanceOf(typeof Element === 'undefined' ? Object : Element),
};
export default NavbarApp;