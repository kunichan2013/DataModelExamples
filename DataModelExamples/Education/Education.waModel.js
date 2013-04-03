
guidedModel =// @startlock
{
	Course :
	{
		methods :
		{// @endlock
			copyYear:function(fromYear, toYear)
			{// @lock
				var fromCourses = ds.Course.query('year = :1', fromYear);
				fromCourses.forEach(function(loopCourse){
					new ds.Course({
						theCourse:  loopCourse.courseMaster,
						schedule: loopCourse.schedule,
						location: loopCourse.location,
						semester: loopCourse.semester,
						year: toYear,
						courseTeacher: loopCourse.courseTeacher
					}).save();
				});
			}// @startlock
		}
	},
	Teacher :
	{
		hasTaught :
		{
			onGet:function()
			{// @endlock
				return (this.coursesTaught.length > 0);
			}// @startlock
		},
		events :
		{
			onRestrictingQuery:function()
			{// @endlock
				return ds.Person.query('isTeacher = true');
			}// @startlock
		}
	},
	Student :
	{
		registered :
		{
			onGet:function()
			{// @endlock
				return (this.attendance.length > 0);
			}// @startlock
		},
		GPA :
		{
			onGet:function()
			{// @endlock
				return this.attendance.average('gradePoint');
			}// @startlock
		},
		events :
		{
			onRestrictingQuery:function()
			{// @endlock
				return ds.Person.query('enrolled = true');
			}// @startlock
		}
	},
	Attendee :
	{
		grade :
		{
			onSort:function(ascending)
			{// @endlock
				if (ascending)
					return 'gradePoint';
				else
					return 'gradePoint desc';
			},// @startlock
			onQuery:function(compOperator, valueToCompare)
			{// @endlock
				valueToCompare = valueToCompare.toUpperCase();
				var gp = {}; //could define this ahead of time but left here for clarity
				gp['F'] = 0;
				gp['D'] = 1;
				gp['D+'] = 1.33;
				gp['C-'] = 1.67;
				gp['C'] = 2;
				gp['C+'] = 2.33;
				gp['B-'] = 2.67;
				gp['B'] = 3;
				gp['B+'] = 3.33;
				gp['A-'] = 3.67;
				gp['A'] = 4;
				if (gp[valueToCompare] != null)
					return 'gradePoint ' + compOperator + gp[valueToCompare];
				else
					return 'gradePoint = -1'; //force a bad result
			},// @startlock
			onSet:function(value)
			{// @endlock
				var gp = {}; //could define this ahead of time but left here for clarity
				gp['F'] = 0;
				gp['D'] = 1;
				gp['D+'] = 1.33;
				gp['C-'] = 1.67;
				gp['C'] = 2;
				gp['C+'] = 2.33;
				gp['B-'] = 2.67;
				gp['B'] = 3;
				gp['B+'] = 3.33;
				gp['A-'] = 3.67;
				gp['A'] = 4;
				value = value.toUpperCase();
				this.gradePoint = gp[value];
			},// @startlock
			onGet:function()
			{// @endlock
				var gp = {}; //could define this ahead of time but left here for clarity
				gp['0'] = 'F';
				gp['1'] = 'D';
				gp['1.33'] = 'D+';
				gp['1.67'] = 'C-';
				gp['2'] = 'C';
				gp['2.33'] = 'C+';
				gp['2.67'] = 'B-';
				gp['3'] = 'B';
				gp['3.33'] = 'B+';
				gp['3.67'] = 'A-';
				gp['4'] = 'A';
				if (gp[this.gradePoint] != null)
					return gp[this.gradePoint];
				else
					return '';
			}// @startlock
		}
	},
	Person :
	{
		fullName :
		{
			onGet:function()
			{// @endlock
				return this.first + ' ' + this.last;
			}// @startlock
		},
		methods :
		{// @endlock
			getRandomPeople:function(howMany)
			{// @lock
				var thePeople = ds.Person.createEntityCollection();
				var allPeople = ds.Person.all();
				var numPeople = allPeople.length;
				for(var i = 1; i <= howMany; i++)
				{
					var randomPosition = Math.round(Math.random() * numPeople);
					var randomPerson = allPeople[randomPosition];
					thePeople.add(randomPerson);
				}
				return thePeople;
			},// @lock
			makeAttendees:function(howManyPerSemester)
			{// @lock
				var grades = [2, 2.33, 2.67, 3, 3.33, 3.67, 4];
				var semesters = ['Spring', 'Fall', 'Winter', 'Summer'];
				
				var allStudents = ds.Person.getRandomPeople(1000); 
				allStudents.forEach(function(loopPerson){
					loopPerson.enrolled = true;
					loopPerson.save();
				});
				allStudents = ds.Student.all();					
									
				allStudents.forEach(function(theStudent)
				{
					var randomStartYear = 1991 + Math.round(Math.random() * 19)
					for(var year = 0; year <=3; year++)
					{			
						for(var semester = 0; semester <= 3; semester++)
						{
							var theSemester = semesters[semester];
							var semesterCourses = ds.Course.query('semester = :1 AND year = :2', theSemester, (randomStartYear + year));
							if (semesterCourses.length > 0)
							{
								for(var i = 1; i <= howManyPerSemester; i++)
								{
									var randomCoursePosition = Math.round(Math.random() * semesterCourses.length);
									var randomCourse = semesterCourses[randomCoursePosition];
									var randomGrade = grades[Math.round(Math.random() * (grades.length - 1))];
									if (randomCourse != null)
									{
										var newAttendee = new ds.Attendee({
											theStudent : theStudent,
											theCourse : randomCourse,
											gradePoint : randomGrade
										});
										newAttendee.save();
									}
								}
							}
						}
					}
				});
				var unRegisteredStudents = ds.Person.getRandomPeople(100); //create a few enrolled but unregistered students
				unRegisteredStudents.forEach(function(loopPerson){
					loopPerson.enrolled = true;
					loopPerson.save();
				});				
				
			},// @lock
			importData:function()
			{// @lock
				var folder = ds.getModelFolder();
				if (folder != null)
				{
					var thePath = folder.path;
					var baseFolder = thePath + 'ImportData/';
					var file = File(baseFolder + 'NamesAddressesNumbers.txt');
					
					if (ds.Person.length == 0)
					{
						var input = TextStream(file,'read');
						if (!input.end())
						{
							var record = input.read('\r');
							if (record = 'First\tLast\tAddress\tCity\tState\tZip\tPhone') //verify that the file is in the right format
							{
								while (!input.end())
								{
									record = input.read("\r"); //read one row
									if (record != "")
									{
										var columnArray = record.split('\t');
										if (columnArray.length == 7)
										{
											var newPerson = new ds.Person({
												first: columnArray[0],
												last: columnArray[1],
												address: columnArray[2],
												city: columnArray[3],
												state: columnArray[4],
												zip: columnArray[5],
												homePhone: columnArray[6]
												});
											newPerson.login = 'person' + newPerson.ID; //just for illustration
											newPerson.password = directory.computeHA1(newPerson.login, 'a'); //just for illustration
											newPerson.save();
										}
									}
								}
							}
						}	
					}
				
					var file = File(baseFolder + 'CourseNameDeptCode.txt');
					if (ds.CourseMaster.length == 0)
					{
						var input = TextStream(file,'read');
						if (!input.end())
						{
							var record = input.read('\r');
							if (record = 'Name\tDepartment\tCode') //verify that the file is in the right format
							{
								while (!input.end())
								{
									record = input.read('\r'); //read one row
									if (record != '')
									{
										var columnArray = record.split('\t');
										if (columnArray.length == 3)
										{
											var newCourseMaster = new ds.CourseMaster({
												name: columnArray[0],
												department: columnArray[1],
												code: columnArray[2],
												units: 4
											});
											newCourseMaster.save();
										}
									}
								}
							}
						}
					}
				
					var file = File(baseFolder + 'ClassLocSchedSem.txt');
					if (ds.Course.length == 0)
					{
						var input = TextStream(file,'read');
						if (!input.end())
						{
							var record = input.read('\r');
							if (record = 'Location\tSchedule\tSemester') //verify that the file is in the right format
							{
								var allTeachers = ds.Person.getRandomPeople(200); 
								allTeachers.forEach(function(loopPerson){
									loopPerson.isTeacher = true;
									loopPerson.save();
								});
								
								allTeachers = ds.Teacher.all();
								
								while (!input.end())
								{
									var allCourseMasters = ds.CourseMaster.all();
									//restrict so that same person teaches multiple courses
									
									record = input.read('\r'); //read one row
									if (record != '')
									{
										var randomCoursePosition = Math.round(Math.random() * allCourseMasters.length);
										var randomCourse = allCourseMasters[randomCoursePosition];

										var randomTeacherPosition = Math.round(Math.random() * allTeachers.length);
										var randomTeacher = allTeachers[randomTeacherPosition];
									
										var columnArray = record.split('\t');
										if (columnArray.length == 3)
										{
											var theYear = columnArray[2].substr(0,4);
											var theSemester = columnArray[2].substr(5);
											var newCourse = new ds.Course({
												location: columnArray[0],
												schedule: columnArray[1],
												year: theYear,
												semester: theSemester,
												theCourse: randomCourse,
												courseTeacher: randomTeacher 
											});
											newCourse.save();
										}
									}
								}
								
								var fewMoreTeachers = ds.Person.getRandomPeople(20); //create a few teachers with no courses
								fewMoreTeachers.forEach(function(loopPerson){
									loopPerson.isTeacher = true;
									loopPerson.save();
								});
							}
						}
					}
				
				}
			}// @startlock
		}
	}
};// @endlock
