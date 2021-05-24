import React from 'react'
import { 
    useTable, 
    useExpanded,
    usePagination, 
    useFilters, 
    useGlobalFilter, 
    useAsyncDebounce, 
} from 'react-table'
import {
    Input, Table as TableStrap, Pagination, PaginationItem, PaginationLink
} from 'reactstrap';
import {
    Paper
} from "@material-ui/core";
import BlockUi from 'react-block-ui';
import LoadingCircularProgress from "../../../../components/LoadingCircularProgress";
import TableAcls from './TableAcls';


const DEFAULT_PAGE_SIZE = 80;


function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
}) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200)
    
    // console.log( preGlobalFilteredRows, globalFilter, setGlobalFilter, flatRows)
        
    return (
        <span>
            Search:{' '}
            <input
                value={value || ""}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={`${count} records...`}
                style={{
                    fontSize: '1.1rem',
                    border: '0',
                }}
            />
        </span>
    )
}



// A simple way to support a renderRowSubComponent is to make a render prop
// This is NOT part of the React Table API, it's merely a rendering
// option we are creating for ourselves in our table renderer
function Table({ columns: userColumns, data, renderRowSubComponent, blocking }) {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        // pagination
        page, // Instead of using 'rows', we'll use page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,

        prepareRow,

        // filter
        visibleColumns,
        preGlobalFilteredRows,
        setGlobalFilter,
        
        state: { pageIndex, pageSize, globalFilter },
        
    } = useTable(
        {
            columns: userColumns,
            data,
            initialState: { pageSize: DEFAULT_PAGE_SIZE, resizable: false },
        },
        useFilters, // useFilters!
        useGlobalFilter, // useGlobalFilter!
        useExpanded,
        usePagination, 
    )

    return (
        <>
            <Paper elevation={1} variant="outlined" square 
                // style={{ height:"30vw", overflow: "auto", padding: "0vw" }} 
            >
                <BlockUi tag="div" blocking={blocking} message="" loader={<LoadingCircularProgress/>}>

                <TableStrap hover size="sm" {...getTableProps()}>
                    <thead>
                        <tr>
                            <th
                                colSpan={visibleColumns.length}
                                style={{
                                    textAlign: 'left',
                                }}
                            >
                                <GlobalFilter
                                    preGlobalFilteredRows={preGlobalFilteredRows}
                                    globalFilter={globalFilter}
                                    setGlobalFilter={setGlobalFilter}
                                />
                            </th>
                        </tr>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {page.map((row, i) => {
                            prepareRow(row)
                            return (
                                // Use a React.Fragment here so the table markup is still valid
                                //   <React.Fragment {...row.getRowProps()}>
                                <React.Fragment key={row.id} >
                                    <tr>
                                        {row.cells.map(cell => {
                                            return (
                                                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                            )
                                        })}
                                    </tr>
                                    {/*
                                        If the row is in an expanded state, render a row with a
                                        column that fills the entire length of the table.
                                    */}
                                    {row.isExpanded ? (
                                        <tr>
                                            <td colSpan={visibleColumns.length}>
                                                {/*
                                                Inside it, call our renderRowSubComponent function. In reality,
                                                you could pass whatever you want as props to
                                                a component like this, including the entire
                                                table instance. But for this example, we'll just
                                                pass the row
                                                */}
                                                {renderRowSubComponent({ row })}
                                            </td>
                                        </tr>
                                    ) : null}
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </TableStrap>
                <br />

                </BlockUi>
            </Paper>

            <Pagination>
                <PaginationItem disabled={!canPreviousPage}>
                    <PaginationLink tag="button" onClick={() => gotoPage(0)}>
                        {"‹‹"}
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem disabled={!canPreviousPage}>
                    <PaginationLink previous tag="button" onClick={() =>  previousPage()}/>
                </PaginationItem>
                <PaginationItem  disabled={!canNextPage}>
                    <PaginationLink next tag="button" onClick={() => nextPage()}/>
                </PaginationItem>
                <PaginationItem disabled={!canNextPage}>
                    <PaginationLink tag="button" onClick={() => gotoPage(pageCount - 1)} >
                        {"››"}
                    </PaginationLink>
                </PaginationItem>
                
                <span>&nbsp;Página <strong>{pageIndex + 1} de {pageOptions.length}</strong></span>
                <span>| Ir para página:&nbsp;</span>
                    <input
                        type="number"
                        className="form-control"
                        defaultValue={pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            gotoPage(page)
                        }}
                        style={{ width: '80px' }}
                    />
                &nbsp;
                <Input type="select"
                        value={pageSize}
                        style={{width: '135px'}}
                        onChange={e => {
                            setPageSize(Number(e.target.value))
                        }}
                    >
                        {[
                            DEFAULT_PAGE_SIZE, 
                            150, 
                            300, 
                            // data.reduce((organization, data) => organization + data.subRows.length, 0)
                        ].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize} por página
                            </option>
                        ))}
                </Input>
            </Pagination>
        </>
    )
}

function TableReport({ network_data, blocking }) {

    const [data, setData] = React.useState(network_data);

    const columns = React.useMemo(
        () => [
            {
                // Make an expander cell
                Header: () => null, // No header
                id: 'expander', // It needs an ID
                Cell: ({ row }) => (
                    // Use Cell to render an expander for each row.
                    // We can use the getToggleRowExpandedProps prop-getter
                    // to build the expander.
                    <span {...row.getToggleRowExpandedProps()}>
                        {row.isExpanded ? '▼' : '▶'}
                    </span>
                ),
            },
            {
                Header: 'Account ID',
                accessor: 'account_id',
            },
            {
                Header: 'Email Account',
                accessor: 'email',
            },
            {
                Header: 'Instance Type',
                accessor: 'instance_type',
            },
            {
                Header: 'Location',
                accessor: 'location',
            },
            {
                Header: 'Launch Time',
                accessor: 'launch_time',
            },
            {
                Header: 'Instance Name',
                accessor: 'instance_name',
            },
            {
                Header: 'Public IP',
                accessor: 'public_ip_address',
            },
            {
                Header: 'Private IP',
                accessor: 'private_ip_address',
            },
            {
                Header: 'Subnet ID',
                accessor: 'sub_net_id',
            },
            {
                Header: 'VPC ID',
                accessor: 'vpc_id',
            },
        ],
        []
    )

    React.useEffect(() => {
        setData(network_data);
    }, [JSON.stringify(network_data)])


    // Create a function that will render our row sub components
    const renderRowSubComponent = React.useCallback(
        // ({ row }) => (
        //     <pre
        //         style={{
        //             fontSize: '10px',
        //         }}
        //     >
        //         <code >{JSON.stringify({ values: row.original.acls }, null, 2)}</code>
        //     </pre>
        // ),
        ({ row }) => (
            <TableAcls acls_data={ row.original.acls} />
        ),
        []
    )

    // console.log(data);

    return (
        <>
            <Table
                columns={columns}
                data={data}
                blocking={blocking}
                // We added this as a prop for our table component
                // Remember, this is not part of the React Table API,
                // it's merely a rendering option we created for
                // ourselves
                renderRowSubComponent={renderRowSubComponent}
            />
        </>
    )
}


export default TableReport
