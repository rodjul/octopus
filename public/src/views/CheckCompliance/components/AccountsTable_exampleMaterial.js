import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import {Fab, Box, Button, Zoom, Tabs, Tab, Typography, CircularProgress} from "@material-ui/core";
// import { Table, Dropdown, Button, Form, Modal } from "react-bootstrap";

import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';


const columns = [
    { id: 'account_id', label: 'Account\u00a0ID' },
    { id: 'account_name', label: 'Name\u00a0Account', align: 'justify', format: value => value.toLocaleString() },
    { id: 'role_name', label: 'Role\u00a0Name',  align: 'justify', format: value => value.toLocaleString() },
    { id: 'role_policy', label: 'Policy', align: 'justify', format: value => value.toFixed(2) },
    { id: 'compliance', label: 'Compliance',  align: 'justify', format: value => value.toLocaleString() },
    { id: 'status', label: 'Status',  align: 'justify', format: value => value.toLocaleString() },
    { id: 'policies_adicionais', label: 'Policies\u00a0Adicionais',  align: 'justify', format: value => value.toLocaleString() },
];



const useStyles = makeStyles(theme => ({
    // paper: {
    //     padding: theme.spacing(2),
    //     color: theme.palette.text.secondary,
    //     backgroundColor: "white",
    // },

    formStyle: {
        padding: "2vw",
        width: "40vw",
    },
    content: {
        overflow: "none",
        marginTop: 64,
        flexGrow: 1,
        marginLeft: 240,
        paddingLeft: 20,
        padding: theme.spacing(3),
        "@media (max-width: 600px)":{
            marginLeft: 0,
            paddingLeft: 20,
      }
    },
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        // height: 224,
        height: "38em",
        // height: "1%",
      },
    tabs: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    tabsMain: {
        // color: "#DCDCDC",
        // backgroundColor: "#17192b",
        fontWeight: "bolder",
    },
    tabContent: {
        width: "100%",
        overflowY: "scroll",
    },
    fabAdd: {
        position: 'absolute',
        bottom: theme.spacing(5),
        right: theme.spacing(5),
    },
    fabSave: {
        position: 'absolute',
        bottom: theme.spacing(5),
        right: theme.spacing(13),
    },
    fabProgress: {
        // color: green[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1,
    }
}));

const AccountsTable = (props) => {
    const classes = useStyles();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(50);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const type_role_selected = props.type_role_selected;
    const type_roles = props.type_roles;
    const accounts = props.accounts;
    const dates_available = props.dates_available;
    const total_rows = props.total_rows;
    const filter_text = props.filter_text;
    const roles = props.roles;
    const policy = props.policy;
    const compliance = props.compliance;
    const policies_adicionais = props.policies_adicionais;
    const status = props.status;
    const img_loading = "";
    const showModal = "";


    let rows = [];
    if(accounts.length !== 0){
        accounts.map(elem => {
            JSON.parse(elem['DataCompliance']).map(elem2 => {
                // id: 'Account', label: 'Account\u00a0ID'; id: 'Name', label: 'Name\u00a0Account'; id: 'name', label: 'Role\u00a0Name';
                // id: 'policy', label: 'Policy'; id: 'compliance', label: 'Compliance'; id: 'status', label: 'Status';
                // id: 'policies_adicionais', label: 'Policie
                
                rows.push( {
                    "account_id":elem['Account'], "account_name":elem['Name'], "role_name":elem2['name'], 
                    "role_policy":elem2['policy'], "compliance":elem2['compliance'].toString(), "status":elem2['status'],
                    "policies_adicionais":elem2.hasOwnProperty("policies_adicionais") ? elem2['policies_adicionais'].toString() : "",
                } );
            });
        });
    }
    
    console.log("Accounts: ",accounts);

    return (
        <main className={classes.content}>
            <Box boxShadow={3}>

                <div style={{marginBot:"1em"}}>
                    <Button className="space_y" value="clear" variant="contained" color="primary"
                    // onClick={this.handleFilterSelection.bind(this)} 
                    >
                        Limpar filtros
                    </Button>
                    <Button className="space" variant="contained" color="primary" style={{marginLeft:"1em"}}
                    //onClick={this.handleShow.bind(this)} 
                    >
                        Novo check
                    </Button>
                    <Button value="table_main" variant="contained" color="primary" style={{marginLeft:"1em"}}
                    // onClick={this.download_table_as_csv.bind(this)} 
                    >
                        Exportar csv
                    </Button>
                </div>

                <TableContainer className={classes.container}>
                    <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                        {columns.map(column => (
                            <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ minWidth: column.minWidth, fontWeight:"bolder" }}
                            >
                            {column.label}
                            </TableCell>
                        ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
                        return (
                            <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                            {columns.map(column => {
                                const value = row[column.id];
                                return (
                                <TableCell key={column.id} align={column.align}>
                                    {column.format && typeof value === 'number' ? column.format(value) : value}
                                </TableCell>
                                );
                            })}
                            </TableRow>
                        );
                        })}
                    </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[50,100,150]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />


            </Box>
        </main>
        
    );
}


export default AccountsTable;