loginByPassword('a', 'a');// it doesn't matter what we pass, see required.js
var y = ds.Person.all()[1];
var x = ds.Project.all()[1];

x.estimate = 2000;
x.department = 'Marketing';
x.mainContact = y;
x.save();

y.first = 'Dave';
y.last = 'Terry';
y.address = '111 West St. John, Suite 404';
y.save();

