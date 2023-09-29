import React, { useEffect, useState } from 'react';
import { TableRow, Table, TableBody, TableCell, Button } from '@carbon/react';
import { TrashCan } from '@carbon/icons-react';

const tip = 0.1; // 10%
const orderapiurl = 'http://localhost:8080/api'

const CurrentOrder = (props) => {

    const ordernumber = props.userSub;
    
    const [myOrder, setMyOrder] = useState({"itemdetails":[{"itemname":"Name"}],"pricetotal":20.00, });

    useEffect(() => {
        const fetchdata = async () => {
            var json = [{"name": "Nothing yet", "id": 1, "categoryId": "none"}];
            var data = await fetch(orderapiurl + '/fullorder/' + ordernumber)
                .catch(console.error);
            json = await data.json()
                .catch(console.error);
            // console.log(json);
            setMyOrder(json);
        };
        fetchdata()
            .catch(console.error);
        }, [props.render, props.userSub]);

    const OrderList = (props) => {
        return (
            <div><Table className='foodmenu__table' size='md'>
                <TableBody>
                        {props.itemdetails.map((item, index) =>
                            <TableRow key={index} id={item.itemid}>
                            <TableCell className='menuitem__name'>{item.itemname}</TableCell>
                            <TableCell className='menuitem__name' align='right'>
                                <Button renderIcon={TrashCan} size='sm' kind="tertiary" iconDescription="Remove" tooltipAlignment="end" onClick={() => removeitem(item.itemid, props.orderid)}>Remove</Button>
                                </TableCell>
                            </TableRow>
                            )
                        }
                </TableBody>
            </Table>
            <h2 className='current-order__price'>Order cost: £{(props.pricetotal * (1 + tip)).toFixed(2)}</h2>
            </div>
        )
    }

    async function removeitem(itemid, orderid) {
        const fetchdata = async () => {
            var json = [{"name": "Nothing yet", "id": 1, "categoryId": "none"}];
            var data = await fetch(orderapiurl + '/order/' + orderid + '/removeitem/' + itemid)
                .catch(console.error);
            json = await data.json()
                .catch(console.error);
            console.log(json);
        };
        fetchdata()
            .catch(console.error);
        props.setRender(Date.now())
    }

    return (
    <div>
        <h1 className='current-order__heading'>Your order</h1>
        <p>This is the current contents of your order.</p>
        <OrderList itemdetails={myOrder.itemdetails} pricetotal={myOrder.pricetotal} orderid={myOrder.orderid}/>
        <p>A {tip*100}% tip has been added to your total price.</p>
    </div>)
};

export default CurrentOrder