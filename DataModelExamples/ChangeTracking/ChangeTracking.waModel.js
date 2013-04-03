
guidedModel =// @startlock
{
	Project :
	{
		events :
		{
			onSave:function()
			{// @endlock
				return ds.Change.writeChange(this);
			}// @startlock
		},
		entityMethods :
		{// @endlock
			getChanges:function()
			{// @lock
				return ds.Change.getChanges(this);
			}// @startlock
		}
	},
	Person :
	{
		events :
		{
			onSave:function()
			{// @endlock
				ds.Change.writeChange(this);
				
			}// @startlock
		},
		entityMethods :
		{// @endlock
			getChanges:function()
			{// @lock
				return ds.Change.getChanges(this);
			}// @startlock
		}
	},
	Change :
	{
		collectionMethods :
		{// @endlock
			changedCollection:function(className)
			{// @lock
				var theClass = ds.dataClasses[className];
				var classChanges = this.query('className = :1', className);
				if (classChanges.length = 0)
					return theClass.createEntityCollection();//empty collection
				else
				{
					var theIDs = classChanges.entityKey; //produces a scalar array
					return theClass.query('ID in :1', theIDs);
				}	
			}// @startlock
		},
		entityMethods :
		{// @endlock
			changedEntity:function()
			{// @lock
				// return the parent entity
				var theClass = ds.dataClasses[this.className];
				return theClass(this.entityKey);
			}// @startlock
		},
		methods :
		{// @endlock
			getChanges:function(theEntity)
			{// @lock
				// return the changes that go with theEntity
				return ds.Change.query('entityKey = :1 order by ID desc', theEntity.getKey());
			},// @lock
			writeChange:function(theEnt)
			{// @lock
				if (!theEnt.isNew()) //if theEntity is not new
				{ 	
					var theClass = theEnt.getDataClass(); //get its class
					//using its key, get a reference to the entity before it was updated
					var oldEnt = theClass(theEnt.getKey());
					var changedFrom = '';	 //will hold a list of modifications
					for (var e in theClass.attributes)
					{	 //cycle through all attributes
						var theAttrib = theClass.attributes[e];
						var kind = theAttrib.kind;
						if ((kind == 'storage') || (kind == 'relatedEntity'))
						{
							if (oldEnt[e] == null) //formerly null
							{
								if (theEnt[e] != null) // but not now
									changedFrom += e + ' : null\r'; // so record null
							}
							else if (kind == 'relatedEntity') 
							{   // is it now null or has the key changed
								if ((theEnt[e] == null) || (theEnt[e].getKey() != oldEnt[e].getKey()))
									changedFrom += e + ' : ' + oldEnt[e].getKey() + '\r';//append to changes
							} 
							else //must be storage attribute
							{   // is it now null or has it changed
								if ((theEnt[e] == null) || (theEnt[e].toString() != oldEnt[e].toString())) 
									changedFrom += e + ' : ' + oldEnt[e] + '\r'; //append to changes
							}
						}
	 				}
					if (changedFrom.length > 0) 
					{ 	//if anything was modified
						var myInfo = sessionStorage.loginInfo; //placed in login listener
						new ds.Change({ 	//keep a record of the changes
							className: theClass.getName(),
							entityKey: theEnt.getKey(),
							modified: new Date(),
							modifiedBy: myInfo.myEmployeeID,
							changes: changedFrom.substr(0, changedFrom.length - 1)
						}).save();
					}
				}
			}// @startlock
		}
	}
};// @endlock
