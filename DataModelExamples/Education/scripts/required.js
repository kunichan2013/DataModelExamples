function myLogin(userName, password)
{
	var theUser = ds.Person({login:userName});
	if (theUser == null) // if no user was found
	   return false; // let Wakanda try to find a user in the directory
	else
	{
		// see of the stored hash value is correct
		if (theUser.password == directory.computeHA1(userName, password)) 
		{
			var myLoginInfo = {myUserID: theUser.ID};
			var theGroups = [];
			if (theUser.enrolled)
				theGroups.push('Student');
			if (theUser.isTeacher)
				theGroups.push('Teacher');
			if (theUser.accessLevel == 1)
				theGroups.push('Registrar');
				
				
			return {ID: theUser.ID, 
					name: theUser.login, 
					fullName: theUser.first + ' ' + theUser.last, 
					belongsTo: theGroups,
					storage : {loginInfo: myLoginInfo}
					}
		}
		else
			return { error: 1024, errorMessage:"invalid login" };
	}
};
