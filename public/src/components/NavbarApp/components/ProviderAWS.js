import React from "react"

import Collapse from '@material-ui/core/Collapse';
import SettingsIcon from '@material-ui/icons/Settings';
import {
    Add, Edit, Assessment, ExpandLess, ExpandMore
} from '@material-ui/icons';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
// import { useTheme } from '@material-ui/core/styles';
import { NavLink} from "react-router-dom";

import styles from "./styles.js";



const ProviderAWS = ({pathname}) => {
    const classes = styles();
    // const theme = useTheme();
    // const [open, setOpen] = React.useState(false);
    
    const [openCollapse, setOpenCollapse] = React.useState(false);
    const handleClick = () => {
        setOpenCollapse(!openCollapse);
    };
    
    const [openCollapse2, setOpenCollapse2] = React.useState(false);
    const handleClick2 = () => {
        setOpenCollapse2(!openCollapse2);
    };

    const [openCollapse3, setOpenCollapse3] = React.useState(false);
    const handleClick3 = () => {
        setOpenCollapse3(!openCollapse3);
    };
    

    // const handleDrawerOpen = () => {
    //     setOpen(true);
    // };
    
    // const handleDrawerClose = () => {
    //     setOpen(false);
    // };

    const isActive = match => pathname === match ? classes.active : "";

    return (
        <>
            <ListItem button onClick={handleClick} className={`${classes.groupLink}`} >
                <ListItemIcon>
                    <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="AWS"  />
                {openCollapse ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openCollapse} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItem button key="Criar conta" className={`${classes.buttonHover} ${isActive("/create-account")}`}> 
                        <ListItemIcon><Add /></ListItemIcon>
                        <NavLink to="/aws-create-account" className={classes.links} >
                            <ListItemText primary="Criar conta" />
                        </NavLink>
                    </ListItem>

                    <ListItem button onClick={handleClick3} className={`${classes.groupLink}`}>
                        <ListItemIcon>
                            <Edit />
                        </ListItemIcon>
                        <ListItemText primary="Gerenciar" />
                        {openCollapse3 ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={openCollapse3} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem button key="manage-roles-accounts" className={`${classes.nested} ${isActive("/aws-manage-roles-accounts")}`}>
                                    <ListItemIcon><Edit /></ListItemIcon>
                                    <NavLink to="/aws-manage-roles-accounts" className={classes.links}>
                                        <ListItemText primary="Tipos de Conta" />
                                    </NavLink>
                                </ListItem>
                                <ListItem button key="manage-iam" className={`${classes.nested} ${isActive("/aws-manage-iam")}`}>
                                    <ListItemIcon><Edit /></ListItemIcon>
                                    <NavLink to="/aws-manage-iam" className={classes.links}>
                                        <ListItemText primary="IAM" />
                                    </NavLink>
                                </ListItem>
                            </List>
                        </Collapse>
                    {/* <ListItem button key="Gerenciar tipos de conta" className={`${classes.buttonHover} ${isActive("/manage-roles-accounts")}`}>
                        <ListItemIcon><Edit /></ListItemIcon>
                        <NavLink to="/aws-manage-roles-accounts" className={classes.links}>
                            <ListItemText primary="AWS Tipos de conta" />
                        </NavLink>
                    </ListItem>
                    <ListItem button key="Gerenciar policies" className={`${classes.buttonHover} ${isActive("/manage-iam")}`}>
                        <ListItemIcon><Edit /></ListItemIcon>
                        <NavLink to="/aws-manage-iam" className={classes.links}>
                            <ListItemText primary="Gerenciar IAM" />
                        </NavLink>
                    </ListItem> */}
                    {/* <ListItem button key="Pesquisar permissões nas contas" className={`${classes.buttonHover}`}>
                        <ListItemIcon><Edit /></ListItemIcon>
                        <NavLink to="#" className={classes.links}>
                            <ListItemText primary="Pesquisar permissões nas contas" />
                        </NavLink>
                    </ListItem>
                    <ListItem button key="Pesquisar permissões nas contas2" className={`${classes.buttonHover}`}>
                        <ListItemIcon><Edit /></ListItemIcon>
                        <NavLink to="#" className={classes.links}>
                            <ListItemText primary="Atualizar roles das contas" />
                        </NavLink>
                    </ListItem> */}

                    {/* <ListItem button key="IAM" className={`${classes.nested} ${isActive("/iam-compliance")}`}>
                        <ListItemIcon><Assessment /></ListItemIcon>
                        <NavLink to="/aws-iam-compliance" className={classes.links}>
                            <ListItemText primary="IAM" />
                        </NavLink>
                    </ListItem>
                    <ListItem button key="CIS" className={`${classes.nested} ${isActive("/cis-compliance")}`}>
                        <ListItemIcon><Assessment /></ListItemIcon>
                        <NavLink to="/aws-cis-compliance" className={classes.links}>
                            <ListItemText primary="CIS" />
                        </NavLink>
                    </ListItem> */}
                    
                    <ListItem button onClick={handleClick2} className={`${classes.groupLink}`}>
                        <ListItemIcon>
                            <Assessment />
                        </ListItemIcon>
                        <ListItemText primary="Relatórios" />
                        {openCollapse2 ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={openCollapse2} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem button key="IAM" className={`${classes.nested} ${isActive("/aws-iam-compliance")}`}>
                                    <ListItemIcon><Assessment /></ListItemIcon>
                                    <NavLink to="/aws-iam-compliance" className={classes.links}>
                                        <ListItemText primary="IAM Compliance" />
                                    </NavLink>
                                </ListItem>
                                <ListItem button key="CIS" className={`${classes.nested} ${isActive("/aws-cis-compliance")}`}>
                                    <ListItemIcon><Assessment /></ListItemIcon>
                                    <NavLink to="/aws-cis-compliance" className={classes.links}>
                                        <ListItemText primary="CIS Compliance" />
                                    </NavLink>
                                </ListItem>
                                <ListItem button key="Network Report" className={`${classes.nested} ${isActive("/aws-network-report")}`} >
                                    <ListItemIcon><Assessment /></ListItemIcon>
                                    <NavLink to="/aws-network-report" className={classes.links}>
                                        <ListItemText primary="Network Report" />
                                    </NavLink>
                                </ListItem>
                                {/* <ListItem button key="Histórico de Eventos" className={`${classes.buttonHover} ${isActive("/aws-event-history")}`}>  */}
                            </List>
                        </Collapse>

                </List>
            </Collapse>

            {/* <ListItem button onClick={handleClick2}>
                <ListItemIcon>
                    <Assessment />
                </ListItemIcon>
                <ListItemText primary="Gerenciar Compliances" />
                {openCollapse2 ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openCollapse2} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                <ListItem button key="IAM" className={`${classes.nested} ${isActive("/iam-compliance")}`}>
                    <ListItemIcon><Assessment /></ListItemIcon>
                    <NavLink to="/aws-iam-compliance" className={classes.links}>
                        <ListItemText primary="IAM" />
                    </NavLink>
                </ListItem>
                <ListItem button key="CIS" className={`${classes.nested} ${isActive("/cis-compliance")}`}>
                    <ListItemIcon><Assessment /></ListItemIcon>
                    <NavLink to="/aws-cis-compliance" className={classes.links}>
                        <ListItemText primary="CIS" />
                    </NavLink>
                </ListItem>
                </List>
            </Collapse> */}
        </>
    )
}

export default ProviderAWS;