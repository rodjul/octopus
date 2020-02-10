import React from "react"
import { NavLink } from 'react-router-dom';
import { Navbar, Nav } from "react-bootstrap";

import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
// import InboxIcon from '@material-ui/icons/MoveToInbox';
// import MailIcon from '@material-ui/icons/Mail';
// import MenuIcon from '@material-ui/icons/Menu';
import {
    Menu as MenuIcon,
    Dashboard,
    Add,
    Edit,
    Assessment
} from '@material-ui/icons';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';



const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex'
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
}));


const NavbarApp = () => {
    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand href="#">Octopus</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <NavLink to="/login" className="nav-link" activeClassName="nav_clicked">Login</NavLink>
                    <NavLink to="/create-account" className="nav-link" activeClassName="nav_clicked">Criar conta</NavLink>
                    <NavLink to="/manage-roles-accounts" className="nav-link" activeClassName="nav_clicked">Gerenciar tipos de conta</NavLink>
                    <NavLink to="/manage-policies" className="nav-link" activeClassName="nav_clicked">Gerenciar policies</NavLink>
                    <NavLink to="/accounts-compliance" className="nav-link" activeClassName="nav_clicked">Compliance das contas</NavLink>

                    {/* <NavDropdown title="Dropdown" id="basic-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
            </NavDropdown> */}

                </Nav>

                {/* <Form inline>
            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
            <Button variant="outline-success">Search</Button>
        </Form> */}

            </Navbar.Collapse>
        </Navbar>
    );
}

const NavbarApp2 = (props) => {
    const { container } = props;
    const classes = useStyles();
    const theme = useTheme();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [titleLocationDrawer, setTitleLocationDrawer] = React.useState("Dashboard");
    
    const titleLocationText = {
        "/login": "Dashboard",
        "/create-account": "Criar conta",
        "/manage-roles-accounts": "Gerenciar tipos de conta",
        "/manage-policies": "Gerenciar policies",
        "/accounts-compliance": "Compliance das contas",
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const onClickRoute = (e) => {
        props.history.push(e);
    }

    console.log(props);

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
                <ListItem button key="Gerenciar policies" onClick={() => onClickRoute("/manage-policies")} >
                    <ListItemIcon><Edit /></ListItemIcon>
                    <ListItemText primary="Gerenciar policies" />
                </ListItem>
                <ListItem button key="Compliance das contas" onClick={() => onClickRoute("/accounts-compliance")} >
                    <ListItemIcon><Assessment /></ListItemIcon>
                    <ListItemText primary="Compliance das contas" />
                </ListItem>
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
            <AppBar position="fixed" className={classes.appBar} >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className={classes.menuButton}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        MUDAR AQUI{ props.appbarTitle}
                    </Typography>
                </Toolbar>
            </AppBar>
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

NavbarApp2.propTypes = {
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    container: PropTypes.instanceOf(typeof Element === 'undefined' ? Object : Element),
};
export default NavbarApp2;