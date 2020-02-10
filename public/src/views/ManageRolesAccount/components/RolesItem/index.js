import React from "react";
import { Form, Modal } from "react-bootstrap";
import { makeStyles } from '@material-ui/core/styles';
import {Fab, Box, Zoom, Button } from "@material-ui/core";

import RolesHtml from "../RolesHtml";


const useStyles = makeStyles(theme => ({
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
}));


const RolesItem = (props) => {
    const classes = useStyles();
    const roles_available = [];
    const showModalDelete = false;
    const html_delete_button = "";
    const delete_roletype = "";
    const role_type = [];
    const description = "";
    const roles = [];

    // if(delete_roletype !== "não declarado"){
    //     html_delete_button = <Button variant="danger" className="" onClick={this.handleShow.bind(this)} >Deletar "{delete_roletype}"</Button>;
    // }

    return (
        <main className={classes.content}>
            <Box boxShadow={3}> 

            <div className="header_buttons">
                {html_delete_button}

                <Form className="space_y" >
                    <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Label>Selecionar tipo de role da conta:</Form.Label>
                        <Form.Control as="select" className="header_button_select"
                        //onChange={this.onChangeRoleTypeSelect.bind(this)} 
                        >
                            <option key="null" value="" >Criar novo documento</option>
                            {roles_available && roles_available.map((elem, index) => {
                                return <option key={elem} value={elem} >{elem}</option>;
                            })}
                        </Form.Control>
                    </Form.Group>
                </Form>


                {/* <Modal show={showModalDelete} onHide={this.handleClose.bind(this)} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Novo check</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Essa ação irá deletar o documento "{delete_roletype}" permanentemente. Deseja continuar?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" value="new_check" onClick={this.handleClose.bind(this)}>
                            Sim
                            </Button>
                        <Button variant="danger" onClick={this.handleClose.bind(this)}>
                            Não
                            </Button>
                    </Modal.Footer>
                </Modal> */}

                {/* <img className="centralize-img2" src="images/loading-spinning-bubbles.svg" /> */}
            </div>

            <Form className="padding_header_forms" name="form_trust" 
            // onSubmit={this.onSubmitForm.bind(this)}
            >
                <div className="form-group row">
                    <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Tipo da conta: </label>
                    <div className="col-sm-12">
                        <input key={role_type} required type="text" name="role_type"
                            onKeyUp={(e) => this.onChangeForms("role_type", null, e)}
                            className="form-control" placeholder="policies-cloud" defaultValue={role_type} />
                    </div>
                </div>

                <div className="form-group row">
                    <label htmlFor="name_trust" className="col-sm-2 col-form-label bolder">Descrição: </label>
                    <div className="col-sm-12">
                        <input key={description} required type="text" name="Description"
                            //onChange={(e) => this.onChangeForms("description",null,e)}
                            className="form-control" placeholder="This document..." defaultValue={description} />
                    </div>
                </div>
                <h1 id="policy_titles">Roles</h1>

                {roles.map((role, index) => {
                    return (
                        <RolesHtml />
                    );
                })}
                <button className="btn btn-primary form_margin_bottom" type="button"
                    onClick={() => this.handleAddFields("role")}
                >Adicionar nova Policy</button>


                <Button block className="button_small_central" type="submit">{delete_roletype == "não declarado" ? "Criar" : "Atualizar"}</Button>
            </Form>

            </Box>
        </main>
    );

}


export default RolesItem;