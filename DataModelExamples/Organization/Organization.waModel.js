﻿
guidedModel =// @startlock
{
	Evaluation :
	{
		events :
		{
			onRestrictingQuery:function()
			{// @endlock
				var myInfo = sessionStorage.loginInfo;
				var resultCollection = ds.Evaluation.createEntityCollection();
				if (myInfo != null)
				{
					var session = currentSession();
					if (session.belongsTo('Admin'))
						resultCollection = ds.Evaluation.all();
					else if (myInfo.myEmployeeID != null)
					{
						var queryString = 'byEmployee.ID = :1 OR aboutEmployee.ID = :1';
						var myID = myInfo.myEmployeeID;
						resultCollection = ds.Evaluation.query(queryString, myID);
					}
				}
				return resultCollection;
			}// @startlock
		}
	},
	CoWorker :
	{
		evaluationComments :
		{
			onSet:function(value)
			{// @endlock
				var myInfo = sessionStorage.loginInfo;
				if (myInfo != null)
				{
					var theEval = ds.Evaluation.find('byEmployee.ID = :1 AND aboutEmployee.ID = :2', myInfo.myEmployeeID, this.ID);
					if (theEval == null)
						theEval = new ds.Evaluation({aboutEmployee: this, byEmployee: myInfo.myEmployeeID});
					theEval.comments = value;
					theEval.save();						
				}
			},// @startlock
			onGet:function()
			{// @endlock
				var result = '';
				var myInfo = sessionStorage.loginInfo;
				if (myInfo != null)
				{
					var theEval = ds.Evaluation.find('byEmployee.ID = :1 AND aboutEmployee.ID = :2', myInfo.myEmployeeID, this.ID);
					if (theEval != null)
						result = theEval.comments;
				}
				return result;
			}// @startlock
		},
		relation :
		{
			onGet:function()
			{// @endlock
				var myInfo = sessionStorage.loginInfo;
				var result = '';
				if (this.ID == myInfo.myManagerID)
					result = 'Manager'
				else if (this.manager != null)
				{
					if (this.manager.ID == myInfo.myEmployeeID)
						result = 'Direct Report';
					else if (this.manager.ID == myInfo.myManagerID)
						result = 'Peer';
				}
				return result;
			}// @startlock
		},
		events :
		{
			onRestrictingQuery:function()
			{// @endlock
				var myInfo = sessionStorage.loginInfo;
				var resultCollection = ds.Employee.createEntityCollection();
				if (myInfo!= null)
				{
					var session = currentSession();
					if (session.belongsTo('Admin'))
						resultCollection = ds.Employee.all();
					else
					{
						if (myInfo.myEmployeeID != null)
						{
							var queryString = '';
							if (myInfo.myManagerID != null)
							{
								// my boss
								queryString = 'ID = ' + myInfo.myManagerID + ' OR '; 
								// my peers
								queryString += '(manager.ID = ' + myInfo.myManagerID;
								queryString += ' AND ID != ' + myInfo.myEmployeeID + ') OR ';
							}
							// and my reports
							queryString += ' manager.ID = ' + myInfo.myEmployeeID;
							resultCollection = ds.Employee.query(queryString);
						} 
					}
				}
				return resultCollection;
			}// @startlock
		}
	},
	Employee :
	{
		totalEmployeeSalary :
		{
			onGet:function()
			{// @endlock
				return this.directReports.sum('totalEmployeeSalary') + this.salary;
			}// @startlock
		},
		countEmployees :
		{
			onGet:function()
			{// @endlock
				return this.directReports.sum('countEmployees') + 1;
			}// @startlock
		},
		depth :
		{
			onGet:function()
			{// @endlock
				return this.directReports.max('depth') + 1;
			}// @startlock
		},
		entityMethods :
		{// @endlock
			getOrgChart:function(depth)
			{// @lock
				var depth = depth || null;
				if (depth == null)
					depth = 100; //effectively infinite
				else
					depth -= 1;	
				var org = {};
				var name = '';
				var info = {Title: this.title, Salary: '$' + this.salary.toFixed()};
				info['Total Employees'] = this.countEmployees;
				info['Total Salary'] = '$' + this.totalEmployeeSalary;
				org[this.fullName] = [info];	
				if ((this.directReports.length > 0) && (depth > 0))
				{
					var attName = this.directReports.length + ' Reports';
					org[attName] = {};
					var theEmployees = this.directReports;
					var i = 0;
					theEmployees.forEach(function(loopEmployee) {
						i++;
						org[attName][i] = loopEmployee.getOrgChart(depth);
					});
				}
				return org;
			},// @lock
			makeSubManagers:function(level)
			{// @lock
				var arrayTitles = ['CEO', 'Vice President', 'Director', 'Manager', 'Group Leader', 'Associate'];
				var arrayDepartments = ['Engineering', 'Sales', 'Marketing', 'Accounting', 'Support', 'Development']
				var numSubordinates = Math.round(Math.random() * 4) + 2;
				var y = ds.Employee.query('title = ""');
				var collLength = y.length;
				var x = ds.Employee.createEntityCollection();
				for (var i = 0; i < numSubordinates; i++){	
					var randomPos = Math.round(Math.random() * collLength)
					x.add(y[randomPos]);
				}			
				var i = 0;
				var theTitle = arrayTitles[level];
				var theManager = this;
				x.forEach(function(loopEmployee){
					if (theTitle == 'Vice President')
					{
						loopEmployee.department = arrayDepartments[i++];
						loopEmployee.title = theTitle + ' ' + loopEmployee.department;
					} else {
						loopEmployee.department = theManager.department;
						if (theTitle == 'Director') 
							loopEmployee.title = loopEmployee.department + ' ' + theTitle;
						else
							loopEmployee.title = theTitle;

					}
					loopEmployee.manager = theManager;
					var min =  Math.round(400000 / (level + 1));
					var variation = Math.round(Math.random() * min / 10);
					loopEmployee.salary = min + variation;
					loopEmployee.save();
				});
				if (level < 5)
				{
					x.forEach(function(loopEmployee){
						loopEmployee.makeSubManagers(level + 1);
					});
				}				
			}// @startlock
		},
		methods :
		{// @endlock
			makeManagers:function()
			{// @lock
				x = ds.Employee.find('title = CEO');
				if (x == null)
					x = ds.Employee.find('ID = 1');
				x.title = 'CEO';
				x.salary = 400000;			
				x.save();
				ds.startTransaction();
				try {
					x.makeSubManagers(1);
					ds.commit();
				} catch (e) {
					ds.rollBack();
				}

			},// @lock
			importEmployees:function()
			{// @lock
				var folder = ds.getModelFolder();
				
				if (folder != null)
				{
					var thePath = folder.path;
					var baseFolder = thePath + "ImportData/";

					var file = File(baseFolder + "Employees.txt");
					if (ds.Employee.length == 0)
					{
						var input = TextStream(file,"read");
						if (!input.end())
						{
							var record = input.read("\r");
							if (record = "First\tLast\tAddress\tCity\tState\tZip\tPhone\tGender") //verify that the file is in the right format
							{
								while (!input.end())
								{
									record = input.read("\r");//read one row
									if (record != "")
									{
										var recordArray = record.split("\t");
										if (recordArray.length > 1)
										{
											var newEmp = new ds.Employee();
											newEmp.first = recordArray[0];
											newEmp.last = recordArray[1];
											newEmp.address = recordArray[2];
											newEmp.city = recordArray[3];
											newEmp.state = recordArray[4];
											newEmp.zip = recordArray[5];
											newEmp.homePhone = recordArray[6];
											newEmp.gender = recordArray[7];
											newEmp.title = '';
											newEmp.login = 'test' + newEmp.ID;
											newEmp.password = directory.computeHA1(newEmp.login, 'a');
											newEmp.save();
										}
									} else 
									{
										break;
									}
								}
							}
						}
					}	
				}
			}// @startlock
		},
		fullName :
		{
			onSort:function(ascending)
			{// @endlock
				if (ascending)
					return 'last, first, middle';
				else
					return 'last desc, first desc, middle desc';

			},// @startlock
			onGet:function()
			{// @endlock
				var middle = '';
				if (this.middle != null)
					middle = (this.middle.length > 0 ? ' ' + this.middle : '');
				return this.first + middle + ' ' + this.last;
			}// @startlock
		}
	}
};// @endlock
