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
import Select from "react-select";
import {
    Paper
} from "@material-ui/core";

// A great library for fuzzy filtering/sorting items
// import matchSorter from 'match-sorter'
import {formatDateTimezone} from "../../../utils";
import BlockUi from 'react-block-ui';
import LoadingCircularProgress from "../../../components/LoadingCircularProgress";
// import TableAcls from './TableAcls';


const DEFAULT_PAGE_SIZE = 80;


// Define a default UI for filtering
function GlobalFilter({
    preGlobalFilteredRows,
    globalFilter,
    setGlobalFilter,
}) {
    // const count = preGlobalFilteredRows.length
    const [value, setValue] = React.useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200)
    
    // console.log( preGlobalFilteredRows, globalFilter, setGlobalFilter, flatRows)
        
    return (
        <span>
            Pesquisar:{' '}
            <input
                value={value || ""}
                onChange={e => {
                    setValue(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder={`Pesquisar por palavra chave...`}
                style={{
                    fontSize: '1.1rem',
                    border: '0',
                    width: "94%",
                }}
            />
        </span>
    )
}



const ReadonlyCell = ({
    value: initialValue,
    row: { index },
    column: { id },
}) => {
    return (
        <span>{initialValue}</span>
    )
}

const EditableCellSelectSingle = ({
    value: initialValue,
    row: { index },
    column: { id },
    updateMyData, // This is a custom function that we supplied to our table instance
    userGroups
}) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChangeSelect = (e) => {
        updateMyData(index, id, e.value);
    }

    let options = [ ];
    userGroups.map(group => options.push({ value: group, label: group}));

    const optionsSelected = {value: initialValue, label: initialValue };

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    
    // console.log("2: ",initialValue, index, id, resourceTypes);

    return (
        <Select
        onChange={(e) => onChangeSelect(e)}
        options={options}
        isMulti={false}
        value={optionsSelected}
      />
    )
}

const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    updateMyData, // This is a custom function that we supplied to our table instance
}) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = e => {
        setValue(e.target.value)
    }

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        updateMyData(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
    }, [initialValue])
    
    // console.log(1);

    // return <input value={value} onChange={onChange} onBlur={onBlur} />
    return <Input value={value} onChange={onChange} onBlur={onBlur} />
}



function Table({ columns: userColumns, data, userGroups, blocking, updateMyData}) {

    const defaultColumn = {
        Cell: EditableCell,
        CellSelectSingle: EditableCellSelectSingle,
        CellReadOnly: ReadonlyCell,
    }
    
    // const defaultColumn = React.useMemo(
    //     () => ({
    //         // Let's set up our default Filter UI
    //         Filter: DefaultColumnFilter,
    //     }),
    //     []
    // )

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
        preGlobalFilteredRows,
        setGlobalFilter,
        state: { pageIndex, pageSize, globalFilter },
        
    } = useTable(
        {
            columns: userColumns,
            data,
            defaultColumn,
            initialState: { pageSize: DEFAULT_PAGE_SIZE, resizable: false },
            // filterTypes
            userGroups,
            updateMyData
        },
        useFilters,
        useGlobalFilter,
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
                                            {row.cells.slice(0,2).map(cell => {
                                                return <td {...cell.getCellProps()} style={{minWidth:"8em"}}>{cell.render('CellReadOnly')}</td>
                                            })}
                                            {row.cells.slice(2,3).map(cell => {
                                                return <td {...cell.getCellProps()} style={{minWidth:"8em"}}>{cell.render('CellSelectSingle')}</td>
                                            })}
                                            {row.cells.slice(3,4).map(cell => {
                                                return <td {...cell.getCellProps()} style={{minWidth:"8em"}}>{cell.render('Cell')}</td>
                                            })}
                                            {row.cells.slice(4,row.cells.length).map(cell => {
                                                return <td {...cell.getCellProps()} style={{minWidth:"8em"}}>{cell.render('CellReadOnly')}</td>
                                            })}
                                        </tr>
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

function TableUsers({ users, blocking, userGroups, handleChangeUsers }) {

    const [data, setData] = React.useState(users);

    const columns = React.useMemo(
        () => [
            {
                Header: 'Username',
                accessor: 'Username',
            },
            {
                Header: 'Nome',
                accessor: 'Name',
            },
            {
                Header: 'Permissão',
                accessor: 'UserGroup',
            },
            {
                Header: 'Logou pela primeira vez',
                accessor: 'FirstLogin',
                // filter: 'fuzzyText',
                Cell: ({cell: {value} }) => (
                    <span>{formatDateTimezone(value, "GMT -3")}</span>
                ),
            },
        ],
        []
    )
    
    React.useEffect(() => {
        setData(users);
    }, [JSON.stringify(users)])

    // When our cell renderer calls updateMyData, we'll use the rowIndex, columnId and new value to update the original data
    const updateMyData = (rowIndex, columnId, value) => {
        // We also turn on the flag to not reset the page
        // setSkipPageReset(true)
        setData(old =>
            old.map((row, index) => {
                if (index === rowIndex) {
                    return {
                        ...old[rowIndex],
                        [columnId]: value,
                    }
                }
                return row
            })
        )
    }

    React.useEffect(()=>{
        handleChangeUsers(data);
    }, [JSON.stringify(data)]);

    return (
        <>
            <Table
                columns={columns}
                data={data}
                userGroups={userGroups}
                blocking={blocking}
                updateMyData={updateMyData}
            />
        </>
    )
}


export default TableUsers
