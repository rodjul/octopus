import React from 'react'
import { 
    useTable, 
    useExpanded, 
    useRowSelect, 
    usePagination, 
    useFilters, 
    useGlobalFilter, 
    useAsyncDebounce, 
    useFlexLayout,
    useResizeColumns,
} from 'react-table'
import {
    Input, Table as TableStrap, Pagination, PaginationItem, PaginationLink, Row, Col
} from 'reactstrap';

import {
    Paper
} from "@material-ui/core";
// A great library for fuzzy filtering/sorting items
// import matchSorter from 'match-sorter'

import BlockUi from 'react-block-ui';
import LoadingCircularProgress from "../../../../components/LoadingCircularProgress";

import useStyles from "./styles";

import ProjetInfo from "./ProjectInfo";
// import makeData from './data'


const DEFAULT_PAGE_SIZE = 80;

const headerProps = (props, { column }) => getStyles(props, column.align)

const cellProps = (props, { cell }) => getStyles(props, cell.row.depth)

const getStyles = (props, depth = 0) => [
    props,
    {
      style: {
        paddingLeft: `${depth * 0.4}rem`,
      },
    },
  ]
// const getStyles = (props, align = 'left') => [
//     props,
//     {
//       style: {
//         justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
//         alignItems: 'flex-start',
//         display: 'flex',
//         backgroundColor:"red",
//         wordWrap: "anywhere"
//       },
//     },
//   ]


const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
        const defaultRef = React.useRef()
        const resolvedRef = ref || defaultRef

        React.useEffect(() => {
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <>
                <input type="checkbox" ref={resolvedRef} {...rest} />
            </>
        )
    }
)


// Define a default UI for filtering
function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
    flatRows
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

function GlobalFilterCustom({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
    // flatRows
    callbackFilter,
}) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        // calling index.jsx filter function because of hierarchy Data handling
        // working at this level does not work
        callbackFilter(value || undefined)
    }, 200)
    
        
    return (
        <span>
            Search:{' '}
            <input
                value={value || ""}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={`Pesquisar por palavras chaves...`}
                style={{
                    fontSize: '1.1rem',
                    border: '0',
                    width: "66vw",
                }}
            />
        </span>
    )
}


function Table({ columns: userColumns, data, dataSelected, blocking, callbackSelect, callbackFilter }) {
    const classes = useStyles();

    const [project, setProject] = React.useState([]);


    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,

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

        flatRows,

        // select
        selectedFlatRows,

        // filter
        visibleColumns,
        preGlobalFilteredRows,
        setGlobalFilter,
        
        state: { expanded, pageIndex, pageSize, selectedRowIds, globalFilter },

    } = useTable(
        {
            columns: userColumns,
            data,
            initialState: { pageSize: DEFAULT_PAGE_SIZE, resizable: false, },
            autoResetExpanded: false,
            // manualGlobalFilter: true,
            // resizable: false,
        },
        // useFlexLayout,
        useFilters, // useFilters!
        useGlobalFilter, // useGlobalFilter!
        useExpanded, // Use the useExpanded plugin hook
        usePagination,
        useRowSelect,
        hooks => {
            hooks.visibleColumns.push(columns => [
                // Let's make a column for selection
                {
                    id: 'selection',
                    resizable:false,
                    // minWidth: 5,
                    width: 40,
                    // maxWidth: 5,
                    // The header can use the table's getToggleAllRowsSelectedProps method
                    // to render a checkbox
                    // Header: ({ getToggleAllRowsSelectedProps }) => (
                    //     <div>
                    //         <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                    //     </div>
                    // ),
                    // The cell can use the individual row's getToggleRowSelectedProps method
                    // to the render a checkbox
                    Cell: ({ row }) => (
                        <div>
                            <IndeterminateCheckbox 
                                // onClick={() => {
                                //     // console.log(state);
                                //     // console.log("1-:",selectedRowIds)
                                //     // row.isSelected ? setProject([]) : setProject(row.original) ;
                                // }} 
                                {...row.getToggleRowSelectedProps()} 
                            />
                        </div>
                    ),
                },
                ...columns,
            ])
        }
    )
    

    React.useEffect(() => {
        // console.log(selectedRowIds);
        callbackSelect(selectedRowIds);
    }, [JSON.stringify(selectedRowIds)]);
    

    return (
        <>
            <Row style={{margin: "0.1vw"}}> {/* adding margin because the style of Row is overflowing the max width */ }

                <Paper className="col-9" elevation={1} variant="outlined" square style={{ height:"30vw", overflow: "auto", padding: "0vw" }} >
                    
                <BlockUi tag="div" blocking={blocking} message="" loader={<LoadingCircularProgress/>}>

                    {/* <TableStrap hover size="sm" responsive {...getTableProps()}> */}
                    <TableStrap hover size="sm" {...getTableProps()}>
                        <thead>
                            <tr>
                                <th
                                    colSpan={visibleColumns.length}
                                    style={{
                                        textAlign: 'left',
                                    }}
                                >
                                    <GlobalFilterCustom
                                        preGlobalFilteredRows={preGlobalFilteredRows}
                                        globalFilter={globalFilter}
                                        setGlobalFilter={setGlobalFilter}
                                        // flatRows={flatRows}
                                        callbackFilter={e => callbackFilter(e)}
                                    />
                                </th>
                            </tr>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps(headerProps)}>{column.render('Header')}</th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map((row, i) => {
                                prepareRow(row)
                                
                                // if its folder, style the text
                                if (row.original.name.toLowerCase().startsWith("folders/") || row.original.name.toLowerCase().startsWith("organizations/")) {
                                    return (
                                        <tr {...row.getRowProps()}>
                                            {row.cells.slice(0, 2).map(cell => {
                                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                            })}
                                            {row.cells.slice(2, 3).map(cell => {
                                                return <td {...cell.getCellProps(cellProps)}><strong>{cell.render('Cell')}</strong></td>
                                            })}
                                            { /* column 3 */}
                                            <td></td>
                                            
                                            {/* column 4 */}
                                            {row.cells.slice(3, 4).map(cell => {
                                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                            })}

                                            {row.cells.slice(5, row.cells.length).map(cell => {
                                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                            })}
                                            {/* {row.cells.slice(3,row.cells.length).map(cell => {
                                                return <td></td>
                                            })} */}
                                        </tr>
                                    )

                                } else {
                                    return (
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map(cell => {
                                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                            })}
                                        </tr>
                                    )
                                }
                            })}

                        </tbody>
                    </TableStrap>
            
                </BlockUi>
                
                </Paper>
                
                
                <Paper className="col-3" elevation={1}  variant="outlined" square  style={{ height:"30vw", overflow: "auto", wordWrap: "anywhere" }} >
                    {/* <ProjetInfo project={project}/> */}
                    <ProjetInfo project={dataSelected}/>
                </Paper>
                
            </Row>

            <br />

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



