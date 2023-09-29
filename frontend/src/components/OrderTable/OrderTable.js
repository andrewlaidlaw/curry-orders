import React, { useEffect, useState } from 'react';
import {
    DataTable,
    Table,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableToolbar,
    TableToolbarSearch,
    TableContainer,
    TableToolbarContent,
    DataTableSkeleton,
    Button,
    Link,
} from '@carbon/react';
import { Renew } from '@carbon/react/icons';

const OrderTable = (props) => {

    const headers = [
        { key: 'name', header: 'Name' },
        { key: 'starter', header: 'Starter' },
        { key: 'main', header: 'Main Course' },
        { key: 'rice', header: 'Rice' },
        // {key: 'drinks', header: 'Drinks'},
        { key: 'other', header: 'Other' }
    ];

    const [rows, setRows] = useState([
        { id: '1', name: 'Andrew Laidlaw', starter: 'Chicken Tikka', main: 'Lamb Tawa', rice: 'Pilau Rice', other: 'Cheese Naan' }
    ]);

    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(true);

    useEffect(() => {
        
        const fetchdata = async () => {
            setLoading(true);
            var json = [{ "name": "Nothing yet", "id": 1, "categoryId": "none" }];
            var data = await fetch(props.orderapiurl + '/order/currentorders')
                .catch(console.error);
            json = await data.json()
                .catch(console.error);
            setRows(json);
            setLoading(false);
        };
        fetchdata()
            .catch(console.error);
        

    }, [props.render, props.userSub, refresh]);

    if (loading) {
        return (
            <DataTableSkeleton headers={headers} title="Orders" />
        )
    } else {
        return (
            <DataTable rows={rows} headers={headers} isSortable>
                {({ rows, headers, getTableProps, getHeaderProps, getRowProps, onInputChange }) => (
                    <TableContainer title='Orders' description='A searchable table of the current orders, although these are subject to change up until the point that orders are closed.'>
                        <TableToolbar>
                            <TableToolbarContent>
                                <TableToolbarSearch persistent onChange={onInputChange} description="Search table"/>
                                <Button iconDescription='Refresh' kind="tertiary" renderIcon={Renew} onClick={() => setRefresh(Date.now())}>Refresh</Button>
                                {/* <Button iconDescription='Your Order'>Your Order</Button> */}
                            </TableToolbarContent>
                        </TableToolbar>
                        <Table {...getTableProps()}>

                            <TableHead>
                                <TableRow>
                                    {headers.map((header) => (
                                        <TableHeader {...getHeaderProps({ header })}>
                                            {header.header}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow {...getRowProps({ row })}>
                                        {row.cells.map((cell) => (
                                            <TableCell key={cell.id}>{cell.value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DataTable>
        )
    }

};

export default OrderTable;