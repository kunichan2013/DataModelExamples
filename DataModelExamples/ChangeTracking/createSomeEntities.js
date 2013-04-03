
//var theDate = new Date(2012, 6, 1);
//var thePerson = ds.Person(1);

//var qString = 'modified >= :1 AND modifiedBy = :2';
//var theChanges = ds.Change.query(qString, theDate, thePerson);
//theChanges;
var y = new ds.Person();
y.first = 'Dan';
y.last = 'Wasserman';
y.address = '111 West St. John Street';
y.city = 'San Jose';
y.state = 'CA';
y.zip = '95113';
y.save();

var x = new ds.Project();
x.name = 'Wakanda Presentations';
x.startDate = new Date(2012, 6, 1);
x.estimate = 5000;
x.department = 'Marketing';
x.mainContact = y;
x.save();
