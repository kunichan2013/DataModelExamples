//ds.Employee.importEmployees();
var x = ds.Employee.query('title != ""');
x.forEach(function(loop){
	loop.title = '';
	loop.save();
});

ds.Employee.makeManagers();
ds.Employee.length + ' ' +ds.Employee.query('title = ""').length + ' ' + ds.Employee.query('title = "Vice President@"').length + ' ' + ds.Employee.query('title = "Associate"').length
