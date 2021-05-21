import React from 'react'
import { 
    useTable, 
    useExpanded,
    usePagination, 
    useFilters,
} from 'react-table'
import {
    Input, Table as TableStrap, Pagination, PaginationItem, PaginationLink
} from 'reactstrap';
import {
    Paper
} from "@material-ui/core";

import matchSorter from 'match-sorter'
import {formatDateTimezone} from "../../../utils";
import BlockUi from 'react-block-ui';
import LoadingCircularProgress from "../../../components/LoadingCircularProgress";


const DEFAULT_PAGE_SIZE = 80;


function SelectColumnFilter({
    column: { filterValue, setFilter, preFilteredRows, id },
}) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = React.useMemo(() => {
        const options2 = new Set()
        preFilteredRows.forEach(row => {
            options2.add(row.values[id])
        })
        return [...options2.values()]
    }, [id, preFilteredRows])

    // Render a multi-select box
    return (
        <Input type="select"
            value={filterValue}
            onChange={e => {
                setFilter(e.target.value || undefined)
            }}
        >
            <option value="">All</option>
            {options.map((option, i) => (
                <option key={i} value={option}>
                    {option}
                </option>
            ))}
        </Input>
    )
}

// Define a default UI for filtering
function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter },
}) {
    // const count = preFilteredRows.length

    return (
        <Input
            value={filterValue || ''}
            onChange={e => {
                setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
            }}
            // placeholder={`Search ${count} records...`}
            placeholder={`Digite para pesquisar`}
        />
    )
}

function fuzzyTextFilterFn(rows, id, filterValue) {
    return matchSorter(rows, filterValue, { keys: [row => row.values[id]] })
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = val => !val


function Table({ columns: userColumns, data, blocking, renderRowSubComponent }) {
    const filterTypes = React.useMemo(
        () => ({
            // Add a new fuzzyTextFilterFn filter type.
            fuzzyText: fuzzyTextFilterFn,
            // Or, override the default text filter to use
            // "startWith"
            text: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id]
                    return rowValue !== undefined
                        ? String(rowValue)
                            .toLowerCase()
                            .startsWith(String(filterValue).toLowerCase())
                        : true
                })
            },
        }),
        []
    )
    
    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    )

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
        visibleColumns,
        state: { pageIndex, pageSize },
        
    } = useTable(
        {
            columns: userColumns,
            data,
            defaultColumn,
            initialState: { pageSize: DEFAULT_PAGE_SIZE, resizable: false },
            filterTypes
        },
        useFilters,
        useExpanded,
        usePagination, 
    )

    return (
        <>
            <Paper elevation={1} variant="outlined" square 
                style={{ 
                    // height:"35em", 
                    minHeight:"40em", 
                    maxHeight:"35vw", 
                    overflow: "auto", 
                    padding: "0vw", 
                    minWidth: "90em" 
                }} 
            >
                <BlockUi tag="div" blocking={blocking} message="" loader={<LoadingCircularProgress/>}>

                    <TableStrap hover size="sm" {...getTableProps()}>
                        <thead>
                            {/* {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                    ))}
                                </tr>
                            ))} */}
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps()} className="tableHeader">
                                            {column.render('Header')}
                                            {/* Render the columns filter UI */}
                                            <div>{column.canFilter ? column.render('Filter') : null}</div>
                                        </th>
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
                                                    <td {...cell.getCellProps()} style={{minWidth:"8em"}}>{cell.render('Cell')}</td>
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
                                                    {renderRowSubComponent({ row })}
                                                </td>
                                            </tr>
                                        ) : null}
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </TableStrap>
                    
                </BlockUi>
                <br />
            </Paper>

            <Pagination style={{marginTop: "1em"}}>
                <PaginationItem disabled={!canPreviousPage}>
                    <PaginationLink tag="button" onClick={() => gotoPage(0)}>
                        {"‹‹"}
                    </PaginationLink>
                </PaginationItem>
                <PaginationItem disabled={!canPreviousPage}>
                    <PaginationLink previous tag="button" onClick={() => previousPage()}/>
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

function TableReport({ eventLogs, blocking }) {

    const [data, setData] = React.useState(eventLogs);

    const columns = React.useMemo(
        () => [
            {
                // Make an expander cell
                // Header: () => null, // No header
                Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
                    <span {...getToggleAllRowsExpandedProps()}>
                        {isAllRowsExpanded ? '▼' : '▶'}
                    </span>
                ),
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
                Header: 'Data',
                accessor: 'TimestampUTC',
                // filter: 'fuzzyText',
                Cell: ({cell: {value} }) => (
                    <span>{formatDateTimezone(value, "GMT -3")}</span>
                ),
            },
            {
                Header: 'Sistema',
                accessor: 'SystemType',
                // filter: 'fuzzyText',
                Filter: SelectColumnFilter,
                filter: 'includes',
             //   minWidth: "8em",
            },
            {
                Header: 'Username',
                accessor: 'Username',
                // filter: 'fuzzyText',
                Filter: SelectColumnFilter,
                filter: 'includes',
             //   minWidth: "8em",
            },
            {
                Header: 'Nome',
                accessor: 'Name',
             //   minWidth: "8em",
            },
            {
                Header: 'IP de Origem',
                accessor: 'SourceIp',
             //   minWidth: "8em",
            },
            {
                Header: 'Title',
                accessor: 'Title',
                Filter: SelectColumnFilter,
                filter: 'includes',
             //   minWidth: "8em",
            },
            // {
            //     Header: 'Código HTTP',
            //     accessor: 'StatusCode',
            //     Filter: SelectColumnFilter,
            //     filter: 'includes',
            //  //   minWidth: "8em",
            // },
            {
                Header: 'HTTP',
                accessor: 'HttpMethod',
                // filter: 'fuzzyText',
                Filter: SelectColumnFilter,
                filter: 'includes',
             //   minWidth: "8em",
            },
            {
                Header: 'API',
                accessor: 'ResourcePath',
             //   minWidth: "8em",
            },
            {
                Header: 'User-Agent',
                accessor: 'UserAgent',
             //   minWidth: "8em",
            },
            // {
            //     Header: 'Payload',
            //     accessor: 'Payload',
            // },
        ],
        []
    )

    React.useEffect(() => {
        setData(eventLogs);
    }, [JSON.stringify(eventLogs)])


    // Create a function that will render our row sub components
    const renderRowSubComponent = React.useCallback(
        ({ row }) => (
            <pre
                style={{
                    fontSize: '0.8em',
                    height: "25em",
                    overflow: "auto",
                }}
            >
                <code>{JSON.stringify({ values: row.original }, null, 2)}</code>
            </pre>
        ),
        // ({ row }) => (
        //     <TableAcls acls_data={ row.original.acls} />
        // ),
        []
    )


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
