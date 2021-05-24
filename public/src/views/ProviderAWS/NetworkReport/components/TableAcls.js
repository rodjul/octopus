import React from 'react'
import { useTable } from 'react-table'
import {
    Table as TableStrap
} from 'reactstrap';



function Table({ columns, data }) {
    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
    })

    // Render the UI for your table
    return (
        <TableStrap hover size="sm" {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </TableStrap>
    )
}

function TableAcls({acls_data}) {

    const [data, setData] = React.useState({acls_data});
    const [adjusted, setAdjusted] = React.useState(false);

    const columns = React.useMemo(

        () => [
            {
                Header: 'Tipo de Regra',
                accessor: 'type',
            },
            {
                Header: 'Security Group ID',
                accessor: 'security_group_id',
            },
            {
                Header: 'From Port',
                accessor: 'from_port',
            },
            {
                Header: 'To Port',
                accessor: 'to_port',
            },
            {
                Header: 'Protocolo',
                accessor: 'ip_protocol',
            },
            {
                Header: 'Ranges de IP',
                accessor: 'ip_ranges',
            },
        ],
        []
    )

    React.useEffect(() => {
        let format = [];
        for(let row in acls_data){
            for(let index in acls_data[row]){
                let value = acls_data[row][index];
            
                if(value['from_port'] === -1)
                    value['from_port'] = "ALL";

                if(value['to_port'] === -1)
                    value['to_port'] = "ALL";

                if(value['ip_protocol'] === "-1")
                    value['ip_protocol'] = "ALL";
                
                try{
                    if(value['ip_ranges'].length)
                        value['ip_ranges'] = value['ip_ranges'].map(range => range["CidrIp"]).join(", ");
                }catch{
                    console.error(value);
                }
                format.push(value);
            };
        }

        setData(format);
        setAdjusted(true);
    }, [JSON.stringify(acls_data)])

    // console.log(data);
    return (
        <>
            {adjusted ? <Table columns={columns} data={data} /> : null}
        </>
    )
}

export default TableAcls
