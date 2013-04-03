function myLogin(userName, password)
{
	// this routine is just for testing and not a good example
	var me = ds.Person.all()[0];
	var myLoginInfo = {myEmployeeID: me.ID};
	var theGroups = [];
	return {ID: me.ID, 
			name: me.first, 
			fullName: me.first + ' ' + me.last, 
			belongsTo: theGroups,
			storage : {loginInfo: myLoginInfo}
			}
};
