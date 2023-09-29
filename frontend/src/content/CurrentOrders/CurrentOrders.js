import React from 'react';
import { Grid, Column } from '@carbon/react';
import OrderTable from '../../components/OrderTable';

const CurrentOrders = (props) => {
  return (
    <Grid className="order-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="order-page__banner">
        <h1 className='order-page__heading, order-page__content-panel'>Current Orders</h1>
        <p>Here is what everyone else has ordered so far - so you can peruse it at your leisure.</p>
      </Column>
      <Column lg={16} md={8} sm={4} className="order-page__r2">
        <Grid className="panels-group-content">
          <Column md={8} lg={16} sm={4} className="order-page__panel-content">
            <OrderTable orderapiurl={props.orderapiurl} />
          </Column>
        </Grid>
      </Column>
    </Grid>
  );
};

export default CurrentOrders;