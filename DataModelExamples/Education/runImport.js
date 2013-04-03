try
{
ds.Person.importData();
ds.Person.length;
ds.Person.makeAttendees(4);
ds.Attendee.length;
var x = ds.CourseMaster.length + ' ';
x += ds.Course.length + ' ';
x += ds.Student.length + ' ';
x += ds.Student.query('registered = true').length + ' ';
x += ds.Teacher.length + ' ';
x += ds.Teacher.query('hasTaught = true').length + ' ';
x += ds.Person.length + ' ';
x += ds.Attendee.length + ' ';

x;

}
catch (e)
{
	e;

}

