import React from 'react';
import { Button, DefinitionTooltip, TableCell, TableRow } from '@carbon/react';
import { Add } from '@carbon/icons-react';

// const orderapiurl = 'http://localhost:8080/api'

const MenuItem = (props) => {
    let name = "";

    async function additem(itemid, orderid) {
        const fetchdata = async () => {
            var json = [{"name": "Nothing yet", "id": 1, "categoryId": "none"}];
            var data = await fetch(props.orderapiurl + '/order/' + orderid + '/additem/' + itemid)
                .catch(console.error);
            json = await data.json()
                .catch(console.error);
            console.log(json);
        };
        fetchdata()
            .catch(console.error);
        props.setRender(Date.now())
    }

    if (props.itemdescription) {
        name = <DefinitionTooltip openOnHover definition={props.itemdescription}>{props.itemname}</DefinitionTooltip>;
    } else {
        name = props.itemname;
    }

    return (
        <TableRow className='menuitem__row'>
            <TableCell md={6} lg={10} sm={2} className='menuitem__name'>
                {name}
            </TableCell>
            <TableCell md={1} lg={4} sm={1} className='menuitem__price'>£{props.itemprice.toFixed(2)}</TableCell>
            <TableCell md={1} lg={2} sm={1} className='menuitem__add'>
                <Button renderIcon={Add} kind='tertiary' size='sm' onClick={() => additem(props.itemid, props.orderid)}>Add</Button>
                </TableCell>
        </TableRow>
    )
}

export default MenuItem;