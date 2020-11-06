import React from "react";
import {
    Divider
} from "@material-ui/core";



const ProjectInfo = ({project}) => {
    let lastSelected = project.length ? project[ project.length -1] : [];
    let policies = lastSelected.policies ? lastSelected.policies : [];
    let title = lastSelected.name ? lastSelected.name : "";

    return (
        <>
            <h2 style={{fontSize: "1.7em"}}>Permissões de: {title}</h2>
            <Divider light />
            
            {policies.length ? (
                <p>A seguir são os usuários com suas roles atribuídas:</p>
            ): (
                <p>Permissões não foram encontradas</p>
            )}

            {policies.map(row => {
                return (
                    <div key={`"${row.role}"`}>
                        <strong>{row.role}</strong>
                        <ul key={`"${row.role}"`}>
                            {row.members.map( user => <li key={`"${user}"`}>{user}</li> )}
                        </ul>
                    </div>
                )
            })}
        </>
    )
            
}

export default ProjectInfo;