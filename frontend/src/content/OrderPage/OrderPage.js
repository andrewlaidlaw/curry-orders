import React, { useState } from 'react';
import { Grid, Column } from '@carbon/react';
import FoodMenu from '../../components/FoodMenu/FoodMenu';
import CurrentOrder from '../../components/CurrentOrder/CurrentOrder';

const OrderPage = (props) => {

  const [render, setRender] = useState({});

  return (

    <Grid className="order-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="order-page__banner">
        <h1 className='order-page__heading, order-page__content-panel'>Order your food</h1>
        <p>Place your order for food by selecting items from the menu below.</p>
      </Column>
      <Column lg={16} md={8} sm={4} className="order-page__r2">
        <Grid className="panels-group-content">
          <Column md={6} lg={10} sm={4} className="order-page__panel-content">
            <FoodMenu render={render} setRender={setRender} userSub={props.userSub} menuapiurl={props.menuapiurl}/>
          </Column>
          <Column md={{ span: 2, offset: 6 }} lg={{ span: 6, offset: 10 }} sm={4} className="order-page__panel-content">
            <CurrentOrder render={render} setRender={setRender} userSub={props.userSub} menuapiurl={props.menuapiurl}/>
          </Column>
        </Grid>
      </Column>
    </Grid>
  );
};

export default OrderPage;