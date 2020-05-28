import React from "react"
// import { NavLink } from 'react-router-dom';

import PropTypes from 'prop-types';
// import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
// import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
// import InboxIcon from '@material-ui/icons/MoveToInbox';
// import MailIcon from '@material-ui/icons/Mail';
// import MenuIcon from '@material-ui/icons/Menu';
import {
    Dashboard, Add, Edit, Assessment, ExpandLess, ExpandMore
} from '@material-ui/icons';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles, useTheme } from '@material-ui/core/styles';



const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
        },
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    // toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: "#17192b",
    },
    fontStyle: {
        color: "#DCDCDC",
        "& svg": {
            color: "#DCDCDC",
        }
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
}));


const NavbarApp = (props) => {
    const { container } = props;
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    
    const [openCollapse, setOpenCollapse] = React.useState(false);
    const handleClick = () => {
        setOpenCollapse(!openCollapse);
    };
    

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const onClickRoute = (e) => {
        props.history.push(e);
    }

    const drawer = (
        <div>
            <div className={classes.toolbar} />
            <Divider />
            <List className={classes.fontStyle}>
                <ListItem button key="Dashboard" onClick={() => onClickRoute("/login")} >
                    <ListItemIcon><Dashboard /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button key="Criar conta" onClick={() => onClickRoute("/create-account")} >
                    <ListItemIcon><Add /></ListItemIcon>
                    <ListItemText primary="Criar conta" />
                </ListItem>
                <ListItem button key="Gerenciar tipos de conta" onClick={() => onClickRoute("/manage-roles-accounts")}  >
                    <ListItemIcon><Edit /></ListItemIcon>
                    <ListItemText primary="Gerenciar tipos de conta" />
                </ListItem>
                <ListItem button key="Gerenciar policies" onClick={() => onClickRoute("/manage-iam")} >
                    <ListItemIcon><Edit /></ListItemIcon>
                    <ListItemText primary="Gerenciar IAM" />
                </ListItem>

                <ListItem button onClick={handleClick}>
                    <ListItemIcon>
                    <Assessment />
                    </ListItemIcon>
                    <ListItemText primary="Gerenciar Compliances" />
                    {openCollapse ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openCollapse} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                    <ListItem button className={classes.nested} key="IAM" onClick={() => onClickRoute("/iam-compliance")} >
                        <ListItemIcon><Assessment /></ListItemIcon>
                        <ListItemText primary="IAM" />
                    </ListItem>
                    <ListItem button className={classes.nested} key="CIS" onClick={() => onClickRoute("/cis-compliance")} >
                        <ListItemIcon><Assessment /></ListItemIcon>
                        <ListItemText primary="CIS" />
                    </ListItem>
                    </List>
                </Collapse>
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
    // console.log(props);
    return (
        <div className={classes.root}>
            <CssBaseline />
            {/* <AppBar position="fixed" className={classes.appBar} color="transparent" >
                 <Toolbar style={{ backgroundColor: "#fff", color:"black"}}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className={classes.menuButton}
                    >
                        <MenuIcon />
                    </IconButton>
                    {/* <Typography variant="h4" noWrap  id="titleHeader" >
                        Titulo da página
                    </Typography> */}
                {/* </Toolbar> 
            </AppBar> */} */}
            <nav className={classes.drawer} aria-label="mailbox folders" >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Hidden smUp implementation="css">
                    <Drawer
                        container={container}
                        variant="temporary"
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="css" >
                    <Drawer
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        variant="permanent"
                        open
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
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