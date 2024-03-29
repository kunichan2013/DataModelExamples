﻿
guidedModel =// @startlock
{
	Product :
	{
		entityMethods :
		{// @endlock
			getCustomerPrice:function(salesOrder)
			{// @lock
				thePrices = this.customerPrices; // get the customerPrices that go with this product
				var theCustomer = salesOrder.customer;
				var orderDate = salesOrder.orderDate;
				var qString = 'customer = :1 AND effectiveDate <= :2';
				qString += ' order by effectiveDate desc';
				var customerPrice = thePrices.find(qString, theCustomer, oderDate);
				if (customerPrice != null)
					return customerPrice.price;
				else
					return this.listPrice - (this.listPrice * theCustomer.discount);
			}// @startlock
		}
	},
	SalesOrder :
	{
		events :
		{
			onValidate:function()
			{// @endlock
				var error = {error: 0, errorMessage: ''};
				var billingContact = this.billingContact;
				var shippingContact = this.shippingContact;
				var theCustomer = this.customer;
				if (theCustomer == null)
					error = {error: 101, errorMessage: 'No assigned customer'};
				else if (billingContact == null)
					error = {error: 102, errorMessage: 'No billing contact'};
				else if (shippingContact == null)
					error = {error: 103, errorMessage: 'No shipping contact'};
				else if (this.orderDate == null)
					error = {error: 104, errorMessage: 'No order date'};
				else if (theCustomer.contacts.find('ID = :1', billingContact.ID) == null)
					error = {error: 105, errorMessage: 'Billing contact invalid for customer'};
				else if (theCustomer.contacts.find('ID = :1', shippingContact.ID) == null)
					error = {error: 106, errorMessage: 'Shipping contact invalid for customer'};
				return error;
			}// @startlock
		},
		entityMethods :
		{// @endlock
			saveNewOrder:function(salesItems)
			{// @lock
				var salesItems = salesItems || null; // in case this method was called with no argument
				try
				{
					this.validate(); // run the On Validate event
					if (!this.isNew())
						throw 107; //not a new sales order
					else if (salesItems == null)
						throw 108; //no sales items
					else if (!Array.isArray(salesItems))
						throw 109; //sales items not an array
					else if (salesItems.length == 0)
						throw 110; //array has no elements
					else
					{
						ds.startTransaction();
						try
						{
							for (index in salesItems)
							{
								var item = salesItems[index];
								if ((item.productID == null) || (item.quantity == null))
									throw 111; //incorrect sales item properties
								else if (!item.quantity > 0)
									throw 112; //no quantity specified
								else
								{
									var theProduct = ds.Product(item.productID);
									if (theProduct == null)
										throw 113; //no product found for sales item
									else
										new ds.SalesItem({
											salesOrder: this,
											quantity: item.quantity,
											product: theProduct,
											price: theProduct.getCustomerPrice(this)
										}).save();
								}
							}
							this.save(); //save the sales order
							ds.commit(); //commit the transaction
						}
						catch (e) //if there is any errors
						{
							ds.rollBack(); //rollback the transaction
							throw e; //re-throw the error
						}
					}
				}
				catch (e)
				{
					throw e; //re-throw the error
				}
			}// @startlock
		},
		customer :
		{
			events :
			{
				onSet:function(attributeName)
				{// @endlock
					this.billingContact = this.customer.billingContact;
					this.shippingContact = this.customer.shippingContact;
				}// @startlock
			}
		},
		total :
		{
			onGet:function()
			{// @endlock
				return this.subtotal + this.shipping + this.tax;
			}// @startlock
		},
		subtotal :
		{
			onGet:function()
			{// @endlock
				return this.salesItems.sum('extended');
			}// @startlock
		}
	},
	SalesItem :
	{
		extended :
		{
			onGet:function()
			{// @endlock
				return this.price * this.quantity;
			}// @startlock
		}
	}
};// @endlock
