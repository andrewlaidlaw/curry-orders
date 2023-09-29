import React from 'react';
import { Grid, Column, Accordion, AccordionItem, TableBody, TableHeader, Table, TableHead, TableRow } from '@carbon/react';
import { useEffect, useState } from 'react';
import MenuItem from '../../components/MenuItem/MenuItem';

const FoodMenu = (props) => {

    const orderid = props.userSub;
    const menuapiurl = props.menuapiurl;

    const [menu, setMenu] = useState([    {
        "categoryId": "rice",
        "id": 8,
        "items": [
            {
                "itemid": 108,
                "itemname": "Steamed Rice",
                "itemprice": 3.75
            }
        ],
        "name": "Rice"
    }]);
    
    useEffect(() => {
        const fetchdata = async () => {
            var json = [{"name": "Nothing yet", "id": 1, "categoryId": "none"}];
            var data = await fetch(menuapiurl + '/menu')
                .catch(console.error);
            json = await data.json()
                .catch(console.error);
            setMenu(json);
        };
        // Set skeleton view
        fetchdata()
            .catch(console.error);
        // Set data view

        }, [props.render, props.userSub]);

    return (
        <Grid>
            <Column lg={16} md={8} sm={4}>
                <h1 className='foodmenu__heading'>The Menu</h1>
                <Accordion aria-label='Categories' className='foodmenu__accordion'>
                    {menu.map( entry =>
                        <FoodItemList name={entry.name} key={entry.id} id={entry.id} items={entry.items} orderid={orderid} setRender={props.setRender}/>
                        )}
                </Accordion>
            </Column>
        </Grid>
    );
};

const FoodItemList = (props) => {
    return (
        <AccordionItem title={props.name} key={props.id} className='foodmenu__accordion'>
            <Table className='foodmenu__table' size='md'>
                <TableHead className='foodmenu__tablehead'>
                    <TableRow>
                        <TableHeader>Item</TableHeader>
                        <TableHeader>Price</TableHeader>
                        <TableHeader>Add to Order</TableHeader>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.items.map((item) => 
                        <MenuItem key={item.itemid} id={item.itemid} itemname={item.itemname} itemdescription={item.itemdescription} itemprice={item.itemprice} orderid={props.orderid} itemid={item.itemid} setRender={props.setRender}/>
                        )
                    }
                </TableBody>
            </Table>
        </AccordionItem>
    )
}

export default FoodMenu;