function Organizations({data, blocking, callbackSetDataSelected, callbackFilter}) {
    const classes = useStyles();

    const columns = React.useMemo(
        () => [
            {
                // width: 20,
                // Build our expander column
                id: 'expander', // Make sure it has an ID
                Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
                    <span {...getToggleAllRowsExpandedProps()}>
                        {isAllRowsExpanded ? '▼' : '▶'}
                    </span>
                ),
                Cell: ({ row }) =>
                    // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                    // to build the toggle for expanding a row
                    row.canExpand ? (
                        <span
                            {...row.getToggleRowExpandedProps({
                                style: {
                                    // We can even use the row.depth property
                                    // and paddingLeft to indicate the depth
                                    // of the row
                                    paddingLeft: `${row.depth * 0.7}rem`,
                                }
                            })}
                        >
                            {/* {row.isExpanded ? '👇' : '👉'} */}
                            {row.isExpanded ? '▼' : '▶'}
                        </span>
                    ) : null,
            },

            {
                Header: 'Pasta',
                accessor: 'displayName',
            },
            {
                Header: 'Nome do Projeto',
                accessor: 'name',
            },
            {
                Header: 'Identificação',
                accessor: 'number',
            },
            {
                Header: 'ID do Projeto',
                accessor: 'project_id',
            },
            {
                Header: 'Users',
                accessor: 'users',
            },
            {
                Header: 'Criado em',
                accessor: 'createTime',
            },
            {
                Header: 'STATUS',
                accessor: 'status',
            },
        ],
        []
    )

    // const [dataTable, setDataTable] = React.useState(data);
    const dataTable = React.useMemo(() => data, [JSON.stringify(data)]);
    // const dataTable = data;

    const [dataSelected, setDataSelected] = React.useState([]);
    const callbackSelect = (e) => {
        // Object { "1.1.0.0": true, "1.1.1": true }
        let keys = Object.keys(e);

        let rowsSelected = [];

        if (keys.length) {
            rowsSelected = keys.map(row => {
                let indexes = row.split(".");
                let keyContent = {};
                let dataToSelect = data;
                for (let index = 0; index < indexes.length; index++) {
                    let project_selected = indexes[index];

                    keyContent = dataToSelect[project_selected];

                    if ((index + 1) < indexes.length)
                        dataToSelect = keyContent.subRows;

                }
                keyContent["index"] = row;
                return keyContent;
            });
        }
        setDataSelected(rowsSelected);
    }

    // assert the data is not new / is not reloaded when select a row
    // React.useEffect(() => {
    //     setDataTable(data);
    // },[JSON.stringify(data)])
    

    React.useEffect(() => {
        callbackSetDataSelected(dataSelected);
    }, [JSON.stringify(dataSelected)]);


    return (
        <>
            <Table
                columns={columns}
                data={dataTable}
                dataSelected={dataSelected}
                callbackSelect={(e) => callbackSelect(e)}
                callbackFilter={callbackFilter}
                blocking={blocking}
            />
        </>
    )
}

export default Organizations
