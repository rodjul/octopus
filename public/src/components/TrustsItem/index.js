import React from "react";
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
import { FormGroup, FormLabel, Tab, Tabs} from "react-bootstrap";

const TrustItem = ({trust_name, policy_document, index, handleJson, handleForm, handleRemoveFields}) =>{
    return (
        <div className="form_margin_bottom shadow" key={`${trust_name}~${index}`}>
            <div className="form-group row">
                <label htmlFor="name_trust" className="col-sm-1 col-form-label bolder">Name: </label>
                <div className="col-sm-11">
                    <input type="text" id="name_trust" name="Name" 
                    onChange={(e) => handleForm("trust",index,e)}
                    className="form-control" placeholder="Readonly" defaultValue={trust_name} />
                </div>
                {/* <label htmlFor="name_trust" className="col-sm-1 col-form-label bolder">Description: </label>
                <div className="col-sm-11">
                    <input type="text" id="name_trust" name={"name_"+ trust_name} className="form-control" placeholder="Readonly" defaultValue={trust_name} />
                </div> */}
            </div>
            <div className="form_margin_bottom">
                <FormGroup>
                    <FormLabel htmlFor="assumerolepolicydocument_" className="bolder">AssumeRolePolicyDocument: </FormLabel>
                    {/* <FormControl name={"assumerolepolicydocument_"+ trust_name} as="textarea" rows="12" defaultValue={JSON.stringify( policy_document, "", '\t' )} /> */}
                </FormGroup>
                
                <Tabs defaultActiveKey="json" id="uncontrolled-tab-example">

                    <Tab eventKey="json" title="JSON">

                        {/* https://github.com/AndrewRedican/react-json-editor-ajrm */}
                        <JSONInput onChange={(e) => handleJson("trust",index,e)} className="custom-rod" name="teste"
                            id          = 'json_editor'
                            placeholder = { policy_document }
                            //theme="light_mitsuketa_tribute"
                            // colors      = { {
                            //     string: "#DAA520" // overrides theme colors with whatever color value you want
                            //   }}
                            locale      = { locale }
                            height      = 'auto'
                            width       = 'auto'
                        />

                    </Tab>
                    <Tab eventKey="editor" title="Editor">
                        <p>item 2</p>
                    </Tab>
                </Tabs>

                
            </div>

            
            <div className="form-group col-sm-2">
                <button className="btn btn-danger" type="button"
                onClick={() => handleRemoveFields(index, "trustrelationships")} 
                >Remover</button>
            </div>

        </div>
    )

}

export default TrustItem;